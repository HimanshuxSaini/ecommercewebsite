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
import { HeroCarousel } from './components/storefront/HeroCarousel';
import { CategoryCircles } from './components/storefront/CategoryCircles';
import { TriplePromoCards } from './components/storefront/TriplePromoCards';
import { FlashDealsSection } from './components/storefront/FlashDealsSection';
import { BestSellersSection } from './components/storefront/BestSellersSection';
import { TrustBadges } from './components/storefront/TrustBadges';
import { BrandsSection } from './components/storefront/BrandsSection';
import { MiddlePromoBanners } from './components/storefront/MiddlePromoBanners';
import { NewArrivalsSection } from './components/storefront/NewArrivalsSection';
import { CatalogSection } from './components/storefront/CatalogSection';
import { BlogSection } from './components/storefront/BlogSection';
import { NewsletterSection } from './components/storefront/NewsletterSection';
import { ProductDetailModal } from './components/storefront/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AdminLayout } from './components/admin/AdminLayout';

const MainApp: React.FC = () => {
  const { currentView } = useApp();

  if (currentView === 'admin') {
    return (
      <>
        <AdminLayout />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F1F1F] flex flex-col font-sans">
      {/* Top Ribbon Announcement Strip */}
      <TopRibbon />

      {/* Main Header */}
      <Header />

      {/* Main Navigation Bar */}
      <Navbar />

      {/* Main Storefront Body */}
      <main className="flex-1">
        {/* 1. Hero Carousel Banner */}
        <HeroCarousel />

        {/* 2. Visual Category Circles (10 categories) */}
        <CategoryCircles />

        {/* 3. Promotional Triple Cards (Electronics, Fashion, Home) */}
        <TriplePromoCards />

        {/* 4. Flash Deals with Live Countdown */}
        <FlashDealsSection />

        {/* 5. Best Sellers Section */}
        <BestSellersSection />

        {/* 6. Trust Badges Strip */}
        <TrustBadges />

        {/* 7. Top Brands Row */}
        <BrandsSection />

        {/* 8. Split Promotional Banners */}
        <MiddlePromoBanners />

        {/* 9. New Arrivals Section */}
        <NewArrivalsSection />

        {/* 10. Interactive Full Catalog Browser with Categories & Search */}
        <CatalogSection />

        {/* 11. From Our Blog Section */}
        <BlogSection />

        {/* 12. Newsletter Subscription */}
        <NewsletterSection />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <UserProfileModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
