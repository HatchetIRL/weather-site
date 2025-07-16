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
     * Extract data from Google Sheets using CSV export URL for multiple sheets
     * @param {string} sheetsUrl - Google Sheets URL
     * @returns {Promise<RawSheetData>}
     */
    async extractSheetData(sheetsUrl) {
        try {
            // Extract spreadsheet ID from the URL
            const spreadsheetId = this.extractSpreadsheetId(sheetsUrl);
            
            if (!spreadsheetId) {
                throw new Error('Invalid Google Sheets URL');
            }

            // Fetch data from all 4 sheets
            const sheets = await this.fetchAllSheets(spreadsheetId);

            return {
                sheets: sheets,
                extractedAt: new Date()
            };
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
            // Handle different Google Sheets URL formats
            let spreadsheetId = null;
            
            // Pattern for pubhtml URLs: /d/e/2PACX-...../pubhtml
            const pubhtmlMatch = sheetsUrl.match(/\/d\/e\/([a-zA-Z0-9-_]+)\/pubhtml/);
            if (pubhtmlMatch) {
                spreadsheetId = pubhtmlMatch[1];
                // For published sheets, use the export URL with the full published ID
                return `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv`;
            }
            
            // Pattern for regular spreadsheet URLs: /d/spreadsheet_id/
            const regularMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (regularMatch) {
                spreadsheetId = regularMatch[1];
                return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
            }

            // Pattern for short URLs: /d/spreadsheet_id
            const shortMatch = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (shortMatch) {
                spreadsheetId = shortMatch[1];
                return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
            }

            console.error('Could not extract spreadsheet ID from URL:', sheetsUrl);
            return null;
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
     * Extract spreadsheet ID from Google Sheets URL
     * @param {string} sheetsUrl - Google Sheets URL
     * @returns {string|null} Spreadsheet ID or null if invalid
     */
    extractSpreadsheetId(sheetsUrl) {
        try {
            // Pattern for pubhtml URLs: /d/e/2PACX-...../pubhtml
            const pubhtmlMatch = sheetsUrl.match(/\/d\/e\/([a-zA-Z0-9-_]+)\/pubhtml/);
            if (pubhtmlMatch) {
                return pubhtmlMatch[1];
            }
            
            // Pattern for regular spreadsheet URLs: /d/spreadsheet_id/
            const regularMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
            if (regularMatch) {
                return regularMatch[1];
            }

            // Pattern for short URLs: /d/spreadsheet_id
            const shortMatch = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (shortMatch) {
                return shortMatch[1];
            }

            console.error('Could not extract spreadsheet ID from URL:', sheetsUrl);
            return null;
        } catch (error) {
            console.error('Error extracting spreadsheet ID:', error);
            return null;
        }
    }

    /**
     * Fetch data from all 4 sheets in the workbook
     * @param {string} spreadsheetId - The spreadsheet ID
     * @returns {Promise<Array>} Array of sheet data
     */
    async fetchAllSheets(spreadsheetId) {
        const sheets = [];
        console.log('Fetching sheets for spreadsheet ID:', spreadsheetId);
        
        // Define the 4 sheets we need to fetch
        const sheetConfigs = [
            { name: 'Main League', gid: '2052107479' },
            { name: 'ML Primes', gid: '394788670' },
            { name: 'Dev League', gid: '732061928' },
            { name: 'DL Primes', gid: '1028354950' }
        ];

        // Fetch each sheet individually
        for (const config of sheetConfigs) {
            try {
                console.log(`Fetching ${config.name} sheet...`);
                // Build CSV URL for specific sheet using gid parameter
                const csvUrl = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv&gid=${config.gid}`;
                console.log('CSV URL:', csvUrl);
                
                const response = await this.fetchWithTimeout(csvUrl);
                console.log(`${config.name} response status:`, response.status);
                
                if (!response.ok) {
                    console.warn(`Failed to fetch ${config.name}: HTTP ${response.status}`);
                    continue;
                }

                const csvText = await response.text();
                console.log(`${config.name} CSV data (first 200 chars):`, csvText.substring(0, 200));
                const parsedData = this.parseCSVText(csvText);
                console.log(`${config.name} parsed rows:`, parsedData.length);
                
                sheets.push({
                    name: config.name,
                    data: parsedData
                });
            } catch (error) {
                console.error(`Error fetching ${config.name}:`, error);
                // Continue with other sheets even if one fails
            }
        }

        console.log('Total sheets fetched:', sheets.length);
        if (sheets.length === 0) {
            throw new Error('Failed to fetch any sheet data');
        }

        return sheets;
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