/**
 * Velneer Authoritative Backend API Client
 * Interacts directly with the Node/Express + MongoDB backend endpoints.
 */

const API_BASE = '/api';

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
      return { success: false, message };
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
};
