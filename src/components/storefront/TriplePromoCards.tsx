import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TriplePromoCards: React.FC = () => {
  const { setSelectedCategory } = useApp();

  const promoCards = [
    {
      tag: 'Deal of the Day',
      tagColor: 'bg-[#D4A373]/20 text-[#8C6F52] border-[#D4A373]/40',
      title: 'Top Deals on Electronics',
      subtitle: 'Up to 60% OFF',
      description: 'On selected audio, laptops & wearables',
      buttonText: 'Shop Deals',
      buttonClass: 'bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white',
      cardClass: 'bg-[#F5F1EC] border-[#C6B8AB] text-[#1F1F1F]',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80',
      categoryId: 'cat-electronics',
      targetId: 'flash-deals',
    },
    {
      tag: 'New Arrivals',
      tagColor: 'bg-[#2E7D32]/10 text-[#2E7D32] border-[#2E7D32]/30',
      title: 'Fashion Festive Sale',
      subtitle: 'Fresh Finds • Min 40% OFF',
      description: 'Check out the latest apparel just for you',
      buttonText: 'Explore Now',
      buttonClass: 'bg-[#8C6F52] hover:bg-[#6B5B4A] text-white',
      cardClass: 'bg-[#EDE6E1] border-[#C6B8AB] text-[#1F1F1F]',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80',
      categoryId: 'cat-fashion',
      targetId: 'flash-deals',
    },
    {
      tag: 'Member Exclusive',
      tagColor: 'bg-[#D4A373]/30 text-[#D4A373] border-[#D4A373]/50',
      title: 'Home Essentials Sale',
      subtitle: 'Extra 10% OFF',
      description: 'On luxury furniture, cookware & decor',
      buttonText: 'Shop Now',
      buttonClass: 'bg-[#8C6F52] hover:bg-[#A8927D] text-white',
      cardClass: 'bg-[#1F1F1F] border-[#3A3A3A] text-white',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80',
      categoryId: 'cat-home',
      targetId: 'best-sellers',
    },
  ];

  const handleClick = (categoryId: string, targetId: string) => {
    setSelectedCategory(categoryId);
    const el = document.getElementById(targetId) || document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {promoCards.map((card, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 border ${card.cardClass} shadow-xs flex items-center justify-between gap-4 overflow-hidden relative group hover:shadow-md transition-shadow`}
          >
            <div className="z-10 flex flex-col items-start max-w-[58%]">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${card.tagColor}`}>
                {card.tag}
              </span>
              <h3 className="text-base sm:text-lg font-black leading-snug">
                {card.title}
              </h3>
              <p className="text-xs font-extrabold mt-1 mb-1 opacity-90">
                {card.subtitle}
              </p>
              <p className="text-[11px] opacity-75 mb-3 line-clamp-1">
                {card.description}
              </p>
              <button
                onClick={() => handleClick(card.categoryId, card.targetId)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer ${card.buttonClass}`}
              >
                <span>{card.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Thumbnail */}
            <div className="w-28 sm:w-32 h-28 sm:h-32 shrink-0 rounded-xl overflow-hidden shadow-sm bg-white/10 p-1 border border-white/20">
              <img
                src={card.imageUrl}
                alt={card.title}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
