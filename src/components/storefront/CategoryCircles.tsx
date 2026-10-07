import React from 'react';
import { useApp } from '../../context/AppContext';

export const CategoryCircles: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory } = useApp();

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-start justify-between gap-3 sm:gap-6 overflow-x-auto pb-2 pt-1 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center min-w-[76px] sm:min-w-[88px] max-w-[96px] text-center group cursor-pointer shrink-0 transition-transform hover:-translate-y-1"
            >
              {/* Circular Avatar Container */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 border-2 transition-all bg-[#F5F1EC] shadow-xs ${
                  isSelected
                    ? 'border-[#8C6F52] ring-2 ring-[#D9CFC6] ring-offset-2'
                    : 'border-[#E8E2DC] group-hover:border-[#8C6F52] group-hover:shadow-md'
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Title */}
              <span
                className={`mt-2 text-xs leading-tight line-clamp-2 font-medium transition-colors ${
                  isSelected
                    ? 'text-[#8C6F52] font-bold'
                    : 'text-[#1F1F1F] group-hover:text-[#8C6F52]'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
