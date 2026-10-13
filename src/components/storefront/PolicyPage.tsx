import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Truck,
  RotateCcw,
  HelpCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  Shield,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PolicySlug } from '../../types';

interface PolicyTabConfig {
  id: PolicySlug;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const POLICY_TABS: PolicyTabConfig[] = [
  {
    id: 'privacy',
    title: 'Privacy Policy',
    subtitle: 'Data protection, cookie consent, & user privacy',
    icon: ShieldCheck,
    tag: 'Legal',
  },
  {
    id: 'terms',
    title: 'Terms & Conditions',
    subtitle: 'Platform agreement, acceptable use, & governance',
    icon: FileText,
    tag: 'Legal',
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    subtitle: 'Transit timelines, ₹499 free shipping, & tracking',
    icon: Truck,
    tag: 'Logistics',
  },
  {
    id: 'returns',
    title: 'Return & Refund Policy',
    subtitle: '7-day replacement window, reverse pick-up, & payouts',
    icon: RotateCcw,
    tag: 'Support',
  },
  {
    id: 'resin-policy',
    title: 'Resin Work & Bulk Orders',
    subtitle: 'Handcrafted tolerances, curing, & wholesale contracts',
    icon: Layers,
    tag: 'Craftsmanship',
  },
  {
    id: 'faqs',
    title: 'Frequently Asked Questions',
    subtitle: 'Instant answers to orders, payments, resin, & care',
    icon: HelpCircle,
    tag: 'Assistance',
  },
  {
    id: 'about',
    title: 'About Velneer',
    subtitle: 'Our founding philosophy, artisans, & quiet luxury',
    icon: Building,
    tag: 'Brand',
  },
  {
    id: 'contact',
    title: 'Contact & Grievance',
    subtitle: 'Direct desk, nodal officer, & official support',
    icon: Mail,
    tag: 'Assistance',
  },
];

export const PolicyPage: React.FC = () => {
  const { currentPolicyTab, setCurrentPolicyTab, navigateToShop } = useApp();
  const [activeFaqCategory, setActiveFaqCategory] = useState<'all' | 'orders' | 'resin' | 'returns' | 'bulk'>('all');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const activeTabMeta = POLICY_TABS.find((t) => t.id === currentPolicyTab) || POLICY_TABS[0];

  const handleOpenWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919306680944?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Editorial Hero Header */}
      <section className="bg-[#173F30] text-[#F8F5EF] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#2E342D]/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-[#D8C8B3] mb-3">
                <activeTabMeta.icon className="w-3.5 h-3.5 text-[#B9A48B]" />
                <span>Velneer Trust & Operations</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white">
                {activeTabMeta.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#D8C8B3] max-w-2xl leading-relaxed">
                {activeTabMeta.subtitle}
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shrink-0 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-[#B9A48B]/20 flex items-center justify-center text-[#B9A48B]">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="text-[#D8C8B3] font-medium">Compliance & Standards</p>
                <p className="text-white font-semibold">IT Act 2000 & Consumer Protection 2020</p>
                <p className="text-[11px] text-[#A3B19B] mt-0.5">Updated: October 2026 | Sonipat, Haryana</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body with Sidebar + Reader View */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <aside className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-[#E5E0D8] p-3 lg:p-4 sticky lg:top-24 z-10">
            <div className="px-3 py-2 border-b border-[#F0EBE1] mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7068]">
                Documentation & Policies
              </span>
            </div>
            <nav className="space-y-1" aria-label="Policy tabs">
              {POLICY_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentPolicyTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentPolicyTab(tab.id);
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#173F30] text-white shadow-sm'
                        : 'text-[#2E342D] hover:bg-[#F3EFE6] hover:text-[#173F30]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#D8C8B3]' : 'text-[#6B7068]'
                        }`}
                      />
                      <span className="truncate">{tab.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-semibold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#F0EBE1] text-[#6B7068]'
                      }`}
                    >
                      {tab.tag}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Direct Support Card in Sidebar */}
            <div className="mt-6 pt-5 border-t border-[#F0EBE1] px-2">
              <div className="rounded-xl bg-[#E9EBDD]/60 border border-[#D7E0D6] p-4 text-xs">
                <p className="font-semibold text-[#173F30] flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" /> Need Direct Assistance?
                </p>
                <p className="text-[#6B7068] leading-relaxed mb-3">
                  Our customer concierge and resin design specialists are on desk Monday–Saturday, 10 AM – 7 PM IST.
                </p>
                <button
                  onClick={() => handleOpenWhatsApp('Hello Velneer Team, I have a query regarding orders and policies.')}
                  className="w-full py-2 px-3 rounded-lg bg-[#173F30] hover:bg-[#122e23] text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  Chat on WhatsApp
                </button>
              </div>
            </div>
          </aside>

          {/* Right Content Panel */}
          <main className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-[#E5E0D8] p-6 sm:p-10 text-[#2E342D]">
            {currentPolicyTab === 'privacy' && <PrivacyPolicyContent />}
            {currentPolicyTab === 'terms' && <TermsContent />}
            {currentPolicyTab === 'shipping' && <ShippingContent navigateToShop={navigateToShop} />}
            {currentPolicyTab === 'returns' && <ReturnsContent />}
            {currentPolicyTab === 'resin-policy' && (
              <ResinAndBulkContent onContactWhatsApp={handleOpenWhatsApp} />
            )}
            {currentPolicyTab === 'faqs' && (
              <FaqsContent
                activeCategory={activeFaqCategory}
                setActiveCategory={setActiveFaqCategory}
                expandedIndex={expandedFaqIndex}
                setExpandedIndex={setExpandedFaqIndex}
                onContactWhatsApp={handleOpenWhatsApp}
              />
            )}
            {currentPolicyTab === 'about' && <AboutContent navigateToShop={navigateToShop} />}
            {currentPolicyTab === 'contact' && <ContactContent onContactWhatsApp={handleOpenWhatsApp} />}
          </main>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   1. PRIVACY POLICY
   ========================================================================= */
const PrivacyPolicyContent: React.FC = () => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Privacy Policy
        </h2>
        <p className="text-xs text-[#6B7068]">
          Effective Date: October 1, 2026 | Last Revised: October 13, 2026 | Compliance: Information Technology Act, 2000 (India) & Digital Personal Data Protection Act (DPDPA)
        </p>
      </div>

      <div className="bg-[#FAF8F5] border-l-4 border-[#173F30] p-4 rounded-r-xl text-sm leading-relaxed text-[#2E342D]">
        <strong>Velneer</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy and personal data. This Privacy Policy outlines how your personal identifiable information (PII) is collected, utilized, processed, stored, and safeguarded when visiting or ordering via our platform.
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          1. Information We Collect
        </h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          To fulfill orders, tailor your browsing experience, and provide transparent order communications, we collect:
        </p>
        <ul className="text-sm space-y-2 list-disc list-inside text-[#555C54]">
          <li><strong>Identity & Contact Data:</strong> Full name, shipping/billing address, mobile telephone number, and email address.</li>
          <li><strong>Transactional & Order Data:</strong> Items purchased, order amounts, payment confirmations, delivery address snapshots, and order notes.</li>
          <li><strong>Custom Resin Specifications:</strong> Customer-uploaded logos, custom text engravings, pigment preferences, and measurements submitted for custom commissions.</li>
          <li><strong>Technical & Session Data:</strong> Browser user-agent, operating system, IP address, and cookie identifiers utilized exclusively for cart persistence and fraud prevention.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          2. Non-Storage of Financial Instruments
        </h3>
        <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6] text-sm text-[#2E342D]">
          <p className="font-semibold text-[#173F30] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" /> Payment Privacy & Security
          </p>
          <p className="text-[#555C54] leading-relaxed">
            Velneer does <strong>not</strong> store, log, or have direct access to your credit card numbers, CVVs, debit card PINs, or UPI MPINs. All monetary transactions are processed through standard compliant payment gateways.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          3. How We Use Your Data
        </h3>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li>Processing, packing, and dispatching orders with logistics partners.</li>
          <li>Sending transactional notifications via Brevo Email and WhatsApp.</li>
          <li>Communicating draft proofs for customized resin and epoxy artworks before curing.</li>
          <li>Preventing transactional fraud, unauthorized access, and malicious activity.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          4. Data Sharing & Third-Party Processors
        </h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          We <strong>never sell, rent, or monetize</strong> your personal data. Your details are disclosed solely to vetted infrastructure providers strictly under non-disclosure obligations:
        </p>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li><strong>Logistics Couriers:</strong> Delivery partners (e.g. Delhivery, Blue Dart, Shiprocket) to execute physical door-step delivery.</li>
          <li><strong>Communications Infrastructure:</strong> Brevo (transactional email routing) and official WhatsApp Business API for order receipts.</li>
          <li><strong>Cloud & Database Hosting:</strong> Secure encrypted MongoDB clusters and Cloudinary media pipelines.</li>
          <li><strong>Statutory Compliance:</strong> When compelled by valid orders of Indian courts or law enforcement authorities.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          5. Cookie Usage & Data Retention
        </h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          We use session cookies and local storage tokens to preserve your shopping cart, active wishlist, and authentication state. You may clear your browser cookies at any time; however, clearing cookies will reset active cart contents.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          6. Your Rights & Data Erasure
        </h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Under the Indian Digital Personal Data Protection Act, you have the right to inspect, correct, or request the deletion of your personal account records. To exercise these rights, submit a written request to <a href="mailto:sales.velneer@gmail.com" className="text-[#173F30] font-semibold underline">sales.velneer@gmail.com</a>.
        </p>
      </section>
    </article>
  );
};

/* =========================================================================
   2. TERMS & CONDITIONS
   ========================================================================= */
const TermsContent: React.FC = () => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#173F30] text-white">
            Binding Legal Contract
          </span>
          <span className="text-xs text-[#6B7068]">Sonipat, Haryana Jurisdiction</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#173F30]">
          Terms & Conditions of Service
        </h2>
        <p className="text-xs text-[#6B7068] mt-1">
          Last Updated: October 13, 2026 | Operating Entity: Velneer (Sonipat, Haryana, India) | Applicable across all purchases, services, and resin commissions.
        </p>
      </div>

      <div className="bg-[#FAF8F5] border-l-4 border-[#173F30] p-4 rounded-r-xl text-sm leading-relaxed text-[#2E342D]">
        Welcome to <strong>Velneer</strong>. These Terms & Conditions (&ldquo;Terms&rdquo;) govern your access to and use of the Velneer website, web store, interactive widgets, concierge desks, and transactions for handcrafted resin artworks, decor, and retail merchandise. By browsing, signing up, placing an order, or commissioning bespoke work, you unconditionally agree to be bound by these Terms and our Privacy Policy.
      </div>

      {/* Quick Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <p className="font-bold text-[#173F30] mb-1">Authentic Craftsmanship</p>
          <p className="text-[#555C54]">Each resin item is handcrafted; natural wood contours and organic pigment swirls are unique hallmarks of quality.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <p className="font-bold text-[#173F30] mb-1">Clear Commercials</p>
          <p className="text-[#555C54]">All stated prices include GST. Free shipping applies above ₹499 with genuine door-to-door transit.</p>
        </div>
        <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <p className="font-bold text-[#173F30] mb-1">Protected Transactions</p>
          <p className="text-[#555C54]">Secure order verification. Zero financial credential storage on Velneer servers.</p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">1. Definitions & Interpretation</h3>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li><strong>&ldquo;Platform&rdquo;</strong> refers to the Velneer website, mobile interfaces, and official communication channels.</li>
          <li><strong>&ldquo;Customer&rdquo; / &ldquo;You&rdquo; / &ldquo;User&rdquo;</strong> refers to any individual or business entity accessing the Platform or purchasing goods.</li>
          <li><strong>&ldquo;Custom Resin Work&rdquo;</strong> refers to bespoke commissioned artwork, clocks, nameplates, tables, and corporate gifts made to individual customer specifications.</li>
          <li><strong>&ldquo;Catalog Products&rdquo;</strong> refers to standard ready-to-ship decor, lifestyle products, and inventory items.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">2. User Eligibility & Account Responsibilities</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          By using this Platform, you represent that you are at least 18 years of age and competent to enter into a legally enforceable contract under the Indian Contract Act, 1872. You agree to:
        </p>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li>Provide authentic, accurate, and current contact, delivery, and billing details.</li>
          <li>Maintain the confidentiality of your session, password, and account credentials.</li>
          <li>Promptly notify Velneer at <a href="mailto:sales.velneer@gmail.com" className="text-[#173F30] underline font-semibold">sales.velneer@gmail.com</a> in the event of unauthorized account usage.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">3. Pricing, GST Invoicing & Order Acceptance</h3>
        <ul className="text-sm space-y-2 list-disc list-inside text-[#555C54]">
          <li><strong>Indian Rupees (INR) & Taxes:</strong> All pricing displayed on the Platform is in Indian Rupees (INR) and includes applicable Goods and Services Tax (GST) unless explicitly indicated otherwise.</li>
          <li><strong>Tax Invoicing:</strong> Tax invoices bearing Velneer&rsquo;s GSTIN and state registration are issued with every order, enabling eligible business entities to claim Input Tax Credit (ITC).</li>
          <li><strong>Order Confirmation:</strong> An order placed through the Platform constitutes an offer to purchase. An order is formally accepted when an order confirmation email or tracking confirmation is transmitted by Velneer.</li>
          <li><strong>Price Errors:</strong> In the rare event of a typographical pricing error caused by technical malfunction, Velneer reserves the right to contact you before shipment to cancel the order or rectify the billing amount.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">4. Bespoke Resin Commissions & Chemical Curing Terms</h3>
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#555C54] space-y-2">
          <p className="font-semibold text-[#173F30] text-sm">Specific Terms Governing Resin Craftsmanship:</p>
          <ul className="space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Design Approvals:</strong> For custom commissions (e.g. customized family nameplates, wedding keepsake preservation, corporate plaques), digital artwork mockups are shared via WhatsApp or Email for customer sign-off prior to pouring.</li>
            <li><strong>Non-Cancellability Once Poured:</strong> Due to irreversible chemical curing involving hardener polymerization, custom resin commissions cannot be cancelled, amended, or refunded after the physical pouring has commenced.</li>
            <li><strong>Natural Variations:</strong> Fluid art, geode pigments, and natural timber grains naturally differ from sample photographs; these organic traits do not constitute product defects.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">5. Payments, Fraud Prevention & Anti-Abuse</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Transactions are processed via secure checkout gateways. Any fraudulent transactions, unauthorized chargebacks, bot scraping, or coupon exploiting will result in immediate termination of user access and potential legal referral.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">6. Intellectual Property Rights</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          All trademarks, &ldquo;Velneer&rdquo; branding, logos, graphic design assets, catalog photographs, resin molds, custom designs, software code, and textual descriptions are the proprietary intellectual property of Velneer. No portion may be reproduced, reverse-engineered, or exploited for commercial purposes without explicit prior written authorization.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">7. Limitation of Liability & Force Majeure</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          To the maximum extent permitted by applicable Indian law, Velneer shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from delays in transit caused by weather disruptions, regional curfews, courier hub strikes, or acts of God. In all events, Velneer&rsquo;s cumulative financial liability for any claim shall be capped strictly at the purchase value received for the product in question.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">8. Governing Law & Exclusive Jurisdiction</h3>
        <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6] text-xs text-[#2E342D] space-y-1">
          <p className="font-bold text-[#173F30]">Legal Jurisdiction:</p>
          <p className="text-[#555C54] leading-relaxed">
            These Terms, all transactions, and any dispute or controversy arising out of or in connection with the Platform shall be governed and interpreted in accordance with the substantive laws of India. The courts situated in <strong>Sonipat, Haryana, India</strong> shall possess sole and exclusive jurisdiction.
          </p>
        </div>
      </section>

      <section className="space-y-2 pt-2 border-t border-[#F0EBE1]">
        <p className="text-xs text-[#6B7068]">
          Have questions or require clarification regarding these terms? Contact our Legal & Compliance Team at <a href="mailto:sales.velneer@gmail.com" className="text-[#173F30] font-semibold underline">sales.velneer@gmail.com</a> or via phone at <a href="tel:+919306680944" className="text-[#173F30] font-semibold underline">+91 93066 80944</a>.
        </p>
      </section>
    </article>
  );
};

/* =========================================================================
   3. SHIPPING & DELIVERY
   ========================================================================= */
const ShippingContent: React.FC<{ navigateToShop: () => void }> = ({ navigateToShop }) => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Shipping & Delivery Policy
        </h2>
        <p className="text-xs text-[#6B7068]">
          Reliable door-to-door transit across 19,000+ PIN codes in India.
        </p>
      </div>

      {/* Free shipping banner */}
      <div className="p-4 rounded-xl bg-[#173F30] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-[#D8C8B3] text-xs uppercase tracking-wider">Storewide Free Shipping</p>
          <p className="text-lg font-bold">Complimentary Standard Delivery on all orders above ₹499</p>
          <p className="text-xs text-[#A3B19B] mt-0.5">Flat ₹40 nominal convenience fee on orders below ₹499.</p>
        </div>
        <button
          onClick={navigateToShop}
          className="px-4 py-2 rounded-lg bg-[#E9EBDD] hover:bg-white text-[#173F30] text-xs font-bold shrink-0 transition-colors cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">1. Order Dispatch Timelines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
            <p className="font-bold text-[#173F30] mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#173F30]" /> Standard Catalog Items
            </p>
            <p className="text-[#555C54]">
              Dispatched within <strong>24 to 48 business hours</strong> from our central hub after payment verification.
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
            <p className="font-bold text-[#173F30] mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#173F30]" /> Handcrafted Resin & Custom Work
            </p>
            <p className="text-[#555C54]">
              Requires <strong>4 to 7 business days</strong> for multi-layer curing, diamond edge polishing, and bubble-free UV heat treatment.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">2. Estimated Delivery Windows</h3>
        <div className="border border-[#E5E0D8] rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#FAF8F5] text-[#2E342D] border-b border-[#E5E0D8]">
              <tr>
                <th className="py-2.5 px-4 font-bold">Destination Region</th>
                <th className="py-2.5 px-4 font-bold">Estimated Transit Time</th>
                <th className="py-2.5 px-4 font-bold">Courier Partners</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8] text-[#555C54]">
              <tr>
                <td className="py-2.5 px-4 font-medium text-[#2E342D]">Delhi NCR, Haryana, Punjab</td>
                <td className="py-2.5 px-4 font-semibold text-[#173F30]">2 – 3 Business Days</td>
                <td className="py-2.5 px-4">Blue Dart / Delhivery Express</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-[#2E342D]">Tier-1 Metros (Mumbai, Bengaluru, Kolkata, Chennai)</td>
                <td className="py-2.5 px-4 font-semibold text-[#173F30]">3 – 5 Business Days</td>
                <td className="py-2.5 px-4">Shiprocket / Xpressbees</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-[#2E342D]">Rest of India & Tier 2/3 Towns</td>
                <td className="py-2.5 px-4 font-semibold text-[#173F30]">4 – 7 Business Days</td>
                <td className="py-2.5 px-4">DTDC / India Post / Delhivery</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-[#2E342D]">Bulk / Pallet Cargo (25+ units)</td>
                <td className="py-2.5 px-4 font-semibold text-[#173F30]">5 – 9 Business Days</td>
                <td className="py-2.5 px-4">Dedicated Freight Carrier (Safexpress / VRL)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">3. Packaging & Fragile Handling</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Resin artwork and decor undergo <strong>5-stage safety packaging</strong>:
        </p>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li>Non-scratch protective foam sheeting against high-gloss resin surfaces.</li>
          <li>Dual-wall heavy duty bubble wrap cushioning.</li>
          <li>Reinforced corner edge protectors for square frames and resin trays.</li>
          <li>Heavy gauge 5-ply corrugated outer boxes with tamper-evident security tape.</li>
          <li>Fragile warning labels for courier handling.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">4. Tracking & Unboxing Requirement</h3>
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5E0D8] text-xs text-[#555C54] space-y-2">
          <p className="font-semibold text-[#173F30] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#C16200]" /> Transit Damage Verification Notice
          </p>
          <p className="leading-relaxed">
            Every shipment includes an online tracking link sent via SMS and Email once dispatched. For claims regarding transit damage on fragile glass or resin items, customers are kindly requested to capture a <strong>short, continuous video while unboxing the sealed outer carton</strong>.
          </p>
        </div>
      </section>
    </article>
  );
};

/* =========================================================================
   4. RETURN, REFUND & CANCELLATION
   ========================================================================= */
const ReturnsContent: React.FC = () => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Return, Refund & Cancellation Policy
        </h2>
        <p className="text-xs text-[#6B7068]">
          Transparent, hassle-free returns engineered for your complete peace of mind.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6]">
          <p className="text-2xl font-serif font-bold text-[#173F30]">7 Days</p>
          <p className="text-xs font-semibold text-[#2E342D] mt-1">Return & Replacement</p>
          <p className="text-[11px] text-[#6B7068]">From date of package delivery</p>
        </div>
        <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6]">
          <p className="text-2xl font-serif font-bold text-[#173F30]">100%</p>
          <p className="text-xs font-semibold text-[#2E342D] mt-1">Free Reverse Pickup</p>
          <p className="text-[11px] text-[#6B7068]">Arranged from your doorstep</p>
        </div>
        <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6]">
          <p className="text-2xl font-serif font-bold text-[#173F30]">5 – 7 Days</p>
          <p className="text-xs font-semibold text-[#2E342D] mt-1">Fast Refund Processing</p>
          <p className="text-[11px] text-[#6B7068]">Back to original payment source</p>
        </div>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">1. Eligibility for Returns & Replacements</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          You are eligible to request a return or replacement within <strong>7 calendar days</strong> of receiving your delivery under the following conditions:
        </p>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li>Product arrived damaged, defective, cracked, or chipped during transit.</li>
          <li>Product received is significantly different from what was ordered (wrong variant, color, or model).</li>
          <li>Product is returned in its original condition, with brand tags intact and packed securely in original packaging.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">2. Non-Returnable & Non-Refundable Items</h3>
        <ul className="text-sm space-y-2 list-disc list-inside text-[#555C54]">
          <li>
            <strong>Bespoke Custom Resin Art:</strong> Handcrafted custom resin pieces created specifically with your names, company branding, personalized photo preservation, or custom sizes once poured cannot be returned unless received physically broken during shipment.
          </li>
          <li>
            <strong>Clearance & Final Sale:</strong> Products marked as &ldquo;Final Clearance&rdquo; at extraordinary discounts.
          </li>
          <li>
            <strong>Items Damaged due to Customer Misuse:</strong> Scratches caused by abrasive cleaning scrubbers, direct continuous outdoor UV sun exposure beyond specified guidelines, or dropping the item post-delivery.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">3. Return Process Step-by-Step</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside text-[#555C54]">
          <li>
            <strong>Initiate Request:</strong> Email us at <a href="mailto:sales.velneer@gmail.com" className="text-[#173F30] font-semibold underline">sales.velneer@gmail.com</a> or WhatsApp <a href="https://wa.me/919306680944" target="_blank" rel="noopener noreferrer" className="text-[#173F30] font-semibold underline">+91 93066 80944</a> with your Order ID and photo/video of the issue.
          </li>
          <li>
            <strong>Quality Review:</strong> Our team reviews and approves the request within 24 business hours.
          </li>
          <li>
            <strong>Reverse Pickup:</strong> Our courier representative collects the package from your doorstep at zero cost to you.
          </li>
          <li>
            <strong>Inspection & Settlement:</strong> Once received at our Sonipat hub, a free replacement is dispatched or the full refund is credited back.
          </li>
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">4. Refund Timelines & Method</h3>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li><strong>Prepaid Orders (UPI, Netbanking, Cards):</strong> Refund is routed to the original bank account/card within 5 to 7 banking days.</li>
          <li><strong>Cash on Delivery (COD) Orders:</strong> Refund is issued directly via UPI transfer or NEFT upon customer providing bank account details.</li>
        </ul>
      </section>
    </article>
  );
};

/* =========================================================================
   5. RESIN ART WORK & BULK ORDERS POLICY
   ========================================================================= */
const ResinAndBulkContent: React.FC<{ onContactWhatsApp: (msg: string) => void }> = ({ onContactWhatsApp }) => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Handcrafted Resin Art & Bulk Orders Policy
        </h2>
        <p className="text-xs text-[#6B7068]">
          Bespoke epoxy resin craftsmanship, corporate gifting, wholesale contracts, and material care guide.
        </p>
      </div>

      <div className="bg-[#FAF8F5] border-l-4 border-[#173F30] p-4 rounded-r-xl text-sm leading-relaxed text-[#2E342D]">
        Every resin product at Velneer is individually handcrafted by skilled artisans. Epoxy resin is a dynamic, fluid medium: when cast, liquid resin cures over multiple days into a crystal-hard, glass-like finish. Here are the core specifications and care principles.
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">1. Natural Artistry & Inherent Characteristics</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Because each item is handmade:
        </p>
        <ul className="text-sm space-y-1.5 list-disc list-inside text-[#555C54]">
          <li><strong>Unique Pigment Flows:</strong> No two ocean resin trays, geode clocks, or coaster sets are 100% identical. Wave patterns and shimmer cells develop organically during curing.</li>
          <li><strong>Micro-Bubbles:</strong> While we vacuum-degas and torch all pours, minute micro-bubbles occasionally settle around textured wood or botanicals, proving authenticity of genuine hand-poured artisan epoxy.</li>
          <li><strong>Raw Wood Edges:</strong> Items incorporating live-edge acacia or teakwood carry natural grain knots, bark contours, and organic texture variations.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">2. Resin Care & Maintenance Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#D7E0D6] bg-[#E9EBDD]/40">
            <p className="font-bold text-[#173F30] mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" /> Recommended Care (Do's)
            </p>
            <ul className="space-y-1 text-[#555C54] list-disc list-inside">
              <li>Clean with a soft microfiber cloth and mild soap water.</li>
              <li>Hand wash only; dry immediately with a clean towel.</li>
              <li>Keep indoors in temperature-controlled spaces.</li>
              <li>Use coaster pads under boiling tea/coffee mugs.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
            <p className="font-bold text-[#C16200] mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#C16200]" /> Avoid (Don'ts)
            </p>
            <ul className="space-y-1 text-[#555C54] list-disc list-inside">
              <li>Never place in a dishwasher or microwave oven.</li>
              <li>Do not use abrasive metal scourers or harsh chemicals (acetone, bleach).</li>
              <li>Avoid prolonged exposure to direct outdoor tropical sunlight.</li>
              <li>Do not use sharp kitchen knives directly as a chopping board.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">3. Corporate Gifting & Bulk Orders (25 to 500+ Units)</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Velneer partners with interior designers, architects, wedding planners, luxury hotels, and corporate enterprises for bespoke customized gifts and hospitality decor:
        </p>
        <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold text-[#173F30]">
            <span>Wholesale Volume Tier</span>
            <span>Commercial Terms</span>
          </div>
          <div className="divide-y divide-[#E5E0D8] text-[#555C54]">
            <div className="py-1.5 flex items-center justify-between">
              <span>25 – 50 Units (Boutique Orders)</span>
              <span className="font-medium text-[#2E342D]">Special Wholesale Tier (7–10 days production)</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span>51 – 200 Units (Corporate Gifting)</span>
              <span className="font-medium text-[#2E342D]">Custom Laser Branding + Custom Gift Packaging</span>
            </div>
            <div className="py-1.5 flex items-center justify-between">
              <span>200+ Units (Enterprise / Exports)</span>
              <span className="font-medium text-[#2E342D]">Dedicated Account Mgr + Formal Purchase Order & GST Invoicing</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="p-5 rounded-2xl bg-[#173F30] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-serif text-lg font-bold">Have a Custom Resin or Bulk Inquiry?</p>
          <p className="text-xs text-[#D8C8B3] mt-1 max-w-md">
            Directly connect with our Master Artisan and B2B desk for instant quotes, digital mockups, and bulk discounts.
          </p>
        </div>
        <button
          onClick={() =>
            onContactWhatsApp(
              'Hello Velneer Team, I would like to enquire about Custom Resin Work / Corporate Bulk Orders.'
            )
          }
          className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-md"
        >
          <MessageCircle className="w-4 h-4" />
          Enquire on WhatsApp
        </button>
      </div>
    </article>
  );
};

/* =========================================================================
   6. FAQS & HELP
   ========================================================================= */
interface FaqItem {
  category: 'orders' | 'resin' | 'returns' | 'bulk';
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  {
    category: 'orders',
    question: 'How do I track my order once placed?',
    answer:
      'As soon as your package is dispatched, we send an automated email and WhatsApp notification with your Tracking ID and direct tracking URL (Delhivery, Blue Dart, or Shiprocket). You can also click "Track Order" in the top navigation or user profile anytime to view live milestone status.',
  },
  {
    category: 'orders',
    question: 'What payment modes are supported on Velneer?',
    answer:
      'We support all major Indian payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD) on eligible PIN codes.',
  },
  {
    category: 'orders',
    question: 'Is Cash on Delivery (COD) available in my area?',
    answer:
      'COD is supported for over 19,000+ PIN codes across India for catalog orders up to ₹5,000. For custom-made resin commissions and personalized nameplates, an advance payment is required because materials are custom-mixed.',
  },
  {
    category: 'resin',
    question: 'Are Velneer resin products food-safe?',
    answer:
      'Yes, our resin pieces utilize high-grade, non-toxic, VOC-free epoxy that is fully food-contact compliant once fully cured (72 hours). They are perfect for serving dry snacks, cheeses, fruit, crackers, and beverages. We recommend hand washing with gentle soap and not using them as heavy chopping boards.',
  },
  {
    category: 'resin',
    question: 'Will the resin turn yellow over time?',
    answer:
      'We exclusively formulate our pieces using top-tier UV-stabilized, anti-yellowing resin technology. To maintain the diamond optical clarity for years, keep the items indoors away from continuous harsh direct sunlight and extreme heaters.',
  },
  {
    category: 'resin',
    question: 'Can I order a custom resin size or color theme?',
    answer:
      'Absolutely! We love crafting custom artwork. You can choose specific pigments (ocean turquoise, emerald green, metallic gold, obsidian black), wood types, and dimensions. Chat directly with our resin artisan via WhatsApp to share your inspiration photo or room aesthetic.',
  },
  {
    category: 'returns',
    question: 'What is the return window if I receive a broken item?',
    answer:
      'We offer a full 7-day hassle-free replacement or refund guarantee for transit damage. Simply send us a photo or short video within 7 days of delivery at sales.velneer@gmail.com or via WhatsApp at +91 93066 80944, and we will dispatch a replacement immediately or process your refund.',
  },
  {
    category: 'returns',
    question: 'How long does a refund take to reflect in my bank account?',
    answer:
      'Once approved and inspected, digital refunds (UPI/Card/Netbanking) credit to your source account within 5 to 7 business days according to standard banking clearing cycles.',
  },
  {
    category: 'bulk',
    question: 'What is the minimum order quantity for wholesale or bulk orders?',
    answer:
      'Our wholesale and corporate gifting tiers begin at just 25 units. For bulk orders, we provide complimentary company logo engraving, customized presentation boxes, and volume discounts. Please reach out to our bulk desk for a customized quotation.',
  },
  {
    category: 'bulk',
    question: 'Do you provide GST invoices for corporate purchases?',
    answer:
      'Yes, all orders on Velneer include a compliant GST tax invoice with our GSTIN number, allowing registered corporate buyers and firms to claim full input tax credit (ITC).',
  },
];

const FaqsContent: React.FC<{
  activeCategory: 'all' | 'orders' | 'resin' | 'returns' | 'bulk';
  setActiveCategory: (cat: 'all' | 'orders' | 'resin' | 'returns' | 'bulk') => void;
  expandedIndex: number | null;
  setExpandedIndex: (idx: number | null) => void;
  onContactWhatsApp: (msg: string) => void;
}> = ({ activeCategory, setActiveCategory, expandedIndex, setExpandedIndex, onContactWhatsApp }) => {
  const filtered = FAQS_DATA.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-[#6B7068]">
          Find quick answers regarding orders, shipments, returns, epoxy resin care, and bulk pricing.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Questions' },
          { id: 'orders', label: 'Orders & Payments' },
          { id: 'resin', label: 'Resin Art & Care' },
          { id: 'returns', label: 'Returns & Refunds' },
          { id: 'bulk', label: 'Bulk & Corporate' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveCategory(tab.id as any);
              setExpandedIndex(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === tab.id
                ? 'bg-[#173F30] text-white shadow-sm'
                : 'bg-[#F0EBE1] text-[#2E342D] hover:bg-[#E5E0D8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => {
          const isOpen = expandedIndex === idx;
          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all ${
                isOpen
                  ? 'border-[#173F30] bg-[#FAF8F5]'
                  : 'border-[#E5E0D8] bg-white hover:border-[#D7E0D6]'
              }`}
            >
              <button
                onClick={() => setExpandedIndex(isOpen ? null : idx)}
                className="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between gap-4 text-left font-semibold text-sm text-[#2E342D] cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#173F30] shrink-0 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 pt-1 text-xs sm:text-sm text-[#555C54] leading-relaxed border-t border-[#F0EBE1]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still Need Help Box */}
      <div className="p-4 rounded-xl bg-[#E9EBDD]/50 border border-[#D7E0D6] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-xs text-[#173F30]">Didn't find your answer?</p>
          <p className="text-xs text-[#6B7068]">Our support concierge is available on WhatsApp and email.</p>
        </div>
        <button
          onClick={() => onContactWhatsApp('Hello Velneer, I need help with an unanswered question.')}
          className="px-4 py-2 rounded-lg bg-[#173F30] hover:bg-[#122e23] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
          Ask Concierge
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   7. ABOUT VELNEER
   ========================================================================= */
const AboutContent: React.FC<{ navigateToShop: () => void }> = ({ navigateToShop }) => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          About Velneer
        </h2>
        <p className="text-xs text-[#6B7068]">
          Crafted for discerning homes, grounded in timeless Indian artisanal heritage.
        </p>
      </div>

      <div className="bg-[#FAF8F5] border-l-4 border-[#173F30] p-4 rounded-r-xl text-sm leading-relaxed text-[#2E342D]">
        <strong>Velneer</strong> was born from a singular passion: bridging the gap between raw, organic nature and sleek contemporary living. We unite seasoned resin craftsmen, natural teak and acacia woodworkers, and sustainable design to curate pieces of quiet luxury for everyday life.
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">Our Design Philosophy</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          In an era of disposable mass-production, we believe luxury lives in the deliberate, thoughtful craft. Every resin pour is timed with meteorological precision; every raw edge of teak is hand-sanded with 7 grits of diamond paper; and every metallic pigment is blended by eye to evoke the ocean swells and earthen mineral formations.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <HeartHandshake className="w-5 h-5 text-[#173F30] mb-2" />
          <p className="font-bold text-[#173F30] mb-1">Ethical Sourcing</p>
          <p className="text-[#555C54]">
            Reclaimed, seasoned acacia, neem, and teakwoods ethically procured from sustainable local plantation forestry.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <Shield className="w-5 h-5 text-[#173F30] mb-2" />
          <p className="font-bold text-[#173F30] mb-1">Artisan Community</p>
          <p className="text-[#555C54]">
            Empowering regional craftsmen in Sonipat, Haryana with dignified compensation and master workshops.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5]">
          <CheckCircle2 className="w-5 h-5 text-[#173F30] mb-2" />
          <p className="font-bold text-[#173F30] mb-1">Enduring Quality</p>
          <p className="text-[#555C54]">
            Formulated to resist yellowing, cracking, and wear, designed to remain family heirlooms for years.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30]">Our Commitment to You</h3>
        <p className="text-sm leading-relaxed text-[#555C54]">
          Whether you are choosing an ocean wave cheese board for your weekend dinner party, selecting a grand bespoke dining table, or ordering personalized festive gifts for your organization, Velneer promises meticulous attention, authentic materials, and world-class service.
        </p>
      </section>

      <div className="pt-2">
        <button
          onClick={navigateToShop}
          className="px-6 py-2.5 rounded-xl bg-[#173F30] hover:bg-[#122e23] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Explore Our Master Collection</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};

/* =========================================================================
   8. CONTACT US & GRIEVANCE REDRESSAL
   ========================================================================= */
const ContactContent: React.FC<{ onContactWhatsApp: (msg: string) => void }> = ({ onContactWhatsApp }) => {
  return (
    <article className="prose max-w-none text-[#2E342D] space-y-6">
      <div className="border-b border-[#F0EBE1] pb-4">
        <h2 className="text-2xl font-serif font-bold text-[#173F30] mb-1">
          Contact Us & Grievance Redressal
        </h2>
        <p className="text-xs text-[#6B7068]">
          Statutory Disclosures under Consumer Protection (E-Commerce) Rules, 2020 & IT Act, 2000.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] space-y-3">
          <p className="font-bold text-[#173F30] text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-[#173F30]" /> Corporate & Registered Office
          </p>
          <div className="space-y-1.5 text-[#555C54]">
            <p className="font-semibold text-[#2E342D]">Velneer</p>
            <p className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#173F30] shrink-0 mt-0.5" />
              <span>Model Town / Industrial Area, Sonipat, Haryana – 131001, India</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
              <a href="tel:+919306680944" className="text-[#2E342D] hover:underline font-semibold">
                +91 93066 80944
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
              <a href="mailto:sales.velneer@gmail.com" className="text-[#2E342D] hover:underline font-semibold">
                sales.velneer@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D7E0D6] bg-[#E9EBDD]/40 space-y-3">
          <p className="font-bold text-[#173F30] text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#173F30]" /> Customer Support Operating Hours
          </p>
          <div className="space-y-1.5 text-[#555C54]">
            <p><strong>Days:</strong> Monday to Saturday</p>
            <p><strong>Timing:</strong> 10:00 AM – 7:00 PM IST</p>
            <p><strong>Sunday:</strong> Automated ticketing / Emergency escalations only</p>
            <p><strong>Turnaround SLA:</strong> All queries acknowledged within 4 to 24 hours.</p>
          </div>
        </div>
      </div>

      {/* Statutory Grievance Redressal Officer */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-[#173F30] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2E7D32]" /> Statutory Grievance Officer
        </h3>
        <div className="p-4 rounded-xl border border-[#E5E0D8] bg-[#FAF8F5] text-xs text-[#555C54] space-y-2">
          <p className="leading-relaxed">
            In compliance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the name and contact details of our Grievance Officer are published below:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-[#2E342D]">
            <p><strong>Name of Officer:</strong> Grievance Redressal Desk</p>
            <p><strong>Designation:</strong> Compliance & Customer Relations Head</p>
            <p><strong>Official Email:</strong> <a href="mailto:sales.velneer@gmail.com" className="text-[#173F30] underline">sales.velneer@gmail.com</a></p>
            <p><strong>Telephone:</strong> <a href="tel:+919306680944" className="text-[#173F30] underline">+91 93066 80944</a></p>
            <p className="sm:col-span-2"><strong>Office Address:</strong> Velneer, Sonipat, Haryana, 131001, India</p>
          </div>
          <p className="text-[11px] text-[#6B7068] pt-1">
            * Grievances lodged with the officer are acknowledged within 48 hours and resolved within 30 days as prescribed by statutory guidelines.
          </p>
        </div>
      </section>

      {/* Direct WhatsApp Callout */}
      <div className="p-4 rounded-xl bg-[#173F30] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-sm">Prefer Instant Real-Time Messaging?</p>
          <p className="text-xs text-[#D8C8B3] mt-0.5">
            Connect directly with our support desk via our official WhatsApp line.
          </p>
        </div>
        <button
          onClick={() => onContactWhatsApp('Hello Velneer, I need customer support regarding my order.')}
          className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Chat on WhatsApp
        </button>
      </div>
    </article>
  );
};
