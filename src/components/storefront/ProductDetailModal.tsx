import React, { useState } from 'react';
import {
  X,
  Star,
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductDetailModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCartOpen,
  } = useApp();

  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const isWishlisted = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity);
  };

  const handleBuyNow = () => {
    addToCart(quickViewProduct, quantity);
    setQuickViewProduct(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Image & Stock */}
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-xl bg-[#F5F1EC] border border-[#E8E2DC] overflow-hidden flex items-center justify-center p-4 relative">
              <img
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.title}
                className="w-full h-full object-contain"
              />
              {quickViewProduct.discountPercentage > 0 && (
                <span className="absolute top-3 left-3 bg-[#E63946] text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs uppercase">
                  {quickViewProduct.discountPercentage}% OFF
                </span>
              )}
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-[#3A3A3A]">
              <div className="p-2 rounded-lg bg-[#F5F1EC] border border-[#E8E2DC]">
                <Truck className="w-4 h-4 mx-auto text-[#8C6F52] mb-1" />
                <span className="text-[10px] font-medium block">Free Delivery</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F5F1EC] border border-[#E8E2DC]">
                <RotateCcw className="w-4 h-4 mx-auto text-[#8C6F52] mb-1" />
                <span className="text-[10px] font-medium block">7 Days Return</span>
              </div>
              <div className="p-2 rounded-lg bg-[#F5F1EC] border border-[#E8E2DC]">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#2E7D32] mb-1" />
                <span className="text-[10px] font-medium block">1 Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#8C6F52] uppercase tracking-wider">
                  {quickViewProduct.brand}
                </span>
                <span className="text-[#C6B8AB]">•</span>
                <span className="text-xs text-[#A8927D]">
                  SKU: {quickViewProduct.sku}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] leading-tight">
                {quickViewProduct.title}
              </h2>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(quickViewProduct.rating)
                          ? 'fill-[#F59E0B]'
                          : 'text-[#E8E2DC]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1F1F1F]">
                  {quickViewProduct.rating}
                </span>
                <span className="text-xs text-[#A8927D]">
                  ({quickViewProduct.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-3.5 rounded-xl bg-[#F5F1EC] border border-[#E8E2DC] flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">
                ₹{quickViewProduct.price.toLocaleString('en-IN')}
              </span>
              {quickViewProduct.originalPrice > quickViewProduct.price && (
                <>
                  <span className="text-sm text-[#A8927D] line-through">
                    ₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-[#2E7D32]">
                    Save ₹{(quickViewProduct.originalPrice - quickViewProduct.price).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#1F1F1F]">Availability:</span>
              {quickViewProduct.stock > 10 ? (
                <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock ({quickViewProduct.stock} available)
                </span>
              ) : quickViewProduct.stock > 0 ? (
                <span className="text-[#D4A373] font-bold">
                  Low Stock: Only {quickViewProduct.stock} left!
                </span>
              ) : (
                <span className="text-[#E63946] font-bold">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#3A3A3A] leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Key Features */}
            {quickViewProduct.features && quickViewProduct.features.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">
                  Key Highlights
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickViewProduct.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#3A3A3A] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C6F52] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specs Table */}
            {quickViewProduct.specs && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider mb-2">
                  Specifications
                </h4>
                <div className="border border-[#E8E2DC] rounded-lg overflow-hidden divide-y divide-[#E8E2DC] text-xs">
                  {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex px-3 py-1.5">
                      <span className="w-1/2 text-[#A8927D] font-medium">{key}</span>
                      <span className="w-1/2 text-[#1F1F1F] font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 border-t border-[#E8E2DC] space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#1F1F1F]">Quantity:</span>
                <div className="flex items-center border border-[#C6B8AB] rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-[#F5F1EC] text-[#3A3A3A] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#1F1F1F]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, q + 1))}
                    disabled={quantity >= quickViewProduct.stock}
                    className="p-2 hover:bg-[#F5F1EC] text-[#3A3A3A] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-2.5 rounded-lg border transition-colors flex items-center justify-center cursor-pointer ${
                    isWishlisted
                      ? 'border-[#E63946] bg-rose-50 text-[#E63946]'
                      : 'border-[#C6B8AB] hover:border-[#8C6F52] text-[#3A3A3A]'
                  }`}
                  title={isWishlisted ? 'Saved' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#E63946]' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={quickViewProduct.stock <= 0}
                  className="w-full bg-[#1F1F1F] hover:bg-[#3A3A3A] disabled:bg-[#C6B8AB] text-white font-semibold text-xs sm:text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={quickViewProduct.stock <= 0}
                  className="w-full bg-[#8C6F52] hover:bg-[#6B5B4A] disabled:bg-[#C6B8AB] text-white font-semibold text-xs sm:text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
