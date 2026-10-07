import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HeroCarousel: React.FC = () => {
  const { banners, setSelectedCategory } = useApp();
  const heroBanners = banners.filter((b) => b.type === 'hero' && b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate carousel every 6 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  if (heroBanners.length === 0) return null;

  const current = heroBanners[currentIndex] || heroBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const handleButtonClick = () => {
    if (current.linkUrl.startsWith('#')) {
      const el = document.querySelector(current.linkUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative rounded-2xl overflow-hidden shadow-xs bg-gradient-to-r from-[#F8EDE3] via-[#EFE5DB] to-[#D6C5B8] border border-[#C6B8AB]/60 min-h-[340px] sm:min-h-[400px] flex items-center">
        {/* Carousel Arrow Left */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-5 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1F1F1F] shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Arrow Right */}
        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-5 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1F1F1F] shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Content Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 items-center px-6 sm:px-14 lg:px-20 py-8 gap-6 z-10">
          {/* Left Column: Typography & CTA */}
          <div className="md:col-span-6 space-y-4 text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#8C6F52]">
              {current.tagline || 'QUALITY. STYLE. EVERYDAY.'}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1F1F1F] tracking-tight leading-tight">
              Upgrade Your <span className="text-[#8C6F52]">Everyday Life.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#3A3A3A] max-w-md font-normal leading-relaxed">
              {current.subtitle ||
                'Shop top-quality products across all categories with unbeatable prices and a seamless experience.'}
            </p>

            <div className="pt-2">
              <button
                onClick={handleButtonClick}
                className="inline-flex items-center gap-2 bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white font-semibold text-sm px-7 py-3 rounded-full transition-all shadow-md hover:shadow-lg hover:gap-3 cursor-pointer"
              >
                <span>{current.buttonText || 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset Showcase */}
          <div className="md:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-md aspect-4/3 rounded-xl overflow-hidden shadow-lg border border-white/80 bg-white">
              <img
                src={current.imageUrl}
                alt={current.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Decorative Subtle Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-semibold drop-shadow">
                ✨ Curated Modern Essentials
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? 'w-6 bg-[#8C6F52]' : 'w-2 bg-[#C6B8AB] hover:bg-[#8C6F52]'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
