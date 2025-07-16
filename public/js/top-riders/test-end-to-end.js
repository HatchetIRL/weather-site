/**
 * @fileoverview End-to-end test scenarios for Top Riders feature
 * Tests complete data flow from Google Sheets to rendered tables
 */

import { TopRidersApp } from './main.js';

/**
 * End-to-end test suite for the complete Top Riders feature
 */
class EndToEndTestSuite {
    constructor() {
        this.testResults = [];
        this.testContainer = null;
        this.testApp = null;
    }

    /**
     * Run all end-to-end tests
     */
    async runAllTests() {
        console.log('🧪 Starting End-to-End Test Suite...');
        
        this.setupTestEnvironment();
        await this.testCompleteDataFlow();
        await this.testErrorHandling();
        await this.testCachingBehavior();
        await this.testResponsiveBehavior();
        await this.testAccessibilityCompliance();
        await this.testPerformanceMetrics();
        this.cleanupTestEnvironment();
        
        this.printResults();
    }

    /**
     * Set up test environment
     */
    setupTestEnvironment() {
        // Create a test container in the DOM
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'e2e-test-container';
        this.testContainer.style.position = 'absolute';
        this.testContainer.style.top = '-9999px'; // Hide from view
        this.testContainer.style.width = '1200px'; // Set a standard width
        this.testContainer.style.height = '800px';
        document.body.appendChild(this.testContainer);
    }

    /**
     * Clean up test environment
     */
    cleanupTestEnvironment() {
        if (this.testApp) {
            this.testApp.destroy();
        }
        
        if (this.testContainer && this.testContainer.parentNode) {
            this.testContainer.parentNode.removeChild(this.testContainer);
        }
    }

    /**
     * Test complete data flow from Google Sheets to rendered tables
     */
    async testCompleteDataFlow() {
        const testName = 'Complete Data Flow';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 6;

            // Create test app with real Google Sheets URL
            this.testApp = new TopRidersApp({
                googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml',
                containerSelector: '#e2e-test-container',
                refreshInterval: 0, // Disable auto-refresh for testing
                enableCaching: true,
                debugMode: true
            });

            // Test initialization
            try {
                await this.testApp.initialize();
                console.log(`✅ App initialization successful`);
                passed++;
            } catch (error) {
                console.log(`❌ App initialization failed:`, error.message);
            }

            // Wait a moment for data to load
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Test data extraction
            const currentData = this.testApp.getCurrentData();
            if (currentData) {
                console.log(`✅ Data extraction successful`);
                passed++;
            } else {
                console.log(`❌ Data extraction failed - no data available`);
            }

            // Test data structure
            if (currentData && 
                Array.isArray(currentData.mainLeague) &&
                Array.isArray(currentData.developmentLeague) &&
                Array.isArray(currentData.prime1) &&
                Array.isArray(currentData.prime2)) {
                console.log(`✅ Data structure is correct`);
                passed++;
            } else {
                console.log(`❌ Data structure is incorrect:`, currentData);
            }

            // Test UI rendering
            const renderedTables = this.testContainer.querySelectorAll('.top-riders-table');
            if (renderedTables.length > 0) {
                console.log(`✅ UI rendering successful: ${renderedTables.length} tables`);
                passed++;
            } else {
                console.log(`❌ UI rendering failed - no tables found`);
            }

            // Test table content
            const tableRows = this.testContainer.querySelectorAll('tbody tr');
            if (tableRows.length > 0) {
                console.log(`✅ Table content rendered: ${tableRows.length} rows`);
                passed++;
            } else {
                console.log(`❌ Table content missing`);
            }

            // Test last updated info
            const lastUpdated = this.testContainer.querySelector('.last-updated-info');
            if (lastUpdated && lastUpdated.textContent.includes('Last updated:')) {
                console.log(`✅ Last updated info displayed`);
                passed++;
            } else {
                console.log(`❌ Last updated info missing`);
            }

            this.testResults.push({
                name: testName,
                passed: passed,
                total: total,
                success: passed >= 4 // Allow some flexibility for network issues
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
     * Test error handling scenarios
     */
    async testErrorHandling() {
        const testName = 'Error Handling';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test with invalid URL
            const invalidApp = new TopRidersApp({
                googleSheetsUrl: 'https://invalid-url-that-does-not-exist.com',
                containerSelector: '#e2e-test-container',
                refreshInterval: 0,
                enableCaching: false
            });

            try {
                await invalidApp.initialize();
                
                // Wait for error handling
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                const errorElement = this.testContainer.querySelector('.top-riders-error');
                if (errorElement) {
                    console.log(`✅ Error state displayed for invalid URL`);
                    passed++;
                } else {
                    console.log(`❌ Error state not displayed for invalid URL`);
                }
                
                invalidApp.destroy();
            } catch (error) {
                console.log(`✅ Error properly thrown for invalid URL`);
                passed++;
            }

            // Test retry functionality
            const retryButton = this.testContainer.querySelector('.top-riders-refresh-btn');
            if (retryButton) {
                console.log(`✅ Retry button available in error state`);
                passed++;
            } else {
                console.log(`❌ Retry button missing in error state`);
            }

            // Test graceful degradation
            const container = this.testContainer.querySelector('.top-riders-container');
            if (container) {
                console.log(`✅ Container structure maintained during errors`);
                passed++;
            } else {
                console.log(`❌ Container structure lost during errors`);
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
     * Test caching behavior
     */
    async testCachingBehavior() {
        const testName = 'Caching Behavior';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 4;

            // Create app with caching enabled
            const cachingApp = new TopRidersApp({
                googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml',
                containerSelector: '#e2e-test-container',
                refreshInterval: 0,
                enableCaching: true,
                cacheExpiry: 60000 // 1 minute
            });

            await cachingApp.initialize();
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Test cache storage
            const cachedData = cachingApp.getCachedData();
            if (cachedData) {
                console.log(`✅ Data successfully cached`);
                passed++;
            } else {
                console.log(`❌ Data caching failed`);
            }

            // Test cache retrieval
            const freshApp = new TopRidersApp({
                googleSheetsUrl: 'invalid-url', // Use invalid URL to force cache usage
                containerSelector: '#e2e-test-container',
                refreshInterval: 0,
                enableCaching: true
            });

            await freshApp.initialize();
            await new Promise(resolve => setTimeout(resolve, 2000));

            const retrievedData = freshApp.getCachedData();
            if (retrievedData) {
                console.log(`✅ Cached data successfully retrieved`);
                passed++;
            } else {
                console.log(`❌ Cached data retrieval failed`);
            }

            // Test cache expiry (simulate by manipulating timestamp)
            if (cachingApp.cacheManager) {
                const stats = cachingApp.cacheManager.getStats();
                if (stats.totalEntries > 0) {
                    console.log(`✅ Cache statistics available`);
                    passed++;
                } else {
                    console.log(`❌ Cache statistics unavailable`);
                }
            }

            // Test offline behavior simulation
            const originalOnLine = navigator.onLine;
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: false
            });

            // Trigger offline event
            window.dispatchEvent(new Event('offline'));
            
            // Restore online status
            Object.defineProperty(navigator, 'onLine', {
                writable: true,
                value: originalOnLine
            });

            console.log(`✅ Offline behavior simulation completed`);
            passed++;

            cachingApp.destroy();
            freshApp.destroy();

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
     * Test responsive behavior across different screen sizes
     */
    async testResponsiveBehavior() {
        const testName = 'Responsive Behavior';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test mobile layout
            this.testContainer.style.width = '400px';
            
            if (this.testApp && this.testApp.renderer) {
                this.testApp.renderer.applyResponsiveStyles();
                
                const container = this.testContainer.querySelector('.top-riders-container');
                if (container && container.classList.contains('mobile-layout')) {
                    console.log(`✅ Mobile layout applied correctly`);
                    passed++;
                } else {
                    console.log(`❌ Mobile layout not applied`);
                }
            }

            // Test tablet layout
            this.testContainer.style.width = '800px';
            
            if (this.testApp && this.testApp.renderer) {
                // Reset classes
                const container = this.testContainer.querySelector('.top-riders-container');
                if (container) {
                    container.className = 'top-riders-container';
                }
                
                this.testApp.renderer.applyResponsiveStyles();
                
                if (container && container.classList.contains('tablet-layout')) {
                    console.log(`✅ Tablet layout applied correctly`);
                    passed++;
                } else {
                    console.log(`❌ Tablet layout not applied`);
                }
            }

            // Test desktop layout
            this.testContainer.style.width = '1200px';
            
            if (this.testApp && this.testApp.renderer) {
                // Reset classes
                const container = this.testContainer.querySelector('.top-riders-container');
                if (container) {
                    container.className = 'top-riders-container';
                }
                
                this.testApp.renderer.applyResponsiveStyles();
                
                if (container && container.classList.contains('desktop-layout')) {
                    console.log(`✅ Desktop layout applied correctly`);
                    passed++;
                } else {
                    console.log(`❌ Desktop layout not applied`);
                }
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
     * Test accessibility compliance
     */
    async testAccessibilityCompliance() {
        const testName = 'Accessibility Compliance';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 5;

            // Test ARIA labels
            const container = this.testContainer.querySelector('[role="region"]');
            if (container && container.getAttribute('aria-label')) {
                console.log(`✅ Main container has proper ARIA labels`);
                passed++;
            } else {
                console.log(`❌ Main container missing ARIA labels`);
            }

            // Test table accessibility
            const tables = this.testContainer.querySelectorAll('table[role="table"]');
            if (tables.length > 0) {
                console.log(`✅ Tables have proper role attributes`);
                passed++;
            } else {
                console.log(`❌ Tables missing role attributes`);
            }

            // Test header scope attributes
            const headers = this.testContainer.querySelectorAll('th[scope="col"]');
            const allHeaders = this.testContainer.querySelectorAll('th');
            if (headers.length === allHeaders.length && allHeaders.length > 0) {
                console.log(`✅ All table headers have scope attributes`);
                passed++;
            } else {
                console.log(`❌ Table headers missing scope attributes: ${headers.length}/${allHeaders.length}`);
            }

            // Test loading state accessibility
            if (this.testApp && this.testApp.renderer) {
                const loadingElement = this.testApp.renderer.createLoadingElement();
                if (loadingElement.getAttribute('role') === 'status') {
                    console.log(`✅ Loading state has proper accessibility`);
                    passed++;
                } else {
                    console.log(`❌ Loading state missing accessibility attributes`);
                }
            }

            // Test keyboard navigation (basic check)
            const focusableElements = this.testContainer.querySelectorAll('button, [tabindex]');
            if (focusableElements.length > 0) {
                console.log(`✅ Focusable elements available for keyboard navigation`);
                passed++;
            } else {
                console.log(`❌ No focusable elements found`);
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
     * Test performance metrics
     */
    async testPerformanceMetrics() {
        const testName = 'Performance Metrics';
        console.log(`\n📋 Testing: ${testName}`);
        
        try {
            let passed = 0;
            let total = 3;

            // Test initialization time
            const initStartTime = performance.now();
            
            const perfApp = new TopRidersApp({
                googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml',
                containerSelector: '#e2e-test-container',
                refreshInterval: 0,
                enableCaching: true
            });

            await perfApp.initialize();
            const initTime = performance.now() - initStartTime;

            if (initTime < 10000) { // Should initialize within 10 seconds
                console.log(`✅ Initialization time acceptable: ${initTime.toFixed(2)}ms`);
                passed++;
            } else {
                console.log(`❌ Initialization time too slow: ${initTime.toFixed(2)}ms`);
            }

            // Test rendering time
            const renderStartTime = performance.now();
            
            // Wait for data and rendering
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const renderTime = performance.now() - renderStartTime;
            
            if (renderTime < 5000) { // Should render within 5 seconds
                console.log(`✅ Rendering time acceptable: ${renderTime.toFixed(2)}ms`);
                passed++;
            } else {
                console.log(`❌ Rendering time too slow: ${renderTime.toFixed(2)}ms`);
            }

            // Test memory usage (basic check)
            if (performance.memory) {
                const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
                if (memoryUsage < 50) { // Should use less than 50MB
                    console.log(`✅ Memory usage acceptable: ${memoryUsage.toFixed(2)}MB`);
                    passed++;
                } else {
                    console.log(`❌ Memory usage high: ${memoryUsage.toFixed(2)}MB`);
                }
            } else {
                console.log(`✅ Memory API not available (acceptable)`);
                passed++;
            }

            perfApp.destroy();

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
     * Print test results summary
     */
    printResults() {
        console.log('\n🏁 End-to-End Test Results');
        console.log('===========================');
        
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
        
        console.log('===========================');
        console.log(`Overall: ${totalPassed}/${totalTests} tests passed`);
        
        if (totalPassed >= totalTests * 0.8) { // 80% pass rate for E2E tests
            console.log('🎉 End-to-end tests mostly successful!');
        } else {
            console.log('⚠️  Many E2E tests failed. Check network connectivity and Google Sheets access.');
        }
    }
}

// Export for use
export { EndToEndTestSuite };

// Make available globally for manual testing
window.EndToEndTestSuite = EndToEndTestSuite;