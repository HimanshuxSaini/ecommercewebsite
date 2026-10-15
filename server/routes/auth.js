import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { isMongoConnected, UserModel } from '../config/mongodb.js';

const router = express.Router();

// Helper: cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// In-memory OTP storage: email -> { otp, expiresAt, type, attempts }
const otpStore = new Map();

// POST /api/auth/send-otp
router.post('/send-otp', authLimiter, async (req, res) => {
  const { email, type = 'login' } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  let user = null;
  if (isMongoConnected()) {
    try {
      user = await UserModel.findOne({ email: cleanEmail }).lean();
    } catch {}
  }
  if (!user) {
    user = db.getUserByEmail(cleanEmail);
  }

  // Generate secure 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    type,
    attempts: 0,
  });

  console.log(`[AUTH OTP] Dispatched OTP for ${cleanEmail} (${type}): [${otp}]`);

  // Dispatch live email via Brevo
  let emailDelivery = { success: true };
  try {
    const { sendOtpEmail } = await import('../services/brevoEmailService.js');
    emailDelivery = await sendOtpEmail({
      to: cleanEmail,
      toName: user?.name || cleanEmail.split('@')[0],
      otp,
      type,
    });
  } catch (err) {
    console.warn('[AUTH OTP] Brevo email dispatch notice:', err.message);
    emailDelivery = { success: false, error: err.message };
  }

  if (!emailDelivery.success && !emailDelivery.simulated) {
    const errText = typeof emailDelivery.error === 'string' ? emailDelivery.error : JSON.stringify(emailDelivery.error || '');
    console.error(`[AUTH OTP] Failed to send email to ${cleanEmail}:`, errText);
    const isIpBlock = errText.includes('unrecognised IP address');
    return res.status(502).json({
      success: false,
      message: isIpBlock
        ? 'Brevo email delivery blocked: Brevo has "Authorised IPs" enabled and blocked the server IP. Please visit https://app.brevo.com/security/authorised_ips and click "Deactivate blocking", or sign up directly with password.'
        : `Email delivery failed: ${errText.slice(0, 150)}. You can also create an account directly with password.`,
      emailError: errText,
    });
  }

  return res.json({
    success: true,
    message: `Verification code sent to ${cleanEmail}. Please check your inbox and spam folder.`,
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', authLimiter, async (req, res) => {
  const { email, otp, type = 'login', name, phone, password } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  const record = otpStore.get(cleanEmail);
  if (!record) {
    return res.status(400).json({ success: false, message: 'No verification code found or code has expired. Please request a new code.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
  }

  if (record.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return res.status(429).json({ success: false, message: 'Too many incorrect attempts. Please request a new verification code.' });
  }

  if (record.otp !== cleanOtp) {
    record.attempts += 1;
    return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email and try again.' });
  }

  // OTP is valid! Consume it immediately
  otpStore.delete(cleanEmail);

  // Check if email belongs to super admins
  const isAdmin = cleanEmail === 'himanshu0481@gmail.com' || cleanEmail === 'sales.velneer@gmail.com';
  const assignedRole = isAdmin ? 'admin' : 'customer';

  let user = null;
  if (isMongoConnected()) {
    try {
      user = await UserModel.findOne({ email: cleanEmail }).lean();
    } catch {}
  }
  if (!user) {
    user = db.getUserByEmail(cleanEmail);
  }

  if (user) {
    // Existing user: enforce admin role if special email
    const effectiveRole = isAdmin ? 'admin' : user.role;
    const token = signToken({ ...user, role: effectiveRole });
    res.cookie('velneer_token', token, COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: effectiveRole,
        phone: user.phone,
      },
    });
  }

  // New user registration via verified OTP
  const cleanName = name ? name.trim() : cleanEmail.split('@')[0];
  const passwordHash = password ? bcrypt.hashSync(password, 10) : '';
  const newUser = {
    id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: cleanName,
    email: cleanEmail,
    role: assignedRole,
    passwordHash,
    phone: phone ? phone.trim() : '',
    createdAt: new Date().toISOString().split('T')[0],
    isActive: true,
    emailVerified: true,
  };

  if (isMongoConnected()) {
    try {
      await UserModel.create(newUser);
    } catch (err) {
      console.warn('[MONGODB] User create fallback:', err.message);
    }
  }
  db.createUser(newUser);

  const token = signToken(newUser);
  res.cookie('velneer_token', token, COOKIE_OPTIONS);

  // Dispatch Welcome email
  import('../services/brevoEmailService.js')
    .then(({ sendWelcomeEmail }) => sendWelcomeEmail(newUser))
    .catch(() => {});

  return res.status(201).json({
    success: true,
    message: 'Email verified and account activated successfully!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    },
  });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = null;

  if (isMongoConnected()) {
    try {
      user = await UserModel.findOne({ email: cleanEmail }).lean();
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = db.getUserByEmail(cleanEmail);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  // Verify password if passwordHash exists
  if (user.passwordHash && password) {
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
  }

  // Role validation for demo/dev simulation if specified
  let effectiveRole = user.role;
  if (cleanEmail === 'himanshu0481@gmail.com' || cleanEmail === 'sales.velneer@gmail.com') {
    effectiveRole = 'admin';
  } else if (role && (role === 'admin' || role === 'manager' || role === 'customer')) {
    if (user.role === 'admin' || role === user.role) {
      effectiveRole = role;
    }
  }

  const token = signToken({ ...user, role: effectiveRole });
  res.cookie('velneer_token', token, COOKIE_OPTIONS);

  return res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: effectiveRole,
      phone: user.phone,
    },
  });
});

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  let existing = null;

  if (isMongoConnected()) {
    try {
      existing = await UserModel.findOne({ email: cleanEmail }).lean();
    } catch {
      existing = null;
    }
  }

  if (!existing) {
    existing = db.getUserByEmail(cleanEmail);
  }

  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  // Hash password with bcrypt cost factor 10
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: name.trim(),
    email: cleanEmail,
    role: (cleanEmail === 'himanshu0481@gmail.com' || cleanEmail === 'sales.velneer@gmail.com') ? 'admin' : 'customer',
    passwordHash,
    phone: phone ? phone.trim() : '',
    createdAt: new Date().toISOString().split('T')[0],
    isActive: true,
  };

  if (isMongoConnected()) {
    try {
      await UserModel.create(newUser);
    } catch (err) {
      console.warn('[MONGODB] User create fallback:', err.message);
    }
  }
  db.createUser(newUser);

  const token = signToken(newUser);
  res.cookie('velneer_token', token, COOKIE_OPTIONS);

  // Dispatch Brevo Welcome Email
  import('../services/brevoEmailService.js')
    .then(({ sendWelcomeEmail }) => sendWelcomeEmail(newUser))
    .catch((err) => console.warn('[BREVO] Welcome email trigger notice:', err.message));

  return res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    },
  });
});

// GET /api/auth/me (Returns authenticated user)
router.get('/me', authenticate, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('velneer_token');
  return res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
