import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, Clock } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useApp } from '../../context/AppContext';

export const FlashDealsSection: React.FC = () => {
  const { products, setSelectedCategory, flashDealConfig } = useApp();

  // Filter flash deal items
  const flashProducts = products.filter((p) => p.isFlashDeal);

  // Live countdown timer synced from flashDealConfig
  const [timeLeft, setTimeLeft] = useState({
    hours: flashDealConfig.hours,
    minutes: flashDealConfig.minutes,
    seconds: flashDealConfig.seconds,
  });

  // Re-sync whenever admin modifies flashDealConfig
  useEffect(() => {
    setTimeLeft({
      hours: flashDealConfig.hours,
      minutes: flashDealConfig.minutes,
      seconds: flashDealConfig.seconds,
    });
  }, [flashDealConfig.hours, flashDealConfig.minutes, flashDealConfig.seconds]);

  useEffect(() => {
    if (!flashDealConfig.isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [flashDealConfig.isActive]);

  const format2 = (n: number) => n.toString().padStart(2, '0');

  // If admin has set flash deals to inactive, do not render or show paused note
  if (!flashDealConfig.isActive) {
    return null;
  }

  return (
    <section id="flash-deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#E8E2DC]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#1F1F1F] font-extrabold text-lg sm:text-xl tracking-tight">
            <Zap className="w-5 h-5 fill-[#E63946] text-[#E63946] animate-pulse" />
            <span>{flashDealConfig.dealTitle || 'Flash Deals'}</span>
          </div>

          {/* Countdown Display */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-[#F5F1EC] text-[#1F1F1F] px-2.5 py-1 rounded-md border border-[#C6B8AB] shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-[#8C6F52] mr-1 hidden xs:inline" />
            <span className="bg-[#1F1F1F] text-white px-1.5 py-0.5 rounded">
              {format2(timeLeft.hours)}
            </span>
            <span>:</span>
            <span className="bg-[#1F1F1F] text-white px-1.5 py-0.5 rounded">
              {format2(timeLeft.minutes)}
            </span>
            <span>:</span>
            <span className="bg-[#1F1F1F] text-white px-1.5 py-0.5 rounded">
              {format2(timeLeft.seconds)}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs sm:text-sm font-semibold text-[#8C6F52] hover:text-[#6B5B4A] flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Flash Deal Products */}
      {flashProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          No active products in Flash Deals right now. New limited deals dropping soon!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {flashProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
