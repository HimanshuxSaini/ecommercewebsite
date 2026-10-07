export type UserRole = 'admin' | 'manager' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  subcategories: Subcategory[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  brand: string;
  categoryId: string;
  subcategoryId?: string;
  imageUrl: string;
  gallery?: string[];
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  features?: string[];
  specs?: Record<string, string>;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  buttonText: string;
  linkUrl: string;
  imageUrl: string;
  type: 'hero' | 'promo_card' | 'mid_split';
  bgColor?: string;
  accentColor?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: 'upi' | 'card' | 'cod' | 'netbanking';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface FlashDealConfig {
  hours: number;
  minutes: number;
  seconds: number;
  isActive: boolean;
  dealTitle: string;
  targetEndTime?: string;
}

export interface NavItem {
  id: string;
  label: string;
  linkType: 'home' | 'section' | 'category' | 'external';
  targetValue: string; // section id (e.g., 'flash-deals'), category id ('cat-electronics'), or external url
  order: number;
  isActive: boolean;
  openInNewTab?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logoText: string;
  logoUrl?: string;
  category: string;
  order: number;
  isActive: boolean;
  websiteUrl?: string;
}
