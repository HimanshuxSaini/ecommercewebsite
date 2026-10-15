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

const LaunchingSoonPage = React.lazy(() =>
  import('./components/storefront/LaunchingSoonPage').then((m) => ({ default: m.LaunchingSoonPage }))
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
  <div className="min-h-screen bg-[#071912] flex flex-col items-center justify-center text-white select-none">
    <div className="relative mb-5">
      <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-400/20 via-amber-300/20 to-emerald-400/20 blur-md animate-pulse" />
      <img src="/velneer_emblem_clean.png" alt="Velneer Logo" className="relative h-14 w-auto object-contain drop-shadow-xl" />
    </div>
    <div className="w-44 h-[2px] bg-emerald-950 rounded-full overflow-hidden border border-emerald-800/40 relative">
      <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-400 animate-pulse w-3/4 rounded-full" />
    </div>
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
      ) : currentPage === 'launching-soon' ? (
        <Suspense fallback={<StorefrontFallback />}>
          <LaunchingSoonPage />
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
      {currentPage !== 'launching-soon' && <WhatsAppWidget />}
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
