/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopRibbon } from './components/layout/TopRibbon';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { HomePage } from './components/storefront/HomePage';
import { ShopPage } from './components/storefront/ShopPage';
import { CategoryPage } from './components/storefront/CategoryPage';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { WhatsAppWidget } from './components/common/WhatsAppWidget';
import { Loader2 } from 'lucide-react';

// Code-split heavy administrative and policy bundles for optimal Core Web Vitals
const AdminLayout = React.lazy(() =>
  import('./components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);

const PolicyPage = React.lazy(() =>
  import('./components/storefront/PolicyPage').then((m) => ({ default: m.PolicyPage }))
);

const AdminFallback = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
    <span className="text-sm font-semibold tracking-wide text-slate-300">
      Loading Velneer Admin Portal...
    </span>
  </div>
);

const StorefrontFallback = () => (
  <div className="py-24 flex flex-col items-center justify-center text-[#173F30]">
    <Loader2 className="w-7 h-7 text-[#173F30] animate-spin mb-2" />
    <span className="text-xs font-semibold text-[#6B7068]">
      Loading page details...
    </span>
  </div>
);

const MainApp: React.FC = () => {
  const { currentView, currentPage } = useApp();

  return (
    <>
      {currentView === 'admin' ? (
        <Suspense fallback={<AdminFallback />}>
          <AdminLayout />
        </Suspense>
      ) : (
        <div className="min-h-screen bg-[#F8F5EF] text-[#2E342D] flex flex-col font-sans">
          {/* Top Ribbon Announcement Strip */}
          <TopRibbon />

          {/* Main Header */}
          <Header />

          {/* Main Navigation Bar */}
          <Navbar />

          {/* Main Storefront Body */}
          <main className="flex-1">
            {currentPage === 'policy' && (
              <Suspense fallback={<StorefrontFallback />}>
                <PolicyPage />
              </Suspense>
            )}
            {currentPage === 'category' && <CategoryPage />}
            {currentPage === 'shop' && <ShopPage />}
            {currentPage === 'home' && <HomePage />}
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Global Interactive Modals & Drawers */}
          <ProductDetailModal />
          <CartDrawer />
          <WishlistDrawer />
          <CheckoutModal />
          <UserProfileModal />
        </div>
      )}

      {/* Global Auth Modal, WhatsApp Concierge & Notification Toasts */}
      <AuthModal />
      <WhatsAppWidget />
      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
