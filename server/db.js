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
    return readJsonFile('users.json', INITIAL_USERS);
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
  getCouponByCode(code) {
    const coupons = this.getCoupons();
    return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
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
