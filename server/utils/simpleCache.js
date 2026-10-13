/**
 * High-Performance In-Memory Simple Cache
 * Lightweight TTL cache replacing external Redis dependency.
 * Provides microsecond in-memory reads, automatic key expiration, and pattern-based invalidation.
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
    // Run cleanup sweep every 60 seconds
    setInterval(() => this.cleanup(), 60000).unref();
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  del(key) {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or pattern (e.g. 'products:')
   */
  delPrefix(prefix) {
    let deletedCount = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  flush() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size() {
    return this.cache.size;
  }
}

export const simpleCache = new SimpleCache();
