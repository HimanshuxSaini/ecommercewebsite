/**
 * Velneer Enterprise Security & Input Sanitization Middleware
 * -------------------------------------------------------------
 * 1. NoSQL Injection Defense (strips $ and . operators from query/body)
 * 2. Bot & Headless Crawler Honeypot Trap
 * 3. Strict RFC Input Sanitization (Type validation, null-byte stripping, length caps)
 * 4. Password Complexity & Common Password Denylist Validation
 * 5. Origin / Referer Cross-Site Request Verification (CSRF mitigation)
 */

// Authoritative top compromised / breached passwords denylist
export const COMMON_PASSWORDS_DENYLIST = new Set([
  'password',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'velneer123',
  'admin123',
  'welcome123',
  'login123',
  'pass1234',
  'letmein123',
  'iloveyou',
  'monkey123',
  'dragon123',
  'football',
  'superman123',
  'trustno1',
  'sunshine',
  'princess',
  'master123',
]);

/**
 * Strips dangerous MongoDB operator keys ($gt, $ne, $where, $regex, etc.)
 * and period (.) keys to prevent NoSQL injection and document traversal.
 */
export function sanitizeNoSqlObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSqlObject);
  }

  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    // Drop keys starting with $ or containing .
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[SECURITY ALERT] Stripped NoSQL injection candidate key: "${key}"`);
      continue;
    }
    clean[key] = sanitizeNoSqlObject(val);
  }
  return clean;
}

/**
 * Global middleware: Sanitizes req.body, req.query, and req.params against NoSQL injection.
 */
export function noSqlSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeNoSqlObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeNoSqlObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeNoSqlObject(req.params);
  }
  next();
}

/**
 * Honeypot Bot Trap:
 * Automated headless bots, scanners, and scrapers automatically populate all form inputs.
 * If hidden honeypot fields contain any value, the bot is silently trapped.
 */
export function botHoneypotTrap(req, res, next) {
  const honeypotKeys = ['hp_website', 'bot_trap', 'company_fax', 'website_trap'];
  for (const key of honeypotKeys) {
    if (req.body && req.body[key] && String(req.body[key]).trim().length > 0) {
      const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      console.warn(`[SECURITY BOT TRAP] Headless crawler/bot trapped from IP ${clientIp} via "${key}". Request discarded.`);
      // Return simulated success to waste bot resources without touching database or services
      return res.status(200).json({
        success: true,
        message: 'Request received and queued for security validation.',
      });
    }
  }
  next();
}

/**
 * Strict Input Sanitization & Type Enforcement for Auth Endpoints
 */
export function authInputSanitizer(req, res, next) {
  const { email, name, phone, otp, password } = req.body || {};

  // 1. Email Sanitization & Type Checking
  if (email !== undefined) {
    if (typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid email payload type.' });
    }
    // Block null bytes, control characters, and verify length
    if (/[\x00-\x1F\x7F]/.test(email) || email.length > 254) {
      return res.status(400).json({ success: false, message: 'Email address contains invalid characters or exceeds limit.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    // Strict RFC 5322 standard pattern
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid, well-formed email address.' });
    }
    req.body.email = cleanEmail;
  }

  // 2. Name Sanitization (if present)
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid name payload type.' });
    }
    if (/[\x00-\x1F\x7F]/.test(name) || name.length > 80) {
      return res.status(400).json({ success: false, message: 'Name contains invalid characters or exceeds 80 characters.' });
    }
    // Strip HTML tags and script injections
    req.body.name = name.replace(/<[^>]*>?/gm, '').replace(/[<>'";`]/g, '').trim();
  }

  // 3. Phone Sanitization (if present)
  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid phone payload type.' });
    }
    const cleanPhone = phone.trim();
    if (!/^[+]?[\d\s-]{7,20}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number format.' });
    }
    req.body.phone = cleanPhone;
  }

  // 4. OTP Sanitization (if present)
  if (otp !== undefined) {
    const otpStr = String(otp).trim();
    if (!/^\d{6}$/.test(otpStr)) {
      return res.status(400).json({ success: false, message: 'Verification code must be exactly 6 numeric digits.' });
    }
    req.body.otp = otpStr;
  }

  // 5. Password Length Boundaries (DoS prevention against massive bcrypt hashing)
  if (password !== undefined) {
    if (typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid password format.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password length must not exceed 128 characters.' });
    }
  }

  next();
}

/**
 * Validates password complexity and checks against compromised password denylist
 */
export function validatePasswordSecurity(password, userEmail = '') {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must not exceed 128 characters.' };
  }

  const lowerPass = password.toLowerCase();

  // Denylist check
  if (COMMON_PASSWORDS_DENYLIST.has(lowerPass)) {
    return {
      valid: false,
      message: 'This password is too common or easily guessable. Please choose a more secure password.',
    };
  }

  // Check if password is based on the user's email username
  if (userEmail) {
    const emailPrefix = userEmail.split('@')[0].toLowerCase();
    if (emailPrefix.length >= 3 && lowerPass.includes(emailPrefix)) {
      return {
        valid: false,
        message: 'Password must not contain parts of your email address for security.',
      };
    }
  }

  // Check complexity (at least one letter and at least one number or symbol)
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasLetter || !hasNumberOrSymbol) {
    return {
      valid: false,
      message: 'Password must include a mix of letters and numbers or symbols.',
    };
  }

  return { valid: true };
}

/**
 * Cross-Site Request Origin Verification:
 * Validates Origin / Referer header on state-modifying requests to prevent external CSRF submissions.
 */
export function csrfOriginGuard(req, res, next) {
  // Only check state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return next();
  }

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers['host'];

  // If neither Origin nor Referer is provided (direct server calls, curls, mobile app), allow
  if (!origin && !referer) {
    return next();
  }

  const allowedOrigins = [
    host,
    'localhost',
    '127.0.0.1',
    process.env.APP_URL ? new URL(process.env.APP_URL).host : null,
  ].filter(Boolean);

  const checkHost = (urlStr) => {
    try {
      const parsed = new URL(urlStr);
      return allowedOrigins.some((allowed) => parsed.host === allowed || parsed.host.includes(allowed));
    } catch {
      return false;
    }
  };

  const isOriginAllowed = origin ? checkHost(origin) : true;
  const isRefererAllowed = referer ? checkHost(referer) : true;

  if (!isOriginAllowed && !isRefererAllowed) {
    console.warn(`[SECURITY CSRF GUARD] Blocked cross-origin request from Origin: ${origin}, Referer: ${referer}`);
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request blocked for security reasons.',
    });
  }

  next();
}
