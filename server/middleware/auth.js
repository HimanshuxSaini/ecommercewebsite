import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'velneer_super_secure_jwt_secret_key_2026_enterprise';
const TOKEN_EXPIRY = '7d';

export function signToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
export function authenticate(req, res, next) {
  // Check authorization header or cookie
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.velneer_token) {
    token = req.cookies.velneer_token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }

  const user = db.getUserById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User account not found or suspended.' });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
}

// Optional Auth (for guest checkouts)
export function optionalAuth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.velneer_token) {
    token = req.cookies.velneer_token;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      const user = db.getUserById(decoded.id);
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }
  }
  next();
}

// RBAC Authorization Middleware (Requires specific role: 'admin' or 'manager')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' lacks permission for this administrative resource.`,
      });
    }
    next();
  };
}
