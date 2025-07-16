/**
 * @fileoverview Unit tests for Top Riders UI rendering functionality
 * Tests HTML generation, responsive behavior, and error states
 */

import { TopRidersRenderer } from './top-riders-renderer.js';
import { CSS_CLASSES } from './constants.js';

/**
 * Test suite for UI rendering functionality
 */
class UIRenderingTestSuite {
    constructor() {
        this.renderer = new TopRidersRenderer();
        this.testResults = [];
        this.testContainer = null;
    }

    /**
     * Run all UI rendering tests
     */
    runAllTests() {
        console.log('🧪 Starting UI Rendering Test Suite...');
        
        this.setupTestEnvironment();
        this.testBasicRendering();
        this.testTableGeneration();
        this.testErrorStates();
        this.testLoadingStates();
        this.testResponsiveElements();
        this.testAccessibility();
        this.cleanupTestEnvironment();
        
        this.printResults();
    }

    /**
     * Set up test environment
     */
    setupTestEnvironment() {
        // Create a test container in the DOM
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'test-container';
        this.testContainer.style.position = 'absolute';
        this.testContainer.style.top = '-9999px'; // Hide from view
        document.body.appendChild(this.testContainer);
    }

    /**
     * Clean up test environment
     */
    cleanupTestEnvironment() {
        if (this.testContainer && this.testContainer.parentNode) {
            this.testContainer.parentNode.removeChild(this.testContainer);
        }
    }

    /**
     * Test basic rendering functionality
     */
    testBasicRendering() {
        const testName = 'Basic Rendering';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Test data
            const testData = {
                mainLeague: [
                    { name: 'John Doe', points: 150, position: 1, category: 'ML', club: 'Test Club' },
                    { name: 'Jane Smith', points: 140, position: 2, category: 'ML', club: 'Another Club' }
                ],
                developmentLeague: [
                    { name: 'Bob Johnson', points: 120, position: 1, category: 'DL', club: 'Third Club' }
                ],
                prime1: [
                    { name: 'Alice Brown', points: 50, position: 1, category: 'Prime1' }
                ],
                prime2: [
                    { name: 'Charlie Wilson', points: 45, position: 1, category: 'Prime2' }
                ],
                lastUpdated: new Date()
            };

            // Test main container creation
            const container = this.renderer.renderTopRidersSection(testData);
            if (container && container.classList.contains(CSS_CLASSES.CONTAINER)) {
                console.log(`✅ Main container creation works`);
                passed++;
            } else {
                console.log(`❌ Main container creation failed`);
            }

            // Test section title creation
            const title = container.querySelector('h2');
            if (title && title.textContent === 'Top Riders') {
                console.log(`✅ Section title creation works`);
                passed++;
            } else {
                console.log(`❌ Section title creation failed`);
            }

            // Test tables container creation
            const tablesContainer = container.querySelector('.top-riders-tables');
            if (tablesContainer) {
                console.log(`✅ Tables container creation works`);
                passed++;
            } else {
                console.log(`❌ Tables container creation failed`);
            }

            // Test last updated info
            const lastUpdated = container.querySelector('.last-updated-info');
            if (lastUpdated && lastUpdated.textContent.includes('Last updated:')) {
                console.log(`✅ Last updated info creation works`);
                passed++;
            } else {
                console.log(`❌ Last updated info creation failed`);
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
     * Test table generation
     */
    testTableGeneration() {
        const testName = 'Table Generation';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 6;

            // Test league table creation
            const leagueRiders = [
                { name: 'John Doe', points: 150, position: 1, category: 'ML', club: 'Test Club' },
                { name: 'Jane Smith', points: 140, position: 2, category: 'ML', club: 'Another Club' }
            ];

            const leagueTable = this.renderer.createLeagueTable(leagueRiders, 'Test League');
            this.testContainer.appendChild(leagueTable);

            // Test table structure
            const table = leagueTable.querySelector('table');
            if (table && table.classList.contains(CSS_CLASSES.TABLE)) {
                console.log(`✅ Table structure creation works`);
                passed++;
            } else {
                console.log(`❌ Table structure creation failed`);
            }

            // Test table headers
            const headers = table.querySelectorAll('th');
            if (headers.length === 4 && headers[0].textContent === 'Position') {
                console.log(`✅ Table headers creation works`);
                passed++;
            } else {
                console.log(`❌ Table headers creation failed: ${headers.length} headers`);
            }

            // Test table rows
            const rows = table.querySelectorAll('tbody tr');
            if (rows.length === 2) {
                console.log(`✅ Table rows creation works`);
                passed++;
            } else {
                console.log(`❌ Table rows creation failed: ${rows.length} rows`);
            }

            // Test cell content
            const firstRowCells = rows[0].querySelectorAll('td');
            if (firstRowCells.length === 4 && firstRowCells[1].textContent === 'John Doe') {
                console.log(`✅ Cell content creation works`);
                passed++;
            } else {
                console.log(`❌ Cell content creation failed`);
            }

            // Test prime table creation
            const primeRiders = [
                { name: 'Alice Brown', points: 50, position: 1, category: 'Prime1' }
            ];

            const primeTable = this.renderer.createPrimeTable(primeRiders, 'Test Prime');
            this.testContainer.appendChild(primeTable);

            const primeTableElement = primeTable.querySelector('table');
            const primeHeaders = primeTableElement.querySelectorAll('th');
            if (primeHeaders.length === 3 && primeHeaders[0].textContent === 'Rank') {
                console.log(`✅ Prime table creation works`);
                passed++;
            } else {
                console.log(`❌ Prime table creation failed`);
            }

            // Test empty data handling
            const emptyTable = this.renderer.createLeagueTable([], 'Empty League');
            const emptyTableElement = emptyTable.querySelector('table');
            const emptyRows = emptyTableElement.querySelectorAll('tbody tr');
            if (emptyRows.length === 0) {
                console.log(`✅ Empty data handling works`);
                passed++;
            } else {
                console.log(`❌ Empty data handling failed: ${emptyRows.length} rows`);
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
     * Test error states
     */
    testErrorStates() {
        const testName = 'Error States';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test error element creation
            const errorElement = this.renderer.createErrorElement('Test error message');
            this.testContainer.appendChild(errorElement);

            if (errorElement.classList.contains(CSS_CLASSES.ERROR)) {
                console.log(`✅ Error element creation works`);
                passed++;
            } else {
                console.log(`❌ Error element creation failed`);
            }

            // Test error message content
            const errorMessage = errorElement.querySelector('p');
            if (errorMessage && errorMessage.textContent === 'Test error message') {
                console.log(`✅ Error message content works`);
                passed++;
            } else {
                console.log(`❌ Error message content failed`);
            }

            // Test retry button
            const retryButton = errorElement.querySelector('button');
            if (retryButton && retryButton.classList.contains(CSS_CLASSES.REFRESH_BTN)) {
                console.log(`✅ Retry button creation works`);
                passed++;
            } else {
                console.log(`❌ Retry button creation failed`);
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
     * Test loading states
     */
    testLoadingStates() {
        const testName = 'Loading States';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test loading element creation
            const loadingElement = this.renderer.createLoadingElement();
            this.testContainer.appendChild(loadingElement);

            if (loadingElement.classList.contains(CSS_CLASSES.LOADING)) {
                console.log(`✅ Loading element creation works`);
                passed++;
            } else {
                console.log(`❌ Loading element creation failed`);
            }

            // Test loading spinner
            const spinner = loadingElement.querySelector('.loading-spinner');
            if (spinner) {
                console.log(`✅ Loading spinner creation works`);
                passed++;
            } else {
                console.log(`❌ Loading spinner creation failed`);
            }

            // Test loading message
            const loadingMessage = loadingElement.querySelector('p');
            if (loadingMessage && loadingMessage.textContent.includes('Loading')) {
                console.log(`✅ Loading message creation works`);
                passed++;
            } else {
                console.log(`❌ Loading message creation failed`);
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
     * Test responsive elements
     */
    testResponsiveElements() {
        const testName = 'Responsive Elements';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Create a test container with specific width
            const responsiveContainer = document.createElement('div');
            responsiveContainer.className = CSS_CLASSES.CONTAINER;
            responsiveContainer.style.width = '500px'; // Mobile width
            this.testContainer.appendChild(responsiveContainer);

            // Set up renderer with the container
            this.renderer.containerElement = responsiveContainer;

            // Test mobile layout detection
            this.renderer.applyResponsiveStyles();
            if (responsiveContainer.classList.contains('mobile-layout')) {
                console.log(`✅ Mobile layout detection works`);
                passed++;
            } else {
                console.log(`❌ Mobile layout detection failed`);
            }

            // Test tablet layout
            responsiveContainer.style.width = '800px';
            responsiveContainer.className = CSS_CLASSES.CONTAINER; // Reset classes
            this.renderer.applyResponsiveStyles();
            if (responsiveContainer.classList.contains('tablet-layout')) {
                console.log(`✅ Tablet layout detection works`);
                passed++;
            } else {
                console.log(`❌ Tablet layout detection failed`);
            }

            // Test desktop layout
            responsiveContainer.style.width = '1200px';
            responsiveContainer.className = CSS_CLASSES.CONTAINER; // Reset classes
            this.renderer.applyResponsiveStyles();
            if (responsiveContainer.classList.contains('desktop-layout')) {
                console.log(`✅ Desktop layout detection works`);
                passed++;
            } else {
                console.log(`❌ Desktop layout detection failed`);
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
     * Test accessibility features
     */
    testAccessibility() {
        const testName = 'Accessibility Features';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 5;

            // Test data
            const testData = {
                mainLeague: [
                    { name: 'John Doe', points: 150, position: 1, category: 'ML', club: 'Test Club' }
                ],
                developmentLeague: [],
                prime1: [],
                prime2: [],
                lastUpdated: new Date()
            };

            const container = this.renderer.renderTopRidersSection(testData);
            this.testContainer.appendChild(container);

            // Test ARIA labels on main container
            if (container.getAttribute('role') === 'region' && 
                container.getAttribute('aria-label') === 'Top Riders Summary') {
                console.log(`✅ Main container ARIA labels work`);
                passed++;
            } else {
                console.log(`❌ Main container ARIA labels failed`);
            }

            // Test table role
            const table = container.querySelector('table');
            if (table && table.getAttribute('role') === 'table') {
                console.log(`✅ Table role attribute works`);
                passed++;
            } else {
                console.log(`❌ Table role attribute failed`);
            }

            // Test column headers scope
            const headers = table.querySelectorAll('th');
            let scopeCount = 0;
            headers.forEach(header => {
                if (header.getAttribute('scope') === 'col') {
                    scopeCount++;
                }
            });
            
            if (scopeCount === headers.length) {
                console.log(`✅ Column header scope attributes work`);
                passed++;
            } else {
                console.log(`❌ Column header scope attributes failed: ${scopeCount}/${headers.length}`);
            }

            // Test data labels for mobile
            const cells = table.querySelectorAll('td');
            let dataLabelCount = 0;
            cells.forEach(cell => {
                if (cell.getAttribute('data-label')) {
                    dataLabelCount++;
                }
            });
            
            if (dataLabelCount === cells.length) {
                console.log(`✅ Data labels for mobile work`);
                passed++;
            } else {
                console.log(`❌ Data labels for mobile failed: ${dataLabelCount}/${cells.length}`);
            }

            // Test loading state accessibility
            const loadingElement = this.renderer.createLoadingElement();
            if (loadingElement.getAttribute('role') === 'status' && 
                loadingElement.getAttribute('aria-label')) {
                console.log(`✅ Loading state accessibility works`);
                passed++;
            } else {
                console.log(`❌ Loading state accessibility failed`);
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
        console.log('\n🏁 UI Rendering Test Results');
        console.log('=============================');
        
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
        
        console.log('=============================');
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed === totalTests) {
            console.log('🎉 All UI rendering tests passed!');
        } else {
            console.log('⚠️  Some tests failed. Check the logs above.');
        }
    }
}

// Export for use
export { UIRenderingTestSuite };

// Make available globally for manual testing
window.UIRenderingTestSuite = UIRenderingTestSuite;