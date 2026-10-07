import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Banknote, HelpCircle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RibbonContent = ({ handleTrackOrder }: { handleTrackOrder: () => void }) => (
  <>
    {/* Left Side: Guarantees */}
    <div className="flex items-center gap-x-5 text-[#3A3A3A] font-medium shrink-0">
      <div className="flex items-center gap-1.5">
        <Truck className="w-3.5 h-3.5 text-[#8C6F52] shrink-0" />
        <span>Free Shipping on Orders Above <strong className="text-[#1F1F1F]">₹499</strong></span>
      </div>
      <span className="text-[#C6B8AB] hidden sm:inline">|</span>
      <div className="flex items-center gap-1.5">
        <RotateCcw className="w-3.5 h-3.5 text-[#8C6F52] shrink-0" />
        <span>Easy Returns</span>
      </div>
      <span className="text-[#C6B8AB] hidden sm:inline">|</span>
      <div className="flex items-center gap-1.5">
        <Banknote className="w-3.5 h-3.5 text-[#8C6F52] shrink-0" />
        <span>Cash on Delivery</span>
      </div>
      <span className="text-[#C6B8AB] hidden sm:inline">|</span>
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
        <span>100% Secure Payments</span>
      </div>
    </div>

    {/* Right Side: Links */}
    <div className="flex items-center gap-4 text-[#3A3A3A] font-medium shrink-0">
      <button
        onClick={handleTrackOrder}
        className="flex items-center gap-1 hover:text-[#8C6F52] transition-colors cursor-pointer"
      >
        <Package className="w-3.5 h-3.5 text-[#8C6F52]" />
        <span>Track Order</span>
      </button>
      <span className="text-[#C6B8AB]">|</span>
      <button
        onClick={() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
        className="flex items-center gap-1 hover:text-[#8C6F52] transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#8C6F52]" />
        <span>Help & Support</span>
      </button>
    </div>
  </>
);

export const TopRibbon: React.FC = () => {
  const { setIsProfileOpen, setIsAuthOpen, currentUser } = useApp();

  const handleTrackOrder = () => {
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="bg-[#F5F1EC] text-[#3A3A3A] text-xs border-b border-[#E8E2DC] overflow-hidden flex items-center h-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {/* Container with Marquee on mobile and normal flex on desktop */}
        <div className="flex items-center w-max md:w-full whitespace-nowrap mobile-marquee hover:animate-paused md:animate-none md:whitespace-normal">
          
          <div className="flex items-center gap-6 pr-6 md:justify-between md:w-full md:pr-0 md:flex-wrap">
            <RibbonContent handleTrackOrder={handleTrackOrder} />
          </div>

          <div className="flex items-center gap-6 pr-6 md:hidden">
            <RibbonContent handleTrackOrder={handleTrackOrder} />
          </div>

        </div>
      </div>
    </div>
  );
};
