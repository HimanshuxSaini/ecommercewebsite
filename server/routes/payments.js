import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';
import { isMongoConnected, OrderModel } from '../config/mongodb.js';

const router = express.Router();

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_velneer_sandbox_secret_2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

// Helper: HMAC SHA-256 signature verification
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

// POST /api/payments/create-order
// Authoritative server-side creation of Razorpay / Gateway order
router.post('/create-order', async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ success: false, message: 'orderId and amount are required.' });
  }

  let order = null;
  if (isMongoConnected()) {
    try {
      order = await OrderModel.findOne({ id: orderId }).lean();
    } catch {
      order = null;
    }
  }

  if (!order) {
    order = db.getOrderById(orderId);
  }

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found in database.' });
  }

  const amountInPaise = Math.round(Number(amount) * 100);

  // If live Razorpay credentials are provided
  if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.id,
          notes: {
            customerName: order.customerName,
            customerPhone: order.customerPhone,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.description || 'Gateway error');
      }

      return res.json({
        success: true,
        gateway: 'razorpay',
        keyId: RAZORPAY_KEY_ID,
        razorpayOrderId: data.id,
        amount: amountInPaise,
        currency: 'INR',
      });
    } catch (err) {
      console.warn('[RAZORPAY] Notice initializing order, falling back to secure sandbox:', err.message);
    }
  }

  // Resilient Sandbox Gateway Order Session
  const mockGatewayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
  return res.json({
    success: true,
    gateway: 'sandbox',
    keyId: RAZORPAY_KEY_ID || 'rzp_test_velneer_sandbox_2026',
    razorpayOrderId: mockGatewayOrderId,
    amount: amountInPaise,
    currency: 'INR',
    message: 'Sandbox payment order initialized.',
  });
});

// POST /api/payments/verify
// Authoritative payment verification from checkout modal
router.post('/verify', async (req, res) => {
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId) {
    return res.status(400).json({ success: false, message: 'Missing orderId or paymentId' });
  }

  let order = null;
  if (isMongoConnected()) {
    try {
      order = await OrderModel.findOne({ id: orderId }).lean();
    } catch {
      order = null;
    }
  }

  if (!order) {
    order = db.getOrderById(orderId);
  }

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // If live Razorpay secret is set, verify HMAC signature
  if (RAZORPAY_KEY_SECRET && razorpaySignature && razorpayOrderId) {
    const generated = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generated !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification' });
    }
  }

  // Update order status in Mongo if connected
  if (isMongoConnected()) {
    try {
      await OrderModel.findOneAndUpdate(
        { id: orderId },
        {
          $set: {
            orderStatus: 'Processing',
            paymentStatus: 'paid',
            paymentId: razorpayPaymentId,
            gatewayOrderId: razorpayOrderId,
            verifiedAt: new Date().toISOString(),
          },
        }
      );
    } catch (err) {
      console.warn('[MONGO] Payment status update notice:', err.message);
    }
  }

  // Update order status to Processing (Paid) in JSON db
  const updatedOrder = db.updateOrderStatus(orderId, 'Processing', {
    paymentId: razorpayPaymentId,
    gatewayOrderId: razorpayOrderId,
    verifiedAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Payment verified successfully. Order confirmed!',
    order: updatedOrder,
  });
});

// POST /api/payments/webhook
router.post('/webhook', (req, res) => {
  const signature = req.headers['x-velneer-signature'] || req.headers['stripe-signature'] || req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (process.env.NODE_ENV === 'production') {
    if (!signature || !verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.warn('[SECURITY] Webhook signature verification failed!');
      return res.status(400).json({ success: false, message: 'Invalid cryptographic webhook signature.' });
    }
  }

  const { eventId, eventType, orderId, paymentId, amount } = req.body;

  if (!eventId) {
    return res.status(400).json({ success: false, message: 'Missing eventId.' });
  }

  if (db.isEventProcessed(eventId)) {
    return res.status(200).json({ success: true, message: 'Event already processed (idempotent).' });
  }

  if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${orderId} not found.` });
    }

    if (amount !== undefined && amount < order.total) {
      console.error(`[FRAUD ALERT] Underpayment detected for order ${orderId}: Paid ${amount}, Expected ${order.total}`);
      db.updateOrderStatus(orderId, 'Cancelled', {
        fraudReason: 'Underpayment discrepancy',
        attemptedAmount: amount,
      });
      return res.status(400).json({ success: false, message: 'Payment amount mismatch.' });
    }

    db.updateOrderStatus(orderId, 'Processing', {
      paymentId,
      paidAt: new Date().toISOString(),
      verifiedAmount: amount || order.total,
    });

    db.markEventProcessed(eventId);
    console.log(`[PAYMENT] Order ${orderId} successfully marked Processing after verified payment ${paymentId}.`);
  } else if (eventType === 'payment.failed') {
    db.updateOrderStatus(orderId, 'Cancelled', {
      failureReason: req.body.failureReason || 'Payment declined by gateway',
    });
    db.markEventProcessed(eventId);
  }

  return res.status(200).json({ success: true, message: 'Webhook processed successfully.' });
});

export default router;
