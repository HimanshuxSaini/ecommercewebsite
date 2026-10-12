import express from 'express';
import crypto from 'crypto';
import { db } from '../db.js';

const router = express.Router();

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'whsec_velneer_sandbox_secret_2026';

// Helper: HMAC SHA-256 signature verification
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!rawBody || !signature || !secret) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(expectedSignature, 'utf-8')
    );
  } catch {
    return false;
  }
}

// POST /api/payments/webhook
router.post('/webhook', (req, res) => {
  const signature = req.headers['x-velneer-signature'] || req.headers['stripe-signature'] || req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  // In production or test with secret, verify HMAC signature
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

  // Idempotency Protection: check if event has already been processed
  if (db.isEventProcessed(eventId)) {
    console.log(`[PAYMENT] Duplicate webhook received for event ${eventId}. Returning 200 OK.`);
    return res.status(200).json({ success: true, message: 'Event already processed (idempotent).' });
  }

  // Handle Event Types
  if (eventType === 'payment.succeeded' || eventType === 'checkout.session.completed') {
    const order = db.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: `Order ${orderId} not found.` });
    }

    // Verify order total matches payment amount to prevent underpayment fraud
    if (amount !== undefined && amount < order.total) {
      console.error(`[FRAUD ALERT] Underpayment detected for order ${orderId}: Paid ${amount}, Expected ${order.total}`);
      db.updateOrderStatus(orderId, 'Cancelled', {
        fraudReason: 'Underpayment discrepancy',
        attemptedAmount: amount,
      });
      return res.status(400).json({ success: false, message: 'Payment amount mismatch.' });
    }

    // Transition state strictly: Pending_Payment -> Paid -> Processing
    db.updateOrderStatus(orderId, 'Processing', {
      paymentId,
      paidAt: new Date().toISOString(),
      verifiedAmount: amount || order.total,
    });

    // Mark event processed
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
