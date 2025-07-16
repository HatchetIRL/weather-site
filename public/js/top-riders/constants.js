/**
 * @fileoverview Constants and configuration values for the Top Riders feature
 */

/**
 * League categories
 */
export const LEAGUE_CATEGORIES = {
    MAIN_LEAGUE: 'ML',
    DEVELOPMENT_LEAGUE: 'DL',
    PRIME_1: 'Prime1',
    PRIME_2: 'Prime2'
};

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
    TOP_ML_COUNT: 10,
    TOP_DL_COUNT: 10,
    TOP_PRIME_COUNT: 5,
    REFRESH_INTERVAL: 300000, // 5 minutes
    CACHE_EXPIRY: 600000, // 10 minutes
    REQUEST_TIMEOUT: 10000 // 10 seconds
};

/**
 * CSS class names for styling
 */
export const CSS_CLASSES = {
    CONTAINER: 'top-riders-container',
    SECTION: 'top-riders-section',
    TABLE: 'top-riders-table',
    HEADER: 'top-riders-header',
    LOADING: 'top-riders-loading',
    ERROR: 'top-riders-error',
    REFRESH_BTN: 'top-riders-refresh-btn'
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Unable to fetch data. Please check your connection.',
    PARSE_ERROR: 'Unable to process standings data.',
    NO_DATA: 'No rider data available.',
    GENERIC_ERROR: 'An error occurred while loading top riders.'
};

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
    CACHED_DATA: 'topRiders_cachedData',
    LAST_UPDATE: 'topRiders_lastUpdate'
};