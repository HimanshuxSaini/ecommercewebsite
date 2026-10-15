import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLoader } from '../common/BrandLoader';

export const LaunchingSoonPage: React.FC = () => {
  const { navigateToHome } = useApp();
  const [showLoader, setShowLoader] = useState(true);

  return (
    <>
      {/* Cinematic Brand Preloader */}
      {showLoader && (
        <BrandLoader
          duration={1300}
          onComplete={() => setShowLoader(false)}
        />
      )}

      {/* Main Launching Soon Screen */}
      <div className="min-h-screen bg-[#071912] text-white flex flex-col items-center justify-center p-6 select-none relative overflow-hidden font-sans">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-b from-emerald-600/15 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Pure Centered Content: Small Logo, Launching Soon, Explore • Shop • Enjoy */}
        <div className="flex flex-col items-center text-center max-w-xl px-4 transition-all duration-700 ease-out">
          {/* Small Logo (Emblem + Name) */}
          <div
            onClick={navigateToHome}
            className="flex items-center justify-center gap-2.5 sm:gap-3 mb-8 cursor-pointer group"
            title="Velneer"
          >
            <img
              src="/velneer_emblem_clean.png"
              alt="Velneer Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
            />
            <img
              src="/velneer_name_clean.png"
              alt="Velneer"
              className="h-5 sm:h-6 w-auto object-contain brightness-125"
            />
          </div>

          {/* Launching Soon Text */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-4">
            Launching Soon
          </h1>

          {/* One Line: Explore • Shop • Enjoy */}
          <p className="text-sm sm:text-base md:text-lg text-[#D4AF37] tracking-[0.25em] sm:tracking-[0.35em] uppercase font-medium">
            Explore &bull; Shop &bull; Enjoy
          </p>
        </div>
      </div>
    </>
  );
};
