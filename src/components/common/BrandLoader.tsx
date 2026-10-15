import React, { useEffect, useState } from 'react';

interface BrandLoaderProps {
  onComplete?: () => void;
  duration?: number; // duration in ms, default ~1400ms
  autoFade?: boolean;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({
  onComplete,
  duration = 1400,
  autoFade = true,
}) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(current);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (autoFade) {
          setIsFading(true);
          setTimeout(() => {
            setIsMounted(false);
            if (onComplete) onComplete();
          }, 600); // 600ms exit fade transition
        } else {
          if (onComplete) onComplete();
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [duration, autoFade, onComplete]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#071912] flex flex-col items-center justify-center p-6 select-none transition-all duration-600 ease-out ${
        isFading ? 'opacity-0 scale-102 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Radial Golden/Emerald Light Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Center Branding Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Glowing 3D Emblem with Pulse */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-400/20 via-amber-300/20 to-emerald-400/20 blur-md animate-pulse" />
          <img
            src="/velneer_emblem_clean.png"
            alt="Velneer Logo"
            className="relative h-14 sm:h-16 w-auto object-contain drop-shadow-xl animate-fade-in"
          />
        </div>

        {/* Clean Velneer Brand Wordmark */}
        <img
          src="/velneer_name_clean.png"
          alt="Velneer"
          className="h-6 sm:h-7 w-auto object-contain brightness-125 mb-8"
        />

        {/* Sleek Metallic Gold Progress Bar */}
        <div className="w-44 sm:w-56 h-[2px] bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/40 relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-400 transition-all duration-75 ease-out rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glowing lead tip */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-200 rounded-full blur-[2px]" />
          </div>
        </div>

        {/* Caption Tagline */}
        <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#D4AF37]/80 font-medium">
          <span>Preparing Experience</span>
          <span className="font-mono text-emerald-300/60 font-normal">({progress}%)</span>
        </div>
      </div>
    </div>
  );
};
