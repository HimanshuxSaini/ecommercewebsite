import React from 'react';
import { HeroCarousel } from './HeroCarousel';
import { CategoryCircles } from './CategoryCircles';
import { TriplePromoCards } from './TriplePromoCards';
import { FlashDealsSection } from './FlashDealsSection';
import { BestSellersSection } from './BestSellersSection';
import { TrustBadges } from './TrustBadges';
import { BrandsSection } from './BrandsSection';
import { MiddlePromoBanners } from './MiddlePromoBanners';
import { NewArrivalsSection } from './NewArrivalsSection';
import { BlogSection } from './BlogSection';
import { NewsletterSection } from './NewsletterSection';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 1. Hero Carousel Banner */}
      <HeroCarousel />

      {/* 2. Visual Category Circles (Navigates to each category's dedicated page) */}
      <CategoryCircles />

      {/* 3. Promotional Triple Cards */}
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

      {/* 10. From Our Blog Section */}
      <BlogSection />

      {/* 11. Newsletter Subscription */}
      <NewsletterSection />
    </div>
  );
};
