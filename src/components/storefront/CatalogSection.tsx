import React, { useState } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';

export const CatalogSection: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  // Active Category object
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  // Filter products
  let filtered = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) {
      return false;
    }
    if (selectedSub && p.subcategoryId !== selectedSub) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchTitle && !matchBrand && !matchDesc && !matchSku) return false;
    }
    return true;
  });

  // Sort
  if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  }

  // Only render if a filter/search is active OR when browsing
  const hasActiveFilter = !!selectedCategory || !!searchQuery || !!selectedSub;

  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#D7E0D6] p-5 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#D7E0D6]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#2E342D] tracking-tight">
                {currentCategoryObj
                  ? currentCategoryObj.name
                  : searchQuery
                  ? `Search: "${searchQuery}"`
                  : 'All Catalog Products'}
              </h2>
              <span className="text-xs bg-[#E9EBDD] text-[#173F30] font-bold px-2 py-0.5 rounded border border-[#B9A48B]">
                {filtered.length} Items Found
              </span>
            </div>
            <p className="text-xs text-[#6B7068] mt-1">
              {currentCategoryObj
                ? `Browsing verified genuine items in ${currentCategoryObj.name}`
                : 'Complete catalog with real-time stock levels and genuine manufacturer warranties'}
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs text-[#6B7068] flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#173F30]" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#E9EBDD] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Subcategories Filter Chips (if category selected) */}
        {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
          <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-[#173F30] shrink-0">Subcategories:</span>
            <button
              onClick={() => setSelectedSub(null)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                selectedSub === null
                  ? 'bg-[#2E342D] text-white shadow-xs'
                  : 'bg-[#E9EBDD] text-[#6B7068] hover:bg-[#D7E0D6]'
              }`}
            >
              All {currentCategoryObj.name}
            </button>
            {currentCategoryObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSub(sub.id === selectedSub ? null : sub.id)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedSub === sub.id
                    ? 'bg-[#173F30] text-white shadow-xs'
                    : 'bg-[#E9EBDD] text-[#6B7068] hover:bg-[#D7E0D6]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Reset Filter Button if active */}
        {hasActiveFilter && (
          <div className="pt-3 mt-3 border-t border-[#D7E0D6] flex items-center gap-2">
            <span className="text-xs text-[#6B7068]">Active filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded">
                Category: {currentCategoryObj?.name}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-[#2E342D] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#2E342D] border border-[#B9A48B] px-2 py-0.5 rounded">
                Query: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-[#E63946] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                setSelectedSub(null);
              }}
              className="text-xs text-[#E63946] hover:underline font-semibold ml-2 cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#D7E0D6] p-12 text-center space-y-3">
          <p className="text-base font-bold text-[#2E342D]">
            No products match your current search or filter.
          </p>
          <p className="text-xs text-[#6B7068] max-w-sm mx-auto">
            Try checking for spelling errors, clearing your category selection, or browsing our Flash Deals!
          </p>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery('');
              setSelectedSub(null);
            }}
            className="bg-[#2E342D] hover:bg-[#6B7068] text-white text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};
