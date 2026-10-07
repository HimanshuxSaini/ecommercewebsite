import React from 'react';
import { Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
    cart,
  } = useApp();

  const isWishlisted = isInWishlist(product.id);
  const cartItem = cart.find((i) => i.product.id === product.id);

  return (
    <div className="bg-white rounded-xl border border-[#E8E2DC] p-3.5 flex flex-col justify-between hover:shadow-md hover:border-[#8C6F52] transition-all duration-200 group relative">
      {/* Top Bar: Discount Badge & Wishlist Heart */}
      <div className="flex items-center justify-between mb-2">
        {product.discountPercentage > 0 ? (
          <span className="bg-[#D4A373] text-[#1F1F1F] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
            {product.discountPercentage}% OFF
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`p-1.5 rounded-full hover:bg-[#F5F1EC] transition-colors cursor-pointer ${
            isWishlisted ? 'text-[#E63946]' : 'text-[#A9A9A9] hover:text-[#E63946]'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-[#E63946] text-[#E63946]' : ''}`}
          />
        </button>
      </div>

      {/* Product Image (clickable for quick view) */}
      <div
        onClick={() => setQuickViewProduct(product)}
        className="w-full aspect-square rounded-lg overflow-hidden bg-[#F5F1EC] flex items-center justify-center p-2 mb-3 cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Details Area */}
      <div className="flex flex-col flex-grow justify-between">
        <div
          onClick={() => setQuickViewProduct(product)}
          className="cursor-pointer"
        >
          <h3 className="text-xs sm:text-sm font-semibold text-[#1F1F1F] line-clamp-2 leading-snug group-hover:text-[#8C6F52] transition-colors">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#1F1F1F]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#A9A9A9] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Rating and Add to Cart Row */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E8E2DC]">
          <div className="flex items-center gap-1 text-[11px] text-[#F59E0B] font-medium">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-[#F59E0B] text-[#F59E0B]'
                      : 'text-[#E8E2DC]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[#3A3A3A] text-[10px] ml-0.5">({product.rating})</span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
              product.stock <= 0
                ? 'bg-[#F5F1EC] text-[#A9A9A9] cursor-not-allowed'
                : cartItem
                ? 'bg-[#F5F1EC] text-[#2E7D32] border border-[#2E7D32]/30 hover:bg-[#E8E2DC]'
                : 'bg-[#F5F1EC] hover:bg-[#1F1F1F] hover:text-white text-[#1F1F1F] border border-[#E8E2DC]'
            }`}
            title={product.stock <= 0 ? 'Out of stock' : cartItem ? 'In Cart' : 'Add to Cart'}
          >
            {cartItem ? (
              <Check className="w-4 h-4 text-[#2E7D32]" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
