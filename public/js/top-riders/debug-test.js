/**
 * @fileoverview Debug test for Top Riders data extraction
 * This file helps test the data extraction process step by step
 */

import { GoogleSheetsExtractor } from './google-sheets-extractor.js';
import { RiderDataParser } from './rider-data-parser.js';

/**
 * Test the Google Sheets data extraction
 */
async function testDataExtraction() {
    console.log('=== Starting Top Riders Debug Test ===');
    
    const extractor = new GoogleSheetsExtractor();
    const parser = new RiderDataParser();
    
    const testUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml';
    
    try {
        console.log('1. Testing spreadsheet ID extraction...');
        const spreadsheetId = extractor.extractSpreadsheetId(testUrl);
        console.log('Extracted spreadsheet ID:', spreadsheetId);
        
        if (!spreadsheetId) {
            console.error('Failed to extract spreadsheet ID');
            return;
        }
        
        console.log('2. Testing individual sheet access...');
        
        // Test accessing one sheet at a time
        const testConfigs = [
            { name: 'Main League', gid: '2052107479' },
            { name: 'ML Primes', gid: '394788670' },
            { name: 'Dev League', gid: '732061928' },
            { name: 'DL Primes', gid: '1028354950' }
        ];
        
        for (const config of testConfigs) {
            console.log(`\n--- Testing ${config.name} ---`);
            const csvUrl = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv&gid=${config.gid}`;
            console.log('CSV URL:', csvUrl);
            
            try {
                const response = await fetch(csvUrl);
                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));
                
                if (response.ok) {
                    const text = await response.text();
                    console.log('Response length:', text.length);
                    console.log('First 300 characters:', text.substring(0, 300));
                    
                    // Try to parse the CSV
                    const lines = text.split('\n');
                    console.log('Number of lines:', lines.length);
                    
                    if (lines.length > 0) {
                        console.log('First line (header):', lines[0]);
                    }
                    if (lines.length > 1) {
                        console.log('Second line (first data):', lines[1]);
                    }
                } else {
                    console.error('Failed to fetch:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('Error fetching sheet:', error);
            }
        }
        
        console.log('\n3. Testing full data extraction...');
        const rawData = await extractor.extractSheetData(testUrl);
        console.log('Raw data structure:', rawData);
        
        if (rawData && rawData.sheets) {
            console.log('Number of sheets extracted:', rawData.sheets.length);
            rawData.sheets.forEach(sheet => {
                console.log(`Sheet "${sheet.name}": ${sheet.data.length} rows`);
            });
        }
        
        console.log('\n4. Testing data parsing...');
        if (rawData) {
            const mainLeague = parser.parseMainLeague(rawData);
            console.log('Main League riders:', mainLeague.length);
            if (mainLeague.length > 0) {
                console.log('Sample rider:', mainLeague[0]);
            }
            
            const devLeague = parser.parseDevelopmentLeague(rawData);
            console.log('Dev League riders:', devLeague.length);
            if (devLeague.length > 0) {
                console.log('Sample rider:', devLeague[0]);
            }
            
            const primes = parser.parsePrimeTables(rawData);
            console.log('Prime 1 riders:', primes.prime1.length);
            console.log('Prime 2 riders:', primes.prime2.length);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
    
    console.log('=== Debug Test Complete ===');
}

// Export for manual testing
window.testTopRidersDataExtraction = testDataExtraction;

export { testDataExtraction };