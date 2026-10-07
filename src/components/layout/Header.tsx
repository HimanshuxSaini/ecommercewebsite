import React, { useState } from 'react';
import {
  Search,
  User as UserIcon,
  Heart,
  ShoppingCart,
  Shield,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    setIsAuthOpen,
    setIsProfileOpen,
    setIsCartOpen,
    cartCount,
    wishlist,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    hasPermission,
    login,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize input to prevent SQLi / XSS scripts in search queries
    const sanitized = localSearch.replace(/[<>'";]/g, '').trim();
    setSearchQuery(sanitized);
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-[#FAF9F6] border-b border-[#E8E2DC] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <div
          onClick={() => {
            setCurrentView('store');
            setSelectedCategory(null);
            setSearchQuery('');
            setLocalSearch('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer shrink-0 group flex flex-col"
        >
          <div className="flex items-center text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-[#1F1F1F] group-hover:text-[#8C6F52] transition-colors">Shop</span>
            <span className="text-[#8C6F52]">Verse</span>
          </div>
          <span className="text-[10px] text-[#8C6F52]/80 font-medium tracking-wide -mt-1 hidden sm:block">
            Everything You Need, Everyday
          </span>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="order-last md:order-none w-full md:w-auto md:flex-1 max-w-2xl mx-0 md:mx-6 mt-1 md:mt-0 flex items-center"
        >
          <div className="relative w-full flex items-center rounded-lg border border-[#C6B8AB] focus-within:border-[#8C6F52] focus-within:ring-2 focus-within:ring-[#E8E2DC] transition-all bg-white hover:border-[#8C6F52]">
            {/* Category Filter Select */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="text-xs text-[#3A3A3A] bg-transparent pl-3 pr-2 py-2.5 border-r border-[#E8E2DC] focus:outline-none cursor-pointer hidden md:block max-w-[130px] truncate"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search products, brands and more..."
              className="w-full text-sm text-[#1F1F1F] placeholder-[#A9A9A9] px-3.5 py-2.5 bg-transparent focus:outline-none"
            />

            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                className="text-xs text-[#A9A9A9] hover:text-[#1F1F1F] px-2 cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="bg-[#1F1F1F] hover:bg-[#3A3A3A] text-white p-2.5 sm:px-5 rounded-r-md transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
              title="Search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>

        {/* Action Controls: Switch Admin, Account, Wishlist, Cart */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Quick Admin Panel Toggle Button */}
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') ? (
            <button
              onClick={() => setCurrentView(currentView === 'admin' ? 'store' : 'admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#F5F1EC] text-[#8C6F52] border-[#C6B8AB] shadow-xs'
                  : 'bg-[#1F1F1F] text-white border-[#1F1F1F] hover:bg-[#3A3A3A]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#D4A373]" />
              <span className="hidden md:inline">
                {currentView === 'admin' ? 'Back to Store' : 'Admin Panel'}
              </span>
              <span className="md:hidden">{currentView === 'admin' ? 'Store' : 'Admin'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                login('admin@shopverse.in', 'admin');
                setCurrentView('admin');
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#F5F1EC] text-[#8C6F52] border border-[#C6B8AB] hover:bg-[#E8E2DC] transition-colors cursor-pointer"
              title="Click to test Admin features directly"
            >
              <Shield className="w-3 h-3 text-[#8C6F52]" />
              <span>Demo Admin</span>
            </button>
          )}

          {/* Account / Profile / Login Button */}
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col items-center justify-center text-[#1F1F1F] hover:text-[#8C6F52] transition-colors py-0.5 px-1 cursor-pointer group"
                  title="My Profile & Account"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F5F1EC] text-[#8C6F52] font-bold flex items-center justify-center text-xs overflow-hidden border-2 border-[#C6B8AB] group-hover:border-[#8C6F52] transition-colors shadow-2xs">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#8C6F52]" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#1F1F1F] group-hover:text-[#8C6F52] transition-colors mt-0.5 leading-tight">
                    Profile
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#C6B8AB] py-2 z-50 animate-in fade-in zoom-in duration-100">
                    <div className="px-4 py-2 border-b border-[#E8E2DC]">
                      <p className="text-xs font-bold text-[#1F1F1F]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#3A3A3A] truncate">{currentUser.email}</p>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F1EC] text-[#8C6F52] border border-[#C6B8AB]">
                        <Shield className="w-3 h-3" />
                        <span className="capitalize">{currentUser.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#1F1F1F] hover:bg-[#F5F1EC] flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#8C6F52]" />
                      <span>My Profile & Orders</span>
                    </button>

                    {hasPermission('manager') && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setCurrentView('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-[#1F1F1F] hover:bg-[#F5F1EC] flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#8C6F52]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {/* Role quick switchers */}
                    <div className="border-t border-[#E8E2DC] my-1 pt-1 px-3">
                      <p className="text-[10px] font-semibold text-[#A9A9A9] uppercase tracking-wider mb-1">
                        Switch Demo Role
                      </p>
                      <button
                        onClick={() => {
                          login('admin@shopverse.in', 'admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#3A3A3A] hover:text-[#8C6F52] flex items-center justify-between cursor-pointer"
                      >
                        <span>Super Admin</span>
                        {currentUser.role === 'admin' && <CheckCircle2 className="w-3 h-3 text-[#8C6F52]" />}
                      </button>
                      <button
                        onClick={() => {
                          login('manager@shopverse.in', 'manager');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#3A3A3A] hover:text-[#8C6F52] flex items-center justify-between cursor-pointer"
                      >
                        <span>Store Manager</span>
                        {currentUser.role === 'manager' && <CheckCircle2 className="w-3 h-3 text-[#8C6F52]" />}
                      </button>
                      <button
                        onClick={() => {
                          login('rahul@example.com', 'customer');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#3A3A3A] hover:text-[#8C6F52] flex items-center justify-between cursor-pointer"
                      >
                        <span>Customer</span>
                        {currentUser.role === 'customer' && <CheckCircle2 className="w-3 h-3 text-[#8C6F52]" />}
                      </button>
                    </div>

                    <div className="border-t border-[#E8E2DC] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-[#E63946] hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex flex-col items-center justify-center text-[#1F1F1F] hover:text-[#8C6F52] transition-colors py-0.5 px-1 cursor-pointer group"
                title="Login / Sign Up"
              >
                <div className="w-8 h-8 rounded-full bg-[#F5F1EC] text-[#8C6F52] flex items-center justify-center border-2 border-[#C6B8AB] group-hover:border-[#8C6F52] transition-colors shadow-2xs">
                  <UserIcon className="w-4 h-4 text-[#8C6F52]" />
                </div>
                <span className="text-[11px] font-semibold text-[#1F1F1F] group-hover:text-[#8C6F52] transition-colors mt-0.5 leading-tight">
                  Login
                </span>
              </button>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={() => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                setIsProfileOpen(true);
              }
            }}
            className="flex items-center gap-1.5 text-[#1F1F1F] hover:text-[#8C6F52] transition-colors relative cursor-pointer"
            title="Wishlist"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-[#1F1F1F] hover:text-[#E63946] transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E63946] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FAF9F6]">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium hidden md:inline">Wishlist</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 text-[#1F1F1F] hover:text-[#8C6F52] transition-colors relative cursor-pointer"
            title="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#1F1F1F]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#8C6F52] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#FAF9F6]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium hidden md:inline">Cart</span>
          </button>
        </div>
      </div>
    </header>
  );
};
