import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('🎉 Thank you for subscribing! A ₹150 welcome coupon code has been sent to your inbox.');
    setEmail('');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-[#F5F1EC] rounded-2xl border border-[#C6B8AB] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        {/* Left Info */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#8C6F52] text-white flex items-center justify-center shrink-0 shadow-md">
            <Send className="w-6 h-6 -translate-y-0.5 translate-x-0.5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-[#1F1F1F] tracking-tight">
              Get Exclusive Offers & Updates
            </h3>
            <p className="text-xs sm:text-sm text-[#3A3A3A] mt-0.5">
              Subscribe to our newsletter and be the first to know about new arrivals, deals and more.
            </p>
          </div>
        </div>

        {/* Right Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1 max-w-md flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full text-xs sm:text-sm text-[#1F1F1F] placeholder-[#A9A9A9] bg-white border border-[#C6B8AB] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8C6F52] focus:border-[#8C6F52] shadow-xs"
          />
          <button
            type="submit"
            className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};
