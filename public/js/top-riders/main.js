/**
 * @fileoverview Main entry point for the Top Riders feature
 * Initializes and coordinates all components
 */

import './interfaces.js';
import { GoogleSheetsExtractor } from './google-sheets-extractor.js';
import { RiderDataParser } from './rider-data-parser.js';
import { RankingEngine } from './ranking-engine.js';
import { TopRidersRenderer } from './top-riders-renderer.js';
import { errorHandler } from './error-handler.js';
import { CacheManager } from './cache-manager.js';
import { DEFAULT_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from './constants.js';

/**
 * Main application class that orchestrates the Top Riders feature
 */
class TopRidersApp {
    /**
     * @param {TopRidersConfig} config - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            googleSheetsUrl: config.googleSheetsUrl || '',
            refreshInterval: config.refreshInterval || DEFAULT_CONFIG.REFRESH_INTERVAL,
            enableCaching: config.enableCaching !== false,
            cacheExpiry: config.cacheExpiry || DEFAULT_CONFIG.CACHE_EXPIRY,
            containerSelector: config.containerSelector || '#top-riders-container',
            debounceDelay: config.debounceDelay || 1000, // 1 second debounce
            ...config
        };
        
        // Initialize components
        this.extractor = new GoogleSheetsExtractor();
        this.parser = new RiderDataParser();
        this.rankingEngine = new RankingEngine();
        this.renderer = new TopRidersRenderer();
        this.cacheManager = new CacheManager({
            cacheExpiry: this.config.cacheExpiry,
            debugMode: this.config.debugMode || false
        });
        
        this.initialized = false;
        this.refreshTimer = null;
        this.containerElement = null;
        this.currentData = null;
        
        // Performance optimization: debounced refresh
        this.debouncedRefresh = this.debounce(this.loadData.bind(this), this.config.debounceDelay);
        this.isRefreshing = false;
    }

    /**
     * Initialize the Top Riders application
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.initialized) {
            console.warn('TopRidersApp already initialized');
            return;
        }

        try {
            console.log('Initializing Top Riders feature...');
            
            // Find or create container element
            this.containerElement = document.querySelector(this.config.containerSelector);
            if (!this.containerElement) {
                console.error('Container element not found:', this.config.containerSelector);
                throw new Error('Container element not found');
            }

            // Set up event listeners
            this.setupEventListeners();
            
            // Set up cache management
            this.setupCacheManagement();
            
            // Load initial data
            await this.loadData();
            
            // Start auto-refresh if enabled
            if (this.config.refreshInterval > 0) {
                this.startAutoRefresh();
            }
            
            this.initialized = true;
            console.log('Top Riders feature initialized successfully');
        } catch (error) {
            const userMessage = errorHandler.handleError(error, 'initialization');
            this.showError(userMessage);
            throw error;
        }
    }

    /**
     * Load and display top riders data
     * @returns {Promise<void>}
     */
    async loadData() {
        try {
            // Show loading state
            this.showLoading();

            // Try to get fresh data
            let topRidersData = null;
            
            if (this.config.googleSheetsUrl) {
                topRidersData = await this.fetchFreshData();
            }

            // Fallback to cached data if fresh data fails
            if (!topRidersData && this.config.enableCaching) {
                topRidersData = this.getCachedData();
            }

            if (topRidersData) {
                this.currentData = topRidersData;
                this.renderData(topRidersData);
                
                // Cache the data if caching is enabled
                if (this.config.enableCaching) {
                    this.cacheData(topRidersData);
                }
            } else {
                this.showError(ERROR_MESSAGES.NO_DATA);
            }
        } catch (error) {
            const userMessage = errorHandler.handleError(error, 'data-loading');
            
            // Try to show cached data as fallback
            if (this.config.enableCaching) {
                const cachedData = this.getCachedData();
                if (cachedData) {
                    this.currentData = cachedData;
                    this.renderData(cachedData);
                    // Show a warning that we're using cached data
                    console.warn('Using cached data due to loading error');
                    return;
                }
            }
            
            this.showError(userMessage);
        }
    }

    /**
     * Fetch fresh data from Google Sheets
     * @returns {Promise<TopRidersData|null>}
     */
    async fetchFreshData() {
        try {
            console.log('Starting to fetch fresh data from:', this.config.googleSheetsUrl);
            
            // Extract raw data from Google Sheets
            const rawData = await this.extractor.extractSheetData(this.config.googleSheetsUrl);
            console.log('Raw data extracted:', rawData);
            
            if (!rawData || !this.parser.validateDataStructure(rawData)) {
                console.error('Invalid data structure received:', rawData);
                throw new Error('Invalid data structure received');
            }

            console.log('Data structure is valid, parsing rider data...');

            // Parse the data into rider objects
            const mainLeague = this.parser.parseMainLeague(rawData);
            console.log('Main League riders parsed:', mainLeague.length, mainLeague);
            
            const developmentLeague = this.parser.parseDevelopmentLeague(rawData);
            console.log('Development League riders parsed:', developmentLeague.length, developmentLeague);
            
            const primeTables = this.parser.parsePrimeTables(rawData);
            console.log('Prime tables parsed:', primeTables);

            // Get top riders using ranking engine
            const topRidersData = {
                mainLeague: this.rankingEngine.getTopRiders(mainLeague, DEFAULT_CONFIG.TOP_ML_COUNT),
                developmentLeague: this.rankingEngine.getTopRiders(developmentLeague, DEFAULT_CONFIG.TOP_DL_COUNT),
                prime1: this.rankingEngine.getTopRiders(primeTables.prime1, DEFAULT_CONFIG.TOP_PRIME_COUNT),
                prime2: this.rankingEngine.getTopRiders(primeTables.prime2, DEFAULT_CONFIG.TOP_PRIME_COUNT),
                lastUpdated: new Date()
            };

            console.log('Final top riders data:', topRidersData);
            return topRidersData;
        } catch (error) {
            console.error('Error fetching fresh data:', error);
            return null;
        }
    }

    /**
     * Render the top riders data
     * @param {TopRidersData} data - Data to render
     */
    renderData(data) {
        try {
            const renderedElement = this.renderer.renderTopRidersSection(data);
            
            // Clear container and add rendered content
            this.containerElement.innerHTML = '';
            this.containerElement.appendChild(renderedElement);
            
            // Apply responsive styles
            this.renderer.applyResponsiveStyles();
        } catch (error) {
            console.error('Error rendering data:', error);
            this.showError(ERROR_MESSAGES.GENERIC_ERROR);
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.containerElement.innerHTML = '';
        this.containerElement.appendChild(this.renderer.createLoadingElement());
    }

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showError(message) {
        this.containerElement.innerHTML = '';
        const errorElement = this.renderer.createErrorElement(message);
        this.containerElement.appendChild(errorElement);
        
        // Add click handler for retry button
        const retryButton = errorElement.querySelector('.top-riders-refresh-btn');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.refreshData();
            });
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for custom error events
        document.addEventListener('topRidersError', (event) => {
            console.error('Top Riders Error:', event.detail);
            this.showError(event.detail.userMessage);
        });

        // Listen for visibility change to refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.initialized) {
                // Refresh data when page becomes visible (user returns to tab)
                setTimeout(() => {
                    this.refreshData();
                }, 1000);
            }
        });
    }

    /**
     * Set up cache management features
     */
    setupCacheManagement() {
        if (!this.config.enableCaching) return;

        // Set up automatic cache cleanup
        this.cacheManager.setupAutoCleanup();

        // Set up offline/online handling
        this.cacheManager.setupOfflineHandling(
            () => {
                // When going offline, show a message if we have cached data
                const cachedData = this.getCachedData();
                if (cachedData) {
                    console.log('Offline mode: Using cached data');
                    // Could show a notification to user about offline mode
                }
            },
            () => {
                // When coming online, refresh data
                console.log('Online mode: Refreshing data');
                setTimeout(() => {
                    this.refreshData();
                }, 2000); // Wait a bit for connection to stabilize
            }
        );

        // Log cache statistics in debug mode
        if (this.config.debugMode) {
            const stats = this.cacheManager.getStats();
            console.log('Cache statistics:', stats);
        }
    }

    /**
     * Cache data using enhanced cache manager
     * @param {TopRidersData} data - Data to cache
     */
    cacheData(data) {
        if (!this.config.enableCaching) return;
        
        this.cacheManager.set(STORAGE_KEYS.CACHED_DATA, data, {
            version: '1.0',
            metadata: {
                sheetsUrl: this.config.googleSheetsUrl,
                ridersCount: {
                    mainLeague: data.mainLeague?.length || 0,
                    developmentLeague: data.developmentLeague?.length || 0,
                    prime1: data.prime1?.length || 0,
                    prime2: data.prime2?.length || 0
                }
            }
        });
    }

    /**
     * Get cached data using enhanced cache manager
     * @returns {TopRidersData|null}
     */
    getCachedData() {
        if (!this.config.enableCaching) return null;
        
        return this.cacheManager.get(STORAGE_KEYS.CACHED_DATA);
    }

    /**
     * Start automatic data refresh
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.refreshData().catch(error => {
                console.error('Auto-refresh failed:', error);
            });
        }, this.config.refreshInterval);
    }

    /**
     * Stop automatic data refresh
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    /**
     * Get current data
     * @returns {TopRidersData|null}
     */
    getCurrentData() {
        return this.currentData;
    }

    /**
     * Update configuration
     * @param {Partial<TopRidersConfig>} newConfig - New configuration values
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart auto-refresh if interval changed
        if (newConfig.refreshInterval !== undefined) {
            this.stopAutoRefresh();
            if (this.config.refreshInterval > 0) {
                this.startAutoRefresh();
            }
        }
    }

    /**
     * Debounce function to limit rapid successive calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Optimized refresh with debouncing and refresh state management
     * @returns {Promise<void>}
     */
    async refreshData() {
        if (this.isRefreshing) {
            console.log('Refresh already in progress, skipping...');
            return;
        }

        this.isRefreshing = true;
        try {
            console.log('Refreshing top riders data...');
            await this.loadData();
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopAutoRefresh();
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        this.initialized = false;
        this.containerElement = null;
        this.currentData = null;
    }
}

// Export for use in other modules
export { TopRidersApp };