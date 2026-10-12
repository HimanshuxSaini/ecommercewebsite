import express from 'express';
import { db } from '../db.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/products (Public catalog with search, category filtering)
router.get('/', apiLimiter, (req, res) => {
  let products = db.getProducts();
  const { category, search, inStock } = req.query;

  if (category) {
    products = products.filter((p) => p.categoryId === category);
  }
  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter((p) => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }
  if (inStock === 'true') {
    products = products.filter((p) => p.stock > 0);
  }

  return res.json({ success: true, count: products.length, products });
});

// GET /api/products/:id (Single product lookup)
router.get('/:id', apiLimiter, (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }
  return res.json({ success: true, product });
});

export default router;
