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
    isWishlistOpen,
    setIsWishlistOpen,
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
    navigateToHome,
    navigateToShop,
    navigateToCategory,
    currentPage,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sanitize input to prevent SQLi / XSS scripts in search queries
    const sanitized = localSearch.replace(/[<>'";]/g, '').trim();
    setSearchQuery(sanitized);
    navigateToShop();
  };

  return (
    <header className="bg-[#F8F5EF] border-b border-[#D7E0D6] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sm:gap-4">
        {/* Logo */}
        <div
          onClick={() => {
            navigateToHome();
            setSearchQuery('');
            setLocalSearch('');
          }}
          className="cursor-pointer shrink-0 group flex flex-col"
        >
          <div className="flex items-center text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-[#2E342D] group-hover:text-[#173F30] transition-colors">Vel</span>
            <span className="text-[#173F30]">neer</span>
          </div>
          <span className="text-[10px] text-[#173F30]/80 font-medium tracking-wide -mt-1 hidden sm:block">
            Everything You Need, Everyday
          </span>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="order-last md:order-none w-full md:w-auto md:flex-1 max-w-2xl mx-0 md:mx-6 mt-1 md:mt-0 flex items-center"
        >
          <div className="relative w-full flex items-center rounded-lg border border-[#B9A48B] focus-within:border-[#173F30] focus-within:ring-2 focus-within:ring-[#D7E0D6] transition-all bg-white hover:border-[#173F30]">
            {/* Category Filter Select */}
            <select
              value={currentPage === 'category' ? selectedCategory || '' : ''}
              onChange={(e) => {
                if (e.target.value) {
                  navigateToCategory(e.target.value);
                } else {
                  navigateToShop();
                }
              }}
              className="text-xs text-[#6B7068] bg-transparent pl-3 pr-2 py-2.5 border-r border-[#D7E0D6] focus:outline-none cursor-pointer hidden md:block max-w-[130px] truncate"
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
              className="w-full text-sm text-[#2E342D] placeholder-[#6B7068] px-3.5 py-2.5 bg-transparent focus:outline-none"
            />

            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                className="text-xs text-[#6B7068] hover:text-[#2E342D] px-2 cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="bg-[#173F30] hover:bg-[#2E5E46] text-white p-2.5 sm:px-5 rounded-r-md transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
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
                  ? 'bg-[#E9EBDD] text-[#173F30] border-[#B9A48B] shadow-xs'
                  : 'bg-[#2E342D] text-white border-[#2E342D] hover:bg-[#6B7068]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#D8C8B3]" />
              <span className="hidden md:inline">
                {currentView === 'admin' ? 'Back to Store' : 'Admin Panel'}
              </span>
              <span className="md:hidden">{currentView === 'admin' ? 'Store' : 'Admin'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                login('admin@velneer.in', 'admin');
                setCurrentView('admin');
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B] hover:bg-[#D7E0D6] transition-colors cursor-pointer"
              title="Click to test Admin features directly"
            >
              <Shield className="w-3 h-3 text-[#173F30]" />
              <span>Demo Admin</span>
            </button>
          )}

          {/* Account / Profile / Login Button */}
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex flex-col items-center justify-center text-[#2E342D] hover:text-[#173F30] transition-colors py-0.5 px-1 cursor-pointer group"
                  title="My Profile & Account"
                >
                  <div className="w-8 h-8 rounded-full bg-[#E9EBDD] text-[#173F30] font-bold flex items-center justify-center text-xs overflow-hidden border-2 border-[#B9A48B] group-hover:border-[#173F30] transition-colors shadow-2xs">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-[#173F30]" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-[#2E342D] group-hover:text-[#173F30] transition-colors mt-0.5 leading-tight">
                    Profile
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#B9A48B] py-2 z-50 animate-in fade-in zoom-in duration-100">
                    <div className="px-4 py-2 border-b border-[#D7E0D6]">
                      <p className="text-xs font-bold text-[#2E342D]">{currentUser.name}</p>
                      <p className="text-[11px] text-[#6B7068] truncate">{currentUser.email}</p>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E9EBDD] text-[#173F30] border border-[#B9A48B]">
                        <Shield className="w-3 h-3" />
                        <span className="capitalize">{currentUser.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-[#2E342D] hover:bg-[#E9EBDD] flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#173F30]" />
                      <span>My Profile & Orders</span>
                    </button>

                    {hasPermission('manager') && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setCurrentView('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-medium text-[#2E342D] hover:bg-[#E9EBDD] flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#173F30]" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {/* Role quick switchers */}
                    <div className="border-t border-[#D7E0D6] my-1 pt-1 px-3">
                      <p className="text-[10px] font-semibold text-[#6B7068] uppercase tracking-wider mb-1">
                        Switch Demo Role
                      </p>
                      <button
                        onClick={() => {
                          login('admin@velneer.in', 'admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#6B7068] hover:text-[#173F30] flex items-center justify-between cursor-pointer"
                      >
                        <span>Super Admin</span>
                        {currentUser.role === 'admin' && <CheckCircle2 className="w-3 h-3 text-[#173F30]" />}
                      </button>
                      <button
                        onClick={() => {
                          login('manager@velneer.in', 'manager');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#6B7068] hover:text-[#173F30] flex items-center justify-between cursor-pointer"
                      >
                        <span>Store Manager</span>
                        {currentUser.role === 'manager' && <CheckCircle2 className="w-3 h-3 text-[#173F30]" />}
                      </button>
                      <button
                        onClick={() => {
                          login('rahul@example.com', 'customer');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1 text-[11px] text-[#6B7068] hover:text-[#173F30] flex items-center justify-between cursor-pointer"
                      >
                        <span>Customer</span>
                        {currentUser.role === 'customer' && <CheckCircle2 className="w-3 h-3 text-[#173F30]" />}
                      </button>
                    </div>

                    <div className="border-t border-[#D7E0D6] mt-1 pt-1">
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
                className="flex flex-col items-center justify-center text-[#2E342D] hover:text-[#173F30] transition-colors py-0.5 px-1 cursor-pointer group"
                title="Login / Sign Up"
              >
                <div className="w-8 h-8 rounded-full bg-[#E9EBDD] text-[#173F30] flex items-center justify-center border-2 border-[#B9A48B] group-hover:border-[#173F30] transition-colors shadow-2xs">
                  <UserIcon className="w-4 h-4 text-[#173F30]" />
                </div>
                <span className="text-[11px] font-semibold text-[#2E342D] group-hover:text-[#173F30] transition-colors mt-0.5 leading-tight">
                  Login
                </span>
              </button>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="flex items-center gap-1.5 text-[#2E342D] hover:text-[#173F30] transition-colors relative cursor-pointer"
            title="Wishlist Side Panel"
          >
            <div className="relative">
              <Heart className="w-5 h-5 text-[#2E342D] hover:text-[#E63946] transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#E63946] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#F8F5EF]">
                  {wishlist.length}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium hidden md:inline">Wishlist</span>
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 text-[#2E342D] hover:text-[#173F30] transition-colors relative cursor-pointer"
            title="Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-[#2E342D]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#173F30] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-[#F8F5EF]">
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
