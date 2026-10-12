import React from 'react';
import { useApp } from '../../context/AppContext';

export const CategoryCircles: React.FC = () => {
  const { categories, selectedCategory, navigateToCategory } = useApp();

  const handleCategoryClick = (catId: string) => {
    navigateToCategory(catId);
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
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 border-2 transition-all bg-[#E9EBDD] shadow-xs ${
                  isSelected
                    ? 'border-[#173F30] ring-2 ring-[#D7E0D6] ring-offset-2'
                    : 'border-[#D7E0D6] group-hover:border-[#173F30] group-hover:shadow-md'
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
                    ? 'text-[#173F30] font-bold'
                    : 'text-[#2E342D] group-hover:text-[#173F30]'
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
