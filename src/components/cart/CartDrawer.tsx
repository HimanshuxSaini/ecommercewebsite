import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setIsCheckoutOpen,
  } = useApp();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCodeInput.trim()) return;

    const res = applyCoupon(couponCodeInput.trim());
    if (res.success) {
      setCouponCodeInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const shippingFee = cartSubtotal > 0 && cartSubtotal < 499 ? 40 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E8E2DC] flex items-center justify-between bg-[#F5F1EC]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8C6F52]" />
              <h2 className="text-base font-bold text-[#1F1F1F]">
                Your Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#E8E2DC] text-[#3A3A3A] hover:text-[#1F1F1F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8E2DC]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5F1EC] text-[#8C6F52] flex items-center justify-center mb-4 border border-[#C6B8AB]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#1F1F1F]">Your cart is empty</h3>
                <p className="text-xs text-[#3A3A3A] max-w-xs mt-1 mb-6">
                  Explore our curated categories and add quality essentials at unbeatable prices!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex gap-3.5">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      className="w-18 h-18 rounded-lg object-contain bg-[#F5F1EC] border border-[#E8E2DC] p-1 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-semibold text-[#1F1F1F] line-clamp-2 leading-tight">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#A8927D] hover:text-[#E63946] transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs font-bold text-[#1F1F1F]">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center border border-[#C6B8AB] rounded-md bg-[#F5F1EC]">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-[#E8E2DC] text-[#3A3A3A] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#1F1F1F]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-[#E8E2DC] text-[#3A3A3A] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="border-t border-[#E8E2DC] p-5 bg-[#F5F1EC]/70 space-y-4">
              {/* Coupon Section */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span> applied!
                        <span className="block text-[10px] text-[#2E7D32]">
                          Saved ₹{cartDiscount}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#E63946] hover:underline font-semibold text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-[#A8927D] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value)}
                          placeholder="Coupon (e.g. WELCOME50, SAVE20)"
                          className="w-full text-xs bg-white border border-[#C6B8AB] rounded-lg pl-8 pr-3 py-2 uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] text-[#E63946] mt-1">{couponError}</p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#3A3A3A] border-t border-[#E8E2DC] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F1F1F]">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#2E7D32] font-medium">
                    <span>Coupon Discount</span>
                    <span>-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="text-[#2E7D32] font-semibold">FREE</span>
                  ) : (
                    <span>₹{shippingFee}</span>
                  )}
                </div>

                {cartSubtotal < 499 && cartSubtotal > 0 && (
                  <p className="text-[10px] text-[#8C6F52] bg-[#EDE6E1] p-1.5 rounded">
                    Add ₹{499 - cartSubtotal} more for Free Shipping!
                  </p>
                )}

                <div className="flex justify-between text-sm font-bold text-[#1F1F1F] border-t border-[#E8E2DC] pt-2">
                  <span>Total Amount</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <div className="pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#8C6F52] hover:bg-[#6B5B4A] text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A8927D]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>256-bit SSL Bank-Grade Encryption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
