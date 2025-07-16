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
            ...config
        };
        
        // Initialize components
        this.extractor = new GoogleSheetsExtractor();
        this.parser = new RiderDataParser();
        this.rankingEngine = new RankingEngine();
        this.renderer = new TopRidersRenderer();
        
        this.initialized = false;
        this.refreshTimer = null;
        this.containerElement = null;
        this.currentData = null;
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
            // Extract raw data from Google Sheets
            const rawData = await this.extractor.extractSheetData(this.config.googleSheetsUrl);
            
            if (!rawData || !this.parser.validateDataStructure(rawData)) {
                throw new Error('Invalid data structure received');
            }

            // Parse the data into rider objects
            const mainLeague = this.parser.parseMainLeague(rawData);
            const developmentLeague = this.parser.parseDevelopmentLeague(rawData);
            const primeTables = this.parser.parsePrimeTables(rawData);

            // Get top riders using ranking engine
            const topRidersData = {
                mainLeague: this.rankingEngine.getTopRiders(mainLeague, DEFAULT_CONFIG.TOP_ML_COUNT),
                developmentLeague: this.rankingEngine.getTopRiders(developmentLeague, DEFAULT_CONFIG.TOP_DL_COUNT),
                prime1: this.rankingEngine.getTopRiders(primeTables.prime1, DEFAULT_CONFIG.TOP_PRIME_COUNT),
                prime2: this.rankingEngine.getTopRiders(primeTables.prime2, DEFAULT_CONFIG.TOP_PRIME_COUNT),
                lastUpdated: new Date()
            };

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
     * Cache data to localStorage
     * @param {TopRidersData} data - Data to cache
     */
    cacheData(data) {
        try {
            const cacheObject = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(cacheObject));
        } catch (error) {
            console.warn('Failed to cache data:', error);
        }
    }

    /**
     * Get cached data from localStorage
     * @returns {TopRidersData|null}
     */
    getCachedData() {
        try {
            const cached = localStorage.getItem(STORAGE_KEYS.CACHED_DATA);
            if (!cached) return null;

            const cacheObject = JSON.parse(cached);
            const age = Date.now() - cacheObject.timestamp;

            // Check if cache is still valid
            if (age > this.config.cacheExpiry) {
                localStorage.removeItem(STORAGE_KEYS.CACHED_DATA);
                return null;
            }

            // Convert lastUpdated back to Date object
            if (cacheObject.data.lastUpdated) {
                cacheObject.data.lastUpdated = new Date(cacheObject.data.lastUpdated);
            }

            return cacheObject.data;
        } catch (error) {
            console.warn('Failed to get cached data:', error);
            return null;
        }
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
     * Manually refresh data
     * @returns {Promise<void>}
     */
    async refreshData() {
        console.log('Refreshing top riders data...');
        await this.loadData();
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