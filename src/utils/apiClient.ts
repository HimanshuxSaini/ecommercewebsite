/**
 * Velneer Authoritative Production API Client
 * Interacts directly with the Node/Express backend with HTTP-Only cookie support.
 */

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const apiClient = {
  // Authentication
  async login(email: string, password?: string, role?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, message };
    }
  },

  async signup(name: string, email: string, password?: string, phone?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone }),
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { success: false, message };
    }
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async logout() {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      return { success: false, message };
    }
  },

  // Catalog Products
  async getProducts(params?: { category?: string; search?: string; inStock?: boolean }) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.inStock) query.append('inStock', 'true');

      const url = `${API_BASE}/products${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await fetch(url);
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fetching products failed';
      return { success: false, message, products: [] };
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/products/categories`);
      return await res.json();
    } catch {
      return { success: false, categories: [] };
    }
  },

  async getBanners() {
    try {
      const res = await fetch(`${API_BASE}/products/banners`);
      return await res.json();
    } catch {
      return { success: false, banners: [] };
    }
  },

  async getBrands() {
    try {
      const res = await fetch(`${API_BASE}/products/brands`);
      return await res.json();
    } catch {
      return { success: false, brands: [] };
    }
  },

  async getCoupons() {
    try {
      const res = await fetch(`${API_BASE}/products/coupons`);
      return await res.json();
    } catch {
      return { success: false, coupons: [] };
    }
  },

  async validateCoupon(code: string, cartTotal: number) {
    try {
      const res = await fetch(`${API_BASE}/products/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal }),
      });
      return await res.json();
    } catch {
      return { valid: false, message: 'Coupon verification failed' };
    }
  },

  // Orders
  async createOrder(orderPayload: Record<string, unknown>) {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Order creation failed';
      return { success: false, message };
    }
  },

  async getMyOrders() {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        credentials: 'include',
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fetching orders failed';
      return { success: false, message, orders: [] };
    }
  },

  // Payments Gateway
  async createPaymentOrder(orderId: string, amount: number) {
    try {
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, amount }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Payment gateway initialization failed' };
    }
  },

  async verifyPayment(payload: { orderId: string; razorpayPaymentId: string; razorpayOrderId?: string; razorpaySignature?: string }) {
    try {
      const res = await fetch(`${API_BASE}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Payment verification failed' };
    }
  },

  // Cloudinary Image Upload
  async uploadImage(file: File, folder = 'velneer/products') {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);

      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      return await res.json();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      return { success: false, message };
    }
  },

  // Admin Operations
  async getAdminOverview() {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, { credentials: 'include' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async getAdminOrders() {
    try {
      const res = await fetch(`${API_BASE}/admin/orders`, { credentials: 'include' });
      return await res.json();
    } catch {
      return { success: false, orders: [] };
    }
  },

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, trackingNumber }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async addProduct(productData: Record<string, unknown>) {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productData),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateProduct(id: string, updates: Record<string, unknown>) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async deleteProduct(id: string) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};
