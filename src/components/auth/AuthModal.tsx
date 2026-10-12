import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  detectSqlInjection,
  detectXssInjection,
  evaluatePasswordStrength,
  isValidEmail,
  loginRateLimiter,
} from '../../utils/security';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, signup, setCurrentView } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [securityNotice, setSecurityNotice] = useState('');

  if (!isAuthOpen) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSecurityNotice('');

    // Pre-flight SQL Injection & XSS detection
    if (
      detectSqlInjection(email) ||
      detectSqlInjection(password) ||
      (mode === 'signup' && detectSqlInjection(name))
    ) {
      setErrorMsg('Security Block: Malicious SQL patterns or operators detected in your input.');
      setSecurityNotice('Your query was rejected by the active SQL Injection filter.');
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
      const success = login(email, role);
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
      const success = signup(name, email, role);
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

  const handleQuickDemo = (demoEmail: string, demoRole: UserRole) => {
    login(demoEmail, demoRole);
    setIsAuthOpen(false);
    if (demoRole === 'admin' || demoRole === 'manager') {
      setCurrentView('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsAuthOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#173F30]/10 text-[#173F30] flex items-center justify-center font-bold text-sm">
                V
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2E342D] leading-tight">
                  {mode === 'login' ? 'Sign In to Velneer' : 'Create an Account'}
                </h3>
                <span className="text-[10px] text-[#6B7068]">
                  {mode === 'login' ? 'Access your orders & saved items' : 'Fast checkout & member discounts'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAuthOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Brand Header */}
            <div className="text-center pb-1">
              <div className="flex items-center justify-center text-2xl font-extrabold tracking-tight mb-1">
                <span className="text-[#2E342D]">Vel</span>
                <span className="text-[#173F30]">neer</span>
              </div>
              <p className="text-xs text-[#6B7068]">
                {mode === 'login'
                  ? 'Sign in to access your orders, wishlist & profile'
                  : 'Join Velneer today for exclusive deals & quick checkout'}
              </p>
            </div>

        {/* Quick Demo Switchers */}
        <div className="mb-5 bg-[#E9EBDD] border border-[#B9A48B] rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between font-semibold text-[#2E342D] mb-2">
            <span>⚡ Instant Demo Sign-in:</span>
            <span className="text-[10px] text-[#173F30] font-bold">1-click Switch</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@velneer.in', 'admin')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#B9A48B] text-[#2E342D] font-semibold hover:bg-[#173F30] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('manager@velneer.in', 'manager')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#B9A48B] text-[#2E342D] font-semibold hover:bg-[#173F30] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              📦 Store Mgr
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('rahul@example.com', 'customer')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#B9A48B] text-[#2E342D] font-semibold hover:bg-[#173F30] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              🛍️ Customer
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-[#D7E0D6] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors cursor-pointer text-center border-b-2 ${
              mode === 'login'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
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
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors cursor-pointer text-center border-b-2 ${
              mode === 'signup'
                ? 'border-[#173F30] text-[#173F30]'
                : 'border-transparent text-[#D8C8B3] hover:text-[#2E342D]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-[#E63946] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#D8C8B3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#173F30] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D8C8B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#173F30] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#D8C8B3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#173F30] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8C8B3] hover:text-[#2E342D] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-1.5 space-y-1">
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
                    {passwordStrength.level} ({password.length} chars)
                  </span>
                </div>
                <div className="w-full bg-[#D7E0D6] h-1.5 rounded-full overflow-hidden flex">
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
                <Lock className="w-4 h-4 text-[#D8C8B3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#173F30] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Role selector dropdown for RBAC simulation */}
          <div>
            <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
              Account Role (RBAC Simulation)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#173F30]"
            >
              <option value="customer">Customer (Storefront & Profile)</option>
              <option value="manager">Store Manager (Inventory & Orders)</option>
              <option value="admin">Super Admin (Full Management Access)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2E342D] hover:bg-[#6B7068] text-white font-bold text-xs sm:text-sm py-3 rounded-lg transition-colors cursor-pointer shadow-md mt-2"
          >
            {mode === 'login' ? 'Sign In Securely' : 'Create My Account'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Role-Based Access Control & Encrypted Session Storage</span>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
