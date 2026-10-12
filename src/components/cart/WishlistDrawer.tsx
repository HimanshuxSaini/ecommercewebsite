import React, { useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    products,
    toggleWishlist,
    addToCart,
    isWishlistOpen,
    setIsWishlistOpen,
    setIsCartOpen,
    cart,
    navigateToShop,
    showToast,
  } = useApp();

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isWishlistOpen) {
        setIsWishlistOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWishlistOpen, setIsWishlistOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isWishlistOpen]);

  if (!isWishlistOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));
  const totalValue = wishlistedProducts.reduce((sum, p) => sum + p.price, 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleMoveToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    addToCart(product, 1);
    toggleWishlist(productId);
    showToast(`Moved "${product.title}" to Cart 🛒`);
  };

  const handleMoveAllToCart = () => {
    if (wishlistedProducts.length === 0) return;
    wishlistedProducts.forEach((p) => {
      addToCart(p, 1);
      toggleWishlist(p.id);
    });
    showToast(`Moved ${wishlistedProducts.length} items to Cart! 🛒`);
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  const handleSwitchToCart = () => {
    setIsWishlistOpen(false);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 border-l border-[#D7E0D6]">
          {/* Top Panel Header */}
          <div className="px-5 py-4 border-b border-[#D7E0D6] bg-[#E9EBDD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E63946]/10 text-[#E63946] flex items-center justify-center">
                <Heart className="w-4 h-4 fill-[#E63946]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#2E342D] leading-tight">
                  My Wishlist
                </h2>
                <p className="text-[11px] text-[#6B7068]">
                  {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Switch to Cart button */}
              <button
                onClick={handleSwitchToCart}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-[#B9A48B] text-[#2E342D] hover:bg-[#F8F5EF] hover:border-[#173F30] transition-colors cursor-pointer"
                title="Switch to Cart side panel"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#173F30]" />
                <span>Cart ({totalCartItems})</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#D7E0D6] text-[#6B7068] hover:text-[#2E342D] transition-colors cursor-pointer"
                title="Close Wishlist Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader action strip (when items exist) */}
          {wishlistedProducts.length > 0 && (
            <div className="px-5 py-2.5 bg-[#F8F5EF] border-b border-[#D7E0D6] flex items-center justify-between text-xs">
              <span className="text-[#6B7068]">
                Estimated Value: <strong className="text-[#173F30]">₹{totalValue.toLocaleString('en-IN')}</strong>
              </span>
              <button
                onClick={handleMoveAllToCart}
                className="text-[#173F30] hover:text-[#2E5E46] font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Move All to Cart</span>
              </button>
            </div>
          )}

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#D7E0D6]">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-[#E9EBDD] text-[#E63946] flex items-center justify-center mb-4 border border-[#B9A48B]">
                  <Heart className="w-8 h-8 fill-[#E63946]/20" />
                </div>
                <h3 className="text-base font-bold text-[#2E342D]">Your wishlist is empty</h3>
                <p className="text-xs text-[#6B7068] max-w-xs mt-1.5 mb-6 leading-relaxed">
                  Save your favorite grocery staples, spices, and treats by tapping the heart icon on any product!
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigateToShop();
                  }}
                  className="bg-[#173F30] hover:bg-[#2E5E46] text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Shop</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlistedProducts.map((p) => {
                  const discountPct =
                    p.originalPrice && p.originalPrice > p.price
                      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                      : 0;

                  return (
                    <div
                      key={p.id}
                      className="pt-3 first:pt-0 flex gap-3.5 group items-start"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl bg-[#E9EBDD] border border-[#D7E0D6] p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                        {discountPct > 0 && (
                          <span className="absolute top-1 left-1 bg-[#E63946] text-white text-[9px] font-black px-1 py-0.5 rounded shadow-xs">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>

                      {/* Info & Actions */}
                      <div className="flex-1 flex flex-col justify-between min-h-[5rem]">
                        <div>
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              {p.brand && (
                                <span className="text-[10px] uppercase font-bold text-[#6B7068] tracking-wider block">
                                  {p.brand}
                                </span>
                              )}
                              <h4 className="text-xs font-bold text-[#2E342D] line-clamp-2 leading-tight">
                                {p.title}
                              </h4>
                            </div>

                            {/* Remove from wishlist */}
                            <button
                              onClick={() => toggleWishlist(p.id)}
                              className="text-[#D8C8B3] hover:text-[#E63946] p-1 transition-colors cursor-pointer"
                              title="Remove from Wishlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Pricing */}
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-extrabold text-[#173F30]">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[11px] text-[#6B7068] line-through">
                                ₹{p.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Move to Cart button */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D7E0D6]/60">
                          <span
                            className={`text-[10px] font-semibold ${
                              p.stock > 0 ? 'text-[#2E7D32]' : 'text-red-500'
                            }`}
                          >
                            {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>

                          <button
                            onClick={() => handleMoveToCart(p.id)}
                            disabled={p.stock <= 0}
                            className="bg-[#173F30] hover:bg-[#2E5E46] disabled:bg-slate-300 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Move to Cart</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Area */}
          {wishlistedProducts.length > 0 && (
            <div className="border-t border-[#D7E0D6] p-5 bg-[#E9EBDD]/70 space-y-3">
              <button
                onClick={handleMoveAllToCart}
                className="w-full bg-[#173F30] hover:bg-[#2E5E46] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Move All to Cart (₹{totalValue.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7068]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Fast & Reliable Delivery Across India • Velneer Quality</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
