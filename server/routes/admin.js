import express from 'express';
import { db } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { isMongoConnected, OrderModel, ProductModel, UserModel } from '../config/mongodb.js';
import { simpleCache } from '../utils/simpleCache.js';
import { sendWhatsAppNotification, WhatsAppTemplates } from '../services/whatsappService.js';

const router = express.Router();

// Apply administrative RBAC guard to all /api/admin routes
router.use(authenticate, requireRole('admin', 'manager'));

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  let orders = [];
  let products = [];
  let users = [];

  if (isMongoConnected()) {
    try {
      orders = await OrderModel.find({}).lean();
      products = await ProductModel.find({}).lean();
      users = await UserModel.find({}).lean();
    } catch {}
  }

  if (orders.length === 0) orders = db.getOrders();
  if (products.length === 0) products = db.getProducts();
  if (users.length === 0) users = db.getUsers();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.status !== 'Pending_Payment')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return res.json({
    success: true,
    stats: {
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      totalRevenue,
    },
  });
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  let orders = [];
  if (isMongoConnected()) {
    try {
      orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();
    } catch {}
  }
  if (!orders || orders.length === 0) {
    orders = db.getOrders();
  }
  return res.json({ success: true, orders });
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  const { status, trackingNumber } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
  }

  if (isMongoConnected()) {
    const updatePayload = { status, updatedAt: new Date().toISOString() };
    if (trackingNumber) updatePayload.trackingNumber = trackingNumber;
    await OrderModel.findOneAndUpdate({ id: req.params.id }, updatePayload);
  }

  const updatedOrder = db.updateOrderStatus(req.params.id, status);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Dispatch shipping WhatsApp update
  if (status === 'Shipped' && updatedOrder.customerPhone) {
    sendWhatsAppNotification({
      phone: updatedOrder.customerPhone,
      message: WhatsAppTemplates.orderShipped(updatedOrder, `https://velneer.in/track?id=${updatedOrder.id}`),
    }).catch(() => {});
  }

  return res.json({ success: true, order: updatedOrder });
});

// GET /api/admin/users (Requires 'admin' role only)
router.get('/users', requireRole('admin'), async (req, res) => {
  let users = [];
  if (isMongoConnected()) {
    try {
      users = await UserModel.find({}, '-passwordHash').lean();
    } catch {}
  }
  if (!users || users.length === 0) {
    users = db.getUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      createdAt: u.createdAt,
      isActive: u.isActive,
    }));
  }
  return res.json({ success: true, users });
});

// POST /api/admin/categories
router.post('/categories', async (req, res) => {
  const newCat = db.addCategory(req.body);
  simpleCache.del('store_categories');
  return res.json({ success: true, category: newCat });
});

// POST /api/admin/banners
router.post('/banners', async (req, res) => {
  const newBanner = db.addBanner(req.body);
  simpleCache.del('store_banners');
  return res.json({ success: true, banner: newBanner });
});

// POST /api/admin/brands
router.post('/brands', async (req, res) => {
  const newBrand = db.addBrand(req.body);
  simpleCache.del('store_brands');
  return res.json({ success: true, brand: newBrand });
});

export default router;
