/**
 * @fileoverview Unit tests for Top Riders data processing functionality
 * Tests parsing, ranking, and edge case handling
 */

import { RiderDataParser } from './rider-data-parser.js';
import { RankingEngine } from './ranking-engine.js';
import { LEAGUE_CATEGORIES } from './constants.js';

/**
 * Test suite for data processing functionality
 */
class DataProcessingTestSuite {
    constructor() {
        this.parser = new RiderDataParser();
        this.rankingEngine = new RankingEngine();
        this.testResults = [];
    }

    /**
     * Run all data processing tests
     */
    runAllTests() {
        console.log('🧪 Starting Data Processing Test Suite...');
        
        this.testParserWithVariousDataStructures();
        this.testParserEdgeCases();
        this.testRankingWithTiedScores();
        this.testRankingEdgeCases();
        this.testDataValidation();
        this.testLargeDatasets();
        
        this.printResults();
    }

    /**
     * Test parser with various Google Sheets data structures
     */
    testParserWithVariousDataStructures() {
        const testName = 'Parser Data Structure Handling';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Test standard format with First Name, Last Name columns
            const standardFormat = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['First Name', 'Last Name', 'Total', 'CI Club'],
                        ['John', 'Doe', '150', 'Test Club'],
                        ['Jane', 'Smith', '140', 'Another Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const standardRiders = this.parser.parseMainLeague(standardFormat);
            if (standardRiders.length === 2 && standardRiders[0].name === 'John Doe') {
                console.log(`✅ Standard format parsing works`);
                passed++;
            } else {
                console.log(`❌ Standard format parsing failed:`, standardRiders);
            }

            // Test format with single Name column
            const singleNameFormat = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['Name', 'Points', 'Club'],
                        ['John Doe', '150', 'Test Club'],
                        ['Jane Smith', '140', 'Another Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const singleNameRiders = this.parser.parseMainLeague(singleNameFormat);
            if (singleNameRiders.length === 2 && singleNameRiders[0].name === 'John Doe') {
                console.log(`✅ Single name format parsing works`);
                passed++;
            } else {
                console.log(`❌ Single name format parsing failed:`, singleNameRiders);
            }

            // Test format with different column names
            const altColumnFormat = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['Rider', 'Pts', 'Team'],
                        ['John Doe', '150', 'Test Club'],
                        ['Jane Smith', '140', 'Another Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const altColumnRiders = this.parser.parseMainLeague(altColumnFormat);
            if (altColumnRiders.length === 2) {
                console.log(`✅ Alternative column names parsing works`);
                passed++;
            } else {
                console.log(`❌ Alternative column names parsing failed:`, altColumnRiders);
            }

            // Test empty data handling
            const emptyFormat = {
                sheets: [{
                    name: 'Main League',
                    data: []
                }],
                extractedAt: new Date()
            };

            const emptyRiders = this.parser.parseMainLeague(emptyFormat);
            if (emptyRiders.length === 0) {
                console.log(`✅ Empty data handling works`);
                passed++;
            } else {
                console.log(`❌ Empty data handling failed:`, emptyRiders);
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
     * Test parser edge cases
     */
    testParserEdgeCases() {
        const testName = 'Parser Edge Cases';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 5;

            // Test malformed data (missing values)
            const malformedData = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['First Name', 'Last Name', 'Total', 'CI Club'],
                        ['John', 'Doe', '150', 'Test Club'],
                        ['', 'Smith', '140', 'Another Club'], // Missing first name
                        ['Bob', '', '130', 'Third Club'], // Missing last name
                        ['Alice', 'Brown', '', 'Fourth Club'], // Missing points
                        ['Charlie', 'Wilson', 'invalid', 'Fifth Club'] // Invalid points
                    ]
                }],
                extractedAt: new Date()
            };

            const malformedRiders = this.parser.parseMainLeague(malformedData);
            // Should only get valid riders (John Doe and Bob)
            if (malformedRiders.length >= 1) {
                console.log(`✅ Malformed data filtering works: ${malformedRiders.length} valid riders`);
                passed++;
            } else {
                console.log(`❌ Malformed data filtering failed:`, malformedRiders);
            }

            // Test special characters in names
            const specialCharsData = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['First Name', 'Last Name', 'Total', 'CI Club'],
                        ['José', 'García', '150', 'Test Club'],
                        ["O'Connor", 'Patrick', '140', 'Another Club'],
                        ['Jean-Luc', 'Picard', '130', 'Third Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const specialCharsRiders = this.parser.parseMainLeague(specialCharsData);
            if (specialCharsRiders.length === 3) {
                console.log(`✅ Special characters handling works`);
                passed++;
            } else {
                console.log(`❌ Special characters handling failed:`, specialCharsRiders);
            }

            // Test very large point values
            const largePointsData = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['First Name', 'Last Name', 'Total', 'CI Club'],
                        ['John', 'Doe', '999999', 'Test Club'],
                        ['Jane', 'Smith', '0.5', 'Another Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const largePointsRiders = this.parser.parseMainLeague(largePointsData);
            if (largePointsRiders.length === 2 && largePointsRiders[0].points === 999999) {
                console.log(`✅ Large point values handling works`);
                passed++;
            } else {
                console.log(`❌ Large point values handling failed:`, largePointsRiders);
            }

            // Test duplicate names
            const duplicateNamesData = {
                sheets: [{
                    name: 'Main League',
                    data: [
                        ['First Name', 'Last Name', 'Total', 'CI Club'],
                        ['John', 'Doe', '150', 'Test Club'],
                        ['John', 'Doe', '140', 'Another Club'], // Duplicate name
                        ['Jane', 'Smith', '130', 'Third Club']
                    ]
                }],
                extractedAt: new Date()
            };

            const duplicateNamesRiders = this.parser.parseMainLeague(duplicateNamesData);
            if (duplicateNamesRiders.length === 3) {
                console.log(`✅ Duplicate names handling works`);
                passed++;
            } else {
                console.log(`❌ Duplicate names handling failed:`, duplicateNamesRiders);
            }

            // Test missing sheet
            const missingSheetData = {
                sheets: [{
                    name: 'Different Sheet',
                    data: [['Header'], ['Data']]
                }],
                extractedAt: new Date()
            };

            const missingSheetRiders = this.parser.parseMainLeague(missingSheetData);
            if (missingSheetRiders.length === 0) {
                console.log(`✅ Missing sheet handling works`);
                passed++;
            } else {
                console.log(`❌ Missing sheet handling failed:`, missingSheetRiders);
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
     * Test ranking with tied scores
     */
    testRankingWithTiedScores() {
        const testName = 'Ranking with Tied Scores';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test riders with tied points
            const tiedRiders = [
                { name: 'Alice', points: 150, position: 1, category: 'ML' },
                { name: 'Bob', points: 150, position: 2, category: 'ML' }, // Same points, different position
                { name: 'Charlie', points: 140, position: 3, category: 'ML' },
                { name: 'David', points: 140, position: 4, category: 'ML' } // Same points, different position
            ];

            const sortedTied = this.rankingEngine.sortByPoints(tiedRiders);
            // Should sort by points first, then by position
            if (sortedTied[0].points === 150 && sortedTied[0].position === 1) {
                console.log(`✅ Tied scores sorting works`);
                passed++;
            } else {
                console.log(`❌ Tied scores sorting failed:`, sortedTied[0]);
            }

            // Test finding tied riders
            const tiedGroups = this.rankingEngine.findTiedRiders(tiedRiders);
            if (tiedGroups.length === 2 && tiedGroups[0].length === 2) {
                console.log(`✅ Finding tied riders works`);
                passed++;
            } else {
                console.log(`❌ Finding tied riders failed:`, tiedGroups);
            }

            // Test getting top riders with ties
            const top3WithTies = this.rankingEngine.getTopRiders(tiedRiders, 3);
            if (top3WithTies.length === 3 && top3WithTies[2].points >= 140) {
                console.log(`✅ Getting top riders with ties works`);
                passed++;
            } else {
                console.log(`❌ Getting top riders with ties failed:`, top3WithTies);
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
     * Test ranking edge cases
     */
    testRankingEdgeCases() {
        const testName = 'Ranking Edge Cases';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Test empty array
            const emptyTop = this.rankingEngine.getTopRiders([], 5);
            if (emptyTop.length === 0) {
                console.log(`✅ Empty array handling works`);
                passed++;
            } else {
                console.log(`❌ Empty array handling failed:`, emptyTop);
            }

            // Test requesting more riders than available
            const fewRiders = [
                { name: 'Alice', points: 150, position: 1, category: 'ML' },
                { name: 'Bob', points: 140, position: 2, category: 'ML' }
            ];
            
            const moreRequested = this.rankingEngine.getTopRiders(fewRiders, 10);
            if (moreRequested.length === 2) {
                console.log(`✅ Requesting more than available works`);
                passed++;
            } else {
                console.log(`❌ Requesting more than available failed:`, moreRequested);
            }

            // Test negative count
            const negativeCount = this.rankingEngine.getTopRiders(fewRiders, -1);
            if (negativeCount.length === 0) {
                console.log(`✅ Negative count handling works`);
                passed++;
            } else {
                console.log(`❌ Negative count handling failed:`, negativeCount);
            }

            // Test invalid rider objects
            const invalidRiders = [
                { name: 'Valid', points: 150, position: 1, category: 'ML' },
                { name: '', points: 140, position: 2, category: 'ML' }, // Invalid: empty name
                { points: 130, position: 3, category: 'ML' }, // Invalid: missing name
                { name: 'Invalid Points', points: 'not-a-number', position: 4, category: 'ML' } // Invalid: non-numeric points
            ];

            const filteredInvalid = this.rankingEngine.filterValidEntries(invalidRiders);
            if (filteredInvalid.length === 1) {
                console.log(`✅ Invalid rider filtering works`);
                passed++;
            } else {
                console.log(`❌ Invalid rider filtering failed:`, filteredInvalid);
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
     * Test data validation
     */
    testDataValidation() {
        const testName = 'Data Validation';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 6;

            // Test valid rider
            const validRider = {
                name: 'John Doe',
                points: 150,
                position: 1,
                category: 'ML',
                club: 'Test Club'
            };

            if (this.parser.validateRider(validRider)) {
                console.log(`✅ Valid rider validation works`);
                passed++;
            } else {
                console.log(`❌ Valid rider validation failed`);
            }

            // Test invalid riders
            const invalidRiders = [
                { name: '', points: 150, position: 1, category: 'ML' }, // Empty name
                { name: 'John', points: 'invalid', position: 1, category: 'ML' }, // Invalid points
                { name: 'John', points: 150, position: 'invalid', category: 'ML' }, // Invalid position
                { name: 'John', points: 150, position: 1, category: '' }, // Empty category
                null, // Null object
                { name: 'John' } // Missing required fields
            ];

            let invalidCount = 0;
            invalidRiders.forEach((rider, index) => {
                if (!this.parser.validateRider(rider)) {
                    invalidCount++;
                }
            });

            if (invalidCount === invalidRiders.length) {
                console.log(`✅ Invalid rider rejection works`);
                passed++;
            } else {
                console.log(`❌ Invalid rider rejection failed: ${invalidCount}/${invalidRiders.length}`);
            }

            // Test data structure validation
            const validStructure = {
                sheets: [{ name: 'Test', data: [['Header'], ['Data']] }],
                extractedAt: new Date()
            };

            if (this.parser.validateDataStructure(validStructure)) {
                console.log(`✅ Valid data structure validation works`);
                passed++;
            } else {
                console.log(`❌ Valid data structure validation failed`);
            }

            // Test invalid data structures
            const invalidStructures = [
                null,
                {},
                { sheets: null },
                { sheets: [], extractedAt: null },
                { sheets: [{ name: 'Test' }] } // Missing data
            ];

            let invalidStructureCount = 0;
            invalidStructures.forEach(structure => {
                if (!this.parser.validateDataStructure(structure)) {
                    invalidStructureCount++;
                }
            });

            if (invalidStructureCount === invalidStructures.length) {
                console.log(`✅ Invalid data structure rejection works`);
                passed++;
            } else {
                console.log(`❌ Invalid data structure rejection failed: ${invalidStructureCount}/${invalidStructures.length}`);
            }

            // Test rider validation with edge values
            const edgeRiders = [
                { name: 'Zero Points', points: 0, position: 1, category: 'ML' }, // Should be valid
                { name: 'Negative Points', points: -10, position: 1, category: 'ML' }, // Should be invalid
                { name: 'High Position', points: 100, position: 999, category: 'ML' }, // Should be valid
                { name: 'Invalid Position', points: 100, position: 0, category: 'ML' } // Should be invalid
            ];

            const validEdgeRiders = edgeRiders.filter(rider => this.rankingEngine.isValidRider(rider));
            if (validEdgeRiders.length === 2) {
                console.log(`✅ Edge value validation works`);
                passed++;
            } else {
                console.log(`❌ Edge value validation failed: ${validEdgeRiders.length}/2 valid`);
            }

            // Test category validation
            const categoryRiders = [
                { name: 'ML Rider', points: 100, position: 1, category: 'ML' },
                { name: 'DL Rider', points: 100, position: 1, category: 'DL' },
                { name: 'Prime1 Rider', points: 100, position: 1, category: 'Prime1' },
                { name: 'Prime2 Rider', points: 100, position: 1, category: 'Prime2' },
                { name: 'Invalid Category', points: 100, position: 1, category: 'INVALID' }
            ];

            const validCategoryRiders = categoryRiders.filter(rider => this.parser.validateRider(rider));
            if (validCategoryRiders.length === 5) { // All should be valid as we don't restrict category values in validation
                console.log(`✅ Category validation works`);
                passed++;
            } else {
                console.log(`❌ Category validation failed: ${validCategoryRiders.length}/5 valid`);
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
     * Test with large datasets
     */
    testLargeDatasets() {
        const testName = 'Large Dataset Handling';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 2;

            // Generate large dataset
            const largeDataset = [];
            const header = ['First Name', 'Last Name', 'Total', 'CI Club'];
            largeDataset.push(header);

            for (let i = 1; i <= 1000; i++) {
                largeDataset.push([
                    `Rider${i}`,
                    `LastName${i}`,
                    (Math.random() * 200).toFixed(1),
                    `Club${i % 10}`
                ]);
            }

            const largeRawData = {
                sheets: [{
                    name: 'Main League',
                    data: largeDataset
                }],
                extractedAt: new Date()
            };

            // Test parsing performance
            const startTime = performance.now();
            const largeRiders = this.parser.parseMainLeague(largeRawData);
            const parseTime = performance.now() - startTime;

            if (largeRiders.length === 1000 && parseTime < 1000) { // Should complete in under 1 second
                console.log(`✅ Large dataset parsing works: ${largeRiders.length} riders in ${parseTime.toFixed(2)}ms`);
                passed++;
            } else {
                console.log(`❌ Large dataset parsing failed: ${largeRiders.length} riders in ${parseTime.toFixed(2)}ms`);
            }

            // Test ranking performance
            const rankStartTime = performance.now();
            const top100 = this.rankingEngine.getTopRiders(largeRiders, 100);
            const rankTime = performance.now() - rankStartTime;

            if (top100.length === 100 && rankTime < 500) { // Should complete in under 0.5 seconds
                console.log(`✅ Large dataset ranking works: top ${top100.length} in ${rankTime.toFixed(2)}ms`);
                passed++;
            } else {
                console.log(`❌ Large dataset ranking failed: top ${top100.length} in ${rankTime.toFixed(2)}ms`);
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
        console.log('\n🏁 Data Processing Test Results');
        console.log('================================');
        
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
        
        console.log('================================');
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed === totalTests) {
            console.log('🎉 All data processing tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the logs above.');
        }
    }
}

// Export for use
export { DataProcessingTestSuite };

// Make available globally for manual testing
window.DataProcessingTestSuite = DataProcessingTestSuite;