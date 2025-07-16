/**
 * @fileoverview JavaScript unit tests for Top Riders data extraction
 * These tests can be run in the browser console to verify functionality
 */

import { GoogleSheetsExtractor } from './google-sheets-extractor.js';
import { RiderDataParser } from './rider-data-parser.js';
import { RankingEngine } from './ranking-engine.js';

/**
 * Mock data for testing
 */
const mockCsvData = `First Name,Last Name,Total,CI Club
John,Doe,150,Test Club
Jane,Smith,140,Another Club
Bob,Johnson,130,Third Club
Alice,Brown,120,Fourth Club
Charlie,Wilson,110,Fifth Club`;

const mockRawSheetData = {
    sheets: [
        {
            name: 'Main League',
            data: [
                ['First Name', 'Last Name', 'Total', 'CI Club'],
                ['John', 'Doe', '150', 'Test Club'],
                ['Jane', 'Smith', '140', 'Another Club'],
                ['Bob', 'Johnson', '130', 'Third Club']
            ]
        },
        {
            name: 'Dev League',
            data: [
                ['First Name', 'Last Name', 'Total', 'CI Club'],
                ['Alice', 'Brown', '120', 'Fourth Club'],
                ['Charlie', 'Wilson', '110', 'Fifth Club']
            ]
        }
    ],
    extractedAt: new Date()
};

/**
 * Test suite for data extraction functionality
 */
class TopRidersTestSuite {
    constructor() {
        this.extractor = new GoogleSheetsExtractor();
        this.parser = new RiderDataParser();
        this.rankingEngine = new RankingEngine();
        this.testResults = [];
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Top Riders Test Suite...');
        
        this.testSpreadsheetIdExtraction();
        this.testCsvParsing();
        this.testDataStructureValidation();
        this.testRiderDataParsing();
        this.testRankingEngine();
        await this.testNetworkErrorHandling();
        
        this.printResults();
    }

    /**
     * Test spreadsheet ID extraction
     */
    testSpreadsheetIdExtraction() {
        const testName = 'Spreadsheet ID Extraction';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            const testUrls = [
                {
                    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml',
                    expected: '2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp'
                }
            ];

            let passed = 0;
            let total = testUrls.length;

            testUrls.forEach(test => {
                const result = this.extractor.extractSpreadsheetId(test.url);
                if (result === test.expected) {
                    console.log(`✅ URL parsing: ${test.url.substring(0, 50)}...`);
                    passed++;
                } else {
                    console.log(`❌ URL parsing failed. Expected: ${test.expected}, Got: ${result}`);
                }
            });

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test CSV parsing functionality
     */
    testCsvParsing() {
        const testName = 'CSV Parsing';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            const parsed = this.extractor.parseCSVText(mockCsvData);
            
            const expectedRows = 6; // Header + 5 data rows
            const expectedCols = 4; // First Name, Last Name, Total, CI Club
            
            let passed = 0;
            let total = 3;

            // Test row count
            if (parsed.length === expectedRows) {
                console.log(`✅ Row count correct: ${parsed.length}`);
                passed++;
            } else {
                console.log(`❌ Row count incorrect. Expected: ${expectedRows}, Got: ${parsed.length}`);
            }

            // Test column count
            if (parsed[0] && parsed[0].length === expectedCols) {
                console.log(`✅ Column count correct: ${parsed[0].length}`);
                passed++;
            } else {
                console.log(`❌ Column count incorrect. Expected: ${expectedCols}, Got: ${parsed[0]?.length}`);
            }

            // Test data content
            if (parsed[1] && parsed[1][0] === 'John' && parsed[1][1] === 'Doe') {
                console.log(`✅ Data content correct`);
                passed++;
            } else {
                console.log(`❌ Data content incorrect. Got: ${parsed[1]}`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test data structure validation
     */
    testDataStructureValidation() {
        const testName = 'Data Structure Validation';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test valid data structure
            if (this.parser.validateDataStructure(mockRawSheetData)) {
                console.log(`✅ Valid data structure accepted`);
                passed++;
            } else {
                console.log(`❌ Valid data structure rejected`);
            }

            // Test invalid data structure (null)
            if (!this.parser.validateDataStructure(null)) {
                console.log(`✅ Null data structure rejected`);
                passed++;
            } else {
                console.log(`❌ Null data structure accepted`);
            }

            // Test invalid data structure (missing sheets)
            if (!this.parser.validateDataStructure({ extractedAt: new Date() })) {
                console.log(`✅ Invalid data structure rejected`);
                passed++;
            } else {
                console.log(`❌ Invalid data structure accepted`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test rider data parsing
     */
    testRiderDataParsing() {
        const testName = 'Rider Data Parsing';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Test Main League parsing
            const mainLeague = this.parser.parseMainLeague(mockRawSheetData);
            if (mainLeague.length === 3) {
                console.log(`✅ Main League parsing: ${mainLeague.length} riders`);
                passed++;
            } else {
                console.log(`❌ Main League parsing failed. Expected: 3, Got: ${mainLeague.length}`);
            }

            // Test Development League parsing
            const devLeague = this.parser.parseDevelopmentLeague(mockRawSheetData);
            if (devLeague.length === 2) {
                console.log(`✅ Dev League parsing: ${devLeague.length} riders`);
                passed++;
            } else {
                console.log(`❌ Dev League parsing failed. Expected: 2, Got: ${devLeague.length}`);
            }

            // Test rider object structure
            if (mainLeague.length > 0) {
                const rider = mainLeague[0];
                if (rider.name && rider.points && rider.category) {
                    console.log(`✅ Rider object structure correct`);
                    passed++;
                } else {
                    console.log(`❌ Rider object structure incorrect:`, rider);
                }
            }

            // Test rider validation
            if (mainLeague.length > 0) {
                const isValid = this.parser.validateRider(mainLeague[0]);
                if (isValid) {
                    console.log(`✅ Rider validation works`);
                    passed++;
                } else {
                    console.log(`❌ Rider validation failed for valid rider`);
                }
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test ranking engine functionality
     */
    testRankingEngine() {
        const testName = 'Ranking Engine';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Create test riders
            const testRiders = [
                { name: 'John', points: 150, position: 1, category: 'ML' },
                { name: 'Jane', points: 140, position: 2, category: 'ML' },
                { name: 'Bob', points: 130, position: 3, category: 'ML' },
                { name: 'Alice', points: 120, position: 4, category: 'ML' }
            ];

            // Test sorting by points
            const sorted = this.rankingEngine.sortByPoints(testRiders);
            if (sorted[0].name === 'John' && sorted[0].points === 150) {
                console.log(`✅ Sorting by points works`);
                passed++;
            } else {
                console.log(`❌ Sorting by points failed. Top rider:`, sorted[0]);
            }

            // Test getting top N riders
            const top2 = this.rankingEngine.getTopRiders(testRiders, 2);
            if (top2.length === 2 && top2[0].name === 'John') {
                console.log(`✅ Getting top N riders works`);
                passed++;
            } else {
                console.log(`❌ Getting top N riders failed:`, top2);
            }

            // Test filtering valid entries
            const mixedRiders = [
                ...testRiders,
                { name: '', points: 100, position: 5, category: 'ML' }, // Invalid: empty name
                { name: 'Invalid', points: 'not-a-number', position: 6, category: 'ML' } // Invalid: non-numeric points
            ];
            
            const validRiders = this.rankingEngine.filterValidEntries(mixedRiders);
            if (validRiders.length === 4) {
                console.log(`✅ Filtering valid entries works`);
                passed++;
            } else {
                console.log(`❌ Filtering valid entries failed. Expected: 4, Got: ${validRiders.length}`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Test network error handling
     */
    async testNetworkErrorHandling() {
        const testName = 'Network Error Handling';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 2;

            // Test timeout handling
            const shortTimeoutExtractor = new GoogleSheetsExtractor({ timeout: 1 }); // 1ms timeout
            
            try {
                await shortTimeoutExtractor.fetchWithTimeout('https://httpstat.us/200?sleep=1000');
                console.log(`❌ Timeout should have occurred`);
            } catch (error) {
                if (error.message.includes('timeout') || error.name === 'AbortError') {
                    console.log(`✅ Timeout handling works`);
                    passed++;
                } else {
                    console.log(`❌ Unexpected error type:`, error);
                }
            }

            // Test invalid URL handling
            try {
                const result = this.extractor.extractSpreadsheetId('invalid-url');
                if (result === null) {
                    console.log(`✅ Invalid URL handling works`);
                    passed++;
                } else {
                    console.log(`❌ Invalid URL should return null, got:`, result);
                }
            } catch (error) {
                console.log(`✅ Invalid URL handling works (threw error)`);
                passed++;
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed === total
            });

        } catch (error) {
            console.error(`❌ ${testName} failed:`, error);
            this.testResults.push({
                name: testName,
                passed: 0,
                total: 1,
                success: false,
                error: error.message
            });
        }
    }

    /**
     * Print test results summary
     */
    printResults() {
        console.log('\n🏁 Test Results Summary');
        console.log('========================');
        
        let totalPassed = 0;
        let totalTests = 0;
        
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.name}: ${result.passed}/${result.total} passed`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
            totalPassed += result.passed;
            totalTests += result.total;
        });
        
        console.log('========================');
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed === totalTests) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the logs above.');
        }
    }
}

// Export for use
export { TopRidersTestSuite };

// Make available globally for manual testing
window.TopRidersTestSuite = TopRidersTestSuite;