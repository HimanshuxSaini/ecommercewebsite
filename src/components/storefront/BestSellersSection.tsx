import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useApp } from '../../context/AppContext';

export const BestSellersSection: React.FC = () => {
  const { products, navigateToShop } = useApp();

  const bestSellerProducts = products.filter((p) => p.isBestSeller);

  return (
    <section id="best-sellers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#D7E0D6]">
        <div className="flex items-center gap-2 text-[#2E342D] font-extrabold text-lg sm:text-xl tracking-tight">
          <Crown className="w-5 h-5 text-[#D8C8B3] fill-[#D8C8B3]" />
          <span>Best Sellers</span>
        </div>

        <button
          onClick={navigateToShop}
          className="text-xs sm:text-sm font-semibold text-[#173F30] hover:text-[#2E5E46] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Best Seller Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {bestSellerProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
