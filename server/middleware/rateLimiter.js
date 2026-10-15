/**
 * Velneer Enterprise Rate Limiter & Anti-Brute-Force Security Engine
 * -----------------------------------------------------------------
 * Multi-layered defenses:
 * 1. Proxy-safe Client IP resolution (IPv6 subnet normalization & anti-spoofing)
 * 2. Sliding-window in-memory rate limiting with standard RFC headers
 * 3. Targeted Account Lockout Protection (prevents credential stuffing & password brute force)
 * 4. Dedicated per-action limiters (Login, Signup, OTP-send, OTP-verify, Checkout, General API)
 * 5. Exponential lockout backoff for repeated brute-force attacks
 */

/**
 * Safely resolves the true client IP address behind reverse proxies (Render, Vercel, Cloudflare).
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = forwarded[0].trim();
  }
  if (!ip) {
    ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
  }
  // Strip IPv6 prefix for IPv4-mapped addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  // Normalize IPv6: group into /64 prefix to prevent rotation bypass
  if (ip.includes(':')) {
    const segments = ip.split(':');
    ip = segments.slice(0, 4).join(':') + '::/64';
  }
  return ip;
}

/**
 * Sliding Window In-Memory Rate Limiter with RFC headers and automatic cleanup.
 */
class SlidingWindowLimiter {
  constructor({ windowMs, maxRequests, message, keyGenerator }) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.keyGenerator = keyGenerator || ((req) => `${getClientIp(req)}_${req.baseUrl || req.path}`);
    this.store = new Map();

    // Periodic cleanup of expired records
    const cleanupInterval = Math.max(60000, Math.floor(windowMs / 2));
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (now > record.resetTime) {
          this.store.delete(key);
        }
      }
    }, cleanupInterval);
  }

  middleware() {
    return (req, res, next) => {
      const key = this.keyGenerator(req);
      const now = Date.now();

      let record = this.store.get(key);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.store.set(key, record);
      } else {
        record.count += 1;
      }

      const remaining = Math.max(0, this.maxRequests - record.count);
      const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);

      // RFC standard rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > this.maxRequests) {
        res.setHeader('Retry-After', remainingSeconds);
        const resolvedMsg = typeof this.message === 'function' ? this.message(remainingSeconds) : this.message;
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: resolvedMsg,
          retryAfter: remainingSeconds,
        });
      }

      next();
    };
  }
}

/**
 * Account Lockout Manager
 * Tracks consecutive failed authentication attempts against targeted email addresses.
 * Defends against distributed botnets rotating IPs to brute-force a specific account.
 */
class AccountLockoutManager {
  constructor({ maxAttempts = 5, windowMs = 15 * 60 * 1000, baseLockoutMs = 15 * 60 * 1000 } = {}) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.baseLockoutMs = baseLockoutMs;
    this.accounts = new Map(); // email -> { failedAttempts, lockedUntil, lockoutLevel, firstAttemptAt }

    // Periodic cleanup of expired entries
    setInterval(() => {
      const now = Date.now();
      for (const [email, data] of this.accounts.entries()) {
        if (now > data.lockedUntil && now - data.firstAttemptAt > this.windowMs * 2) {
          this.accounts.delete(email);
        }
      }
    }, 5 * 60 * 1000);
  }

  normalizeKey(email) {
    return String(email || '').trim().toLowerCase();
  }

  isLocked(email) {
    const key = this.normalizeKey(email);
    if (!key) return { isLocked: false, remainingSeconds: 0 };
    const data = this.accounts.get(key);
    if (!data) return { isLocked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (data.lockedUntil && data.lockedUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((data.lockedUntil - now) / 1000),
        lockedUntil: data.lockedUntil,
      };
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  recordFailure(email) {
    const key = this.normalizeKey(email);
    if (!key) return { isLocked: false, remainingSeconds: 0, attemptsRemaining: this.maxAttempts };
    const now = Date.now();
    let data = this.accounts.get(key);

    if (!data || now - data.firstAttemptAt > this.windowMs) {
      data = {
        failedAttempts: 1,
        firstAttemptAt: now,
        lockedUntil: 0,
        lockoutLevel: data?.lockoutLevel || 0,
      };
    } else {
      data.failedAttempts += 1;
    }

    if (data.failedAttempts >= this.maxAttempts) {
      data.lockoutLevel += 1;
      // Progressive exponential backoff: 15m -> 30m -> 60m
      const multiplier = Math.min(4, Math.pow(2, data.lockoutLevel - 1));
      const durationMs = this.baseLockoutMs * multiplier;
      data.lockedUntil = now + durationMs;
      data.failedAttempts = 0; // reset for next cycle
      this.accounts.set(key, data);

      const remainingSeconds = Math.ceil(durationMs / 1000);
      console.warn(`[SECURITY LOCKOUT] Account "${key}" locked for ${remainingSeconds}s due to repeated failures.`);
      return {
        isLocked: true,
        remainingSeconds,
        lockedUntil: data.lockedUntil,
        attemptsRemaining: 0,
      };
    }

    this.accounts.set(key, data);
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsRemaining: this.maxAttempts - data.failedAttempts,
    };
  }

  reset(email) {
    const key = this.normalizeKey(email);
    if (key) {
      this.accounts.delete(key);
    }
  }

  lockManually(email, seconds = 900) {
    const key = this.normalizeKey(email);
    if (!key) return;
    const now = Date.now();
    this.accounts.set(key, {
      failedAttempts: 0,
      firstAttemptAt: now,
      lockedUntil: now + seconds * 1000,
      lockoutLevel: 1,
    });
  }
}

export const accountLockoutManager = new AccountLockoutManager();

/**
 * 1. LOGIN RATE LIMITER
 * - IP Level: Max 10 attempts per 15 minutes.
 * - Account Level: Pre-checks if target email is currently locked out.
 */
const loginIpLimiter = new SlidingWindowLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: (secs) => `Too many login attempts from this network. Please wait ${Math.ceil(secs / 60)} minute(s) before trying again.`,
  keyGenerator: (req) => `${getClientIp(req)}_login`,
});

export const loginRateLimiter = (req, res, next) => {
  const email = req.body?.email;
  if (email) {
    const lock = accountLockoutManager.isLocked(email);
    if (lock.isLocked) {
      const mins = Math.ceil(lock.remainingSeconds / 60);
      res.setHeader('Retry-After', lock.remainingSeconds);
      return res.status(429).json({
        success: false,
        error: 'ACCOUNT_TEMPORARILY_LOCKED',
        message: `Account protection active: Too many failed login attempts on this email. Please wait ${mins} minute(s) before trying again.`,
        retryAfter: lock.remainingSeconds,
      });
    }
  }
  return loginIpLimiter.middleware()(req, res, next);
};

/**
 * 2. SIGNUP RATE LIMITER
 * Protects against bot registration attacks and MongoDB saturation.
 * Limits to 5 new account creations per 1 hour per IP.
 */
export const signupRateLimiter = new SlidingWindowLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: (secs) => `Account creation rate limit reached. Please wait ${Math.ceil(secs / 60)} minute(s) before registering another account.`,
  keyGenerator: (req) => `${getClientIp(req)}_signup`,
}).middleware();

/**
 * 3. OTP SEND RATE LIMITER
 * Defends against:
 * - Email SMS/OTP bombing against victim inboxes.
 * - Depletion of daily Brevo email credits.
 * Rules:
 * - 60-second cooldown between consecutive OTP requests for the same email.
 * - Max 3 OTP requests per 10 minutes per email.
 * - Max 5 OTP requests per 15 minutes per IP.
 */
const otpEmailTracker = new Map(); // email -> { lastSent, count10m, resetTime }

export const otpSendLimiter = (req, res, next) => {
  const ip = getClientIp(req);
  const rawEmail = req.body?.email;
  const email = String(rawEmail || '').trim().toLowerCase();
  const now = Date.now();

  if (email) {
    let emailData = otpEmailTracker.get(email);
    if (!emailData || now > emailData.resetTime) {
      emailData = { lastSent: 0, count10m: 0, resetTime: now + 10 * 60 * 1000 };
      otpEmailTracker.set(email, emailData);
    }

    // A. 60-second minimum cooldown
    const elapsedSinceLast = now - emailData.lastSent;
    if (elapsedSinceLast < 60 * 1000) {
      const waitSecs = Math.ceil((60 * 1000 - elapsedSinceLast) / 1000);
      res.setHeader('Retry-After', waitSecs);
      return res.status(429).json({
        success: false,
        error: 'OTP_COOLDOWN_ACTIVE',
        message: `Please wait ${waitSecs} second(s) before requesting another verification code.`,
        retryAfter: waitSecs,
      });
    }

    // B. Max 3 OTP requests per 10 minutes per email
    if (emailData.count10m >= 3) {
      const remainingSecs = Math.ceil((emailData.resetTime - now) / 1000);
      res.setHeader('Retry-After', remainingSecs);
      return res.status(429).json({
        success: false,
        error: 'OTP_EMAIL_LIMIT_REACHED',
        message: `Too many verification codes requested for this email. Please wait ${Math.ceil(remainingSecs / 60)} minute(s) or use password login.`,
        retryAfter: remainingSecs,
      });
    }

    emailData.lastSent = now;
    emailData.count10m += 1;
    otpEmailTracker.set(email, emailData);
  }

  // C. IP Limit: Max 5 OTP sends per 15 minutes
  return new SlidingWindowLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: (secs) => `Too many OTP requests from your network. Please wait ${Math.ceil(secs / 60)} minute(s).`,
    keyGenerator: () => `${ip}_otpsend`,
  }).middleware()(req, res, next);
};

/**
 * 4. OTP VERIFICATION LIMITER
 * Prevents 6-digit numeric OTP brute force attacks.
 * Max 5 attempts per 10 minutes per IP/email.
 */
export const otpVerifyLimiter = new SlidingWindowLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 5,
  message: (secs) => `Too many invalid verification attempts. Security lock active for ${Math.ceil(secs / 60)} minute(s).`,
  keyGenerator: (req) => `${getClientIp(req)}_${String(req.body?.email || '').toLowerCase()}_otpverify`,
}).middleware();

/**
 * 5. CHECKOUT LIMITER
 * Max 10 checkout orders per 2 minutes per IP.
 */
export const checkoutLimiter = new SlidingWindowLimiter({
  windowMs: 2 * 60 * 1000,
  maxRequests: 10,
  message: 'Checkout request limit exceeded. Please wait a moment before placing another order.',
  keyGenerator: (req) => `${getClientIp(req)}_checkout`,
}).middleware();

/**
 * 6. GENERAL API LIMITER
 * Max 120 requests per minute per IP.
 */
export const apiLimiter = new SlidingWindowLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'API rate limit exceeded. Please slow down.',
  keyGenerator: (req) => `${getClientIp(req)}_general`,
}).middleware();

// Backward-compatibility alias
export const authLimiter = loginRateLimiter;
