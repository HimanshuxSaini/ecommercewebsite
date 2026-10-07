import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Banknote, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On Orders Above ₹499',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '7 Days Return Policy',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      description: '100% Safe & Secure',
    },
    {
      icon: Banknote,
      title: 'Cash on Delivery',
      description: 'Available Across India',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: "We're Here to Help",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="bg-white rounded-2xl border border-[#E8E2DC] p-5 shadow-xs grid grid-cols-2 md:grid-cols-5 gap-4">
        {badges.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 ${
                idx === badges.length - 1 ? 'col-span-2 md:col-span-1 justify-center md:justify-start' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5F1EC] text-[#8C6F52] flex items-center justify-center shrink-0 border border-[#C6B8AB]">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#1F1F1F] leading-tight">
                  {badge.title}
                </h4>
                <p className="text-[11px] text-[#3A3A3A] mt-0.5 font-normal">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
