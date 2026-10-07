import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Tag,
  Image,
  ShoppingBag,
  Store,
  Shield,
  LogOut,
  ChevronRight,
  AlertOctagon,
  Zap,
  Compass,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminInventory } from './AdminInventory';
import { AdminCategories } from './AdminCategories';
import { AdminCoupons } from './AdminCoupons';
import { AdminBanners } from './AdminBanners';
import { AdminOrders } from './AdminOrders';
import { AdminFlashDeals } from './AdminFlashDeals';
import { AdminNavigation } from './AdminNavigation';
import { AdminBrands } from './AdminBrands';

export const AdminLayout: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    currentUser,
    setCurrentView,
    logout,
    hasPermission,
    login,
  } = useApp();

  // RBAC Guard
  const canAccessAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');

  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-900">
            Access Restricted: RBAC Guard
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your current account role (<strong>{currentUser?.role || 'Guest'}</strong>) does not possess administrative privileges to view backend inventory, financial analytics, or store configuration.
          </p>

          <div className="pt-2 space-y-2">
            <button
              onClick={() => login('admin@shopverse.in', 'admin')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              👑 Elevate to Super Admin (Demo Switch)
            </button>
            <button
              onClick={() => setCurrentView('store')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard, superOnly: false },
    { id: 'flash-deals', label: 'Flash Deals & Timer', icon: Zap, superOnly: false },
    { id: 'products', label: 'Product Catalog', icon: Package, superOnly: false },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes, superOnly: false },
    { id: 'categories', label: 'Categories & Subcategories', icon: FolderTree, superOnly: false },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Tag, superOnly: true },
    { id: 'banners', label: 'Banners & Campaigns', icon: Image, superOnly: true },
    { id: 'brands', label: 'Top Brands & Logos', icon: Award, superOnly: false },
    { id: 'navigation', label: 'Navbar Menu Manager', icon: Compass, superOnly: false },
    { id: 'orders', label: 'Customer Orders', icon: ShoppingBag, superOnly: false },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans">
      {/* Top Admin Bar */}
      <header className="bg-[#1F1F1F] text-white border-b border-[#3A3A3A] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-lg font-black tracking-tight cursor-pointer" onClick={() => setCurrentView('store')}>
              <span>Shop</span>
              <span className="text-[#8C6F52]">Verse</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-[#8C6F52] text-white px-2 py-0.5 rounded">
                Control Hub
              </span>
            </div>
            <span className="text-[#3A3A3A] hidden sm:inline">/</span>
            <span className="text-xs text-[#A8927D] hidden sm:inline capitalize">
              {adminTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('store')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3A3A3A] hover:bg-[#8C6F52] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Back to Storefront</span>
            </button>

            <div className="h-4 w-px bg-[#3A3A3A]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#8C6F52] text-white font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-white block leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#D4A373] font-semibold capitalize block">
                  {currentUser.role === 'admin' ? 'Super Admin' : 'Store Manager'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-[#A8927D] hover:text-[#E63946] cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="bg-white rounded-2xl border border-[#E8E2DC] shadow-xs p-3 space-y-1">
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#A8927D]">
              Admin Navigation
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              const isDisabled = item.superOnly && !isSuperAdmin;

              return (
                <button
                  key={item.id}
                  disabled={isDisabled}
                  onClick={() => setAdminTab(item.id as any)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed text-[#A8927D]'
                      : isActive
                      ? 'bg-[#8C6F52] text-white shadow-xs'
                      : 'text-[#3A3A3A] hover:bg-[#F5F1EC] hover:text-[#1F1F1F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8C6F52]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.superOnly && !isSuperAdmin && (
                    <span className="text-[9px] bg-[#E8E2DC] text-[#3A3A3A] px-1 py-0.5 rounded">
                      Admin Only
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="bg-[#F5F1EC] border border-[#C6B8AB] rounded-2xl p-4 text-xs text-[#1F1F1F] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#8C6F52]">
              <Shield className="w-4 h-4 text-[#8C6F52]" />
              <span>RBAC Policy Active</span>
            </div>
            <p className="text-[11px] text-[#3A3A3A] leading-relaxed">
              Logged in with role <strong>{currentUser.role}</strong>. Any changes in inventory, discounts, or catalog instantly update the public customer storefront.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'flash-deals' && <AdminFlashDeals />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'inventory' && <AdminInventory />}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'coupons' && <AdminCoupons />}
          {adminTab === 'banners' && <AdminBanners />}
          {adminTab === 'brands' && <AdminBrands />}
          {adminTab === 'navigation' && <AdminNavigation />}
          {adminTab === 'orders' && <AdminOrders />}
        </main>
      </div>
    </div>
  );
};
