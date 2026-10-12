import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Flame, Tag, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    setCurrentView,
    navItems,
    currentPage,
    navigateToHome,
    navigateToShop,
    navigateToCategory,
  } = useApp();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeHoverCat, setActiveHoverCat] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeNavItems = navItems.filter((i) => i.isActive).sort((a, b) => a.order - b.order);

  const handleNavClick = (item: (typeof activeNavItems)[0]) => {
    setCurrentView('store');

    if (item.linkType === 'home') {
      navigateToHome();
      return;
    }

    if (item.linkType === 'shop') {
      navigateToShop();
      return;
    }

    if (item.linkType === 'category') {
      navigateToCategory(item.targetValue);
      return;
    }

    if (item.linkType === 'section') {
      if (currentPage !== 'home') {
        navigateToHome();
        setTimeout(() => {
          const el = document.getElementById(item.targetValue);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(item.targetValue);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    if (item.linkType === 'external') {
      if (item.openInNewTab) {
        window.open(item.targetValue, '_blank');
      } else {
        window.location.href = item.targetValue;
      }
    }
  };

  return (
    <nav className="bg-[#F8F5EF] border-b border-[#D7E0D6] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* All Categories Dropdown Trigger */}
        <div className="relative py-2" ref={menuRef}>
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="bg-[#173F30] hover:bg-[#2E5E46] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-2.5 transition-all shadow-xs cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>All Categories</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Dropdown Menu */}
          {isCategoryMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-80 md:w-[650px] bg-white rounded-xl shadow-2xl border border-[#B9A48B] p-4 z-50 flex flex-col md:flex-row gap-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Category List */}
              <div className="w-full md:w-1/2 divide-y divide-[#D7E0D6] max-h-[360px] overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    navigateToShop();
                    setIsCategoryMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                    currentPage === 'shop' ? 'bg-[#E9EBDD] text-[#173F30]' : 'text-[#2E342D] hover:bg-[#E9EBDD]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#173F30]" />
                    All Products (Shop)
                  </span>
                  <span className="text-[10px] text-[#6B7068]">Explore All &rarr;</span>
                </button>

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveHoverCat(cat.id)}
                    className="group"
                  >
                    <button
                      onClick={() => {
                        navigateToCategory(cat.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        currentPage === 'category' && selectedCategory === cat.id
                          ? 'bg-[#E9EBDD] text-[#173F30] font-semibold'
                          : 'text-[#2E342D] hover:bg-[#E9EBDD]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-[#6B7068] group-hover:text-[#173F30]">
                        {cat.subcategories.length} subs &rarr;
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Subcategories Preview Panel */}
              <div className="hidden md:block w-1/2 bg-[#E9EBDD] rounded-lg p-3.5 border border-[#D7E0D6]">
                {(() => {
                  const currentPreviewCat = categories.find((c) => c.id === (activeHoverCat || categories[0]?.id));
                  if (!currentPreviewCat) return null;
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D7E0D6]">
                        <img
                          src={currentPreviewCat.imageUrl}
                          alt={currentPreviewCat.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#B9A48B]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#2E342D]">{currentPreviewCat.name}</h4>
                          <button
                            onClick={() => {
                              navigateToCategory(currentPreviewCat.id);
                              setIsCategoryMenuOpen(false);
                            }}
                            className="text-[10px] text-[#173F30] font-semibold hover:underline cursor-pointer"
                          >
                            Go to {currentPreviewCat.name} Page &rarr;
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {currentPreviewCat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              navigateToCategory(currentPreviewCat.id);
                              setIsCategoryMenuOpen(false);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-xs text-[#6B7068] hover:text-[#173F30] hover:bg-white transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{sub.name}</span>
                            <span className="text-[10px] text-[#6B7068]">&rsaquo;</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Links Navigation Bar */}
        <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-5 overflow-x-auto py-2 no-scrollbar text-xs sm:text-sm font-medium text-[#2E342D]">
          {activeNavItems.map((item) => {
            const isActive =
              (item.linkType === 'home' && currentPage === 'home') ||
              (item.linkType === 'shop' && currentPage === 'shop') ||
              (item.linkType === 'category' && currentPage === 'category' && selectedCategory === item.targetValue);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#173F30] font-bold bg-[#E9EBDD]'
                    : 'hover:text-[#173F30]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
