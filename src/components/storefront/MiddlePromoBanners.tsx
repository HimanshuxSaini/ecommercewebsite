import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MiddlePromoBanners: React.FC = () => {
  const { setSelectedCategory } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Banner: Home Decor */}
        <div className="relative rounded-2xl overflow-hidden bg-[#F5F1EC] border border-[#C6B8AB] shadow-xs flex items-center min-h-[220px] p-6 group hover:shadow-md transition-shadow">
          <div className="z-10 max-w-[55%]">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F1F1F] leading-tight">
              Make Your Home More Beautiful
            </h3>
            <p className="text-base font-black text-[#E63946] mt-2 mb-4">
              Up to 60% <span className="uppercase text-[#1F1F1F]">OFF</span>
            </p>
            <button
              onClick={() => {
                setSelectedCategory('cat-home');
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5F1EC] via-[#F5F1EC]/40 to-transparent" />
          </div>
        </div>

        {/* Right Banner: Smartphones */}
        <div className="relative rounded-2xl overflow-hidden bg-[#EDE6E1] border border-[#C6B8AB] shadow-xs flex items-center min-h-[220px] p-6 group hover:shadow-md transition-shadow">
          <div className="z-10 max-w-[55%]">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1F1F1F] leading-tight">
              Latest Smartphones At Best Prices
            </h3>
            <p className="text-base font-black text-[#8C6F52] mt-2 mb-4">
              Starting <span className="text-[#1F1F1F] font-extrabold">₹9,999</span>
            </p>
            <button
              onClick={() => {
                setSelectedCategory('cat-mobiles');
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 bg-[#8C6F52] hover:bg-[#6B5B4A] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs"
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#EDE6E1] via-[#EDE6E1]/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
