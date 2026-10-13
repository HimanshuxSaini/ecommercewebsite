import React, { useState } from 'react';
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
  const { isAuthOpen, setIsAuthOpen, login, signup } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-flight SQL Injection & XSS detection
    if (
      detectSqlInjection(email) ||
      detectSqlInjection(password) ||
      (mode === 'signup' && detectSqlInjection(name))
    ) {
      setErrorMsg('Security Block: Malicious SQL patterns or operators detected in your input.');
      return;
    }

    if (
      detectXssInjection(email) ||
      detectXssInjection(password) ||
      (mode === 'signup' && detectXssInjection(name))
    ) {
      setErrorMsg('Security Block: Script injection/HTML tags are strictly disallowed.');
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMsg('Please enter a valid, well-formed email address.');
      return;
    }

    // Rate Limiting Check
    const rateCheck = loginRateLimiter.isLockedOut(email);
    if (rateCheck.isLocked) {
      setErrorMsg(`Too many unsuccessful login attempts. Locked out for ${rateCheck.remainingSeconds}s for your security.`);
      return;
    }

    if (mode === 'login') {
      if (!email || !password) {
        setErrorMsg('Please fill in both email and password.');
        return;
      }
      const success = await login(email, 'customer', password);
      if (success) {
        setIsAuthOpen(false);
      } else {
        setErrorMsg('Invalid login credentials or account not verified.');
      }
    } else {
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Security Requirement: Password must be at least 8 characters long.');
        return;
      }
      if (!passwordStrength.hasLetter || !passwordStrength.hasNumber) {
        setErrorMsg('Password must contain at least one letter and one number for cryptographic strength.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter confirm password.');
        return;
      }
      const success = await signup(name, email, 'customer', password);
      if (success) {
        setIsAuthOpen(false);
      }
    }
  };

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAuthOpen) {
        setIsAuthOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthOpen, setIsAuthOpen]);

  // Lock body scroll while open
  React.useEffect(() => {
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

      {/* Main Full-Screen Center Area */}
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
                Discover thoughtfully chosen essentials, timeless design, and a more personal shopping experience.
              </p>

              <div className="space-y-3 my-4 xl:my-6">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Delivery Across India</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Complimentary shipping on orders above ₹499.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Your Account, Protected</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Designed with account security and privacy in mind.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Lock className="w-3.5 h-3.5 text-[#E9EBDD] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Privacy Matters</p>
                    <p className="text-[10px] xl:text-[11px] text-white/70">Your information is handled according to our Privacy Policy.</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] xl:text-[11px] text-white/70 italic border-t border-white/15 pt-3">
              “Considered choices. Effortless living. The Velneer experience.”
            </p>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-7 p-5 sm:p-7 xl:p-8 flex flex-col justify-center overflow-y-auto max-h-[calc(100vh-5rem)] scrollbar-none">
            {/* Header info */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#2E342D] tracking-tight mb-0.5">
                {mode === 'login' ? 'Sign In to Velneer' : 'Create an Account'}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B7068]">
                {mode === 'login'
                  ? 'Access your orders, saved wishlist items, and personal settings.'
                  : 'Join Velneer today for early drops, member pricing, and instant checkout.'}
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex border-b border-[#D7E0D6] mb-3 sm:mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
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

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E63946] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-10 py-2 sm:py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#2E342D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {mode === 'signup' && password.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#6B7068] font-medium">Password Strength:</span>
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
                    <div className="w-full bg-[#D7E0D6] h-1 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 4
                            ? 'w-full bg-[#2E7D32]'
                            : passwordStrength.score === 3
                            ? 'w-3/4 bg-[#173F30]'
                            : passwordStrength.score === 2
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/4 bg-[#E63946]'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#6B7068] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-2 focus:ring-[#173F30] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#173F30] hover:bg-[#2E342D] text-white font-bold text-xs py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer shadow-sm mt-1 sm:mt-2 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{mode === 'login' ? 'Sign In Securely' : 'Create My Account'}</span>
              </button>
            </form>

            <div className="mt-3 sm:mt-4 pt-3 border-t border-[#D7E0D6] flex items-center justify-center gap-2 text-[10px] text-[#6B7068]">
              <Shield className="w-3 h-3 text-[#173F30]" />
              <span>Verified Session &amp; Secure Authentication</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
