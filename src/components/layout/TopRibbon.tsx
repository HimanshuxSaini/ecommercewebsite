import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Banknote, HelpCircle, Package } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RibbonContent = ({
  handleTrackOrder,
  navigateToPolicy,
}: {
  handleTrackOrder: () => void;
  navigateToPolicy: (tab: any) => void;
}) => (
  <>
    {/* Left Side: Guarantees */}
    <div className="flex items-center gap-x-5 text-[#6B7068] font-medium shrink-0">
      <button
        onClick={() => navigateToPolicy('shipping')}
        className="flex items-center gap-1.5 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <Truck className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
        <span>Free Shipping on Orders Above <strong className="text-[#2E342D]">₹499</strong></span>
      </button>
      <span className="text-[#B9A48B] hidden sm:inline">|</span>
      <button
        onClick={() => navigateToPolicy('returns')}
        className="flex items-center gap-1.5 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
        <span>Easy 7-Day Returns</span>
      </button>
      <span className="text-[#B9A48B] hidden sm:inline">|</span>
      <button
        onClick={() => navigateToPolicy('faqs')}
        className="flex items-center gap-1.5 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <Banknote className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
        <span>Cash on Delivery</span>
      </button>
      <span className="text-[#B9A48B] hidden sm:inline">|</span>
      <button
        onClick={() => navigateToPolicy('privacy')}
        className="flex items-center gap-1.5 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
        <span>100% Secure Payments</span>
      </button>
    </div>

    {/* Right Side: Links */}
    <div className="flex items-center gap-4 text-[#6B7068] font-medium shrink-0">
      <button
        onClick={handleTrackOrder}
        className="flex items-center gap-1 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <Package className="w-3.5 h-3.5 text-[#173F30]" />
        <span>Track Order</span>
      </button>
      <span className="text-[#B9A48B]">|</span>
      <button
        onClick={() => navigateToPolicy('faqs')}
        className="flex items-center gap-1 hover:text-[#173F30] transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-[#173F30]" />
        <span>Help & Support</span>
      </button>
    </div>
  </>
);

export const TopRibbon: React.FC = () => {
  const { setIsProfileOpen, setIsAuthOpen, currentUser, navigateToPolicy } = useApp();

  const handleTrackOrder = () => {
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="bg-[#E9EBDD] text-[#6B7068] text-xs border-b border-[#D7E0D6] overflow-hidden flex items-center h-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
        {/* Container with Marquee on mobile and normal flex on desktop */}
        <div className="flex items-center w-max md:w-full whitespace-nowrap mobile-marquee hover:animate-paused md:animate-none md:whitespace-normal">
          
          <div className="flex items-center gap-6 pr-6 md:justify-between md:w-full md:pr-0 md:flex-wrap">
            <RibbonContent handleTrackOrder={handleTrackOrder} navigateToPolicy={navigateToPolicy} />
          </div>

          <div className="flex items-center gap-6 pr-6 md:hidden">
            <RibbonContent handleTrackOrder={handleTrackOrder} navigateToPolicy={navigateToPolicy} />
          </div>

        </div>
      </div>
    </div>
  );
};
