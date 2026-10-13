import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  HelpCircle,
  CheckCircle2,
  Palette,
  Boxes,
  Package,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  chips?: { label: string; action: () => void }[];
}

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [readyQuery, setReadyQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917494980621'; // Velneer Official Support & Workshop Number

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initial greeting
  const initialMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Namaste! 🙏 Welcome to Velneer Support & Custom Studio. I am your automated assistant.',
      time: getCurrentTime(),
    },
    {
      id: 'msg-2',
      sender: 'bot',
      text: 'How can we help you today? Please tap an option below or type your query:',
      time: getCurrentTime(),
      chips: [
        { label: '📦 Track My Order', action: () => handleSelectCategory('track') },
        { label: '🏷️ Product Inquiry', action: () => handleSelectCategory('product') },
        { label: '🏢 Bulk / Wholesale', action: () => handleSelectCategory('bulk') },
        { label: '🎨 Custom Resin Art', action: () => handleSelectCategory('resin') },
        { label: '💬 General Help', action: () => handleSelectCategory('general') },
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, readyQuery]);

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

  const addMessage = (sender: 'bot' | 'user', text: string, chips?: { label: string; action: () => void }[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender,
        text,
        time: getCurrentTime(),
        chips,
      },
    ]);
  };

  const handleSelectCategory = (category: string) => {
    setActiveCategory(category);
    setReadyQuery(null);

    if (category === 'track') {
      addMessage('user', '📦 Track My Order');
      setTimeout(() => {
        addMessage(
          'bot',
          'Please enter your Order ID (e.g. ORD-2026-1024) or 10-digit mobile number so we can look up your dispatch status:'
        );
      }, 400);
    } else if (category === 'product') {
      addMessage('user', '🏷️ Product Inquiry / Availability');
      setTimeout(() => {
        addMessage(
          'bot',
          'Which item are you interested in? You can specify product names (e.g., Pure Copper Bottle, Ocean Wall Clock, Resin Coasters):',
          [
            { label: 'Pure Copperware', action: () => handleQuickProduct('Pure Copperware Collection') },
            { label: 'Epoxy Resin Clocks', action: () => handleQuickProduct('Epoxy Resin Wall Clock') },
            { label: 'River Wood Tables', action: () => handleQuickProduct('Ocean Epoxy River Table') },
            { label: 'Custom Gift Hampers', action: () => handleQuickProduct('Custom Gift Hampers') },
          ]
        );
      }, 400);
    } else if (category === 'bulk') {
      addMessage('user', '🏢 Bulk & Wholesale Orders');
      setTimeout(() => {
        addMessage(
          'bot',
          'We offer tiered wholesale discounts & GST invoicing for corporate and bulk gifting! What approximate volume are you planning?',
          [
            { label: '25 – 50 Units', action: () => handleQuickBulk('25 to 50 Units') },
            { label: '50 – 100 Units', action: () => handleQuickBulk('50 to 100 Units') },
            { label: '100 – 500 Units', action: () => handleQuickBulk('100 to 500 Units') },
            { label: '500+ Enterprise', action: () => handleQuickBulk('500+ Enterprise Volume') },
          ]
        );
      }, 400);
    } else if (category === 'resin') {
      addMessage('user', '🎨 Custom Resin Art Studio');
      setTimeout(() => {
        addMessage(
          'bot',
          'Our resin studio crafts personalized bespoke pieces! Which bespoke project would you like to commission?',
          [
            { label: 'Wall Clock & Geode Art', action: () => handleQuickResin('Custom Wall Clock & Geode Art') },
            { label: 'Varmala Flower Preservation', action: () => handleQuickResin('Wedding Varmala Flower Preservation') },
            { label: 'Ocean River Table', action: () => handleQuickResin('Ocean Wave Epoxy River Table') },
            { label: 'Nameplate / Signage', action: () => handleQuickResin('Bespoke Resin Nameplate') },
          ]
        );
      }, 400);
    } else {
      addMessage('user', '💬 General Support & Queries');
      setTimeout(() => {
        addMessage('bot', 'Please type your question or query below and send:');
      }, 400);
    }
  };

  const handleQuickProduct = (productName: string) => {
    addMessage('user', productName);
    const finalFormatted = `Hello Velneer Team,\n\nI have an inquiry regarding: *${productName}*.\nCould you please share details on availability, customization options, and delivery timeline?\n\nThank you!`;
    finalizeBotQuery(finalFormatted, `Product inquiry prepared for "${productName}".`);
  };

  const handleQuickBulk = (qty: string) => {
    addMessage('user', `Estimated Volume: ${qty}`);
    const finalFormatted = `Hello Velneer Corporate & Wholesale Team,\n\nI would like to inquire about a Bulk / Corporate Order.\n• Approximate Quantity: *${qty}*\n• Requirement: Store catalog & wholesale pricing sheet.\n\nPlease share catalog and quotation with GST details.`;
    finalizeBotQuery(finalFormatted, `Wholesale inquiry prepared for ${qty}.`);
  };

  const handleQuickResin = (resinType: string) => {
    addMessage('user', resinType);
    const finalFormatted = `Hello Velneer Resin Art Studio,\n\nI am inquiring about a custom commission: *${resinType}*.\nCould you please guide me on available dimensions, resin colors, and customization pricing?\n\nLooking forward to your guidance!`;
    finalizeBotQuery(finalFormatted, `Custom resin commission query prepared for ${resinType}.`);
  };

  const finalizeBotQuery = (queryText: string, confirmationText: string) => {
    setReadyQuery(queryText);
    setTimeout(() => {
      addMessage(
        'bot',
        `✨ ${confirmationText}\n\nYour message is formatted and ready! Tap below to open WhatsApp and send your query instantly:`
      );
    }, 450);
  };

  const handleSendInput = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');
    addMessage('user', text);

    setTimeout(() => {
      let finalFormatted = '';
      if (activeCategory === 'track') {
        finalFormatted = `Hello Velneer Support,\n\nI want to track my order.\n• Order ID / Phone: *${text}*\n\nPlease provide the current shipment status and expected delivery date. Thank you!`;
        finalizeBotQuery(finalFormatted, `Order tracking request formatted for: ${text}`);
      } else if (activeCategory === 'bulk') {
        finalFormatted = `Hello Velneer Team,\n\nI have a bulk order requirement: "${text}".\nPlease share quotation and wholesale pricing.`;
        finalizeBotQuery(finalFormatted, 'Bulk requirement received.');
      } else if (activeCategory === 'resin') {
        finalFormatted = `Hello Velneer Resin Studio,\n\nI want to discuss custom resin work: "${text}".\nPlease share samples and pricing.`;
        finalizeBotQuery(finalFormatted, 'Resin inquiry received.');
      } else {
        finalFormatted = `Hello Velneer Support,\n\nQuery: ${text}\n\nPlease connect me with a representative.`;
        finalizeBotQuery(finalFormatted, 'Your query is ready.');
      }
    }, 400);
  };

  const handleOpenWhatsApp = (customTextToSend?: string) => {
    const text = customTextToSend || readyQuery || 'Hello Velneer, I would like to inquire about your products.';
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
    setActiveCategory('');
    setReadyQuery(null);
    setInputText('');
  };

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
          aria-label="Open WhatsApp Chat Bot"
        >
          {/* Pulsing online indicator ring */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#173F30] opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#173F30] border-2 border-white" />
          </span>

          {/* WhatsApp SVG Icon */}
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
          </svg>

          <div className="text-left leading-tight hidden sm:block">
            <p className="text-[11px] font-bold text-white tracking-wide uppercase flex items-center gap-1">
              <span>WhatsApp Bot</span>
              <Sparkles className="w-2.5 h-2.5 text-yellow-200" />
            </p>
            <p className="text-[10px] text-white/90">Instant Query Dispatch</p>
          </div>
        </button>
      )}

      {/* Expanded Interactive Chatbot Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#D7E0D6] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200 h-[520px] max-h-[85vh]">
          {/* Header */}
          <div className="bg-[#173F30] text-white p-3.5 flex items-center justify-between border-b border-[#2E342D] shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366] flex items-center justify-center font-bold text-white text-sm">
                  {/* WhatsApp Mini SVG */}
                  <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-[#173F30]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Velneer WhatsApp Bot</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <p className="text-[10px] text-[#E9EBDD] flex items-center gap-1">
                  <span>Online</span> • <span>+91 74949 80621</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body (WhatsApp Wallpaper aesthetic) */}
          <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-[#EFEAE2] text-xs text-[#2E342D]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl text-xs shadow-2xs whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#D9FDD3] text-[#2E342D] rounded-tr-xs'
                      : 'bg-white text-[#2E342D] rounded-tl-xs border border-[#D7E0D6]/60'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[9px] text-[#6B7068] text-right mt-1 font-mono">
                    {msg.time}
                  </span>
                </div>

                {/* Interactive Action Chips (Quick replies) */}
                {msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={chip.action}
                        className="bg-white hover:bg-[#173F30] hover:text-white text-[#173F30] text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-[#B9A48B]/50 transition-all cursor-pointer shadow-2xs active:scale-95"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ready to Send Card */}
            {readyQuery && (
              <div className="p-3 bg-white rounded-xl border-2 border-[#25D366] shadow-sm space-y-2 mt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#173F30]">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Formatted Query Preview:</span>
                  </span>
                  <span className="text-[9px] bg-[#E9EBDD] text-[#173F30] px-1.5 py-0.5 rounded">
                    Ready
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#D7E0D6] text-[11px] text-[#2E342D] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {readyQuery}
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp()}
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 px-3 rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.664-.698c.974.53 1.83.811 2.802.812 3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.766-5.774-5.766zm8.469 5.766c0 4.693-3.813 8.508-8.5 8.508-1.464 0-2.85-.373-4.062-1.031l-4.509 1.182 1.205-4.404c-.754-1.277-1.196-2.77-1.196-4.364 0-4.693 3.813-8.508 8.562-8.508 4.688 0 8.5 3.815 8.5 8.617z" />
                  </svg>
                  <span>Send Query on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendInput}
            className="p-2.5 bg-white border-t border-[#D7E0D6] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeCategory === 'track'
                  ? 'Type Order ID or Phone number...'
                  : 'Type your message or query here...'
              }
              className="flex-1 text-xs bg-[#FAF8F5] border border-[#B9A48B] rounded-full px-3.5 py-2 text-[#2E342D] focus:outline-none focus:ring-1 focus:ring-[#173F30]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-[#173F30] hover:bg-[#2E5E46] disabled:opacity-40 text-white rounded-full transition-colors cursor-pointer shrink-0"
              title="Send to bot"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer Sub-bar */}
          <div className="px-3 py-1.5 bg-[#F0F2F5] border-t border-[#E0E0E0] flex items-center justify-between text-[10px] text-[#6B7068] shrink-0">
            <span>Direct to: +91 74949 80621</span>
            <button
              type="button"
              onClick={() => handleOpenWhatsApp('Hello Velneer, I need quick assistance.')}
              className="text-[#173F30] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Instant WhatsApp</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
