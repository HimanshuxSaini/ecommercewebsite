import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useApp } from '../../context/AppContext';

export const NewArrivalsSection: React.FC = () => {
  const { products, setSelectedCategory } = useApp();

  const newProducts = products.filter((p) => p.isNewArrival);

  return (
    <section id="new-arrivals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E8E2DC]">
        <div className="flex items-center gap-2">
          <span className="bg-[#2E7D32] text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            New
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1F1F1F] tracking-tight">
            New Arrivals
          </h2>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            const el = document.getElementById('catalog-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-xs sm:text-sm font-semibold text-[#8C6F52] hover:text-[#6B5B4A] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of New Arrival Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {newProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
