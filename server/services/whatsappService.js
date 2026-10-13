/**
 * Velneer WhatsApp Notification Service
 * Supports WhatsApp Business Cloud API with graceful sandbox fallback.
 */

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_API_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export const STORE_WHATSAPP_NUMBER = process.env.VITE_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || '917494980621';

/**
 * Format customer phone into standard +91 E.164 format
 */
export function formatPhone(phone = '') {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Generate a click-to-chat WhatsApp direct link for a phone number
 */
export function generateWhatsAppLink(phone, message) {
  const formatted = formatPhone(phone);
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a click-to-chat WhatsApp direct link to the Velneer store number
 */
export function generateStoreWhatsAppLink(message) {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Send WhatsApp Notification (Cloud API or Sandbox fallback)
 */
export async function sendWhatsAppNotification({ phone, message }) {
  const cleanPhone = formatPhone(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, reason: 'Invalid phone number' };
  }

  // If live WhatsApp Cloud API credentials are provided
  if (WHATSAPP_API_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: message },
        }),
      });

      const data = await res.json();
      console.log(`[WHATSAPP] Live message dispatched to ${cleanPhone}:`, data);
      return { success: true, live: true, data };
    } catch (err) {
      console.error('[WHATSAPP] Failed to dispatch via Cloud API:', err.message);
    }
  }

  // Safe developer sandbox log
  console.log(`[WHATSAPP SANDBOX] To: +${cleanPhone}`);
  console.log(`[WHATSAPP MESSAGE]:\n${message}`);
  return {
    success: true,
    sandbox: true,
    directChatUrl: generateWhatsAppLink(cleanPhone, message),
  };
}

/**
 * Pre-formatted templates for order lifecycle
 */
export const WhatsAppTemplates = {
  orderConfirmed: (order) => {
    return `🎉 Order Confirmed with Velneer!\n\nHi ${order.customerName || 'Valued Customer'},\nThank you for choosing Velneer. Your order #${order.id} has been placed successfully for ₹${order.total?.toLocaleString('en-IN')}.\n\nItems: ${(order.items || []).map((i) => `${i.productTitle} (x${i.quantity})`).join(', ')}\nDelivery Address: ${order.shippingAddress?.street}, ${order.shippingAddress?.city}\n\nWe will notify you once your order is dispatched!`;
  },

  orderShipped: (order, trackingUrl) => {
    return `🚚 Your Velneer Order is On Its Way!\n\nOrder #${order.id} has been dispatched.\nTrack your shipment live here: ${trackingUrl || 'https://velneer.in/track'}\n\nThank you for shopping with Velneer!`;
  },
};
