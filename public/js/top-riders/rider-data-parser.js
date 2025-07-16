/**
 * @fileoverview Parser for converting raw Google Sheets data into structured rider objects
 * Handles parsing of Main League, Development League, and Prime tables
 */

import { LEAGUE_CATEGORIES } from './constants.js';

/**
 * Service for parsing raw sheet data into structured rider objects
 */
class RiderDataParser {
    constructor() {
        // Common column patterns to look for in sheets
        this.columnPatterns = {
            position: /^(pos|position|rank|#)$/i,
            name: /^(name|rider|cyclist)$/i,
            points: /^(points|pts|total)$/i,
            club: /^(club|team)$/i
        };
    }

    /**
     * Parse Main League data from raw sheet data
     * @param {RawSheetData} rawData - Raw sheet data
     * @returns {Rider[]} Array of Main League riders
     */
    parseMainLeague(rawData) {
        try {
            // Find the Main League sheet
            const mainLeagueSheet = rawData.sheets.find(sheet =>
                sheet.name === 'Main League' || sheet.name.toLowerCase().includes('main')
            );

            if (!mainLeagueSheet || !mainLeagueSheet.data || mainLeagueSheet.data.length === 0) {
                console.warn('No Main League sheet found');
                return [];
            }

            const riders = this.parseRiderData(mainLeagueSheet.data, LEAGUE_CATEGORIES.MAIN_LEAGUE);

            return riders;
        } catch (error) {
            console.error('Error parsing Main League data:', error);
            return [];
        }
    }

    /**
     * Parse Development League data from raw sheet data
     * @param {RawSheetData} rawData - Raw sheet data
     * @returns {Rider[]} Array of Development League riders
     */
    parseDevelopmentLeague(rawData) {
        try {
            // Find the Development League sheet
            const devLeagueSheet = rawData.sheets.find(sheet =>
                sheet.name === 'Dev League' || sheet.name.toLowerCase().includes('dev')
            );

            if (!devLeagueSheet || !devLeagueSheet.data || devLeagueSheet.data.length === 0) {
                console.warn('No Development League sheet found');
                return [];
            }

            const riders = this.parseRiderData(devLeagueSheet.data, LEAGUE_CATEGORIES.DEVELOPMENT_LEAGUE);

            return riders;
        } catch (error) {
            console.error('Error parsing Development League data:', error);
            return [];
        }
    }

    /**
     * Parse Prime tables data from raw sheet data
     * @param {RawSheetData} rawData - Raw sheet data
     * @returns {{prime1: Rider[], prime2: Rider[]}} Object containing both prime tables
     */
    parsePrimeTables(rawData) {
        try {
            // Find the ML Primes sheet (Prime 1)
            const mlPrimesSheet = rawData.sheets.find(sheet =>
                sheet.name === 'ML Primes' || sheet.name.toLowerCase().includes('ml prime')
            );

            // Find the DL Primes sheet (Prime 2)
            const dlPrimesSheet = rawData.sheets.find(sheet =>
                sheet.name === 'DL Primes' || sheet.name.toLowerCase().includes('dl prime')
            );

            let prime1 = [];
            let prime2 = [];

            if (mlPrimesSheet && mlPrimesSheet.data && mlPrimesSheet.data.length > 0) {
                prime1 = this.parseRiderData(mlPrimesSheet.data, LEAGUE_CATEGORIES.PRIME_1);
            } else {
                console.warn('No ML Primes sheet found');
            }

            if (dlPrimesSheet && dlPrimesSheet.data && dlPrimesSheet.data.length > 0) {
                prime2 = this.parseRiderData(dlPrimesSheet.data, LEAGUE_CATEGORIES.PRIME_2);
            } else {
                console.warn('No DL Primes sheet found');
            }

            return {
                prime1: prime1,
                prime2: prime2
            };
        } catch (error) {
            console.error('Error parsing Prime tables data:', error);
            return { prime1: [], prime2: [] };
        }
    }

    /**
     * Find a specific sheet section by name patterns
     * @param {RawSheetData} rawData - Raw sheet data
     * @param {string[]} patterns - Array of patterns to search for
     * @returns {string[][]|null} Sheet data or null if not found
     */
    findSheetSection(rawData, patterns) {
        // First, try to find a dedicated sheet tab
        for (const sheet of rawData.sheets) {
            for (const pattern of patterns) {
                if (sheet.name.toLowerCase().includes(pattern.toLowerCase())) {
                    return sheet.data;
                }
            }
        }

        // If no dedicated sheet found, look for sections within the main sheet
        const mainSheet = rawData.sheets[0];
        if (!mainSheet || !mainSheet.data) {
            return null;
        }

        // Look for section headers in the data
        for (let i = 0; i < mainSheet.data.length; i++) {
            const row = mainSheet.data[i];
            const rowText = row.join(' ').toLowerCase();

            for (const pattern of patterns) {
                if (rowText.includes(pattern.toLowerCase())) {
                    // Found section header, extract data until next section or end
                    return this.extractSectionData(mainSheet.data, i);
                }
            }
        }

        return null;
    }

    /**
     * Extract section data starting from a header row
     * @param {string[][]} sheetData - Full sheet data
     * @param {number} startIndex - Index of section header
     * @returns {string[][]} Section data
     */
    extractSectionData(sheetData, startIndex) {
        const sectionData = [];
        let i = startIndex + 1; // Start after header

        // Look for the actual table header (Position, Name, Points, etc.)
        while (i < sheetData.length) {
            const row = sheetData[i];
            if (this.isTableHeader(row)) {
                break;
            }
            i++;
        }

        // Extract table data
        while (i < sheetData.length) {
            const row = sheetData[i];

            // Stop if we hit another section header or empty rows
            if (this.isNewSection(row) || this.isEmptyRow(row)) {
                break;
            }

            sectionData.push(row);
            i++;
        }

        return sectionData;
    }

    /**
     * Parse rider data from a data section
     * @param {string[][]} sectionData - Section data to parse
     * @param {string} category - League category
     * @returns {Rider[]} Array of parsed riders
     */
    parseRiderData(sectionData, category) {
        if (!sectionData || sectionData.length === 0) {
            return [];
        }

        // Find header row and column indices
        const headerInfo = this.findColumnIndices(sectionData[0]);
        if (!headerInfo.valid) {
            console.warn('Could not identify column structure for category:', category);
            return [];
        }

        const riders = [];

        // Pre-allocate array for better performance with large datasets
        const estimatedSize = Math.max(0, sectionData.length - 1);
        riders.length = 0; // Ensure clean start

        // Parse data rows (skip header) - optimized for large datasets
        for (let i = 1; i < sectionData.length; i++) {
            const row = sectionData[i];

            // Quick empty/section check without function calls for performance
            if (!row || row.length === 0 || row.every(cell => !cell || cell.trim() === '')) {
                continue;
            }

            const rider = this.parseRiderRow(row, headerInfo, category);
            if (rider && this.validateRider(rider)) {
                riders.push(rider);
            }

            // Yield control periodically for very large datasets
            if (i % 1000 === 0 && sectionData.length > 5000) {
                // Use setTimeout to yield control without await in non-async function
                setTimeout(() => { }, 0);
            }
        }

        return riders;
    }

    /**
     * Find column indices based on header row
     * @param {string[]} headerRow - Header row data
     * @returns {Object} Column indices and validity flag
     */
    findColumnIndices(headerRow) {
        const indices = {
            position: -1,
            firstName: -1,
            lastName: -1,
            name: -1,
            points: -1,
            club: -1,
            valid: false
        };

        for (let i = 0; i < headerRow.length; i++) {
            const header = headerRow[i].toLowerCase().trim();

            // Skip empty headers (common in Google Sheets exports)
            if (!header) continue;

            // Handle the specific format of this sheet
            if (header === 'first name') {
                indices.firstName = i;
            } else if (header === 'last name') {
                indices.lastName = i;
            } else if (header === 'total') {
                indices.points = i;
            } else if (header === 'ci club') {
                indices.club = i;
            } else if (this.columnPatterns.position.test(header)) {
                indices.position = i;
            } else if (this.columnPatterns.name.test(header)) {
                indices.name = i;
            } else if (this.columnPatterns.points.test(header)) {
                indices.points = i;
            } else if (this.columnPatterns.club.test(header)) {
                indices.club = i;
            }
        }

        // For this format, we need:
        // 1. firstName + lastName + points, OR
        // 2. just lastName + points (for Dev League format), OR  
        // 3. single name column + points
        indices.valid = (indices.firstName >= 0 && indices.lastName >= 0 && indices.points >= 0) ||
            (indices.lastName >= 0 && indices.points >= 0) ||
            (indices.name >= 0 && indices.points >= 0);
            
        console.log('Column analysis for header:', headerRow);
        console.log('Found indices:', indices);
        console.log('Valid structure:', indices.valid);

        return indices;
    }

    /**
     * Parse a single rider row
     * @param {string[]} row - Row data
     * @param {Object} columnIndices - Column index mapping
     * @param {string} category - League category
     * @returns {Rider|null} Parsed rider or null if invalid
     */
    parseRiderRow(row, columnIndices, category) {
        try {
            let name = '';

            // Handle firstName + lastName format
            if (columnIndices.firstName >= 0 && columnIndices.lastName >= 0) {
                const firstName = row[columnIndices.firstName]?.trim() || '';
                const lastName = row[columnIndices.lastName]?.trim() || '';
                name = `${firstName} ${lastName}`.trim();
            } else if (columnIndices.lastName >= 0) {
                // Handle case where there's only lastName column (Dev League format)
                name = row[columnIndices.lastName]?.trim() || '';
            } else if (columnIndices.name >= 0) {
                name = row[columnIndices.name]?.trim() || '';
            }

            if (!name) {
                return null;
            }

            const position = columnIndices.position >= 0 ?
                parseInt(row[columnIndices.position]) || 0 : 0;

            const points = columnIndices.points >= 0 ?
                parseFloat(row[columnIndices.points]) || 0 : 0;

            const club = columnIndices.club >= 0 ?
                row[columnIndices.club]?.trim() : '';

            return {
                name,
                position,
                points,
                club: club || undefined,
                category
            };
        } catch (error) {
            console.warn('Error parsing rider row:', error, row);
            return null;
        }
    }

    /**
     * Validate rider data structure
     * @param {any} data - Data to validate
     * @returns {boolean} True if valid rider data
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Check if it's RawSheetData
        if (data.sheets && Array.isArray(data.sheets) && data.extractedAt) {
            return data.sheets.every(sheet =>
                sheet.name && Array.isArray(sheet.data)
            );
        }

        return false;
    }

    /**
     * Validate a single rider object
     * @param {Rider} rider - Rider to validate
     * @returns {boolean} True if valid
     */
    validateRider(rider) {
        return rider &&
            typeof rider.name === 'string' &&
            rider.name.length > 0 &&
            typeof rider.position === 'number' &&
            typeof rider.points === 'number' &&
            typeof rider.category === 'string';
    }

    /**
     * Check if a row is a table header
     * @param {string[]} row - Row to check
     * @returns {boolean} True if appears to be a header
     */
    isTableHeader(row) {
        if (!row || row.length === 0) return false;

        const rowText = row.join(' ').toLowerCase();
        return /position|name|points|rider/.test(rowText);
    }

    /**
     * Check if a row indicates a new section
     * @param {string[]} row - Row to check
     * @returns {boolean} True if appears to be a new section
     */
    isNewSection(row) {
        if (!row || row.length === 0) return false;

        const rowText = row.join(' ').toLowerCase();
        return /league|prime|sprint|table/.test(rowText) &&
            row.filter(cell => cell.trim()).length <= 2;
    }

    /**
     * Check if a row is empty or contains only whitespace
     * @param {string[]} row - Row to check
     * @returns {boolean} True if empty
     */
    isEmptyRow(row) {
        return !row || row.every(cell => !cell || cell.trim() === '');
    }
}

export { RiderDataParser };