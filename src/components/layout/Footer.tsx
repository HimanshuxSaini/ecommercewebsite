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
  const {
    navigateToHome,
    navigateToShop,
    navigateToCategory,
    categories,
    setIsProfileOpen,
    setIsAuthOpen,
    currentUser,
  } = useApp();

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
    <footer className="bg-[#F8F5EF] border-t border-[#D7E0D6] mt-12 text-[#6B7068] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-1 space-y-3">
            <div className="cursor-pointer" onClick={navigateToHome}>
              <div className="flex items-center text-2xl font-extrabold tracking-tight">
                <span className="text-[#2E342D]">Vel</span>
                <span className="text-[#173F30]">neer</span>
              </div>
              <span className="text-[10px] text-[#D8C8B3] font-medium tracking-wide -mt-1 block">
                Everything You Need, Everyday
              </span>
            </div>

            <p className="text-[#6B7068] text-xs leading-relaxed">
              A one-stop destination for all your shopping needs. Quality products, great prices and exceptional service.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#facebook"
                onClick={(e) => e.preventDefault()}
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#E9EBDD] hover:bg-[#173F30] hover:text-white flex items-center justify-center text-[#2E342D] transition-colors cursor-pointer border border-[#D7E0D6]"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#instagram"
                onClick={(e) => e.preventDefault()}
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#E9EBDD] hover:bg-[#173F30] hover:text-white flex items-center justify-center text-[#2E342D] transition-colors cursor-pointer border border-[#D7E0D6]"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#youtube"
                onClick={(e) => e.preventDefault()}
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#E9EBDD] hover:bg-[#E63946] hover:text-white flex items-center justify-center text-[#2E342D] transition-colors cursor-pointer border border-[#D7E0D6]"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#twitter"
                onClick={(e) => e.preventDefault()}
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-[#E9EBDD] hover:bg-[#173F30] hover:text-white flex items-center justify-center text-[#2E342D] transition-colors cursor-pointer border border-[#D7E0D6]"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={navigateToShop}
                  className="hover:text-[#173F30] transition-colors cursor-pointer font-semibold"
                >
                  All Products (Shop)
                </button>
              </li>
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => navigateToCategory(cat.id)}
                    className="hover:text-[#173F30] transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="#flash-deals"
                  className="hover:text-[#173F30] transition-colors cursor-pointer"
                >
                  Today's Deals
                </a>
              </li>
              <li>
                <a
                  href="#new-arrivals"
                  className="hover:text-[#173F30] transition-colors cursor-pointer"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="#best-sellers"
                  className="hover:text-[#173F30] transition-colors cursor-pointer"
                >
                  Best Sellers
                </a>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Gift Cards
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleTrack}
                  className="hover:text-[#173F30] transition-colors cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Return & Refund
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  FAQs
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Help & Support
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: About Us */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider">
              About Us
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Our Story
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Careers
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Blog
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="hover:text-[#173F30] transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Us */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#2E342D] uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
                <span className="font-semibold text-[#2E342D]">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#173F30] shrink-0" />
                <span className="text-[#6B7068] truncate">support@velneer.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#173F30] shrink-0 mt-0.5" />
                <span className="text-[#6B7068]">Sonipat, Haryana, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Icons */}
        <div className="border-t border-[#D7E0D6] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#D8C8B3] text-center sm:text-left font-medium">
            &copy; 2026 Velneer. All rights reserved.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
            <div className="px-3 py-1.5 rounded bg-[#E9EBDD] border border-[#B9A48B] h-8 flex items-center justify-center">
              <img src="https://img.icons8.com/color/1200/visa.png" alt="VISA" className="h-6 object-contain scale-125" />
            </div>
            <div className="px-3 py-1.5 rounded bg-[#E9EBDD] border border-[#B9A48B] h-8 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />
            </div>
            <div className="px-3 py-1.5 rounded bg-[#E9EBDD] border border-[#B9A48B] h-8 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Rupay-Logo.png" alt="RuPay" className="h-6 object-contain scale-110" />
            </div>
            <div className="px-3 py-1.5 rounded bg-[#E9EBDD] border border-[#B9A48B] h-8 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 object-contain" />
            </div>
            <div className="px-3 py-1.5 rounded bg-[#E9EBDD] border border-[#B9A48B] h-8 flex items-center justify-center">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-4 object-contain scale-110" />
            </div>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-8 h-8 rounded-lg bg-[#2E342D] hover:bg-[#173F30] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
