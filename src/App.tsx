/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopRibbon } from './components/layout/TopRibbon';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/ToastContainer';
import { HomePage } from './components/storefront/HomePage';
import { ShopPage } from './components/storefront/ShopPage';
import { CategoryPage } from './components/storefront/CategoryPage';
import { PolicyPage } from './components/storefront/PolicyPage';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { WhatsAppWidget } from './components/common/WhatsAppWidget';

const MainApp: React.FC = () => {
  const { currentView, currentPage } = useApp();

  return (
    <>
      {currentView === 'admin' ? (
        <AdminLayout />
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
            {currentPage === 'policy' && <PolicyPage />}
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
