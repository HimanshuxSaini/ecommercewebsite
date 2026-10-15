import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_BANNERS,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_NAV_ITEMS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
} from '../data/mockData';
import {
  Address,
  Banner,
  Brand,
  CartItem,
  Category,
  Coupon,
  FlashDealConfig,
  NavItem,
  Order,
  Product,
  PolicySlug,
  StorePage,
  Toast,
  User,
  UserRole,
} from '../types';
import {
  detectSqlInjection,
  detectXssInjection,
  isValidEmail,
  normalizeEmail,
  sanitizeInput,
  loginRateLimiter,
} from '../utils/security';
import { apiClient } from '../utils/apiClient';

interface AppContextType {
  // User & RBAC
  currentUser: User | null;
  users: User[];
  login: (email: string, role?: UserRole, password?: string, botTrap?: string) => Promise<{ success: boolean; message?: string; retryAfter?: number }>;
  signup: (name: string, email: string, role?: UserRole, password?: string, phone?: string, botTrap?: string) => Promise<{ success: boolean; message?: string; retryAfter?: number }>;
  sendOtp: (email: string, type?: 'login' | 'signup', botTrap?: string) => Promise<{ success: boolean; message: string; retryAfter?: number }>;
  verifyOtp: (payload: { email: string; otp: string; type: 'login' | 'signup'; name?: string; phone?: string; password?: string; hp_website?: string }) => Promise<{ success: boolean; message?: string; retryAfter?: number }>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  hasPermission: (requiredRole: UserRole) => boolean;

  // Catalog & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (id: string, additionalStock: number) => void;

  // Flash Deals Control
  flashDealConfig: FlashDealConfig;
  updateFlashDealTime: (hours: number, minutes: number, seconds: number, dealTitle?: string, isActive?: boolean) => void;
  toggleFlashDealActive: () => void;
  addCustomFlashDeal: (productId: string, discountPercentage?: number, newPrice?: number) => void;
  removeCustomFlashDeal: (productId: string) => void;
  createAndAddFlashDeal: (productData: Omit<Product, 'id' | 'createdAt'>) => void;

  // Categories & Subcategories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'subcategories'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, name: string) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;

  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  validateCoupon: (code: string, cartTotal: number) => { valid: boolean; discount: number; message: string };

  // Cart & Wishlist
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;

  // Addresses & Orders
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'> & { id?: string }) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  orders: Order[];
  placeOrder: (shippingAddress: Address, paymentMethod: Order['paymentMethod']) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // UI & Nav State
  currentView: 'store' | 'admin';
  setCurrentView: (view: 'store' | 'admin') => void;
  currentPage: StorePage;
  setCurrentPage: (page: StorePage) => void;
  currentPolicyTab: PolicySlug;
  setCurrentPolicyTab: (tab: PolicySlug) => void;
  navigateToHome: () => void;
  navigateToShop: () => void;
  navigateToCategory: (categoryId: string) => void;
  navigateToPolicy: (tab?: PolicySlug) => void;
  navigateToLaunchingSoon: () => void;
  adminTab: 'dashboard' | 'products' | 'inventory' | 'categories' | 'coupons' | 'banners' | 'orders' | 'flash-deals' | 'navigation' | 'brands';
  setAdminTab: (tab: 'dashboard' | 'products' | 'inventory' | 'categories' | 'coupons' | 'banners' | 'orders' | 'flash-deals' | 'navigation' | 'brands') => void;
  brands: Brand[];
  isBrandsSectionVisible: boolean;
  setIsBrandsSectionVisible: (visible: boolean) => void;
  toggleBrandsSectionVisible: () => void;
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  reorderBrands: (brands: Brand[]) => void;
  navItems: NavItem[];
  addNavItem: (item: Omit<NavItem, 'id'>) => void;
  updateNavItem: (id: string, updates: Partial<NavItem>) => void;
  deleteNavItem: (id: string) => void;
  reorderNavItems: (items: NavItem[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (categoryId: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sv_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sv_currentUser');
    if (saved && saved !== 'null' && saved !== 'undefined') {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const emailLower = parsed.email.toLowerCase();
          if (emailLower === 'himanshu0481@gmail.com' || emailLower === 'sales.velneer@gmail.com') {
            parsed.role = 'admin';
            return parsed;
          }
        }
        // Clear out legacy auto-injected demo accounts so the user starts as a guest and sees Login
        if (parsed && parsed.email && !parsed.name?.includes('(Super Admin)') && parsed.id !== 'usr-admin-1') {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    // Default to null (unauthenticated guest) so login screen and Login CTA are displayed
    return null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sv_products');
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        const missing = INITIAL_PRODUCTS.filter((ip) => !parsed.some((p) => p.id === ip.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('sv_products', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sv_categories');
    if (saved) {
      try {
        const parsed: Category[] = JSON.parse(saved);
        const missing = INITIAL_CATEGORIES.filter((ic) => !parsed.some((c) => c.id === ic.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('sv_categories', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('sv_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sv_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sv_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sv_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sv_wishlist');
    return saved ? JSON.parse(saved) : ['prod-boat-141', 'prod-samsung-m14'];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('sv_addresses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'addr-default',
        fullName: 'Himanshu Sharma',
        phone: '+91 93066 80944',
        street: 'Flat 102, Shivalik Tower, Model Town',
        city: 'Sonipat',
        state: 'Haryana',
        pincode: '131001',
        isDefault: true,
        type: 'home',
      },
    ];
  });

  // UI state
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [currentPage, setCurrentPage] = useState<StorePage>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const req = urlParams.get('page');
      if (req === 'home' || req === 'shop' || req === 'category' || req === 'policy') {
        return req as StorePage;
      }
      const entered = sessionStorage.getItem('sv_session_entered_store');
      if (entered === 'true') {
        const saved = localStorage.getItem('sv_currentPage');
        if (saved === 'home' || saved === 'shop' || saved === 'category' || saved === 'policy') {
          return saved as StorePage;
        }
        return 'home';
      }
    } catch {}
    return 'launching-soon';
  });
  const [currentPolicyTab, setCurrentPolicyTab] = useState<PolicySlug>('privacy');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'products' | 'inventory' | 'categories' | 'coupons' | 'banners' | 'orders' | 'flash-deals' | 'navigation' | 'brands'>('dashboard');
  const [brands, setBrands] = useState<Brand[]>(() => {
    const saved = localStorage.getItem('sv_brands');
    return saved ? JSON.parse(saved) : INITIAL_BRANDS;
  });
  const [isBrandsSectionVisible, setIsBrandsSectionVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('sv_isBrandsSectionVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [navItems, setNavItems] = useState<NavItem[]>(() => {
    const saved = localStorage.getItem('sv_navItems');
    if (saved) {
      try {
        const parsed: NavItem[] = JSON.parse(saved);
        if (!parsed.some((i) => i.linkType === 'shop' || i.targetValue === 'shop')) {
          const homeIndex = parsed.findIndex((i) => i.linkType === 'home');
          const shopItem: NavItem = {
            id: 'nav-shop',
            label: 'Shop',
            linkType: 'shop',
            targetValue: 'shop',
            order: homeIndex >= 0 ? parsed[homeIndex].order + 1 : 2,
            isActive: true,
          };
          const updated = [...parsed];
          updated.splice(homeIndex >= 0 ? homeIndex + 1 : 1, 0, shopItem);
          const withShop = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
          const missing = INITIAL_NAV_ITEMS.filter((ini) => !withShop.some((i) => i.id === ini.id));
          const finalNav = missing.length > 0 ? [...withShop, ...missing].map((item, idx) => ({ ...item, order: idx + 1 })) : withShop;
          localStorage.setItem('sv_navItems', JSON.stringify(finalNav));
          return finalNav;
        }
        const missing = INITIAL_NAV_ITEMS.filter((ini) => !parsed.some((i) => i.id === ini.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing].map((item, idx) => ({ ...item, order: idx + 1 }));
          localStorage.setItem('sv_navItems', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return INITIAL_NAV_ITEMS;
      }
    }
    return INITIAL_NAV_ITEMS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Flash Deals Config state
  const [flashDealConfig, setFlashDealConfig] = useState<FlashDealConfig>(() => {
    const saved = localStorage.getItem('sv_flashDealConfig');
    return saved
      ? JSON.parse(saved)
      : {
          hours: 12,
          minutes: 34,
          seconds: 56,
          isActive: true,
          dealTitle: 'Flash Deals',
        };
  });

  // Synchronize live collections from Authoritative Backend
  useEffect(() => {
    apiClient.getMe().then((res) => {
      if (res?.success && res.user) {
        setCurrentUser(res.user);
      }
    }).catch(() => {});

    apiClient.getProducts().then((res) => {
      if (res?.success && Array.isArray(res.products) && res.products.length > 0) {
        setProducts(res.products);
      }
    }).catch(() => {});

    apiClient.getCategories().then((res) => {
      if (res?.success && Array.isArray(res.categories) && res.categories.length > 0) {
        setCategories(res.categories);
      }
    }).catch(() => {});

    apiClient.getBanners().then((res) => {
      if (res?.success && Array.isArray(res.banners) && res.banners.length > 0) {
        setBanners(res.banners);
      }
    }).catch(() => {});

    apiClient.getBrands().then((res) => {
      if (res?.success && Array.isArray(res.brands) && res.brands.length > 0) {
        setBrands(res.brands);
      }
    }).catch(() => {});

    apiClient.getCoupons().then((res) => {
      if (res?.success && Array.isArray(res.coupons) && res.coupons.length > 0) {
        setCoupons(res.coupons);
      }
    }).catch(() => {});
  }, []);

  // Synchronize to localStorage
  useEffect(() => {
    localStorage.setItem('sv_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sv_flashDealConfig', JSON.stringify(flashDealConfig));
  }, [flashDealConfig]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sv_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sv_currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sv_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sv_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sv_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('sv_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sv_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sv_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sv_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sv_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('sv_navItems', JSON.stringify(navItems));
  }, [navItems]);

  useEffect(() => {
    localStorage.setItem('sv_brands', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem('sv_isBrandsSectionVisible', JSON.stringify(isBrandsSectionVisible));
  }, [isBrandsSectionVisible]);

  useEffect(() => {
    localStorage.setItem('sv_currentPage', currentPage);
  }, [currentPage]);

  // Page Navigation Helpers
  const navigateToHome = () => {
    try {
      sessionStorage.setItem('sv_session_entered_store', 'true');
    } catch {}
    setCurrentView('store');
    setSelectedCategory(null);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToShop = () => {
    try {
      sessionStorage.setItem('sv_session_entered_store', 'true');
    } catch {}
    setCurrentView('store');
    setSelectedCategory(null);
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (categoryId: string) => {
    setCurrentView('store');
    setSelectedCategory(categoryId);
    setCurrentPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPolicy = (tab: PolicySlug = 'privacy') => {
    setCurrentView('store');
    setSelectedCategory(null);
    setCurrentPolicyTab(tab);
    setCurrentPage('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLaunchingSoon = () => {
    try {
      sessionStorage.removeItem('sv_session_entered_store');
    } catch {}
    setCurrentView('store');
    setSelectedCategory(null);
    setCurrentPage('launching-soon');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetSelectedCategory = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setCurrentPage('category');
    }
  };

  // Toast Helper
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // RBAC Permission Check
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (requiredRole === 'manager') return currentUser.role === 'manager';
    if (requiredRole === 'customer') return true;
    return false;
  };

  // Auth Operations
  const login = async (rawEmail: string, role?: UserRole, password?: string, botTrap?: string): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
    // 1. SQL Injection & XSS Guard
    if (detectSqlInjection(rawEmail) || detectXssInjection(rawEmail)) {
      showToast('Security Alert: Malicious characters or SQL patterns detected.', 'error');
      return { success: false, message: 'Disallowed characters detected.' };
    }

    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
      showToast('Please provide a valid email format.', 'error');
      return { success: false, message: 'Please provide a valid email format.' };
    }

    // 2. Client-side Brute Force Lockout Guard
    const rateCheck = loginRateLimiter.isLockedOut(email);
    if (rateCheck.isLocked) {
      const lockMsg = `Security Lockout Active: Too many failed login attempts. Please wait ${rateCheck.remainingSeconds}s.`;
      showToast(lockMsg, 'error');
      return { success: false, message: lockMsg, retryAfter: rateCheck.remainingSeconds };
    }

    try {
      const apiRes = await apiClient.login(email, password, role, botTrap);
      if (apiRes?.success && apiRes.user) {
        loginRateLimiter.resetAttempts(email);
        setCurrentUser(apiRes.user);
        showToast(`Welcome back, ${apiRes.user.name}!`);
        return { success: true };
      }

      if (apiRes && apiRes.success === false) {
        // Authoritative server rejection
        const lock = loginRateLimiter.recordFailedAttempt(email);
        const retrySecs = apiRes.retryAfter || (lock.isLocked ? lock.remainingSeconds : undefined);
        const errorMsg = apiRes.message || 'Invalid email or password.';
        showToast(errorMsg, 'error');
        return {
          success: false,
          message: errorMsg,
          retryAfter: retrySecs,
        };
      }
    } catch {
      // Network unreachable fallback
    }

    loginRateLimiter.recordFailedAttempt(email);
    const failMsg = 'Invalid email or password.';
    showToast(failMsg, 'error');
    return { success: false, message: failMsg };
  };

  const signup = async (rawName: string, rawEmail: string, role: UserRole = 'customer', password?: string, phone?: string, botTrap?: string): Promise<{ success: boolean; message?: string; retryAfter?: number }> => {
    // 1. SQLi & XSS Guards
    if (
      detectSqlInjection(rawName) ||
      detectSqlInjection(rawEmail) ||
      detectXssInjection(rawName) ||
      detectXssInjection(rawEmail)
    ) {
      showToast('Security Warning: Disallowed SQL/Script pattern detected in input.', 'error');
      return { success: false, message: 'Disallowed characters detected in input.' };
    }

    const name = sanitizeInput(rawName);
    const email = normalizeEmail(rawEmail);

    if (!name || name.length < 2) {
      showToast('Name must be at least 2 characters.', 'error');
      return { success: false, message: 'Name must be at least 2 characters.' };
    }

    if (!isValidEmail(email)) {
      showToast('Invalid email address format.', 'error');
      return { success: false, message: 'Invalid email address format.' };
    }

    try {
      const apiRes = await apiClient.signup(name, email, password, phone, botTrap);
      if (apiRes?.success && apiRes.user) {
        loginRateLimiter.resetAttempts(email);
        setCurrentUser(apiRes.user);
        setUsers((prev) => [...prev, apiRes.user]);
        showToast(`Account created successfully! Welcome, ${apiRes.user.name}.`);
        return { success: true };
      }

      if (apiRes && apiRes.success === false) {
        showToast(apiRes.message || 'Registration failed.', 'error');
        return {
          success: false,
          message: apiRes.message || 'Registration failed.',
          retryAfter: apiRes.retryAfter,
        };
      }
    } catch {
      // Network failure
    }

    const failMsg = 'Unable to complete registration. Please check your connection and try again.';
    showToast(failMsg, 'error');
    return { success: false, message: failMsg };
  };

  const sendOtp = async (rawEmail: string, type: 'login' | 'signup' = 'login', botTrap?: string) => {
    const email = normalizeEmail(rawEmail);
    if (!isValidEmail(email)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    const res = await apiClient.sendOtp(email, type, botTrap);
    if (res?.success) {
      showToast(res.message || `Verification code sent to ${email}`, 'info');
      return { success: true, message: res.message };
    }
    return {
      success: false,
      message: res?.message || 'Failed to dispatch verification code.',
      retryAfter: res?.retryAfter,
    };
  };

  const verifyOtp = async (payload: { email: string; otp: string; type: 'login' | 'signup'; name?: string; phone?: string; password?: string; hp_website?: string }) => {
    const email = normalizeEmail(payload.email);
    const res = await apiClient.verifyOtp({ ...payload, email });
    if (res?.success && res.user) {
      loginRateLimiter.resetAttempts(email);
      const isSpecialAdmin = email.toLowerCase() === 'himanshu0481@gmail.com' || email.toLowerCase() === 'sales.velneer@gmail.com';
      if (isSpecialAdmin) {
        res.user.role = 'admin';
      }
      setCurrentUser(res.user);
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = res.user;
          return updated;
        }
        return [...prev, res.user];
      });
      showToast(`Welcome to Velneer, ${res.user.name}!`);
      return { success: true };
    }
    return {
      success: false,
      message: res?.message || 'Invalid or expired verification code.',
      retryAfter: res?.retryAfter,
    };
  };

  const logout = () => {
    apiClient.logout().catch(() => {});
    setCurrentUser(null);
    setCurrentView('store');
    showToast('Logged out securely.', 'info');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast(`User role updated to ${newRole}`);
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    // Security sanitize profile update fields
    const sanitizedUpdates: Partial<User> = {};
    if (updates.name) {
      if (detectSqlInjection(updates.name) || detectXssInjection(updates.name)) {
        showToast('Invalid characters in profile name.', 'error');
        return;
      }
      sanitizedUpdates.name = sanitizeInput(updates.name);
    }
    if (updates.phone) {
      if (detectSqlInjection(updates.phone)) {
        showToast('Invalid phone characters detected.', 'error');
        return;
      }
      sanitizedUpdates.phone = sanitizeInput(updates.phone);
    }

    const updated = { ...currentUser, ...sanitizedUpdates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    showToast('Profile updated successfully');
  };

  // Product Catalog CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    apiClient.addProduct(newProduct as unknown as Record<string, unknown>).catch(() => {});
    showToast(`Product "${newProduct.title}" added to catalog`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    apiClient.updateProduct(id, updates as Record<string, unknown>).catch(() => {});
    showToast('Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    apiClient.deleteProduct(id).catch(() => {});
    showToast('Product removed from catalog', 'info');
  };

  const restockProduct = (id: string, additionalStock: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + additionalStock) } : p
      )
    );
    showToast(`Stock updated (+${additionalStock})`);
  };

  // Flash Deals Control Methods
  const updateFlashDealTime = (
    hours: number,
    minutes: number,
    seconds: number,
    dealTitle?: string,
    isActive?: boolean
  ) => {
    setFlashDealConfig((prev) => ({
      ...prev,
      hours: Math.max(0, hours),
      minutes: Math.max(0, Math.min(59, minutes)),
      seconds: Math.max(0, Math.min(59, seconds)),
      dealTitle: dealTitle !== undefined ? dealTitle : prev.dealTitle,
      isActive: isActive !== undefined ? isActive : prev.isActive,
    }));
    showToast('Flash deals timer & settings updated!');
  };

  const toggleFlashDealActive = () => {
    setFlashDealConfig((prev) => {
      const next = !prev.isActive;
      showToast(next ? 'Flash Deals enabled on storefront' : 'Flash Deals paused on storefront');
      return { ...prev, isActive: next };
    });
  };

  const addCustomFlashDeal = (productId: string, discountPercentage?: number, newPrice?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const disc = discountPercentage !== undefined ? discountPercentage : (p.discountPercentage > 0 ? p.discountPercentage : 40);
          const price = newPrice !== undefined ? newPrice : Math.round(p.originalPrice * (1 - disc / 100));
          return {
            ...p,
            isFlashDeal: true,
            discountPercentage: disc,
            price: price,
          };
        }
        return p;
      })
    );
    showToast('Product added to Flash Deals!');
  };

  const removeCustomFlashDeal = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isFlashDeal: false } : p))
    );
    showToast('Product removed from Flash Deals', 'info');
  };

  const createAndAddFlashDeal = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      isFlashDeal: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Custom Flash Deal "${newProduct.title}" created & launched!`);
  };

  // Categories CRUD
  const addCategory = (categoryData: Omit<Category, 'id' | 'subcategories'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      subcategories: [],
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Category "${newCat.name}" created`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Category deleted', 'info');
  };

  const addSubcategory = (categoryId: string, name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newSub = {
      id: `sub-${Date.now()}`,
      name,
      slug,
      categoryId,
    };
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: [...c.subcategories, newSub] }
          : c
      )
    );
    showToast(`Subcategory "${name}" added`);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.filter((s) => s.id !== subcategoryId),
            }
          : c
      )
    );
    showToast('Subcategory removed');
  };

  // Banner Management
  const addBanner = (bannerData: Omit<Banner, 'id'>) => {
    const newBanner: Banner = {
      ...bannerData,
      id: `ban-${Date.now()}`,
    };
    setBanners((prev) => [...prev, newBanner]);
    showToast('Promotional banner added');
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Banner updated');
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast('Banner removed', 'info');
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  // Navigation Items Management (Header Nav Bar)
  const addNavItem = (itemData: Omit<NavItem, 'id'>) => {
    const cleanLabel = sanitizeInput(itemData.label);
    if (!cleanLabel) {
      showToast('Navigation label is required', 'error');
      return;
    }
    const newItem: NavItem = {
      ...itemData,
      id: `nav-${Date.now()}`,
      label: cleanLabel,
      order: itemData.order || navItems.length + 1,
      isActive: itemData.isActive !== false,
    };
    setNavItems((prev) => [...prev, newItem]);
    showToast(`Added "${newItem.label}" to navigation bar`);
  };

  const updateNavItem = (id: string, updates: Partial<NavItem>) => {
    const sanitizedUpdates = { ...updates };
    if (updates.label) {
      sanitizedUpdates.label = sanitizeInput(updates.label);
    }
    setNavItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...sanitizedUpdates } : item))
    );
    showToast('Navigation link updated');
  };

  const deleteNavItem = (id: string) => {
    setNavItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Navigation link removed', 'info');
  };

  const reorderNavItems = (items: NavItem[]) => {
    setNavItems(items);
    showToast('Navigation order updated');
  };

  // Top Brands Management
  const addBrand = (brandData: Omit<Brand, 'id'>) => {
    const cleanName = sanitizeInput(brandData.name);
    const cleanLogoText = sanitizeInput(brandData.logoText || brandData.name);
    if (!cleanName) {
      showToast('Brand name is required', 'error');
      return;
    }
    const newBrand: Brand = {
      ...brandData,
      id: `brand-${Date.now()}`,
      name: cleanName,
      logoText: cleanLogoText,
      order: brandData.order || brands.length + 1,
      isActive: brandData.isActive !== false,
    };
    setBrands((prev) => [...prev, newBrand]);
    showToast(`Brand "${newBrand.name}" added to storefront`);
  };

  const updateBrand = (id: string, updates: Partial<Brand>) => {
    const sanitized = { ...updates };
    if (updates.name) sanitized.name = sanitizeInput(updates.name);
    if (updates.logoText) sanitized.logoText = sanitizeInput(updates.logoText);
    setBrands((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...sanitized } : b))
    );
    showToast('Brand details updated');
  };

  const deleteBrand = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    showToast('Brand removed', 'info');
  };

  const reorderBrands = (updatedBrands: Brand[]) => {
    setBrands(updatedBrands);
    showToast('Brand display order updated');
  };

  const toggleBrandsSectionVisible = () => {
    setIsBrandsSectionVisible((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Top Brands section is now visible on storefront'
          : 'Top Brands section is now hidden from storefront',
        next ? 'success' : 'info'
      );
      return next;
    });
  };

  // Coupon Engine
  const addCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedCount: 0,
      code: couponData.code.toUpperCase().trim(),
    };
    setCoupons((prev) => [...prev, newCoupon]);
    showToast(`Coupon "${newCoupon.code}" created`);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Coupon details updated');
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted', 'info');
  };

  const validateCoupon = (
    code: string,
    cartTotalAmount: number
  ): { valid: boolean; discount: number; message: string; coupon?: Coupon } => {
    if (detectSqlInjection(code) || detectXssInjection(code)) {
      return { valid: false, discount: 0, message: 'Security Block: Malicious patterns detected in promo code.' };
    }
    const formatted = sanitizeInput(code).toUpperCase().trim();
    const found = coupons.find((c) => c.code === formatted);

    if (!found) {
      return { valid: false, discount: 0, message: 'Invalid coupon code.' };
    }
    if (!found.isActive) {
      return { valid: false, discount: 0, message: 'This coupon has expired or is inactive.' };
    }
    if (new Date(found.expiryDate) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired.' };
    }
    if (cartTotalAmount < found.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ₹${found.minOrderAmount} required for this coupon.`,
      };
    }
    if (found.usedCount >= found.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached.' };
    }

    let discount = 0;
    if (found.discountType === 'percentage') {
      discount = Math.round((cartTotalAmount * found.discountValue) / 100);
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = found.discountValue;
    }

    return {
      valid: true,
      discount,
      message: `Coupon "${found.code}" applied! You save ₹${discount}.`,
      coupon: found,
    };
  };

  const applyCoupon = (code: string) => {
    const validation = validateCoupon(code, cartSubtotal);
    if (!validation.valid) {
      showToast(validation.message, 'error');
      return { success: false, message: validation.message };
    }
    const c = coupons.find((cp) => cp.code === code.toUpperCase().trim());
    if (c) {
      setAppliedCoupon(c);
      showToast(validation.message, 'success');
      return { success: true, message: validation.message };
    }
    return { success: false, message: 'Coupon not found' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && cartDiscount > appliedCoupon.maxDiscount) {
        cartDiscount = appliedCoupon.maxDiscount;
      }
    } else {
      cartDiscount = appliedCoupon.discountValue;
    }
  }

  // Free shipping on orders above ₹499
  const shippingFee = cartSubtotal > 0 && cartSubtotal < 499 ? 40 : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + shippingFee);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Sorry, this product is currently out of stock!', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          showToast(`Only ${product.stock} items left in stock`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: nextQty }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.title}" to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((i) => i.product.id === productId);
    if (item && quantity > item.product.stock) {
      showToast(`Cannot exceed available stock of ${item.product.stock}`, 'warning');
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to Wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Addresses
  const addAddress = (addrData: Omit<Address, 'id'> & { id?: string }) => {
    // Sanitize address inputs to eliminate potential injections
    const sanitizedAddr: Address = {
      id: addrData.id || `addr-${Date.now()}`,
      fullName: sanitizeInput(addrData.fullName),
      phone: sanitizeInput(addrData.phone),
      street: sanitizeInput(addrData.street),
      city: sanitizeInput(addrData.city),
      state: sanitizeInput(addrData.state),
      pincode: sanitizeInput(addrData.pincode),
      isDefault: Boolean(addrData.isDefault),
      type: addrData.type || 'home',
    };

    if (sanitizedAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: false })).concat(sanitizedAddr)
      );
    } else {
      setAddresses((prev) => [...prev, sanitizedAddr]);
    }
    showToast('New address saved securely');
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        if (updates.isDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      })
    );
    showToast('Address updated');
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast('Address deleted');
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  // Place Order (with anti-tampering server/canonical price verification)
  const placeOrder = (
    shippingAddress: Address,
    paymentMethod: Order['paymentMethod']
  ): Order => {
    if (cart.length === 0) {
      throw new Error('Your shopping bag is empty.');
    }

    // Verify each item's price against the canonical catalog to prevent client-side cart tampering
    let canonicalSubtotal = 0;
    const verifiedItems = cart.map((item) => {
      const canonicalProd = products.find((p) => p.id === item.product.id) || item.product;
      const canonicalPrice = Number(canonicalProd.price) || 0;
      canonicalSubtotal += canonicalPrice * item.quantity;
      return {
        productId: canonicalProd.id,
        productTitle: canonicalProd.title,
        price: canonicalPrice,
        quantity: Math.max(1, Math.floor(item.quantity)),
        imageUrl: canonicalProd.imageUrl,
      };
    });

    // Recompute discount securely
    let verifiedDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        const rawDiscount = (canonicalSubtotal * appliedCoupon.discountValue) / 100;
        verifiedDiscount = appliedCoupon.maxDiscount
          ? Math.min(rawDiscount, appliedCoupon.maxDiscount)
          : rawDiscount;
      } else {
        verifiedDiscount = appliedCoupon.discountValue;
      }
      verifiedDiscount = Math.round(verifiedDiscount);
    }

    const verifiedShippingFee = canonicalSubtotal > 0 && canonicalSubtotal < 499 ? 40 : 0;
    const verifiedTotal = Math.max(0, canonicalSubtotal - verifiedDiscount + verifiedShippingFee);

    const newOrder: Order = {
      id: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser?.id || 'guest',
      customerName: currentUser?.name || shippingAddress.fullName,
      customerEmail: currentUser?.email || 'customer@velneer.com',
      customerPhone: currentUser?.phone || shippingAddress.phone,
      shippingAddress,
      items: verifiedItems,
      subtotal: canonicalSubtotal,
      discount: verifiedDiscount,
      couponCode: appliedCoupon?.code,
      shippingFee: verifiedShippingFee,
      total: verifiedTotal,
      paymentMethod,
      status: 'Processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      trackingNumber: `VEL-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    // Deduct stock in real-time
    setProducts((prev) =>
      prev.map((p) => {
        const ordered = cart.find((c) => c.product.id === p.id);
        if (ordered) {
          return { ...p, stock: Math.max(0, p.stock - ordered.quantity) };
        }
        return p;
      })
    );

    // Update coupon usage count if used
    if (appliedCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === appliedCoupon.id ? { ...c, usedCount: c.usedCount + 1 } : c
        )
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    // Synchronize order to authoritative backend & trigger notifications
    apiClient.createOrder(newOrder as unknown as Record<string, unknown>).catch(() => {});
    clearCart();
    showToast('Order placed successfully! Thank you for shopping with Velneer.');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status, updatedAt: new Date().toISOString() }
          : o
      )
    );
    apiClient.updateOrderStatus(orderId, status).catch(() => {});
    showToast(`Order #${orderId} marked as ${status}`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        login,
        signup,
        logout,
        updateUserRole,
        updateUserProfile,
        hasPermission,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        flashDealConfig,
        updateFlashDealTime,
        toggleFlashDealActive,
        addCustomFlashDeal,
        removeCustomFlashDeal,
        createAndAddFlashDeal,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        validateCoupon,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        orders,
        placeOrder,
        updateOrderStatus,
        currentView,
        setCurrentView,
        currentPage,
        setCurrentPage,
        currentPolicyTab,
        setCurrentPolicyTab,
        navigateToHome,
        navigateToShop,
        navigateToCategory,
        navigateToPolicy,
        navigateToLaunchingSoon,
        adminTab,
        setAdminTab,
        brands,
        isBrandsSectionVisible,
        setIsBrandsSectionVisible,
        toggleBrandsSectionVisible,
        addBrand,
        updateBrand,
        deleteBrand,
        reorderBrands,
        navItems,
        addNavItem,
        updateNavItem,
        deleteNavItem,
        reorderNavItems,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory: handleSetSelectedCategory,
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthOpen,
        setIsAuthOpen,
        sendOtp,
        verifyOtp,
        isProfileOpen,
        setIsProfileOpen,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
