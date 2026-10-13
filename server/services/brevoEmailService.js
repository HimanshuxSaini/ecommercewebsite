import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY || '';
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'sales.velneer@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Velneer Store';

let brevoClient = null;
if (BREVO_API_KEY && BREVO_API_KEY !== 'your_brevo_v3_api_key_here') {
  try {
    brevoClient = new BrevoClient({ apiKey: BREVO_API_KEY });
  } catch (err) {
    console.warn('[BREVO] Notice initializing client:', err.message);
  }
}

/**
 * Send an HTML transactional email via Brevo API
 */
export async function sendEmail({ to, toName = 'Customer', subject, htmlContent }) {
  if (!brevoClient) {
    console.log(`[BREVO EMAIL LOG] To: ${to} (${toName}) | Subject: "${subject}"`);
    console.log(`[BREVO EMAIL] Note: Email queued safely in dev sandbox. Add live BREVO_API_KEY to .env to deliver live emails to ${to}.`);
    return { success: true, simulated: true };
  }

  try {
    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
      to: [{ email: to, name: toName }],
    });

    console.log(`[BREVO] Email successfully dispatched to ${to}. MessageId:`, response?.messageId);
    return { success: true, messageId: response?.messageId };
  } catch (error) {
    console.error('[BREVO] Error delivering email:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

/**
 * Send Order Confirmation Email Template
 */
export async function sendOrderConfirmationEmail(order) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E9EBDD;">
        <td style="padding: 10px; font-size: 13px; color: #2E342D;">${item.productTitle}</td>
        <td style="padding: 10px; font-size: 13px; color: #2E342D; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; font-size: 13px; font-weight: bold; color: #173F30; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F5EF; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #D7E0D6;">
          <div style="background-color: #173F30; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">VELNEER</h1>
            <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.85;">Your Order Has Been Confirmed!</p>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 14px; color: #2E342D;">Hello <strong>${order.customerName}</strong>,</p>
            <p style="font-size: 13px; color: #6B7068; line-height: 1.5;">Thank you for shopping with Velneer! We have received your order <strong>#${order.id}</strong> and are preparing it for express dispatch.</p>
            
            <div style="background-color: #E9EBDD; border-radius: 8px; padding: 12px; margin: 20px 0; font-size: 12px;">
              <p style="margin: 3px 0;"><strong>Tracking Number:</strong> ${order.trackingNumber || 'VEL-TRK-PENDING'}</p>
              <p style="margin: 3px 0;"><strong>Payment Method:</strong> ${(order.paymentMethod || 'UPI').toUpperCase()}</p>
              <p style="margin: 3px 0;"><strong>Shipping Address:</strong> ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #F8F5EF; border-bottom: 2px solid #D7E0D6;">
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #2E342D;">Item</th>
                  <th style="padding: 8px; text-align: center; font-size: 12px; color: #2E342D;">Qty</th>
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #2E342D;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: right; margin-top: 15px; font-size: 14px; color: #2E342D;">
              <p style="margin: 4px 0;"><strong>Total Paid: ₹${Number(order.total || 0).toLocaleString('en-IN')}</strong></p>
            </div>
          </div>
          <div style="background-color: #F8F5EF; padding: 15px; text-align: center; font-size: 11px; color: #6B7068; border-top: 1px solid #D7E0D6;">
            Velneer Technologies Pvt. Ltd. • Sonipat, Haryana, India<br/>
            Need help? Contact sales.velneer@gmail.com | Phone: +91 93066 80944 | WhatsApp: +91 74949 80621
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: order.customerEmail,
    toName: order.customerName,
    subject: `Order Confirmed #${order.id} — Velneer`,
    htmlContent,
  });
}

/**
 * Send Welcome Email to Newly Registered User
 */
export async function sendWelcomeEmail(user) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: sans-serif; background-color: #F8F5EF; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 25px; border: 1px solid #D7E0D6;">
          <h2 style="color: #173F30; margin-top: 0;">Welcome to Velneer, ${user.name}!</h2>
          <p style="color: #6B7068; font-size: 13px; line-height: 1.6;">
            We're thrilled to have you with us. Explore our catalog of fresh staples, curated pantry essentials, and kitchen collections with guaranteed quality and fast delivery.
          </p>
          <div style="background: #E9EBDD; padding: 12px; border-radius: 8px; font-size: 12px; margin: 15px 0;">
            Use coupon <strong>WELCOME50</strong> on your first order for flat ₹50 OFF!
          </div>
          <p style="font-size: 12px; color: #888;">If you didn't create an account, please contact sales.velneer@gmail.com.</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    toName: user.name,
    subject: 'Welcome to Velneer — Premium Essentials Delivered',
    htmlContent,
  });
}

/**
 * Send 6-Digit Email Verification OTP via Brevo
 */
export async function sendOtpEmail({ to, toName = 'Customer', otp, type = 'login' }) {
  const isSignup = type === 'signup';
  const heading = isSignup ? 'Verify Your Velneer Account' : 'Velneer Login Verification Code';
  const actionText = isSignup
    ? 'Thank you for registering with Velneer. Use the 6-digit verification code below to verify your email address and activate your account:'
    : 'We received a sign-in request for your Velneer account. Use the 6-digit verification code below to securely log in:';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F5EF; padding: 24px; margin: 0;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #D7E0D6; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background-color: #173F30; padding: 28px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px; font-weight: 800;">VELNEER</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; letter-spacing: 0.5px;">${heading}</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 28px; text-align: center;">
            <p style="font-size: 15px; color: #2E342D; margin-top: 0; text-align: left;">
              Hello <strong>${toName}</strong>,
            </p>
            <p style="font-size: 14px; color: #6B7068; line-height: 1.6; text-align: left;">
              ${actionText}
            </p>

            <!-- OTP Highlight Box -->
            <div style="background-color: #E9EBDD; border: 2px dashed #B9A48B; border-radius: 12px; padding: 20px; margin: 28px 0; text-align: center;">
              <span style="font-size: 12px; font-weight: 700; color: #173F30; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">Your One-Time Code</span>
              <span style="font-size: 36px; font-weight: 800; color: #173F30; letter-spacing: 8px; font-family: monospace; display: block;">${otp}</span>
              <span style="font-size: 11px; color: #6B7068; display: block; margin-top: 6px;">⏱️ Valid for 10 minutes</span>
            </div>

            <p style="font-size: 12px; color: #888888; line-height: 1.5; text-align: left; margin-bottom: 0;">
              🔒 <strong>Security Warning:</strong> Never share this code with anyone. Velneer employees will never ask for your verification code.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8F5EF; padding: 18px 24px; text-align: center; font-size: 11px; color: #6B7068; border-top: 1px solid #D7E0D6;">
            Velneer Technologies Pvt. Ltd. • Sonipat, Haryana, India<br/>
            Support: sales.velneer@gmail.com | WhatsApp: +91 74949 80621
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    toName,
    subject: `${otp} is your Velneer Verification Code`,
    htmlContent,
  });
}

