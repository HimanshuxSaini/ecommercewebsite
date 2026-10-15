import dotenv from 'dotenv';
import { sendEmail } from '../services/brevoEmailService.js';

dotenv.config();

async function testBrevo() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sales.velneer@gmail.com';

  console.log('==============================================================');
  console.log('             BREVO TRANSACTIONAL EMAIL TEST                   ');
  console.log('==============================================================');

  if (!apiKey || apiKey.trim() === '') {
    console.log('⚠️  BREVO_API_KEY is not set in .env.');
    console.log('Please get your API key from https://app.brevo.com/settings/keys/api and add it to .env:');
    console.log('  BREVO_API_KEY="xkeysib-..."');
    console.log('  BREVO_SENDER_EMAIL="your-verified-email@example.com"');
    process.exit(1);
  }

  console.log(`Connecting to Brevo API with Sender: ${senderEmail}...`);
  const result = await sendEmail({
    to: senderEmail,
    toName: 'Velneer Admin',
    subject: 'Velneer Luxe Care - Brevo Email Service Connected!',
    htmlContent: `
      <div style="font-family: sans-serif; padding: 20px; background: #FAF8F5; border: 1px solid #D7E0D6; border-radius: 10px;">
        <h2 style="color: #173F30;">🎉 Brevo Email Integration Active</h2>
        <p>Your Velneer e-commerce transactional email service is now live and operational.</p>
        <p>Customers will now automatically receive branded order confirmations, dispatch alerts, and invoices.</p>
        <hr style="border: none; border-top: 1px solid #D7E0D6;" />
        <small style="color: #6B7068;">Velneer Luxe Care • Sonipat, Haryana, India</small>
      </div>
    `,
  });

  if (result.success && !result.simulated) {
    console.log('✅ Brevo test email dispatched successfully! MessageId:', result.messageId);
    console.log(`Check inbox of ${senderEmail} for confirmation.`);
  } else if (result.simulated) {
    console.log('⚠️ Simulated mode (No valid API key detected).');
  } else {
    console.error('❌ Failed to dispatch email:\n', result.error);
    const errStr = String(result.error || '');
    if (errStr.includes('unrecognised IP address')) {
      console.log('\n==============================================================');
      console.log('🔧 HOW TO FIX THIS BREVO ERROR (Takes 30 seconds):');
      console.log('Brevo has security IP restriction enabled on your account.');
      console.log('1. Open: https://app.brevo.com/security/authorised_ips');
      console.log('2. Click "Deactivate blocking" (or add your current IP address).');
      console.log('   Note: Cloud hosts like Render / Vercel use dynamic IPs, so');
      console.log('   deactivating IP blocking is necessary for transactional email.');
      console.log('3. Also ensure "sales.velneer@gmail.com" is verified at:');
      console.log('   https://app.brevo.com/senders');
      console.log('==============================================================\n');
    }
  }
}

testBrevo();
