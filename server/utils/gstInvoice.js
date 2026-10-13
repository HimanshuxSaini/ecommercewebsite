/**
 * Authoritative Indian E-Commerce GST Invoice Generator & Calculator
 * Compliant with GST Act & Consumer Protection (E-Commerce) Rules, 2020.
 */

export const SELLER_DETAILS = {
  legalName: 'Velneer Retail & Lifestyle Pvt. Ltd.',
  brandName: 'Velneer',
  gstin: process.env.SELLER_GSTIN || '06AAACV1234F1Z5',
  pan: process.env.SELLER_PAN || 'AAACV1234F',
  registeredAddress: 'Plot No. 42, Sector 18, Udyog Vihar Phase IV, Gurugram, Haryana - 122015, India',
  state: 'Haryana',
  stateCode: '06',
  supportEmail: 'care@velneer.in',
  supportPhone: '+91 80000 12345',
};

/**
 * Calculate GST breakdown for an order
 * @param {Object} order 
 * @param {string} customerState 
 */
export function calculateGSTBreakdown(order, customerState = 'Haryana') {
  const isIntraState = customerState.toLowerCase().trim() === SELLER_DETAILS.state.toLowerCase().trim();
  const GST_RATE = 0.18; // 18% standard rate

  const total = Number(order.total) || 0;
  const taxableAmount = Math.round((total / (1 + GST_RATE)) * 100) / 100;
  const totalTax = Math.round((total - taxableAmount) * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isIntraState) {
    cgst = Math.round((totalTax / 2) * 100) / 100;
    sgst = Math.round((totalTax - cgst) * 100) / 100;
  } else {
    igst = totalTax;
  }

  return {
    taxableAmount,
    totalTax,
    isIntraState,
    cgst,
    sgst,
    igst,
    gstRatePercentage: 18,
  };
}

/**
 * Generate a production-ready HTML Tax Invoice
 */
export function generateGSTInvoiceHTML(order) {
  const customerState = order.shippingAddress?.state || 'Haryana';
  const tax = calculateGSTBreakdown(order, customerState);
  const invoiceDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
  const invoiceNo = `VEL-${new Date().getFullYear()}-${order.id ? order.id.slice(-6).toUpperCase() : '1001'}`;

  const itemsHtml = (order.items || [])
    .map((item, idx) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
      return `
        <tr style="border-bottom: 1px solid #E2E8F0;">
          <td style="padding: 10px; font-size: 12px; color: #1E293B;">${idx + 1}</td>
          <td style="padding: 10px; font-size: 12px; color: #1E293B;">
            <strong>${item.productTitle || 'Velneer Catalog Item'}</strong>
            <div style="font-size: 10px; color: #64748B;">SKU: ${item.productId || 'N/A'} | HSN: 330499</div>
          </td>
          <td style="padding: 10px; font-size: 12px; text-align: center; color: #1E293B;">${item.quantity || 1}</td>
          <td style="padding: 10px; font-size: 12px; text-align: right; color: #1E293B;">₹${item.price?.toLocaleString('en-IN')}</td>
          <td style="padding: 10px; font-size: 12px; text-align: right; color: #1E293B;">₹${itemTaxable.toLocaleString('en-IN')}</td>
          <td style="padding: 10px; font-size: 12px; text-align: right; font-weight: bold; color: #0F172A;">₹${itemTotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Tax Invoice - ${invoiceNo}</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #0F172A; background: #FFF; }
      .invoice-box { max-width: 800px; margin: auto; border: 1px solid #CBD5E1; border-radius: 8px; padding: 24px; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F172A; padding-bottom: 16px; margin-bottom: 20px; }
      .company-name { font-size: 20px; font-weight: 800; color: #173F30; }
      .badge { display: inline-block; background: #E2E8F0; color: #0F172A; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { background: #F8FAFC; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #CBD5E1; }
      .totals-table td { padding: 6px 10px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="invoice-box">
      <div class="header">
        <div>
          <div class="company-name">${SELLER_DETAILS.brandName}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">${SELLER_DETAILS.legalName}</div>
          <div style="font-size: 11px; color: #475569;">${SELLER_DETAILS.registeredAddress}</div>
          <div style="font-size: 11px; color: #0F172A; margin-top: 4px;"><strong>GSTIN:</strong> ${SELLER_DETAILS.gstin} | <strong>PAN:</strong> ${SELLER_DETAILS.pan}</div>
        </div>
        <div style="text-align: right;">
          <span class="badge">TAX INVOICE</span>
          <div style="font-size: 14px; font-weight: bold; margin-top: 6px;">${invoiceNo}</div>
          <div style="font-size: 11px; color: #64748B;">Date: ${invoiceDate}</div>
          <div style="font-size: 11px; color: #64748B;">Order ID: #${order.id}</div>
          <div style="font-size: 11px; color: #16A34A; font-weight: bold; margin-top: 4px;">Status: ${order.status || 'Paid'}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px;">
        <div style="width: 48%;">
          <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Billed & Shipped To:</strong>
          <div style="font-weight: bold; margin-top: 4px;">${order.shippingAddress?.fullName || order.customerName || 'Customer'}</div>
          <div>${order.shippingAddress?.street || 'N/A'}</div>
          <div>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</div>
          <div>Phone: ${order.shippingAddress?.phone || order.customerPhone || 'N/A'}</div>
          <div>State Code: ${tax.isIntraState ? '06 (Haryana)' : 'Interstate'}</div>
        </div>
        <div style="width: 48%; text-align: right;">
          <strong style="color: #475569; text-transform: uppercase; font-size: 11px;">Payment & Delivery Mode:</strong>
          <div style="margin-top: 4px;">Method: <strong>${(order.paymentMethod || 'Prepaid').toUpperCase()}</strong></div>
          <div>Delivery: Standard Insured Express</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 45%;">Description</th>
            <th style="width: 10%; text-align: center;">Qty</th>
            <th style="width: 12%; text-align: right;">Unit Price</th>
            <th style="width: 13%; text-align: right;">Taxable Value</th>
            <th style="width: 15%; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <table class="totals-table" style="width: 320px;">
          <tr>
            <td style="color: #64748B;">Taxable Amount:</td>
            <td style="text-align: right; font-weight: 600;">₹${tax.taxableAmount.toLocaleString('en-IN')}</td>
          </tr>
          ${tax.isIntraState ? `
          <tr>
            <td style="color: #64748B;">CGST (9%):</td>
            <td style="text-align: right; font-weight: 600;">₹${tax.cgst.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color: #64748B;">SGST (9%):</td>
            <td style="text-align: right; font-weight: 600;">₹${tax.sgst.toLocaleString('en-IN')}</td>
          </tr>` : `
          <tr>
            <td style="color: #64748B;">IGST (18%):</td>
            <td style="text-align: right; font-weight: 600;">₹${tax.igst.toLocaleString('en-IN')}</td>
          </tr>`}
          <tr>
            <td style="color: #64748B;">Shipping / Handling:</td>
            <td style="text-align: right; font-weight: 600; color: #16A34A;">FREE</td>
          </tr>
          ${order.discount ? `
          <tr>
            <td style="color: #64748B;">Coupon Discount:</td>
            <td style="text-align: right; font-weight: 600; color: #DC2626;">-₹${order.discount.toLocaleString('en-IN')}</td>
          </tr>` : ''}
          <tr style="border-top: 2px solid #0F172A;">
            <td style="font-size: 14px; font-weight: 800; color: #0F172A; padding-top: 10px;">Grand Total:</td>
            <td style="font-size: 14px; font-weight: 800; color: #173F30; text-align: right; padding-top: 10px;">₹${order.total?.toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <div style="border-top: 1px solid #E2E8F0; margin-top: 30px; padding-top: 12px; font-size: 10px; color: #64748B; display: flex; justify-content: space-between; align-items: center;">
        <div>
          * This is a computer generated invoice and requires no physical signature.<br />
          For warranty claims or support, contact ${SELLER_DETAILS.supportEmail}.
        </div>
        <div style="text-align: right; font-weight: bold; color: #0F172A;">
          For ${SELLER_DETAILS.legalName}<br />
          <span style="font-size: 9px; color: #64748B;">(Authorized Signatory)</span>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}
