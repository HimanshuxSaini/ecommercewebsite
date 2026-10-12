import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MiddlePromoBanners: React.FC = () => {
  const { navigateToCategory } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Banner: Home Decor */}
        <div className="relative rounded-2xl overflow-hidden bg-[#E9EBDD] border border-[#B9A48B] shadow-xs flex items-center min-h-[220px] p-6 group hover:shadow-md transition-shadow">
          <div className="z-10 max-w-[55%]">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2E342D] leading-tight">
              Make Your Home More Beautiful
            </h3>
            <p className="text-base font-black text-[#E63946] mt-2 mb-4">
              Up to 60% <span className="uppercase text-[#2E342D]">OFF</span>
            </p>
            <button
              onClick={() => navigateToCategory('cat-home')}
              className="inline-flex items-center gap-1.5 bg-[#2E342D] hover:bg-[#6B7068] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-[50%] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&auto=format&fit=crop&q=80"
              alt="Home Furniture Decor"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E9EBDD] via-[#E9EBDD]/40 to-transparent" />
          </div>
        </div>

        {/* Right Banner: Smartphones */}
        <div className="relative rounded-2xl overflow-hidden bg-[#E9EBDD] border border-[#B9A48B] shadow-xs flex items-center min-h-[220px] p-6 group hover:shadow-md transition-shadow">
          <div className="z-10 max-w-[55%]">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2E342D] leading-tight">
              Latest Smartphones At Best Prices
            </h3>
            <p className="text-base font-black text-[#173F30] mt-2 mb-4">
              Starting <span className="text-[#2E342D] font-extrabold">₹9,999</span>
            </p>
            <button
              onClick={() => navigateToCategory('cat-mobiles')}
              className="inline-flex items-center gap-1.5 bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-[50%] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=700&auto=format&fit=crop&q=80"
              alt="Smartphones Collection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#E9EBDD] via-[#E9EBDD]/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
