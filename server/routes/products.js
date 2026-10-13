import express from 'express';
import { db } from '../db.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { simpleCache } from '../utils/simpleCache.js';
import {
  isMongoConnected,
  ProductModel,
  CategoryModel,
  BannerModel,
  BrandModel,
  CouponModel,
} from '../config/mongodb.js';

const router = express.Router();

// GET /api/products/categories
router.get('/categories', apiLimiter, async (req, res) => {
  const cacheKey = 'store_categories';
  const cached = simpleCache.get(cacheKey);
  if (cached) return res.json({ success: true, fromCache: true, categories: cached });

  try {
    let categories = [];
    if (isMongoConnected()) {
      categories = await CategoryModel.find({}).lean();
    }
    if (!categories || categories.length === 0) {
      categories = db.getCategories();
    }

    simpleCache.set(cacheKey, categories, 300);
    return res.json({ success: true, categories });
  } catch (err) {
    return res.json({ success: true, categories: db.getCategories() });
  }
});

// GET /api/products/banners
router.get('/banners', apiLimiter, async (req, res) => {
  const cacheKey = 'store_banners';
  const cached = simpleCache.get(cacheKey);
  if (cached) return res.json({ success: true, fromCache: true, banners: cached });

  try {
    let banners = [];
    if (isMongoConnected()) {
      banners = await BannerModel.find({ isActive: true }).sort({ priority: 1 }).lean();
    }
    if (!banners || banners.length === 0) {
      banners = db.getBanners();
    }

    simpleCache.set(cacheKey, banners, 300);
    return res.json({ success: true, banners });
  } catch (err) {
    return res.json({ success: true, banners: db.getBanners() });
  }
});

// GET /api/products/brands
router.get('/brands', apiLimiter, async (req, res) => {
  const cacheKey = 'store_brands';
  const cached = simpleCache.get(cacheKey);
  if (cached) return res.json({ success: true, fromCache: true, brands: cached });

  try {
    let brands = [];
    if (isMongoConnected()) {
      brands = await BrandModel.find({ isActive: true }).sort({ priority: 1 }).lean();
    }
    if (!brands || brands.length === 0) {
      brands = db.getBrands();
    }

    simpleCache.set(cacheKey, brands, 300);
    return res.json({ success: true, brands });
  } catch (err) {
    return res.json({ success: true, brands: db.getBrands() });
  }
});

// GET /api/products/coupons
router.get('/coupons', apiLimiter, async (req, res) => {
  try {
    let coupons = [];
    if (isMongoConnected()) {
      coupons = await CouponModel.find({ isActive: true }).lean();
    }
    if (!coupons || coupons.length === 0) {
      coupons = db.getCoupons();
    }
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.json({ success: true, coupons: db.getCoupons() });
  }
});

// POST /api/products/validate-coupon
router.post('/validate-coupon', apiLimiter, async (req, res) => {
  const { code, cartTotal = 0 } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });

  let coupon = null;
  if (isMongoConnected()) {
    coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true }).lean();
  }
  if (!coupon) {
    coupon = db.getCouponByCode(code);
  }

  if (!coupon) {
    return res.status(404).json({ valid: false, message: 'Invalid or inactive coupon code.' });
  }

  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon.`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((cartTotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    discount,
    coupon,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discount}.`,
  });
});

// GET /api/products (Public catalog with search, category filtering, and simpleCache)
router.get('/', apiLimiter, async (req, res) => {
  const { category, search, inStock, limit = 100, page = 1 } = req.query;
  const cacheKey = `products_${category || 'all'}_${search || ''}_${inStock || 'all'}_p${page}_l${limit}`;

  const cached = simpleCache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, fromCache: true, ...cached });
  }

  try {
    let products = [];
    if (isMongoConnected()) {
      const query = {};
      if (category) query.categoryId = category;
      if (inStock === 'true') query.stock = { $gt: 0 };
      if (search) {
        query.$or = [
          { title: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } },
          { brand: { $regex: String(search), $options: 'i' } },
        ];
      }
      products = await ProductModel.find(query).lean();
    }

    if (!products || products.length === 0) {
      products = db.getProducts();
      if (category) {
        products = products.filter((p) => p.categoryId === category);
      }
      if (search) {
        const q = String(search).toLowerCase();
        products = products.filter((p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
        );
      }
      if (inStock === 'true') {
        products = products.filter((p) => p.stock > 0);
      }
    }

    const payload = { count: products.length, products };
    simpleCache.set(cacheKey, payload, 60); // 60s TTL
    return res.json({ success: true, ...payload });
  } catch (err) {
    const products = db.getProducts();
    return res.json({ success: true, count: products.length, products });
  }
});

// GET /api/products/:id (Single product lookup)
router.get('/:id', apiLimiter, async (req, res) => {
  const { id } = req.params;
  const cacheKey = `product_${id}`;
  const cached = simpleCache.get(cacheKey);
  if (cached) return res.json({ success: true, fromCache: true, product: cached });

  let product = null;
  if (isMongoConnected()) {
    product = await ProductModel.findOne({ id }).lean();
  }
  if (!product) {
    product = db.getProductById(id);
  }

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  simpleCache.set(cacheKey, product, 180);
  return res.json({ success: true, product });
});

// POST /api/products (Create Product - Admin/Manager)
router.post('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const productData = req.body;
    let saved = null;
    if (isMongoConnected()) {
      saved = await ProductModel.create(productData);
    }
    const localSaved = db.addProduct(productData);

    // Invalidate simpleCache
    simpleCache.delPrefix('products_');
    return res.status(201).json({ success: true, product: saved || localSaved });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id (Update Product - Admin/Manager)
router.put('/:id', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isMongoConnected()) {
      await ProductModel.findOneAndUpdate({ id }, updates);
    }
    const updated = db.updateProduct(id, updates);

    // Invalidate simpleCache
    simpleCache.delPrefix('products_');
    simpleCache.del(`product_${id}`);

    return res.json({ success: true, product: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id (Delete Product - Admin/Manager)
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      await ProductModel.findOneAndDelete({ id });
    }
    db.deleteProduct(id);

    simpleCache.delPrefix('products_');
    simpleCache.del(`product_${id}`);

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
