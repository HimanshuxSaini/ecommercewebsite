class ServerRateLimiter {
  constructor(windowMs = 60000, maxRequests = 10, message = 'Too many requests. Please wait a moment.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.clients = new Map();

    // Clean up stale entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.clients.entries()) {
        if (now - record.resetTime > this.windowMs) {
          this.clients.delete(key);
        }
      }
    }, 300000);
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const key = `${ip}_${req.baseUrl || req.path}`;
      const now = Date.now();

      let record = this.clients.get(key);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
        };
        this.clients.set(key, record);
        return next();
      }

      record.count += 1;
      if (record.count > this.maxRequests) {
        const remainingSeconds = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', remainingSeconds);
        return res.status(429).json({
          success: false,
          message: this.message,
          retryAfter: remainingSeconds,
        });
      }

      next();
    };
  }
}

// 5 attempts per minute on login/signup
export const authLimiter = new ServerRateLimiter(60000, 5, 'Too many authentication attempts. Please wait 1 minute.').middleware();

// 10 checkout orders per 2 minutes
export const checkoutLimiter = new ServerRateLimiter(120000, 10, 'Too many checkout requests. Please wait a moment.').middleware();

// 100 general requests per minute
export const apiLimiter = new ServerRateLimiter(60000, 100, 'API rate limit exceeded. Please slow down.').middleware();
