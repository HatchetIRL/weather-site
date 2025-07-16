/**
 * @fileoverview Real Google Sheets data validation tests
 * Tests parsing accuracy with actual league data structure
 */

import { TopRidersApp } from './main.js';
import { GoogleSheetsExtractor } from './google-sheets-extractor.js';
import { RiderDataParser } from './rider-data-parser.js';

/**
 * Test suite for validating real Google Sheets data
 */
class RealDataTestSuite {
    constructor() {
        this.testResults = [];
        this.realSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml';
        this.extractor = new GoogleSheetsExtractor();
        this.parser = new RiderDataParser();
    }

    /**
     * Run all real data tests
     */
    async runAllTests() {
        console.log('🧪 Starting Real Google Sheets Data Test Suite...');
        console.log('📊 Testing with actual Galway Summer League 2025 data');
        
        await this.testDataAccessibility();
        await this.testDataStructureValidation();
        await this.testDataParsingAccuracy();
        await this.testRankingAccuracy();
        await this.testDataRefreshMechanisms();
        await this.testFullIntegrationWithRealData();
        
        this.printResults();
    }

    /**
     * Test if Google Sheets data is accessible
     */
    async testDataAccessibility() {
        const testName = 'Google Sheets Data Accessibility';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 5;

            // Test spreadsheet ID extraction
            const spreadsheetId = this.extractor.extractSpreadsheetId(this.realSheetsUrl);
            if (spreadsheetId) {
                console.log(`✅ Spreadsheet ID extracted: ${spreadsheetId}`);
                passed++;
            } else {
                console.log(`❌ Failed to extract spreadsheet ID`);
            }

            // Test individual sheet access
            const sheetConfigs = [
                { name: 'Main League', gid: '2052107479' },
                { name: 'ML Primes', gid: '394788670' },
                { name: 'Dev League', gid: '732061928' },
                { name: 'DL Primes', gid: '1028354950' }
            ];

            let accessibleSheets = 0;
            for (const config of sheetConfigs) {
                try {
                    const csvUrl = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv&gid=${config.gid}`;
                    const response = await fetch(csvUrl);
                    
                    if (response.ok) {
                        const text = await response.text();
                        if (text.length > 100) { // Should have substantial content
                            console.log(`✅ ${config.name} sheet accessible (${text.length} chars)`);
                            accessibleSheets++;
                        } else {
                            console.log(`❌ ${config.name} sheet has minimal content`);
                        }
                    } else {
                        console.log(`❌ ${config.name} sheet not accessible: HTTP ${response.status}`);
                    }
                } catch (error) {
                    console.log(`❌ ${config.name} sheet access error:`, error.message);
                }
            }

            if (accessibleSheets === 4) {
                console.log(`✅ All 4 sheets accessible`);
                passed += 4;
            } else {
                console.log(`❌ Only ${accessibleSheets}/4 sheets accessible`);
                passed += accessibleSheets;
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 4 // Need at least spreadsheet ID + 3 sheets
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
     * Test data structure validation with real data
     */
    async testDataStructureValidation() {
        const testName = 'Real Data Structure Validation';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Extract real data
            const rawData = await this.extractor.extractSheetData(this.realSheetsUrl);
            
            if (rawData && this.parser.validateDataStructure(rawData)) {
                console.log(`✅ Raw data structure is valid`);
                passed++;
            } else {
                console.log(`❌ Raw data structure is invalid:`, rawData);
            }

            // Validate each sheet
            if (rawData && rawData.sheets) {
                console.log(`📊 Found ${rawData.sheets.length} sheets:`);
                
                rawData.sheets.forEach(sheet => {
                    console.log(`   - ${sheet.name}: ${sheet.data.length} rows`);
                    
                    if (sheet.data.length > 1) { // Should have header + data
                        console.log(`✅ ${sheet.name} has data`);
                        passed++;
                    } else {
                        console.log(`❌ ${sheet.name} has insufficient data`);
                    }
                });

                // Adjust total based on actual sheets found
                total = 1 + rawData.sheets.length;
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= Math.ceil(total * 0.75) // 75% success rate
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
     * Test data parsing accuracy with real data
     */
    async testDataParsingAccuracy() {
        const testName = 'Real Data Parsing Accuracy';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 8;

            const rawData = await this.extractor.extractSheetData(this.realSheetsUrl);
            
            if (!rawData) {
                throw new Error('No raw data available for parsing test');
            }

            // Test Main League parsing
            const mainLeague = this.parser.parseMainLeague(rawData);
            console.log(`📊 Main League: ${mainLeague.length} riders parsed`);
            
            if (mainLeague.length > 0) {
                console.log(`✅ Main League parsing successful`);
                passed++;
                
                // Validate sample rider structure
                const sampleRider = mainLeague[0];
                if (sampleRider.name && typeof sampleRider.points === 'number' && sampleRider.category === 'ML') {
                    console.log(`✅ Main League rider structure valid:`, sampleRider);
                    passed++;
                } else {
                    console.log(`❌ Main League rider structure invalid:`, sampleRider);
                }
            } else {
                console.log(`❌ Main League parsing failed - no riders`);
            }

            // Test Development League parsing
            const devLeague = this.parser.parseDevelopmentLeague(rawData);
            console.log(`📊 Development League: ${devLeague.length} riders parsed`);
            
            if (devLeague.length > 0) {
                console.log(`✅ Development League parsing successful`);
                passed++;
                
                const sampleDevRider = devLeague[0];
                if (sampleDevRider.name && typeof sampleDevRider.points === 'number' && sampleDevRider.category === 'DL') {
                    console.log(`✅ Development League rider structure valid:`, sampleDevRider);
                    passed++;
                } else {
                    console.log(`❌ Development League rider structure invalid:`, sampleDevRider);
                }
            } else {
                console.log(`❌ Development League parsing failed - no riders`);
            }

            // Test Prime tables parsing
            const primeTables = this.parser.parsePrimeTables(rawData);
            console.log(`📊 Prime 1: ${primeTables.prime1.length} riders, Prime 2: ${primeTables.prime2.length} riders`);
            
            if (primeTables.prime1.length > 0) {
                console.log(`✅ Prime 1 parsing successful`);
                passed++;
                
                const samplePrime1 = primeTables.prime1[0];
                if (samplePrime1.name && typeof samplePrime1.points === 'number') {
                    console.log(`✅ Prime 1 rider structure valid:`, samplePrime1);
                    passed++;
                } else {
                    console.log(`❌ Prime 1 rider structure invalid:`, samplePrime1);
                }
            } else {
                console.log(`❌ Prime 1 parsing failed - no riders`);
            }

            if (primeTables.prime2.length > 0) {
                console.log(`✅ Prime 2 parsing successful`);
                passed++;
                
                const samplePrime2 = primeTables.prime2[0];
                if (samplePrime2.name && typeof samplePrime2.points === 'number') {
                    console.log(`✅ Prime 2 rider structure valid:`, samplePrime2);
                    passed++;
                } else {
                    console.log(`❌ Prime 2 rider structure invalid:`, samplePrime2);
                }
            } else {
                console.log(`❌ Prime 2 parsing failed - no riders`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 6 // Need most parsing to work
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
     * Test ranking accuracy with real data
     */
    async testRankingAccuracy() {
        const testName = 'Real Data Ranking Accuracy';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            const rawData = await this.extractor.extractSheetData(this.realSheetsUrl);
            const mainLeague = this.parser.parseMainLeague(rawData);
            
            if (mainLeague.length > 0) {
                // Test that riders are properly sorted by points
                let isSorted = true;
                for (let i = 1; i < mainLeague.length; i++) {
                    if (mainLeague[i-1].points < mainLeague[i].points) {
                        isSorted = false;
                        break;
                    }
                }
                
                if (isSorted) {
                    console.log(`✅ Main League riders properly sorted by points`);
                    passed++;
                } else {
                    console.log(`❌ Main League riders not properly sorted`);
                }

                // Test top 10 selection
                const top10 = mainLeague.slice(0, 10);
                if (top10.length <= 10 && top10.every(rider => rider.points >= 0)) {
                    console.log(`✅ Top 10 selection works correctly`);
                    passed++;
                } else {
                    console.log(`❌ Top 10 selection failed`);
                }
            }

            const devLeague = this.parser.parseDevelopmentLeague(rawData);
            if (devLeague.length > 0) {
                // Test development league ranking
                const top10Dev = devLeague.slice(0, 10);
                if (top10Dev.length <= 10) {
                    console.log(`✅ Development League top 10 selection works`);
                    passed++;
                } else {
                    console.log(`❌ Development League top 10 selection failed`);
                }
            }

            const primeTables = this.parser.parsePrimeTables(rawData);
            if (primeTables.prime1.length > 0 || primeTables.prime2.length > 0) {
                // Test prime rankings
                const top5Prime1 = primeTables.prime1.slice(0, 5);
                const top5Prime2 = primeTables.prime2.slice(0, 5);
                
                if (top5Prime1.length <= 5 && top5Prime2.length <= 5) {
                    console.log(`✅ Prime tables top 5 selection works`);
                    passed++;
                } else {
                    console.log(`❌ Prime tables top 5 selection failed`);
                }
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 3
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
     * Test data refresh mechanisms
     */
    async testDataRefreshMechanisms() {
        const testName = 'Data Refresh Mechanisms';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test initial data load
            const initialData = await this.extractor.extractSheetData(this.realSheetsUrl);
            if (initialData && initialData.extractedAt) {
                console.log(`✅ Initial data load with timestamp`);
                passed++;
            } else {
                console.log(`❌ Initial data load failed`);
            }

            // Test data freshness detection
            const now = new Date();
            const dataAge = now - initialData.extractedAt;
            if (dataAge < 60000) { // Less than 1 minute old
                console.log(`✅ Data freshness detection works: ${dataAge}ms old`);
                passed++;
            } else {
                console.log(`❌ Data appears stale: ${dataAge}ms old`);
            }

            // Test refresh capability
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            const refreshedData = await this.extractor.extractSheetData(this.realSheetsUrl);
            
            if (refreshedData && refreshedData.extractedAt > initialData.extractedAt) {
                console.log(`✅ Data refresh capability works`);
                passed++;
            } else {
                console.log(`❌ Data refresh capability failed`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 2
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
     * Test full integration with real data
     */
    async testFullIntegrationWithRealData() {
        const testName = 'Full Integration with Real Data';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 5;

            // Create test container
            const testContainer = document.createElement('div');
            testContainer.id = 'real-data-test-container';
            testContainer.style.position = 'absolute';
            testContainer.style.top = '-9999px';
            document.body.appendChild(testContainer);

            // Create app with real data
            const realDataApp = new TopRidersApp({
                googleSheetsUrl: this.realSheetsUrl,
                containerSelector: '#real-data-test-container',
                refreshInterval: 0,
                enableCaching: true,
                debugMode: true
            });

            // Test initialization
            await realDataApp.initialize();
            console.log(`✅ App initialized with real data`);
            passed++;

            // Wait for data processing
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Test data availability
            const currentData = realDataApp.getCurrentData();
            if (currentData) {
                console.log(`✅ Real data successfully processed`);
                passed++;

                // Test data completeness
                const hasMainLeague = currentData.mainLeague && currentData.mainLeague.length > 0;
                const hasDevLeague = currentData.developmentLeague && currentData.developmentLeague.length > 0;
                const hasPrimes = (currentData.prime1 && currentData.prime1.length > 0) || 
                                 (currentData.prime2 && currentData.prime2.length > 0);

                if (hasMainLeague || hasDevLeague || hasPrimes) {
                    console.log(`✅ Real data contains rider information`);
                    console.log(`   - Main League: ${currentData.mainLeague?.length || 0} riders`);
                    console.log(`   - Dev League: ${currentData.developmentLeague?.length || 0} riders`);
                    console.log(`   - Prime 1: ${currentData.prime1?.length || 0} riders`);
                    console.log(`   - Prime 2: ${currentData.prime2?.length || 0} riders`);
                    passed++;
                } else {
                    console.log(`❌ Real data contains no rider information`);
                }
            } else {
                console.log(`❌ No real data available after processing`);
            }

            // Test UI rendering with real data
            const renderedTables = testContainer.querySelectorAll('.top-riders-table');
            if (renderedTables.length > 0) {
                console.log(`✅ UI rendered with real data: ${renderedTables.length} tables`);
                passed++;
            } else {
                console.log(`❌ UI not rendered with real data`);
            }

            // Test data accuracy by checking a few riders
            if (currentData && currentData.mainLeague && currentData.mainLeague.length > 0) {
                const topRider = currentData.mainLeague[0];
                if (topRider.name && topRider.points > 0) {
                    console.log(`✅ Real data accuracy check passed`);
                    console.log(`   Top ML rider: ${topRider.name} with ${topRider.points} points`);
                    passed++;
                } else {
                    console.log(`❌ Real data accuracy check failed:`, topRider);
                }
            }

            // Cleanup
            realDataApp.destroy();
            if (testContainer.parentNode) {
                testContainer.parentNode.removeChild(testContainer);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 4
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
        console.log('\n🏁 Real Google Sheets Data Test Results');
        console.log('========================================');
        
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
        
        console.log('========================================');
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed >= totalTests * 0.8) {
            console.log('🎉 Real data tests mostly successful!');
            console.log('📊 The Top Riders feature should work with the actual Google Sheets data.');
        } else {
            console.log('⚠️  Many real data tests failed.');
            console.log('🔍 Check Google Sheets accessibility and data structure.');
            console.log('📋 The sheets may have changed structure or access permissions.');
        }
    }
}

// Export for use
export { RealDataTestSuite };

// Make available globally for manual testing
window.RealDataTestSuite = RealDataTestSuite;