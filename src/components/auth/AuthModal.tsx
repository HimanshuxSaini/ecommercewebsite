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

  const handleQuickDemo = (demoEmail: string, demoRole: UserRole) => {
    login(demoEmail, demoRole);
    setIsAuthOpen(false);
    if (demoRole === 'admin' || demoRole === 'manager') {
      setCurrentView('admin');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center text-2xl font-extrabold tracking-tight mb-1">
            <span className="text-[#1F1F1F]">Shop</span>
            <span className="text-[#8C6F52]">Verse</span>
          </div>
          <p className="text-xs text-[#3A3A3A]">
            {mode === 'login'
              ? 'Sign in to access your orders, wishlist & profile'
              : 'Join ShopVerse today for exclusive deals & quick checkout'}
          </p>
        </div>

        {/* Quick Demo Switchers */}
        <div className="mb-5 bg-[#F5F1EC] border border-[#C6B8AB] rounded-xl p-3 text-xs">
          <div className="flex items-center justify-between font-semibold text-[#1F1F1F] mb-2">
            <span>⚡ Instant Demo Sign-in:</span>
            <span className="text-[10px] text-[#8C6F52] font-bold">1-click Switch</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@shopverse.in', 'admin')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#C6B8AB] text-[#1F1F1F] font-semibold hover:bg-[#8C6F52] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('manager@shopverse.in', 'manager')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#C6B8AB] text-[#1F1F1F] font-semibold hover:bg-[#8C6F52] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              📦 Store Mgr
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('rahul@example.com', 'customer')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#C6B8AB] text-[#1F1F1F] font-semibold hover:bg-[#8C6F52] hover:text-white transition-colors cursor-pointer text-center text-[11px]"
            >
              🛍️ Customer
            </button>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex border-b border-[#E8E2DC] mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-colors cursor-pointer text-center border-b-2 ${
              mode === 'login'
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
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
                ? 'border-[#8C6F52] text-[#8C6F52]'
                : 'border-transparent text-[#A8927D] hover:text-[#1F1F1F]'
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
              <label className="text-[11px] font-semibold text-[#1F1F1F] block mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full text-xs bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-[#1F1F1F] block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#1F1F1F] block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg pl-9 pr-10 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8927D] hover:text-[#1F1F1F] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'signup' && password.length > 0 && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[#3A3A3A] font-medium">Security Strength:</span>
                  <span
                    className={`font-bold ${
                      passwordStrength.level === 'Strong'
                        ? 'text-[#2E7D32]'
                        : passwordStrength.level === 'Good'
                        ? 'text-[#8C6F52]'
                        : passwordStrength.level === 'Fair'
                        ? 'text-amber-600'
                        : 'text-[#E63946]'
                    }`}
                  >
                    {passwordStrength.level} ({password.length} chars)
                  </span>
                </div>
                <div className="w-full bg-[#E8E2DC] h-1.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score >= 4
                        ? 'w-full bg-[#2E7D32]'
                        : passwordStrength.score === 3
                        ? 'w-3/4 bg-[#8C6F52]'
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
              <label className="text-[11px] font-semibold text-[#1F1F1F] block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C6F52] focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* Role selector dropdown for RBAC simulation */}
          <div>
            <label className="text-[11px] font-semibold text-[#1F1F1F] block mb-1">
              Account Role (RBAC Simulation)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs bg-[#F5F1EC] border border-[#C6B8AB] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
            >
              <option value="customer">Customer (Storefront & Profile)</option>
              <option value="manager">Store Manager (Inventory & Orders)</option>
              <option value="admin">Super Admin (Full Management Access)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white font-bold text-xs sm:text-sm py-3 rounded-lg transition-colors cursor-pointer shadow-md mt-2"
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
  );
};
