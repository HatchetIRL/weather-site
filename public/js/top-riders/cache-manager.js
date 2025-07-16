/**
 * @fileoverview Cache manager for Top Riders feature
 * Handles localStorage caching with advanced features like cache invalidation,
 * compression, and offline detection
 */

import { STORAGE_KEYS, DEFAULT_CONFIG } from './constants.js';

/**
 * Advanced cache manager for Top Riders data
 */
class CacheManager {
    constructor(options = {}) {
        this.cacheExpiry = options.cacheExpiry || DEFAULT_CONFIG.CACHE_EXPIRY;
        this.maxCacheSize = options.maxCacheSize || 5 * 1024 * 1024; // 5MB default
        this.compressionEnabled = options.compressionEnabled !== false;
        this.debugMode = options.debugMode || false;
    }

    /**
     * Store data in cache with metadata
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {Object} options - Caching options
     * @returns {boolean} Success status
     */
    set(key, data, options = {}) {
        try {
            const cacheEntry = {
                data: data,
                timestamp: Date.now(),
                version: options.version || '1.0',
                metadata: {
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    dataSize: JSON.stringify(data).length,
                    ...options.metadata
                },
                expiry: options.expiry || this.cacheExpiry
            };

            // Compress data if enabled and data is large
            if (this.compressionEnabled && cacheEntry.metadata.dataSize > 1024) {
                cacheEntry.compressed = true;
                cacheEntry.data = this.compressData(data);
            }

            const serialized = JSON.stringify(cacheEntry);
            
            // Check if we're exceeding storage limits
            if (serialized.length > this.maxCacheSize) {
                console.warn('Cache entry too large, skipping cache');
                return false;
            }

            localStorage.setItem(key, serialized);
            
            if (this.debugMode) {
                console.log(`Cache set: ${key} (${serialized.length} bytes)`);
            }

            return true;
        } catch (error) {
            console.warn('Failed to cache data:', error);
            
            // Try to free up space and retry
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                try {
                    localStorage.setItem(key, JSON.stringify(cacheEntry));
                    return true;
                } catch (retryError) {
                    console.error('Cache retry failed:', retryError);
                }
            }
            
            return false;
        }
    }

    /**
     * Retrieve data from cache
     * @param {string} key - Cache key
     * @param {Object} options - Retrieval options
     * @returns {any|null} Cached data or null if not found/expired
     */
    get(key, options = {}) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) {
                if (this.debugMode) {
                    console.log(`Cache miss: ${key}`);
                }
                return null;
            }

            const cacheEntry = JSON.parse(cached);
            const age = Date.now() - cacheEntry.timestamp;
            const expiry = options.ignoreExpiry ? Infinity : (cacheEntry.expiry || this.cacheExpiry);

            // Check if cache is expired
            if (age > expiry) {
                if (this.debugMode) {
                    console.log(`Cache expired: ${key} (age: ${age}ms, expiry: ${expiry}ms)`);
                }
                this.remove(key);
                return null;
            }

            // Decompress data if needed
            let data = cacheEntry.data;
            if (cacheEntry.compressed) {
                data = this.decompressData(data);
            }

            // Convert Date objects back from strings
            if (data && typeof data === 'object') {
                data = this.restoreDateObjects(data);
            }

            if (this.debugMode) {
                console.log(`Cache hit: ${key} (age: ${age}ms)`);
            }

            return data;
        } catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            this.remove(key); // Remove corrupted cache entry
            return null;
        }
    }

    /**
     * Remove item from cache
     * @param {string} key - Cache key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            if (this.debugMode) {
                console.log(`Cache removed: ${key}`);
            }
        } catch (error) {
            console.warn('Failed to remove cache entry:', error);
        }
    }

    /**
     * Check if item exists in cache and is valid
     * @param {string} key - Cache key
     * @returns {boolean} True if valid cache exists
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Get cache metadata without retrieving the data
     * @param {string} key - Cache key
     * @returns {Object|null} Cache metadata
     */
    getMetadata(key) {
        try {
            const cached = localStorage.getItem(key);
            if (!cached) return null;

            const cacheEntry = JSON.parse(cached);
            return {
                timestamp: cacheEntry.timestamp,
                age: Date.now() - cacheEntry.timestamp,
                version: cacheEntry.version,
                metadata: cacheEntry.metadata,
                expiry: cacheEntry.expiry,
                compressed: cacheEntry.compressed || false
            };
        } catch (error) {
            console.warn('Failed to get cache metadata:', error);
            return null;
        }
    }

    /**
     * Clean up expired cache entries
     * @returns {number} Number of entries cleaned up
     */
    cleanup() {
        let cleanedCount = 0;
        const keysToRemove = [];

        try {
            // Find all cache keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('topRiders_')) {
                    const metadata = this.getMetadata(key);
                    if (metadata && metadata.age > metadata.expiry) {
                        keysToRemove.push(key);
                    }
                }
            }

            // Remove expired entries
            keysToRemove.forEach(key => {
                this.remove(key);
                cleanedCount++;
            });

            if (this.debugMode && cleanedCount > 0) {
                console.log(`Cache cleanup: removed ${cleanedCount} expired entries`);
            }

        } catch (error) {
            console.warn('Cache cleanup failed:', error);
        }

        return cleanedCount;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        try {
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('topRiders_')) {
                    keysToRemove.push(key);
                }
            }

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            if (this.debugMode) {
                console.log(`Cache cleared: removed ${keysToRemove.length} entries`);
            }

        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        let totalEntries = 0;
        let totalSize = 0;
        let expiredEntries = 0;
        let compressedEntries = 0;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('topRiders_')) {
                    totalEntries++;
                    
                    const value = localStorage.getItem(key);
                    if (value) {
                        totalSize += value.length;
                        
                        try {
                            const entry = JSON.parse(value);
                            const age = Date.now() - entry.timestamp;
                            if (age > (entry.expiry || this.cacheExpiry)) {
                                expiredEntries++;
                            }
                            if (entry.compressed) {
                                compressedEntries++;
                            }
                        } catch (parseError) {
                            // Ignore parse errors for stats
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to get cache stats:', error);
        }

        return {
            totalEntries,
            totalSize,
            expiredEntries,
            compressedEntries,
            maxCacheSize: this.maxCacheSize,
            utilizationPercent: (totalSize / this.maxCacheSize * 100).toFixed(2)
        };
    }

    /**
     * Check if browser is offline
     * @returns {boolean} True if offline
     */
    isOffline() {
        return !navigator.onLine;
    }

    /**
     * Simple data compression using JSON string manipulation
     * @param {any} data - Data to compress
     * @returns {string} Compressed data
     */
    compressData(data) {
        try {
            // Simple compression: remove unnecessary whitespace from JSON
            const jsonString = JSON.stringify(data);
            return jsonString.replace(/\s+/g, ' ').trim();
        } catch (error) {
            console.warn('Data compression failed:', error);
            return JSON.stringify(data);
        }
    }

    /**
     * Decompress data
     * @param {string} compressedData - Compressed data
     * @returns {any} Decompressed data
     */
    decompressData(compressedData) {
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            console.warn('Data decompression failed:', error);
            return null;
        }
    }

    /**
     * Restore Date objects from JSON strings
     * @param {any} obj - Object to process
     * @returns {any} Object with restored Date objects
     */
    restoreDateObjects(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.restoreDateObjects(item));
        }

        const restored = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key === 'lastUpdated' || key === 'extractedAt' || key === 'timestamp') {
                restored[key] = new Date(value);
            } else if (typeof value === 'object') {
                restored[key] = this.restoreDateObjects(value);
            } else {
                restored[key] = value;
            }
        }

        return restored;
    }

    /**
     * Set up automatic cache cleanup
     * @param {number} interval - Cleanup interval in milliseconds
     */
    setupAutoCleanup(interval = 60000) { // Default: 1 minute
        setInterval(() => {
            this.cleanup();
        }, interval);
    }

    /**
     * Set up offline/online event listeners
     * @param {Function} onOffline - Callback for offline event
     * @param {Function} onOnline - Callback for online event
     */
    setupOfflineHandling(onOffline, onOnline) {
        window.addEventListener('offline', () => {
            if (this.debugMode) {
                console.log('Browser went offline - relying on cache');
            }
            if (onOffline) onOffline();
        });

        window.addEventListener('online', () => {
            if (this.debugMode) {
                console.log('Browser came online - can fetch fresh data');
            }
            if (onOnline) onOnline();
        });
    }
}

export { CacheManager };