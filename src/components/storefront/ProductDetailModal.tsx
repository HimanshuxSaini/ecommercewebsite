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

  // Close on ESC key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickViewProduct) {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct, setQuickViewProduct]);

  // Lock body scroll while open
  React.useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quickViewProduct]);

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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setQuickViewProduct(null)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg md:max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
          {/* Top Panel Header */}
          <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#173F30] tracking-wider block">
                Product Details
              </span>
              <h3 className="text-sm font-bold text-[#2E342D] line-clamp-1">
                {quickViewProduct.title}
              </h3>
            </div>
            <button
              onClick={() => setQuickViewProduct(null)}
              className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="w-full aspect-square rounded-xl bg-[#E9EBDD] border border-[#D7E0D6] overflow-hidden flex items-center justify-center p-4 relative">
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
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs text-[#6B7068]">
              <div className="p-2 rounded-lg bg-[#E9EBDD] border border-[#D7E0D6]">
                <Truck className="w-4 h-4 mx-auto text-[#173F30] mb-1" />
                <span className="text-[10px] font-medium block">Free Delivery</span>
              </div>
              <div className="p-2 rounded-lg bg-[#E9EBDD] border border-[#D7E0D6]">
                <RotateCcw className="w-4 h-4 mx-auto text-[#173F30] mb-1" />
                <span className="text-[10px] font-medium block">7 Days Return</span>
              </div>
              <div className="p-2 rounded-lg bg-[#E9EBDD] border border-[#D7E0D6]">
                <ShieldCheck className="w-4 h-4 mx-auto text-[#2E7D32] mb-1" />
                <span className="text-[10px] font-medium block">1 Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-[#173F30] uppercase tracking-wider">
                  {quickViewProduct.brand}
                </span>
                <span className="text-[#B9A48B]">•</span>
                <span className="text-xs text-[#D8C8B3]">
                  SKU: {quickViewProduct.sku}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#2E342D] leading-tight">
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
                          : 'text-[#D7E0D6]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#2E342D]">
                  {quickViewProduct.rating}
                </span>
                <span className="text-xs text-[#D8C8B3]">
                  ({quickViewProduct.reviewCount.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="p-3.5 rounded-xl bg-[#E9EBDD] border border-[#D7E0D6] flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#2E342D]">
                ₹{quickViewProduct.price.toLocaleString('en-IN')}
              </span>
              {quickViewProduct.originalPrice > quickViewProduct.price && (
                <>
                  <span className="text-sm text-[#D8C8B3] line-through">
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
              <span className="font-semibold text-[#2E342D]">Availability:</span>
              {quickViewProduct.stock > 10 ? (
                <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Stock ({quickViewProduct.stock} available)
                </span>
              ) : quickViewProduct.stock > 0 ? (
                <span className="text-[#D8C8B3] font-bold">
                  Low Stock: Only {quickViewProduct.stock} left!
                </span>
              ) : (
                <span className="text-[#E63946] font-bold">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#6B7068] leading-relaxed">
              {quickViewProduct.description}
            </p>

            {/* Key Features */}
            {quickViewProduct.features && quickViewProduct.features.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider mb-2">
                  Key Highlights
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickViewProduct.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[#6B7068] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#173F30] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specs Table */}
            {quickViewProduct.specs && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider mb-2">
                  Specifications
                </h4>
                <div className="border border-[#D7E0D6] rounded-lg overflow-hidden divide-y divide-[#D7E0D6] text-xs">
                  {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex px-3 py-1.5">
                      <span className="w-1/2 text-[#D8C8B3] font-medium">{key}</span>
                      <span className="w-1/2 text-[#2E342D] font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="pt-4 border-t border-[#D7E0D6] space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#2E342D]">Quantity:</span>
                <div className="flex items-center border border-[#B9A48B] rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-[#E9EBDD] text-[#6B7068] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#2E342D]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(quickViewProduct.stock, q + 1))}
                    disabled={quantity >= quickViewProduct.stock}
                    className="p-2 hover:bg-[#E9EBDD] text-[#6B7068] disabled:opacity-40 cursor-pointer"
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
                      : 'border-[#B9A48B] hover:border-[#173F30] text-[#6B7068]'
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
                  className="w-full bg-[#E9EBDD] hover:bg-[#173F30] hover:text-white text-[#173F30] border border-[#B9A48B]/40 disabled:opacity-50 font-semibold text-xs sm:text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={quickViewProduct.stock <= 0}
                  className="w-full bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-[#B9A48B] text-white font-semibold text-xs sm:text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <span>Buy Now</span>
                </button>
              </div>

              {/* Direct WhatsApp Product Inquiry */}
              <button
                type="button"
                onClick={() => {
                  const message = `Hello Velneer, I am interested in *${quickViewProduct.title}* (Price: ₹${quickViewProduct.price.toLocaleString('en-IN')}, SKU: ${quickViewProduct.id}).\nCould you please share details, custom options, or bulk availability?`;
                  const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '917494980621';
                  window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
                }}
                className="w-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/30 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
                </svg>
                <span>Ask Question on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
