import express from 'express';
import { db } from '../db.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { checkoutLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/orders (User gets their own orders; IDOR-safe)
router.get('/', authenticate, (req, res) => {
  const userOrders = db.getOrdersByUserId(req.user.id);
  return res.json({ success: true, orders: userOrders });
});

// GET /api/orders/:id (IDOR-safe: user can only view their own order, or admin)
router.get('/:id', authenticate, (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Authorization check (Anti-IDOR)
  if (order.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ success: false, message: 'Access denied: You cannot view orders placed by other users.' });
  }

  return res.json({ success: true, order });
});

// POST /api/orders (Authoritative order creation with server-side catalog price recalculation & atomic stock check)
router.post('/', checkoutLimiter, optionalAuth, (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street) {
    return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
  }

  const validPaymentMethods = ['upi', 'card', 'cod', 'netbanking'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method selected.' });
  }

  // Authoritative server-side price recalculation & stock verification
  const catalogProducts = db.getProducts();
  let verifiedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const catalogItem = catalogProducts.find((p) => p.id === item.productId);
    if (!catalogItem) {
      return res.status(400).json({ success: false, message: `Product ${item.productId} does not exist in catalog.` });
    }

    const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (catalogItem.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for "${catalogItem.title}". Only ${catalogItem.stock} available.`,
      });
    }

    const price = Number(catalogItem.price) || 0;
    verifiedSubtotal += price * qty;

    verifiedItems.push({
      productId: catalogItem.id,
      productTitle: catalogItem.title,
      price,
      quantity: qty,
      imageUrl: catalogItem.imageUrl,
    });
  }

  // Authoritative coupon evaluation
  let verifiedDiscount = 0;
  let appliedCouponData = null;
  if (couponCode) {
    const coupon = db.getCouponByCode(couponCode);
    if (coupon) {
      if (verifiedSubtotal >= (coupon.minOrderAmount || 0)) {
        if (coupon.discountType === 'percentage') {
          const raw = (verifiedSubtotal * coupon.discountValue) / 100;
          verifiedDiscount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
        } else {
          verifiedDiscount = coupon.discountValue;
        }
        verifiedDiscount = Math.round(verifiedDiscount);
        appliedCouponData = coupon;
      }
    }
  }

  const shippingFee = verifiedSubtotal > 0 && verifiedSubtotal < 499 ? 40 : 0;
  const verifiedTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + shippingFee);

  // Atomic stock reservation
  for (const vItem of verifiedItems) {
    const stockRes = db.updateProductStock(vItem.productId, vItem.quantity);
    if (!stockRes.success) {
      return res.status(400).json({ success: false, message: stockRes.message });
    }
  }

  // Enforce secure initial order state
  // If payment method is COD, status is 'Pending' awaiting dispatch confirmation.
  // If digital payment (UPI / Card / Netbanking), status is 'Pending_Payment' awaiting gateway confirmation.
  const initialStatus = paymentMethod === 'cod' ? 'Processing' : 'Pending_Payment';

  const newOrder = {
    id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user ? req.user.id : 'guest',
    customerName: req.user ? req.user.name : shippingAddress.fullName,
    customerEmail: req.user ? req.user.email : 'guest@velneer.com',
    customerPhone: req.user ? req.user.phone || shippingAddress.phone : shippingAddress.phone,
    shippingAddress,
    items: verifiedItems,
    subtotal: verifiedSubtotal,
    discount: verifiedDiscount,
    couponCode: appliedCouponData ? appliedCouponData.code : null,
    shippingFee,
    total: verifiedTotal,
    paymentMethod,
    status: initialStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: `VEL-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  db.createOrder(newOrder);

  // Dispatch Brevo Order Confirmation Email
  import('../services/brevoEmailService.js')
    .then(({ sendOrderConfirmationEmail }) => sendOrderConfirmationEmail(newOrder))
    .catch((err) => console.warn('[BREVO] Order email trigger notice:', err.message));

  return res.status(201).json({
    success: true,
    message: initialStatus === 'Pending_Payment'
      ? 'Order created. Awaiting payment settlement.'
      : 'Order placed successfully!',
    order: newOrder,
  });
});

export default router;
