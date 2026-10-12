import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BrandsSection: React.FC = () => {
  const { setSearchQuery, setSelectedCategory, brands, isBrandsSectionVisible } = useApp();

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory(null);
    setSearchQuery(brandName);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // If admin has set the entire Top Brands section to hidden, do not render it
  if (!isBrandsSectionVisible) return null;

  const activeBrands = brands
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeBrands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D7E0D6]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#2E342D] tracking-tight">
            Top Brands
          </h2>
          <span className="text-[10px] text-[#173F30] bg-[#E9EBDD] border border-[#B9A48B] px-2 py-0.5 rounded-full font-bold">
            Verified Partners
          </span>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs sm:text-sm font-semibold text-[#173F30] hover:text-[#2E5E46] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
        {activeBrands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => handleBrandClick(brand.name)}
            className="shrink-0 w-[130px] sm:w-[150px] bg-white rounded-xl border border-[#D7E0D6] p-3 flex flex-col items-center justify-center min-h-[96px] hover:shadow-md hover:border-[#173F30] cursor-pointer transition-all group relative overflow-hidden"
            title={`Browse ${brand.name} products`}
          >
            {brand.logoUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#E9EBDD] p-1 border border-[#D7E0D6] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
                    // Fallback to text logo if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : null}

            <span className="text-xs sm:text-sm font-black tracking-wider text-[#2E342D] group-hover:text-[#173F30] transition-colors uppercase text-center truncate max-w-full">
              {brand.logoText || brand.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
