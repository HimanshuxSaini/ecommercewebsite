import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setSelectedCategory, setIsProfileOpen, setIsAuthOpen, currentUser } = useApp();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrack = () => {
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <footer className="bg-[#FAF9F6] border-t border-[#E8E2DC] mt-12 text-[#3A3A3A] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1 space-y-3">
            <div className="cursor-pointer" onClick={scrollToTop}>
              <div className="flex items-center text-2xl font-extrabold tracking-tight">
                <span className="text-[#1F1F1F]">Shop</span>
                <span className="text-[#8C6F52]">Verse</span>
              </div>
              <span className="text-[10px] text-[#A8927D] font-medium tracking-wide -mt-1 block">
                Everything You Need, Everyday
              </span>
            </div>

            <p className="text-[#3A3A3A] text-xs leading-relaxed">
              A one-stop destination for all your shopping needs. Quality products, great prices and exceptional service.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                onClick={(e) => e.preventDefault()}
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#F5F1EC] hover:bg-[#8C6F52] hover:text-white flex items-center justify-center text-[#1F1F1F] transition-colors cursor-pointer border border-[#E8E2DC]"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#F5F1EC] hover:bg-[#8C6F52] hover:text-white flex items-center justify-center text-[#1F1F1F] transition-colors cursor-pointer border border-[#E8E2DC]"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                onClick={(e) => e.preventDefault()}
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#F5F1EC] hover:bg-[#E63946] hover:text-white flex items-center justify-center text-[#1F1F1F] transition-colors cursor-pointer border border-[#E8E2DC]"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-[#F5F1EC] hover:bg-[#8C6F52] hover:text-white flex items-center justify-center text-[#1F1F1F] transition-colors cursor-pointer border border-[#E8E2DC]"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    scrollToTop();
                  }}
                  className="hover:text-[#8C6F52] transition-colors cursor-pointer"
                >
                  All Categories
                </button>
              </li>
              <li>
                <a
                  href="#flash-deals"
                  className="hover:text-[#8C6F52] transition-colors cursor-pointer"
                >
                  Today's Deals
                </a>
              </li>
              <li>
                <a
                  href="#new-arrivals"
                  className="hover:text-[#8C6F52] transition-colors cursor-pointer"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="#best-sellers"
                  className="hover:text-[#8C6F52] transition-colors cursor-pointer"
                >
                  Best Sellers
                </a>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Gift Cards
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleTrack}
                  className="hover:text-[#8C6F52] transition-colors cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Return & Refund
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  FAQs
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Help & Support
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
              About Us
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Our Story
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Careers
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Blog
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="hover:text-[#8C6F52] transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Us */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#8C6F52] shrink-0" />
                <span className="font-semibold text-[#1F1F1F]">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#8C6F52] shrink-0" />
                <span className="text-[#3A3A3A] truncate">support@shopverse.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#8C6F52] shrink-0 mt-0.5" />
                <span className="text-[#3A3A3A]">Sonipat, Haryana, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="border-t border-[#E8E2DC] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#A8927D] text-center sm:text-left font-medium">
            &copy; 2026 ShopVerse. All rights reserved.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <div className="px-2.5 py-1 rounded bg-[#F5F1EC] border border-[#C6B8AB] h-7 flex items-center justify-center">
              <img src="https://img.icons8.com/color/1200/visa.png" alt="VISA" className="h-3.5 object-contain" />
            </div>
            <div className="px-2.5 py-1 rounded bg-[#F5F1EC] border border-[#C6B8AB] h-7 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 object-contain" />
            </div>
            <div className="px-2.5 py-1 rounded bg-[#F5F1EC] border border-[#C6B8AB] h-7 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" className="h-3.5 object-contain" />
            </div>
            <div className="px-2.5 py-1 rounded bg-[#F5F1EC] border border-[#C6B8AB] h-7 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-3.5 object-contain" />
            </div>
            <div className="px-2.5 py-1 rounded bg-[#F5F1EC] border border-[#C6B8AB] h-7 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-3.5 object-contain" />
            </div>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-8 h-8 rounded-lg bg-[#1F1F1F] hover:bg-[#8C6F52] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
