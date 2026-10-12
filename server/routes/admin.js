import express from 'express';
import { db } from '../db.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply administrative RBAC guard to all /api/admin routes
router.use(authenticate, requireRole('admin', 'manager'));

// GET /api/admin/overview
router.get('/overview', (req, res) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers();

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
router.get('/orders', (req, res) => {
  const orders = db.getOrders();
  return res.json({ success: true, orders });
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status transition.' });
  }

  const updatedOrder = db.updateOrderStatus(req.params.id, status);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  return res.json({ success: true, order: updatedOrder });
});

// GET /api/admin/users (Requires 'admin' role only)
router.get('/users', requireRole('admin'), (req, res) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    createdAt: u.createdAt,
    isActive: u.isActive,
  }));
  return res.json({ success: true, users });
});

export default router;
