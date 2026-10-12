import React, { useState, useMemo } from 'react';
import {
  Home,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Search,
  X,
  Layers,
  ShoppingBag,
  Grid3X3,
  Check,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    navigateToHome,
    navigateToCategory,
    searchQuery,
    setSearchQuery,
  } = useApp();

  // Local filter states
  const [filterCatId, setFilterCatId] = useState<string | null>(selectedCategory || null);
  const [filterSubId, setFilterSubId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1000' | '1000-5000' | '5000-20000' | 'above-20000'>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [dealFilter, setDealFilter] = useState<'all' | 'flash' | 'bestseller' | 'new'>('all');

  // Active category object if filtered
  const activeCatObj = useMemo(() => {
    return filterCatId ? categories.find((c) => c.id === filterCatId) : null;
  }, [filterCatId, categories]);

  // Extract all brands
  const allBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category filter
    if (filterCatId) {
      list = list.filter((p) => p.categoryId === filterCatId);
    }

    // Subcategory filter
    if (filterSubId) {
      list = list.filter((p) => p.subcategoryId === filterSubId);
    }

    // Global / Shop Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    // Price range
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

    // Deals badge filter
    if (dealFilter === 'flash') {
      list = list.filter((p) => p.isFlashDeal);
    } else if (dealFilter === 'bestseller') {
      list = list.filter((p) => p.isBestSeller);
    } else if (dealFilter === 'new') {
      list = list.filter((p) => p.isNewArrival);
    }

    // In Stock
    if (onlyInStock) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list = list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list = list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [
    products,
    filterCatId,
    filterSubId,
    searchQuery,
    priceRange,
    selectedBrand,
    dealFilter,
    onlyInStock,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setFilterCatId(null);
    setFilterSubId(null);
    setSearchQuery('');
    setPriceRange('all');
    setSelectedBrand('all');
    setDealFilter('all');
    setOnlyInStock(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    Boolean(filterCatId) ||
    Boolean(filterSubId) ||
    Boolean(searchQuery) ||
    priceRange !== 'all' ||
    selectedBrand !== 'all' ||
    dealFilter !== 'all' ||
    onlyInStock;

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
          <span className="font-bold text-[#173F30]">Shop Catalog</span>
          {activeCatObj && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#B9A48B]" />
              <span className="font-medium text-[#2E342D]">{activeCatObj.name}</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Shop Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="bg-white rounded-3xl border border-[#D7E0D6] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#E9EBDD] text-[#173F30] rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2E342D] tracking-tight">
                {activeCatObj ? activeCatObj.name : 'Shop All Products'}
              </h1>
              <span className="text-xs bg-[#E9EBDD] text-[#173F30] font-bold px-2.5 py-0.5 rounded-full border border-[#B9A48B]">
                {filteredProducts.length} Products
              </span>
            </div>
            <p className="text-xs text-[#6B7068] max-w-xl">
              Browse our complete catalog with authentic products, real-time stock availability,
              and special manufacturer warranty across all categories.
            </p>
          </div>

          {/* Quick jump to dedicated category page if category is filtered */}
          {activeCatObj && (
            <button
              onClick={() => navigateToCategory(activeCatObj.id)}
              className="bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            >
              <span>Open Dedicated {activeCatObj.name} Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Selector Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-white rounded-2xl border border-[#D7E0D6] p-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-[#173F30] shrink-0 px-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Department:
            </span>

            {/* All Categories Button */}
            <button
              onClick={() => {
                setFilterCatId(null);
                setFilterSubId(null);
              }}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                filterCatId === null
                  ? 'bg-[#173F30] text-white shadow-sm'
                  : 'bg-[#E9EBDD] text-[#2E342D] hover:bg-[#D7E0D6]'
              }`}
            >
              All Categories ({products.length})
            </button>

            {/* Category Buttons */}
            {categories.map((cat) => {
              const isSelected = filterCatId === cat.id;
              const count = products.filter((p) => p.categoryId === cat.id).length;

              return (
                <div key={cat.id} className="inline-flex items-center shrink-0">
                  <button
                    onClick={() => {
                      setFilterCatId(isSelected ? null : cat.id);
                      setFilterSubId(null);
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-l-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#173F30] text-white shadow-sm'
                        : 'bg-[#E9EBDD] text-[#2E342D] hover:bg-[#D7E0D6]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white/30 text-white' : 'bg-white text-[#173F30]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                  {/* Dedicated Page Mini-Link */}
                  <button
                    onClick={() => navigateToCategory(cat.id)}
                    title={`Open ${cat.name} Page`}
                    className={`px-1.5 py-1.5 rounded-r-full text-xs transition-colors cursor-pointer border-l border-white/20 ${
                      isSelected
                        ? 'bg-[#173F30] text-white/80 hover:text-white'
                        : 'bg-[#E9EBDD] text-[#6B7068] hover:text-[#173F30] hover:bg-[#D7E0D6]'
                    }`}
                  >
                    &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Subcategories bar if category selected */}
      {activeCatObj && activeCatObj.subcategories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <div className="bg-[#E9EBDD]/60 rounded-xl border border-[#B9A48B]/50 p-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
            <span className="font-semibold text-[#173F30] shrink-0 pl-1">Subcategories:</span>
            <button
              onClick={() => setFilterSubId(null)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                filterSubId === null
                  ? 'bg-[#2E342D] text-white'
                  : 'bg-white text-[#2E342D] hover:bg-[#D7E0D6]'
              }`}
            >
              All {activeCatObj.name}
            </button>
            {activeCatObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setFilterSubId(sub.id === filterSubId ? null : sub.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
                  filterSubId === sub.id
                    ? 'bg-[#173F30] text-white'
                    : 'bg-white text-[#2E342D] hover:bg-[#D7E0D6]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Filter Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-white rounded-2xl border border-[#D7E0D6] p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Deals filter */}
              <select
                value={dealFilter}
                onChange={(e) => setDealFilter(e.target.value as any)}
                className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
              >
                <option value="all">All Deals & Offers</option>
                <option value="flash">Flash Deals</option>
                <option value="bestseller">Best Sellers</option>
                <option value="new">New Arrivals</option>
              </select>

              {/* Price Filter */}
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

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
              >
                <option value="all">All Brands ({allBrands.length})</option>
                {allBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              {/* In-Stock Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#173F30] focus:ring-[#173F30] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#2E342D]">In Stock Only</span>
              </label>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#6B7068] font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#173F30]" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#E9EBDD] border border-[#B9A48B] rounded-lg px-2.5 py-1.5 text-xs text-[#2E342D] font-medium cursor-pointer focus:outline-none focus:border-[#173F30]"
              >
                <option value="featured">Featured / Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-[#D7E0D6] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#6B7068]">Active:</span>

              {activeCatObj && (
                <span className="inline-flex items-center gap-1 bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded font-semibold">
                  Category: {activeCatObj.name}
                  <button onClick={() => setFilterCatId(null)} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-[#E9EBDD] text-[#2E342D] border border-[#B9A48B] px-2 py-0.5 rounded">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded capitalize">
                  Price: {priceRange.replace('-', ' ')}
                  <button onClick={() => setPriceRange('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              {dealFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] px-2 py-0.5 rounded capitalize">
                  Badge: {dealFilter}
                  <button onClick={() => setDealFilter('all')} className="cursor-pointer">
                    <X className="w-3 h-3 hover:text-rose-600" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-[#E63946] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#D7E0D6] p-12 sm:p-16 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#E9EBDD] text-[#173F30] mx-auto flex items-center justify-center">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#2E342D]">
              No Products Match Your Filter
            </h3>
            <p className="text-xs text-[#6B7068] max-w-md mx-auto">
              Try removing some of your active filters, or check out our featured deals and top categories.
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
