import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, Sparkles, Flame, Tag, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, setCurrentView, navItems } = useApp();
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
      setSelectedCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (item.linkType === 'category') {
      setSelectedCategory(item.targetValue);
      const el = document.getElementById('catalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (item.linkType === 'section') {
      setSelectedCategory(null);
      const el = document.getElementById(item.targetValue);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        const catEl = document.getElementById('catalog-section');
        if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
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
    <nav className="bg-[#FAF9F6] border-b border-[#E8E2DC] relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* All Categories Dropdown Trigger */}
        <div className="relative py-2" ref={menuRef}>
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white font-medium text-xs sm:text-sm px-4 py-2 rounded-lg flex items-center gap-2.5 transition-all shadow-xs cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>All Categories</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Dropdown Menu */}
          {isCategoryMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-80 md:w-[650px] bg-white rounded-xl shadow-2xl border border-[#C6B8AB] p-4 z-50 flex flex-col md:flex-row gap-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Category List */}
              <div className="w-full md:w-1/2 divide-y divide-[#E8E2DC] max-h-[360px] overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsCategoryMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                    selectedCategory === null ? 'bg-[#F5F1EC] text-[#8C6F52]' : 'text-[#1F1F1F] hover:bg-[#F5F1EC]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#8C6F52]" />
                    All Products
                  </span>
                  <span className="text-[10px] text-[#A9A9A9]">View All</span>
                </button>

                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveHoverCat(cat.id)}
                    className="group"
                  >
                    <button
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setIsCategoryMenuOpen(false);
                        const el = document.getElementById('catalog-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        selectedCategory === cat.id ? 'bg-[#F5F1EC] text-[#8C6F52] font-semibold' : 'text-[#1F1F1F] hover:bg-[#F5F1EC]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-[#A9A9A9] group-hover:text-[#8C6F52]">
                        {cat.subcategories.length} subs &rarr;
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Subcategories Preview Panel */}
              <div className="hidden md:block w-1/2 bg-[#F5F1EC] rounded-lg p-3.5 border border-[#E8E2DC]">
                {(() => {
                  const currentPreviewCat = categories.find((c) => c.id === (activeHoverCat || categories[0]?.id));
                  if (!currentPreviewCat) return null;
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E8E2DC]">
                        <img
                          src={currentPreviewCat.imageUrl}
                          alt={currentPreviewCat.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#C6B8AB]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#1F1F1F]">{currentPreviewCat.name}</h4>
                          <p className="text-[10px] text-[#A8927D]">Explore subcategories</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {currentPreviewCat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedCategory(currentPreviewCat.id);
                              setIsCategoryMenuOpen(false);
                              const el = document.getElementById('catalog-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full text-left px-2 py-1.5 rounded text-xs text-[#3A3A3A] hover:text-[#8C6F52] hover:bg-white transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{sub.name}</span>
                            <span className="text-[10px] text-[#A9A9A9]">&rsaquo;</span>
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
        <div className="flex items-center space-x-1 sm:space-x-3 md:space-x-5 overflow-x-auto py-2 no-scrollbar text-xs sm:text-sm font-medium text-[#1F1F1F]">
          {activeNavItems.map((item) => {
            const isActive =
              (item.linkType === 'category' && selectedCategory === item.targetValue) ||
              (item.linkType === 'home' && selectedCategory === null && window.scrollY < 200);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#8C6F52] font-bold bg-[#F5F1EC]'
                    : 'hover:text-[#8C6F52]'
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
