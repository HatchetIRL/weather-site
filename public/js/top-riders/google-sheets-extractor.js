/**
 * @fileoverview Google Sheets data extraction service
 * Handles fetching and parsing data from Google Sheets
 */

import { DEFAULT_CONFIG, ERROR_MESSAGES } from './constants.js';

/**
 * Service for extracting data from Google Sheets
 */
class GoogleSheetsExtractor {
    /**
     * @param {Object} options - Configuration options
     * @param {number} [options.timeout] - Request timeout in milliseconds
     */
    constructor(options = {}) {
        this.timeout = options.timeout || DEFAULT_CONFIG.REQUEST_TIMEOUT;
    }

    /**
     * Extract data from Google Sheets using CSV export URL
     * @param {string} sheetsUrl - Google Sheets URL
     * @returns {Promise<RawSheetData>}
     */
    async extractSheetData(sheetsUrl) {
        try {
            // Convert Google Sheets URL to CSV export URL
            const csvUrl = this.convertToCsvUrl(sheetsUrl);
            
            if (!csvUrl) {
                throw new Error('Invalid Google Sheets URL');
            }

            return await this.parseCSVData(csvUrl);
        } catch (error) {
            console.error('Failed to extract sheet data:', error);
            this.handleDataExtractionError(error);
            throw error;
        }
    }

    /**
     * Parse CSV data from Google Sheets export URL
     * @param {string} csvUrl - CSV export URL
     * @returns {Promise<RawSheetData>}
     */
    async parseCSVData(csvUrl) {
        try {
            const response = await this.fetchWithTimeout(csvUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const csvText = await response.text();
            const parsedData = this.parseCSVText(csvText);

            return {
                sheets: [{
                    name: 'Main Sheet',
                    data: parsedData
                }],
                extractedAt: new Date()
            };
        } catch (error) {
            console.error('Failed to parse CSV data:', error);
            throw error;
        }
    }

    /**
     * Convert Google Sheets URL to CSV export URL
     * @param {string} sheetsUrl - Original Google Sheets URL
     * @returns {string|null} CSV export URL or null if invalid
     */
    convertToCsvUrl(sheetsUrl) {
        try {
            // Extract spreadsheet ID from various Google Sheets URL formats
            const patterns = [
                /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
                /\/d\/([a-zA-Z0-9-_]+)/
            ];

            let spreadsheetId = null;
            
            for (const pattern of patterns) {
                const match = sheetsUrl.match(pattern);
                if (match) {
                    spreadsheetId = match[1];
                    break;
                }
            }

            if (!spreadsheetId) {
                console.error('Could not extract spreadsheet ID from URL:', sheetsUrl);
                return null;
            }

            // Return CSV export URL
            return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        } catch (error) {
            console.error('Error converting to CSV URL:', error);
            return null;
        }
    }

    /**
     * Fetch data with timeout
     * @param {string} url - URL to fetch
     * @returns {Promise<Response>}
     */
    async fetchWithTimeout(url) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Parse CSV text into 2D array
     * @param {string} csvText - Raw CSV text
     * @returns {string[][]} Parsed CSV data
     */
    parseCSVText(csvText) {
        const lines = csvText.split('\n');
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                // Simple CSV parsing - handles basic cases
                // For more complex CSV with quotes/escapes, could use a library
                const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
                result.push(row);
            }
        }

        return result;
    }

    /**
     * Handle data extraction errors
     * @param {Error} error - The error that occurred
     */
    handleDataExtractionError(error) {
        let userMessage = ERROR_MESSAGES.GENERIC_ERROR;

        if (error.message.includes('timeout') || error.message.includes('network')) {
            userMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (error.message.includes('parse') || error.message.includes('CSV')) {
            userMessage = ERROR_MESSAGES.PARSE_ERROR;
        }

        // Dispatch custom event for error handling
        const errorEvent = new CustomEvent('topRidersError', {
            detail: {
                error: error,
                userMessage: userMessage,
                timestamp: new Date()
            }
        });

        document.dispatchEvent(errorEvent);
    }

    /**
     * Test if a Google Sheets URL is accessible
     * @param {string} sheetsUrl - Google Sheets URL to test
     * @returns {Promise<boolean>} True if accessible, false otherwise
     */
    async testSheetAccess(sheetsUrl) {
        try {
            const csvUrl = this.convertToCsvUrl(sheetsUrl);
            if (!csvUrl) return false;

            const response = await this.fetchWithTimeout(csvUrl);
            return response.ok;
        } catch (error) {
            console.warn('Sheet access test failed:', error);
            return false;
        }
    }
}

export { GoogleSheetsExtractor };