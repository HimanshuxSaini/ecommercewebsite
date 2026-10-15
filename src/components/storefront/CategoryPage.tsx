import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Home,
  ArrowUpDown,
  Search,
  X,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';

export const CategoryPage: React.FC = () => {
  const {
    categories,
    selectedCategory,
    navigateToHome,
    navigateToShop,
    navigateToCategory,
    products,
  } = useApp();

  // Find the currently active category object
  const activeCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);

  // Local filter states for this category
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1000' | '1000-5000' | '5000-20000' | 'above-20000'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchInCat, setSearchInCat] = useState<string>('');

  // Extract all brands for this category
  const availableBrands = useMemo(() => {
    if (!activeCategory) return [];
    const catProducts = products.filter((p) => p.categoryId === activeCategory.id);
    const brandsSet = new Set<string>();
    catProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products, activeCategory]);

  // Filter and sort products belonging to this category
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return [];

    let list = products.filter((p) => p.categoryId === activeCategory.id);

    // Subcategory filter
    if (selectedSubcategory) {
      list = list.filter((p) => p.subcategoryId === selectedSubcategory);
    }

    // Keyword search within category
    if (searchInCat.trim()) {
      const q = searchInCat.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Price range filter
    if (priceRange === 'under-1000') {
      list = list.filter((p) => p.price < 1000);
    } else if (priceRange === '1000-5000') {
      list = list.filter((p) => p.price >= 1000 && p.price <= 5000);
    } else if (priceRange === '5000-20000') {
      list = list.filter((p) => p.price >= 5000 && p.price <= 20000);
    } else if (priceRange === 'above-20000') {
      list = list.filter((p) => p.price > 20000);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      list = list.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // In stock only
    if (inStockOnly) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [
    activeCategory,
    products,
    selectedSubcategory,
    searchInCat,
    priceRange,
    selectedBrand,
    inStockOnly,
    sortBy,
  ]);

  // Count active filters
  const hasActiveFilters =
    Boolean(selectedSubcategory) ||
    Boolean(searchInCat) ||
    priceRange !== 'all' ||
    selectedBrand !== 'all' ||
    inStockOnly;

  const clearAllFilters = () => {
    setSelectedSubcategory(null);
    setSearchInCat('');
    setPriceRange('all');
    setSelectedBrand('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  if (!activeCategory) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#2E342D]">Category Not Found</h2>
        <button
          onClick={navigateToHome}
          className="mt-4 px-4 py-2 bg-[#173F30] text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Other categories for exploration at the bottom
  const otherCategories = categories.filter((c) => c.id !== activeCategory.id);

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Breadcrumbs */}
      <div className="bg-[#E9EBDD]/60 border-b border-[#D7E0D6] py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 text-xs text-[#6B7068]">
          <button
            onClick={navigateToHome}
            className="flex items-center gap-1 hover:text-[#173F30] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#B9A48B]" />
          <button
            onClick={navigateToShop}
            className="hover:text-[#173F30] transition-colors cursor-pointer"
          >
            Shop
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#B9A48B]" />
          <span className="font-bold text-[#173F30]">{activeCategory.name}</span>
        </div>
      </div>

      {/* 2. Hero Category Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#173F30] via-[#24523F] to-[#2E342D] text-white shadow-lg border border-[#B9A48B]/40 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-[#E9EBDD]/10 pointer-events-none blur-2xl" />

          {/* Left Hero Content */}
          <div className="z-10 max-w-xl text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#E9EBDD]">
              <span>Official Department Collection</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {activeCategory.name}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
              Explore authentic top-tier products in {activeCategory.name}. Handpicked quality,
              verified manufacturer warranty, and lowest online price guarantee.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-lg font-bold text-white flex items-center gap-1.5 backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5" />
                {filteredProducts.length} Items Available
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Fast Express Dispatch
              </span>
              <span className="bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Genuine Certified
              </span>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="z-10 shrink-0 w-44 sm:w-60 h-44 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white/10 backdrop-blur-sm group">
            <img
              src={activeCategory.imageUrl}
              alt={activeCategory.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Subcategories Filter Pills Bar */}
      {activeCategory.subcategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="bg-white rounded-2xl border border-[#D7E0D6] p-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-[#173F30] shrink-0 px-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Subcategories:
              </span>

              {/* All in Category */}
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedSubcategory === null
                    ? 'bg-[#173F30] text-white shadow-sm'
                    : 'bg-[#E9EBDD] text-[#2E342D] hover:bg-[#D7E0D6]'
                }`}
              >
                All {activeCategory.name}
              </button>

              {/* Individual Subcategories */}
              {activeCategory.subcategories.map((sub) => {
                const subCount = products.filter(
                  (p) => p.categoryId === activeCategory.id && p.subcategoryId === sub.id
                ).length;
                const isSelected = selectedSubcategory === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() =>
                      setSelectedSubcategory(isSelected ? null : sub.id)
                    }
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#173F30] text-white shadow-sm'
                        : 'bg-[#E9EBDD] text-[#2E342D] hover:bg-[#D7E0D6]'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {subCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isSelected ? 'bg-white/30 text-white' : 'bg-white text-[#173F30]'
                        }`}
                      >
                        {subCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Controls & Filters Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search inside this category */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7068]" />
              <input
                type="text"
                value={searchInCat}
                onChange={(e) => setSearchInCat(e.target.value)}
                placeholder={`Search within ${activeCategory.name}...`}
                className="w-full bg-[#E9EBDD] border border-[#B9A48B] rounded-xl pl-9 pr-8 py-2 text-xs text-[#2E342D] placeholder-[#6B7068] focus:outline-none focus:ring-1 focus:ring-[#173F30] focus:bg-white transition-all"
              />
              {searchInCat && (
                <button
                  onClick={() => setSearchInCat('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7068] hover:text-[#2E342D] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
              {/* Price Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B7068] font-medium hidden sm:inline">Price:</span>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
                >
                  <option value="all">All Prices</option>
                  <option value="under-1000">Under ₹1,000</option>
                  <option value="1000-5000">₹1,000 - ₹5,000</option>
                  <option value="5000-20000">₹5,000 - ₹20,000</option>
                  <option value="above-20000">Above ₹20,000</option>
                </select>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6B7068] font-medium hidden sm:inline">Brand:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
                  >
                    <option value="all">All Brands ({availableBrands.length})</option>
                    {availableBrands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B7068] font-medium flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#173F30]" />
                  <span className="hidden sm:inline">Sort:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#173F30] focus:ring-[#173F30] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#2E342D]">In Stock</span>
              </label>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-[#D7E0D6] flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#6B7068] font-medium">Applied Filters:</span>

              {selectedSubcategory && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded">
                  Sub: {activeCategory.subcategories.find((s) => s.id === selectedSubcategory)?.name}
                  <button onClick={() => setSelectedSubcategory(null)} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {searchInCat && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#2E342D] border border-[#B9A48B] px-2 py-0.5 rounded">
                  Query: "{searchInCat}"
                  <button onClick={() => setSearchInCat('')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded capitalize">
                  Price: {priceRange.replace('-', ' ')}
                  <button onClick={() => setPriceRange('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-xs text-[#E63946] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Product Grid or Empty State */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#D7E0D6] p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#E9EBDD] text-[#173F30] mx-auto flex items-center justify-center">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#2E342D]">
              No Products Match Your Filter in {activeCategory.name}
            </h3>
            <p className="text-xs text-[#6B7068] max-w-md mx-auto">
              We couldn't find any products matching your specific combination of filters.
              Try relaxing your filters or clearing search terms to explore full inventory.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={clearAllFilters}
                className="bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Reset Filters
              </button>
              <button
                onClick={navigateToShop}
                className="bg-[#E9EBDD] hover:bg-[#D7E0D6] text-[#2E342D] text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Browse All Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* 6. Department Assurance & Benefits Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#173F30]/30 transition-all">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#173F30]">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E342D]">Fast Delivery</h4>
              <p className="text-[11px] text-[#6B7068]">Safe shipping directly to your doorstep</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#173F30]/30 transition-all">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#173F30]">
              <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E342D]">Genuine Warranty</h4>
              <p className="text-[11px] text-[#6B7068]">100% certified authentic products</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#173F30]/30 transition-all">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#173F30]">
              <RotateCcw className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E342D]">7-Day Easy Returns</h4>
              <p className="text-[11px] text-[#6B7068]">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 flex items-center gap-3.5 shadow-xs hover:border-[#173F30]/30 transition-all">
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-[#173F30]">
              <Tag className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#2E342D]">Best Price Guarantee</h4>
              <p className="text-[11px] text-[#6B7068]">Curated deals and seasonal coupons</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Explore Other Categories Strip */}
      {otherCategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-white rounded-3xl border border-[#D7E0D6] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D7E0D6]">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#2E342D]">
                  Explore More Categories
                </h3>
                <p className="text-xs text-[#6B7068] mt-0.5">
                  Discover top collections across our other departments
                </p>
              </div>
              <button
                onClick={navigateToShop}
                className="text-xs font-bold text-[#173F30] hover:text-[#2E5E46] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {otherCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigateToCategory(cat.id)}
                  className="flex flex-col items-center p-2.5 rounded-2xl hover:bg-[#E9EBDD] transition-all cursor-pointer group text-center"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#D7E0D6] group-hover:border-[#173F30] p-0.5 bg-white shadow-2xs transition-all mb-2">
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-[#2E342D] group-hover:text-[#173F30] line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
