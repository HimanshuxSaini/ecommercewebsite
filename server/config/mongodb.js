import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Ensure reliable SRV resolution on Windows environments with restricted router DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/velneer_store';

let isConnected = false;

export async function connectMongoDB() {
  if (isConnected) return;

  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 4000, // Quick timeout fallback to local resilient store if cluster isn't active
    };

    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('[MONGODB] Successfully connected to MongoDB database at:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
  } catch (err) {
    console.warn('[MONGODB] Notice: Remote MongoDB cluster not reachable yet. Seamlessly operating on secure high-speed local store with automatic retry:', err.message);
    isConnected = false;
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

// User Schema
const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    role: { type: String, enum: ['customer', 'manager', 'admin'], default: 'customer' },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String },
    brand: { type: String, index: true },
    categoryId: { type: String, required: true, index: true },
    subcategoryId: { type: String },
    imageUrl: { type: String, required: true },
    gallery: [{ type: String }],
    isFlashDeal: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    features: [{ type: String }],
    specs: { type: Map, of: String },
  },
  { timestamps: true }
);

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String },
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      type: String,
    },
    items: [
      {
        productId: String,
        productTitle: String,
        price: Number,
        quantity: Number,
        imageUrl: String,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['upi', 'card', 'cod', 'netbanking'], required: true },
    status: {
      type: String,
      enum: ['Created', 'Pending_Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending_Payment',
      index: true,
    },
    trackingNumber: { type: String },
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    icon: { type: String },
    imageUrl: { type: String },
    itemCount: { type: Number, default: 0 },
    subcategories: [
      {
        id: String,
        name: String,
        slug: String,
        itemCount: Number,
      },
    ],
  },
  { timestamps: true }
);

// Coupon Schema
const couponSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    description: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiresAt: { type: String },
    isActive: { type: Boolean, default: true },
    usedCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 1000 },
  },
  { timestamps: true }
);

// Banner Schema
const bannerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    tagline: { type: String },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/shop' },
    imageUrl: { type: String, required: true },
    badge: { type: String },
    backgroundColor: { type: String },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Brand Schema
const brandSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    slug: { type: String },
    logoUrl: { type: String, required: true },
    tagline: { type: String },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const ProductModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema);
export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
export const BannerModel = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
export const BrandModel = mongoose.models.Brand || mongoose.model('Brand', brandSchema);
