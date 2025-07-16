/**
 * @fileoverview Core interfaces and type definitions for the Top Riders feature
 * Using JSDoc comments to provide TypeScript-style type information
 */

/**
 * @typedef {Object} Rider
 * @property {string} name - Rider's name
 * @property {number} position - Current position in standings
 * @property {number} points - Total points earned
 * @property {string} [club] - Rider's club affiliation
 * @property {'ML'|'DL'|'Prime1'|'Prime2'} category - League category
 */

/**
 * @typedef {Object} TopRidersData
 * @property {Rider[]} mainLeague - Top 10 ML riders
 * @property {Rider[]} developmentLeague - Top 10 DL riders
 * @property {Rider[]} prime1 - Top 5 Prime 1 riders
 * @property {Rider[]} prime2 - Top 5 Prime 2 riders
 * @property {Date} lastUpdated - When data was last refreshed
 */

/**
 * @typedef {Object} SheetTab
 * @property {string} name - Sheet tab name
 * @property {string[][]} data - 2D array of sheet data
 */

/**
 * @typedef {Object} RawSheetData
 * @property {SheetTab[]} sheets - Array of sheet tabs
 * @property {Date} extractedAt - When data was extracted
 */

/**
 * @typedef {Object} TopRidersConfig
 * @property {string} googleSheetsUrl - URL to Google Sheets
 * @property {number} refreshInterval - Auto-refresh interval in milliseconds
 * @property {boolean} enableCaching - Whether to use localStorage caching
 * @property {number} cacheExpiry - Cache expiry time in milliseconds
 */

// Export empty object to make this a module
export {};