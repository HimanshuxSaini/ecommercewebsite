import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJsonFile(filename, defaultData = []) {
  const filePath = getFilePath(filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[DB] Error reading ${filename}:`, error);
    return defaultData;
  }
}

function writeJsonFile(filename, data) {
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`[DB] Error writing ${filename}:`, error);
    return false;
  }
}

// Initial default seed users with secure bcrypt hashes (password: Velneer@2026 for admin, Password@123 for others)
const INITIAL_USERS = [
  {
    id: 'usr-admin-0',
    name: 'Himanshu Saini',
    email: 'himanshu0481@gmail.com',
    role: 'admin',
    passwordHash: bcrypt.hashSync('Velneer@2026', 10),
    phone: '+91 93066 80944',
    createdAt: '2025-01-10',
    isActive: true,
  },
  {
    id: 'usr-admin-sales',
    name: 'Velneer Sales Admin',
    email: 'sales.velneer@gmail.com',
    role: 'admin',
    passwordHash: bcrypt.hashSync('Velneer@2026', 10),
    phone: '+91 74949 80621',
    createdAt: '2025-01-10',
    isActive: true,
  },
  {
    id: 'usr-admin-1',
    name: 'Himanshu Sharma (Super Admin)',
    email: 'admin@velneer.in',
    role: 'admin',
    passwordHash: bcrypt.hashSync('Velneer@2026', 10),
    phone: '+91 98765 43210',
    createdAt: '2025-01-10',
    isActive: true,
  },
  {
    id: 'usr-mgr-1',
    name: 'Ananya Verma (Inventory Manager)',
    email: 'manager@velneer.in',
    role: 'manager',
    passwordHash: bcrypt.hashSync('Manager@2026', 10),
    phone: '+91 98112 34567',
    createdAt: '2025-02-14',
    isActive: true,
  },
  {
    id: 'usr-cust-1',
    name: 'Rahul Mehta',
    email: 'rahul@example.com',
    role: 'customer',
    passwordHash: bcrypt.hashSync('Customer@2026', 10),
    phone: '+91 99887 76655',
    createdAt: '2026-01-05',
    isActive: true,
  },
];

export const db = {
  // Users
  getUsers() {
    const users = readJsonFile('users.json', INITIAL_USERS);
    let mutated = false;
    for (const u of users) {
      if (!u.passwordHash) {
        if (u.role === 'admin') {
          u.passwordHash = bcrypt.hashSync('Velneer@2026', 12);
        } else if (u.role === 'manager') {
          u.passwordHash = bcrypt.hashSync('Manager@2026', 12);
        } else {
          u.passwordHash = bcrypt.hashSync('Customer@2026', 12);
        }
        mutated = true;
      }
    }
    if (mutated) {
      writeJsonFile('users.json', users);
    }
    return users;
  },
  getUserByEmail(email) {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  },
  createUser(userData) {
    const users = this.getUsers();
    users.push(userData);
    writeJsonFile('users.json', users);
    return userData;
  },
  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      writeJsonFile('users.json', users);
      return users[index];
    }
    return null;
  },

  // Products
  getProducts() {
    return readJsonFile('products.json', []);
  },
  getProductById(id) {
    const products = this.getProducts();
    return products.find((p) => p.id === id);
  },
  setProducts(productsList) {
    return writeJsonFile('products.json', productsList);
  },
  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: productData.id || `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...productData,
    };
    products.unshift(newProduct);
    writeJsonFile('products.json', products);
    return newProduct;
  },
  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      writeJsonFile('products.json', products);
      return products[index];
    }
    return null;
  },
  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    writeJsonFile('products.json', filtered);
    return true;
  },
  updateProductStock(productId, decrementQty) {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return { success: false, message: 'Product not found' };
    if (product.stock < decrementQty) {
      return { success: false, message: `Insufficient stock for ${product.title}. Only ${product.stock} available.` };
    }
    product.stock -= decrementQty;
    writeJsonFile('products.json', products);
    return { success: true, remainingStock: product.stock };
  },

  // Categories
  getCategories() {
    return readJsonFile('categories.json', []);
  },
  setCategories(list) {
    return writeJsonFile('categories.json', list);
  },
  addCategory(categoryData) {
    const categories = this.getCategories();
    const newCat = {
      id: categoryData.id || `cat-${Date.now()}`,
      subcategories: [],
      ...categoryData,
    };
    categories.push(newCat);
    writeJsonFile('categories.json', categories);
    return newCat;
  },
  updateCategory(id, updates) {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      writeJsonFile('categories.json', categories);
      return categories[index];
    }
    return null;
  },
  deleteCategory(id) {
    const categories = this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    writeJsonFile('categories.json', filtered);
    return true;
  },

  // Banners
  getBanners() {
    return readJsonFile('banners.json', []);
  },
  setBanners(list) {
    return writeJsonFile('banners.json', list);
  },
  addBanner(bannerData) {
    const banners = this.getBanners();
    const newBanner = {
      id: bannerData.id || `ban-${Date.now()}`,
      isActive: true,
      ...bannerData,
    };
    banners.push(newBanner);
    writeJsonFile('banners.json', banners);
    return newBanner;
  },
  updateBanner(id, updates) {
    const banners = this.getBanners();
    const index = banners.findIndex((b) => b.id === id);
    if (index !== -1) {
      banners[index] = { ...banners[index], ...updates };
      writeJsonFile('banners.json', banners);
      return banners[index];
    }
    return null;
  },
  deleteBanner(id) {
    const banners = this.getBanners();
    const filtered = banners.filter((b) => b.id !== id);
    writeJsonFile('banners.json', filtered);
    return true;
  },

  // Brands
  getBrands() {
    return readJsonFile('brands.json', []);
  },
  setBrands(list) {
    return writeJsonFile('brands.json', list);
  },
  addBrand(brandData) {
    const brands = this.getBrands();
    const newBrand = {
      id: brandData.id || `brand-${Date.now()}`,
      isActive: true,
      ...brandData,
    };
    brands.push(newBrand);
    writeJsonFile('brands.json', brands);
    return newBrand;
  },
  updateBrand(id, updates) {
    const brands = this.getBrands();
    const index = brands.findIndex((b) => b.id === id);
    if (index !== -1) {
      brands[index] = { ...brands[index], ...updates };
      writeJsonFile('brands.json', brands);
      return brands[index];
    }
    return null;
  },
  deleteBrand(id) {
    const brands = this.getBrands();
    const filtered = brands.filter((b) => b.id !== id);
    writeJsonFile('brands.json', filtered);
    return true;
  },

  // Orders
  getOrders() {
    return readJsonFile('orders.json', []);
  },
  getOrderById(id) {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id);
  },
  getOrdersByUserId(userId) {
    const orders = this.getOrders();
    return orders.filter((o) => o.userId === userId);
  },
  createOrder(orderData) {
    const orders = this.getOrders();
    orders.unshift(orderData);
    writeJsonFile('orders.json', orders);
    return orderData;
  },
  updateOrderStatus(orderId, status, paymentDetails = null) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (paymentDetails) {
      order.paymentDetails = paymentDetails;
    }
    writeJsonFile('orders.json', orders);
    return order;
  },

  // Coupons
  getCoupons() {
    return readJsonFile('coupons.json', [
      {
        id: 'coup-1',
        code: 'WELCOME50',
        description: 'Flat ₹50 off on first purchase',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 299,
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usedCount: 42,
        isActive: true,
      },
      {
        id: 'coup-2',
        code: 'SAVE20',
        description: '20% off up to ₹150 on pantry essentials',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 150,
        minOrderAmount: 499,
        expiryDate: '2026-12-31',
        usageLimit: 300,
        usedCount: 78,
        isActive: true,
      },
    ]);
  },
  setCoupons(list) {
    return writeJsonFile('coupons.json', list);
  },
  getCouponByCode(code) {
    const coupons = this.getCoupons();
    return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  },
  addCoupon(couponData) {
    const coupons = this.getCoupons();
    const newCoupon = {
      id: couponData.id || `coup-${Date.now()}`,
      usedCount: 0,
      isActive: true,
      ...couponData,
    };
    coupons.push(newCoupon);
    writeJsonFile('coupons.json', coupons);
    return newCoupon;
  },
  updateCoupon(id, updates) {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.id === id);
    if (index !== -1) {
      coupons[index] = { ...coupons[index], ...updates };
      writeJsonFile('coupons.json', coupons);
      return coupons[index];
    }
    return null;
  },
  deleteCoupon(id) {
    const coupons = this.getCoupons();
    const filtered = coupons.filter((c) => c.id !== id);
    writeJsonFile('coupons.json', filtered);
    return true;
  },

  // Webhook Idempotency Store
  isEventProcessed(eventId) {
    const events = readJsonFile('processed_events.json', []);
    return events.includes(eventId);
  },
  markEventProcessed(eventId) {
    const events = readJsonFile('processed_events.json', []);
    if (!events.includes(eventId)) {
      events.push(eventId);
      writeJsonFile('processed_events.json', events);
    }
  },
};
