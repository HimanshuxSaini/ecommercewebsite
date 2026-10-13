import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Palette,
  Boxes,
} from 'lucide-react';

type InquiryType = 'bulk' | 'resin' | 'general' | 'custom';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<InquiryType>('bulk');
  const [customText, setCustomText] = useState('');
  
  // Specific Form Fields
  const [bulkItem, setBulkItem] = useState('');
  const [bulkQty, setBulkQty] = useState('50+');
  const [resinType, setResinType] = useState('Custom Wall Clock & Decor');
  const [resinDetails, setResinDetails] = useState('');

  const widgetRef = useRef<HTMLDivElement>(null);
  const WHATSAPP_NUMBER = '919306680944';

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Construct formatted WhatsApp message based on inquiry type
  const buildWhatsAppMessage = (): string => {
    switch (selectedType) {
      case 'bulk':
        return `Hello Velneer Team,\n\nI would like to place an inquiry for a Bulk / Wholesale Order.\n• Product Requirement: ${bulkItem.trim() || 'General Store Catalog'}\n• Estimated Quantity: ${bulkQty}\n• Additional Notes: ${customText.trim() || 'Please share wholesale pricing and delivery schedule.'}\n\nKindly share quotation and catalog.`;

      case 'resin':
        return `Hello Velneer Resin Studio,\n\nI am inquiring about Custom Epoxy Resin Work.\n• Project Type: ${resinType}\n• Specific Requirements: ${resinDetails.trim() || 'Custom color palette & dimensions'}\n• Notes: ${customText.trim() || 'Please share portfolio samples and price estimates.'}\n\nLooking forward to your guidance!`;

      case 'general':
        return `Hello Velneer Support,\n\nI have a general inquiry regarding orders / store services.\n• Message: ${customText.trim() || 'Please connect me with a representative.'}\n\nThank you!`;

      case 'custom':
      default:
        return customText.trim()
          ? `Hello Velneer,\n\n${customText.trim()}`
          : `Hello Velneer, I would like to connect with your sales and design team.`;
    }
  };

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const message = buildWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-4 pr-5 py-3.5 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
          aria-label="Contact Velneer on WhatsApp for Bulk Orders and Resin Work"
        >
          {/* Subtle Online Pulse Ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#173F30] opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#173F30] border-2 border-white" />
          </span>

          {/* WhatsApp Icon */}
          <svg
            className="w-5 h-5 fill-current shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
          </svg>

          <div className="text-left leading-tight hidden sm:block">
            <p className="text-[11px] font-bold text-white tracking-wide uppercase">WhatsApp Support</p>
            <p className="text-[10px] text-white/90">Bulk Orders & Resin Art</p>
          </div>
        </button>
      )}

      {/* Expanded Interactive Chat Modal */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#D7E0D6] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[85vh]">
          {/* Header */}
          <div className="bg-[#173F30] text-white p-4 flex items-center justify-between border-b border-[#2E342D]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-sm border border-white/20">
                  V
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-[#173F30]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white leading-tight">Velneer Concierge</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <p className="text-[11px] text-[#E9EBDD] flex items-center gap-1">
                  <span>Online</span> • <span>+91 93066 80944</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close chat window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Body & Topic Selector */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#FAF8F5] text-xs text-[#2E342D]">
            {/* Assistant Welcome Bubble */}
            <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 border border-[#D7E0D6] shadow-2xs space-y-1.5 max-w-[90%]">
              <p className="font-semibold text-[#173F30] text-xs">Namaste & Welcome to Velneer!</p>
              <p className="text-[#6B7068] leading-relaxed text-[11px]">
                Please select your inquiry category below to connect directly with our specialized team on WhatsApp:
              </p>
            </div>

            {/* Quick Topic Tabs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedType('bulk')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedType === 'bulk'
                    ? 'bg-[#E9EBDD] border-[#173F30] text-[#173F30] font-bold shadow-xs'
                    : 'bg-white border-[#D7E0D6] text-[#2E342D] hover:border-[#B9A48B]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  <Boxes className="w-3.5 h-3.5 text-[#173F30]" />
                  <span>Bulk Orders</span>
                </div>
                <p className="text-[10px] text-[#6B7068] font-normal leading-tight">Wholesale & Corporate</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('resin')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedType === 'resin'
                    ? 'bg-[#E9EBDD] border-[#173F30] text-[#173F30] font-bold shadow-xs'
                    : 'bg-white border-[#D7E0D6] text-[#2E342D] hover:border-[#B9A48B]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  <Palette className="w-3.5 h-3.5 text-[#173F30]" />
                  <span>Resin Work</span>
                </div>
                <p className="text-[10px] text-[#6B7068] font-normal leading-tight">Custom Art & Keepsakes</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('general')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedType === 'general'
                    ? 'bg-[#E9EBDD] border-[#173F30] text-[#173F30] font-bold shadow-xs'
                    : 'bg-white border-[#D7E0D6] text-[#2E342D] hover:border-[#B9A48B]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-[#173F30]" />
                  <span>Order Inquiry</span>
                </div>
                <p className="text-[10px] text-[#6B7068] font-normal leading-tight">Tracking & Questions</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType('custom')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedType === 'custom'
                    ? 'bg-[#E9EBDD] border-[#173F30] text-[#173F30] font-bold shadow-xs'
                    : 'bg-white border-[#D7E0D6] text-[#2E342D] hover:border-[#B9A48B]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  <PhoneCall className="w-3.5 h-3.5 text-[#173F30]" />
                  <span>Direct Message</span>
                </div>
                <p className="text-[10px] text-[#6B7068] font-normal leading-tight">Custom Notes</p>
              </button>
            </div>

            {/* Dynamic Form for Selected Topic */}
            <form onSubmit={handleStartChat} className="bg-white p-3.5 rounded-2xl border border-[#D7E0D6] space-y-2.5 shadow-2xs">
              {selectedType === 'bulk' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Product / Requirement
                    </label>
                    <input
                      type="text"
                      value={bulkItem}
                      onChange={(e) => setBulkItem(e.target.value)}
                      placeholder="e.g. Copper Bottles, Home Decors, Gifting"
                      className="w-full text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Approximate Quantity
                    </label>
                    <select
                      value={bulkQty}
                      onChange={(e) => setBulkQty(e.target.value)}
                      className="w-full text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                    >
                      <option value="25-50 Units">25 - 50 Units (Small Business / Gifting)</option>
                      <option value="50-100 Units">50 - 100 Units (Corporate Orders)</option>
                      <option value="100-500 Units">100 - 500 Units (Wholesale)</option>
                      <option value="500+ Units">500+ Units (Enterprise Supply)</option>
                    </select>
                  </div>
                </>
              )}

              {selectedType === 'resin' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Resin Project Type
                    </label>
                    <select
                      value={resinType}
                      onChange={(e) => setResinType(e.target.value)}
                      className="w-full text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                    >
                      <option value="Custom Wall Clock & Decor">Custom Resin Wall Clock & Decor</option>
                      <option value="Ocean Wave River Table / Coffee Table">Ocean Wave River / Coffee Table</option>
                      <option value="Wedding / Varmala Flower Preservation">Wedding / Varmala Flower Preservation</option>
                      <option value="Resin Coasters, Trays & Platters">Resin Coasters, Trays & Platters</option>
                      <option value="Nameplate & Corporate Signage">Resin Nameplate & Signage</option>
                      <option value="Personalized Resin Gift Hamper">Personalized Resin Gift Hamper</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                      Preferred Dimensions / Color Theme
                    </label>
                    <input
                      type="text"
                      value={resinDetails}
                      onChange={(e) => setResinDetails(e.target.value)}
                      placeholder="e.g. 16-inch round, emerald green & gold pigments"
                      className="w-full text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-[#2E342D] block mb-1">
                  {selectedType === 'custom' ? 'Your Message' : 'Additional Message / Query (Optional)'}
                </label>
                <textarea
                  rows={2}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type any specific requirement or timeline..."
                  className="w-full text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-lg p-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Chat on WhatsApp (+91 93066 80944)</span>
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-[#E9EBDD] border-t border-[#D7E0D6] text-center text-[10px] text-[#2E342D] font-medium">
            Directly routed to Velneer Sales & Custom Resin Workshop
          </div>
        </div>
      )}
    </div>
  );
};
