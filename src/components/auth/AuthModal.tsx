import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  detectSqlInjection,
  detectXssInjection,
  evaluatePasswordStrength,
  isValidEmail,
  loginRateLimiter,
} from '../../utils/security';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, signup, sendOtp, verifyOtp } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [signupMethod, setSignupMethod] = useState<'password' | 'otp'>('password');

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Security honeypot (empty for humans, filled by automated bot crawlers)
  const [honeypot, setHoneypot] = useState('');
  const formLoadedAt = useRef(Date.now());

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lockoutCooldown, setLockoutCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordStrength = evaluatePasswordStrength(password, email);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Anti-brute-force lockout countdown timer
  useEffect(() => {
    if (lockoutCooldown <= 0) return;
    const timer = setInterval(() => {
      setLockoutCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutCooldown]);

  // Reset form and wipe sensitive credential memory when modal opens or closes
  useEffect(() => {
    if (isAuthOpen) {
      formLoadedAt.current = Date.now();
      setErrorMsg('');
      setIsOtpSent(false);
      setOtpCode('');
      setHoneypot('');
      setResendCooldown(0);
    } else {
      // Memory wipe of sensitive plaintext password state
      setPassword('');
      setConfirmPassword('');
      setOtpCode('');
      setHoneypot('');
      setErrorMsg('');
    }
  }, [isAuthOpen, mode]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthOpen) {
        setIsAuthOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthOpen, setIsAuthOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isAuthOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthOpen]);

  if (!isAuthOpen) return null;

  // Handle Requesting OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (
      detectSqlInjection(email) ||
      detectXssInjection(email) ||
      (mode === 'signup' && (detectSqlInjection(name) || detectXssInjection(name)))
    ) {
      setErrorMsg('Security Block: Disallowed characters or SQL injection patterns detected.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMsg('Please enter your full name (minimum 2 characters).');
        return;
      }
      if (password && password.length < 8) {
        setErrorMsg('Password must be at least 8 characters.');
        return;
      }
      if (password && password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    // Rate limiter guard
    if (lockoutCooldown > 0) {
      setErrorMsg(`Security lockout active. Please wait ${lockoutCooldown}s.`);
      return;
    }

    // Bot submission velocity protection (< 400ms after load indicates scripted bot)
    if (Date.now() - formLoadedAt.current < 400 && !isOtpSent) {
      setErrorMsg('Security Notice: Form submitted too quickly. Please review your details and submit again.');
      return;
    }

    const rateCheck = loginRateLimiter.isLockedOut(email);
    if (rateCheck.isLocked) {
      setLockoutCooldown(rateCheck.remainingSeconds);
      setErrorMsg(`Too many attempts. Account protection active for ${rateCheck.remainingSeconds}s.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(email.trim(), mode, honeypot);
      if (res.success) {
        setIsOtpSent(true);
        setResendCooldown(60);
      } else {
        setErrorMsg(res.message || 'Failed to dispatch verification code.');
        if (res.retryAfter) {
          setLockoutCooldown(res.retryAfter);
        }
      }
    } catch {
      setErrorMsg('Network error sending verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verifying OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutCooldown > 0) {
      setErrorMsg(`Security lockout active. Please wait ${lockoutCooldown}s.`);
      return;
    }

    const cleanOtp = otpCode.replace(/\D/g, '').trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        type: mode,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        password: password || undefined,
        hp_website: honeypot,
      });

      if (res.success) {
        setPassword('');
        setConfirmPassword('');
        setOtpCode('');
        setIsAuthOpen(false);
      } else {
        setErrorMsg(res.message || 'Invalid or expired verification code.');
        if (res.retryAfter) {
          setLockoutCooldown(res.retryAfter);
        }
      }
    } catch {
      setErrorMsg('Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Standard Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutCooldown > 0) {
      setErrorMsg(`Account protection active. Please wait ${lockoutCooldown}s before trying again.`);
      return;
    }

    // Bot submission velocity protection
    if (Date.now() - formLoadedAt.current < 400) {
      setErrorMsg('Security Notice: Fast automated interaction detected. Please try again.');
      return;
    }

    const rateCheck = loginRateLimiter.isLockedOut(email);
    if (rateCheck.isLocked) {
      setLockoutCooldown(rateCheck.remainingSeconds);
      setErrorMsg(`Account protection active. Please wait ${rateCheck.remainingSeconds}s.`);
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), 'customer', password, honeypot);
      if (res.success) {
        setPassword('');
        setConfirmPassword('');
        setIsAuthOpen(false);
      } else {
        setErrorMsg(res.message || 'Invalid email or password. You can also sign in via Email OTP.');
        if (res.retryAfter) {
          setLockoutCooldown(res.retryAfter);
        }
      }
    } catch {
      setErrorMsg('Sign in failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Standard Password Sign Up (Instant 1-Click Registration)
  const handlePasswordSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutCooldown > 0) {
      setErrorMsg(`Registration rate limit active. Please wait ${lockoutCooldown}s.`);
      return;
    }

    // Bot submission velocity protection
    if (Date.now() - formLoadedAt.current < 400) {
      setErrorMsg('Security Notice: Automated form submission detected. Please review and try again.');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (
      detectSqlInjection(email) ||
      detectXssInjection(email) ||
      detectSqlInjection(name) ||
      detectXssInjection(name)
    ) {
      setErrorMsg('Security Block: Disallowed characters or SQL injection patterns detected.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (!passwordStrength.isNotCommon) {
      setErrorMsg('Security Alert: This password is too common or easily guessable. Please create a stronger password.');
      return;
    }

    if (!passwordStrength.isNotEmail) {
      setErrorMsg('Security Alert: Password must not contain parts of your email address.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup(name.trim(), email.trim().toLowerCase(), 'customer', password, phone.trim(), honeypot);
      if (res.success) {
        setPassword('');
        setConfirmPassword('');
        setIsAuthOpen(false);
      } else {
        setErrorMsg(res.message || 'Registration failed. An account with this email may already exist.');
        if (res.retryAfter) {
          setLockoutCooldown(res.retryAfter);
        }
      }
    } catch {
      setErrorMsg('Account registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] h-screen max-h-screen overflow-hidden flex flex-col animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <header className="h-14 sm:h-16 border-b border-[#D7E0D6] bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-2.5 select-none">
          <img
            src="/velneer_emblem_clean.png"
            alt="Velneer Logo"
            className="h-9 w-auto object-contain drop-shadow-xs"
          />
          <img
            src="/velneer_name_clean.png"
            alt="Velneer"
            className="h-6 w-auto object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAuthOpen(false)}
          className="flex items-center gap-2 text-xs font-semibold text-[#2E342D] hover:text-[#173F30] bg-[#E9EBDD] hover:bg-[#D7E0D6] border border-[#B9A48B] px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
          title="Return to Storefront"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#173F30]" />
          <span>Return to Store</span>
        </button>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-4xl max-h-[calc(100vh-5rem)] bg-white rounded-2xl sm:rounded-3xl border border-[#D7E0D6] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Brand Showcase (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#173F30] text-white p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-white/90 text-[10px] font-semibold backdrop-blur-xs mb-3 xl:mb-4">
                Velneer Member Portal
              </div>
              <h2 className="text-xl xl:text-2xl font-extrabold tracking-tight leading-tight text-white mb-2">
                Elevate your everyday.
              </h2>
              <p className="text-[11px] xl:text-xs text-white/80 leading-relaxed">
                Experience verified security, instant email OTP verification, and seamless access to orders and member perks.
              </p>

              <div className="space-y-3 my-4 xl:my-6">
                <div className="flex items-start gap-2.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Instant Email OTP</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Secure 6-digit codes sent straight to your inbox.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Your Account, Protected</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Anti-tamper security and encrypted token sessions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Fast &amp; Free Delivery</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Free shipping on orders above ₹499 across India.</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] xl:text-[11px] text-white/70 italic border-t border-white/15 pt-3">
              “Effortless living. Verified quality. The Velneer experience.”
            </p>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 p-5 sm:p-7 xl:p-8 flex flex-col justify-center overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-none">
            {/* Header info */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2E342D] tracking-tight mb-0.5">
                {isOtpSent
                  ? 'Verify Your Email OTP'
                  : mode === 'login'
                  ? 'Sign In to Velneer'
                  : 'Create an Account'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B7068]">
                {isOtpSent
                  ? `Enter the 6-digit code sent to ${email}`
                  : mode === 'login'
                  ? 'Access your orders, saved wishlist items, and personal settings.'
                  : 'Join Velneer with email verification for exclusive drops and orders.'}
              </p>
            </div>

            {/* Mode Toggle Tabs (Hidden while verifying OTP) */}
            {!isOtpSent && (
              <div className="flex border-b border-[#D7E0D6] mb-3 sm:mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 pb-2 text-xs font-bold transition-colors cursor-pointer text-center border-b-2 ${
                    mode === 'login'
                      ? 'border-[#173F30] text-[#173F30]'
                      : 'border-transparent text-[#6B7068] hover:text-[#2E342D]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 pb-2 text-xs font-bold transition-colors cursor-pointer text-center border-b-2 ${
                    mode === 'signup'
                      ? 'border-[#173F30] text-[#173F30]'
                      : 'border-transparent text-[#6B7068] hover:text-[#2E342D]'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Method Switcher (OTP vs Password) */}
            {!isOtpSent && (
              <div className="flex bg-[#E9EBDD] p-1 rounded-xl mb-3 text-xs">
                {mode === 'login' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('otp');
                        setErrorMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        loginMethod === 'otp'
                          ? 'bg-white text-[#173F30] shadow-xs'
                          : 'text-[#6B7068] hover:text-[#2E342D]'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Email OTP (Fast)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('password');
                        setErrorMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        loginMethod === 'password'
                          ? 'bg-white text-[#173F30] shadow-xs'
                          : 'text-[#6B7068] hover:text-[#2E342D]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupMethod('password');
                        setErrorMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        signupMethod === 'password'
                          ? 'bg-white text-[#173F30] shadow-xs'
                          : 'text-[#6B7068] hover:text-[#2E342D]'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Instant Sign Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupMethod('otp');
                        setErrorMsg('');
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        signupMethod === 'otp'
                          ? 'bg-white text-[#173F30] shadow-xs'
                          : 'text-[#6B7068] hover:text-[#2E342D]'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Email OTP</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Lockout Warning Banner */}
            {lockoutCooldown > 0 && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between animate-in fade-in shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-semibold">Security Lockout Active</span>
                </div>
                <span className="font-mono font-extrabold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md text-[11px]">
                  {lockoutCooldown}s remaining
                </span>
              </div>
            )}

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E63946] text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STAGE A: OTP INPUT & VERIFICATION */}
            {/* ========================================================================= */}
            {isOtpSent ? (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                {/* Security Honeypot (Invisible to humans, traps automated form-filling bots) */}
                <div className="opacity-0 absolute -left-[9999px] top-0 h-0 w-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" tabIndex={-1}>
                  <label htmlFor="hp_otp_trap">Leave this blank</label>
                  <input
                    id="hp_otp_trap"
                    type="text"
                    name="hp_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="p-3 bg-[#E9EBDD] border border-[#B9A48B] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#173F30]" />
                    <span className="font-semibold text-[#2E342D] truncate max-w-[200px] sm:max-w-[260px]">
                      {email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtpCode('');
                      setErrorMsg('');
                    }}
                    className="text-[#173F30] font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    Edit Email
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#173F30] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      autoFocus
                      autoComplete="one-time-code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full text-center tracking-[8px] sm:tracking-[12px] font-mono text-xl sm:text-2xl font-extrabold bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-10 pr-4 py-2.5 text-[#173F30] placeholder-[#B9A48B] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-[#6B7068] mt-1.5 text-center">
                    Check your spam/junk folder if code doesn't appear in your main inbox within 30s.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6 || lockoutCooldown > 0}
                  className="w-full bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-[#B9A48B] text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Verifying Code...</span>
                  ) : lockoutCooldown > 0 ? (
                    <span>Locked ({lockoutCooldown}s)</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{mode === 'login' ? 'Verify & Sign In' : 'Verify & Activate Account'}</span>
                    </>
                  )}
                </button>

                {/* Resend OTP Button */}
                <div className="text-center pt-1 space-y-2">
                  {resendCooldown > 0 ? (
                    <span className="text-[11px] text-[#6B7068]">
                      Resend new code in <strong className="text-[#173F30]">{resendCooldown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRequestOtp()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#173F30] hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Verification Code</span>
                    </button>
                  )}

                  {/* Fallback to instant password registration */}
                  <div className="pt-2 border-t border-[#D7E0D6] text-center">
                    <p className="text-[11px] text-[#6B7068] mb-1">Didn't receive the email in your inbox or spam?</p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtpSent(false);
                        setMode('signup');
                        setSignupMethod('password');
                        setErrorMsg('');
                      }}
                      className="text-xs font-bold text-[#173F30] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign Up Instantly with Password Instead</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : mode === 'login' && loginMethod === 'otp' ? (
              /* ========================================================================= */
              /* STAGE B: LOGIN VIA EMAIL OTP (EMAIL INPUT) */
              /* ========================================================================= */
              <form onSubmit={handleRequestOtp} className="space-y-3">
                {/* Security Honeypot */}
                <div className="opacity-0 absolute -left-[9999px] top-0 h-0 w-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" tabIndex={-1}>
                  <label htmlFor="hp_login_otp_trap">Leave this blank</label>
                  <input
                    id="hp_login_otp_trap"
                    type="text"
                    name="hp_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Your Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || lockoutCooldown > 0}
                  className="w-full bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-[#B9A48B] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span>Sending Code...</span>
                  ) : lockoutCooldown > 0 ? (
                    <span>Locked ({lockoutCooldown}s)</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Verification Code (OTP)</span>
                    </>
                  )}
                </button>
              </form>
            ) : mode === 'login' && loginMethod === 'password' ? (
              /* ========================================================================= */
              /* STAGE C: LOGIN VIA PASSWORD */
              /* ========================================================================= */
              <form onSubmit={handlePasswordLoginSubmit} className="space-y-3">
                {/* Security Honeypot */}
                <div className="opacity-0 absolute -left-[9999px] top-0 h-0 w-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" tabIndex={-1}>
                  <label htmlFor="hp_login_pass_trap">Leave this blank</label>
                  <input
                    id="hp_login_pass_trap"
                    type="text"
                    name="hp_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-10 py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#2E342D] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || lockoutCooldown > 0}
                  className="w-full bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-[#B9A48B] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span>Signing in...</span>
                  ) : lockoutCooldown > 0 ? (
                    <span>Locked ({lockoutCooldown}s)</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Sign In with Password</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* ========================================================================= */
              /* STAGE D: CREATE ACCOUNT (INSTANT PASSWORD OR EMAIL OTP) */
              /* ========================================================================= */
              <form
                onSubmit={signupMethod === 'password' ? handlePasswordSignupSubmit : handleRequestOtp}
                className="space-y-2.5 sm:space-y-3"
              >
                {/* Security Honeypot (Invisible to humans, traps automated form-filling bots) */}
                <div className="opacity-0 absolute -left-[9999px] top-0 h-0 w-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" tabIndex={-1}>
                  <label htmlFor="hp_signup_trap">Leave this blank</label>
                  <input
                    id="hp_signup_trap"
                    type="text"
                    name="hp_website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9XXXX XXXXX"
                        className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-10 py-2 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#2E342D] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="mt-1.5 space-y-1 bg-white/70 p-2 rounded-lg border border-[#D7E0D6]">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#6B7068] font-medium">Security Strength:</span>
                        <span
                          className={`font-bold ${
                            passwordStrength.level === 'Strong'
                              ? 'text-[#2E7D32]'
                              : passwordStrength.level === 'Good'
                              ? 'text-[#173F30]'
                              : passwordStrength.level === 'Fair'
                              ? 'text-amber-600'
                              : 'text-[#E63946]'
                          }`}
                        >
                          {passwordStrength.level}
                        </span>
                      </div>
                      <div className="w-full bg-[#E9EBDD] h-1.5 rounded-full overflow-hidden flex gap-0.5">
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 1 ? (passwordStrength.score === 1 ? 'bg-rose-500' : 'bg-amber-500') : 'bg-gray-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 2 ? (passwordStrength.score === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-gray-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 3 ? 'bg-emerald-600' : 'bg-gray-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            passwordStrength.score >= 4 ? 'bg-[#173F30]' : 'bg-gray-200'
                          }`}
                        />
                      </div>

                      {/* Security Rules Checklist */}
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                        <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-emerald-700' : 'text-[#6B7068]'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${passwordStrength.hasMinLength ? 'text-emerald-600' : 'text-gray-300'}`} />
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.hasLetter && passwordStrength.hasNumber ? 'text-emerald-700' : 'text-[#6B7068]'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${passwordStrength.hasLetter && passwordStrength.hasNumber ? 'text-emerald-600' : 'text-gray-300'}`} />
                          <span>Letters & numbers</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.isNotCommon ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${passwordStrength.isNotCommon ? 'text-emerald-600' : 'text-rose-500'}`} />
                          <span>{passwordStrength.isNotCommon ? 'Breach protected' : 'Common password'}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.isNotEmail ? 'text-emerald-700' : 'text-rose-600 font-semibold'}`}>
                          <CheckCircle2 className={`w-3 h-3 ${passwordStrength.isNotEmail ? 'text-emerald-600' : 'text-rose-500'}`} />
                          <span>Unique from email</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || lockoutCooldown > 0}
                  className="w-full bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-[#B9A48B] text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? (
                    <span>{signupMethod === 'password' ? 'Creating Account...' : 'Sending Verification Code...'}</span>
                  ) : lockoutCooldown > 0 ? (
                    <span>Rate Limited ({lockoutCooldown}s)</span>
                  ) : signupMethod === 'password' ? (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Create Account Instantly</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Send Email Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
