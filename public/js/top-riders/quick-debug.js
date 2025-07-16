/**
 * Quick debug script to test Google Sheets access
 * Run this in browser console to see what's happening
 */

// Test direct Google Sheets access
async function quickDebugGoogleSheets() {
    console.log('🔍 Quick Debug: Testing Google Sheets Access');
    
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml';
    const spreadsheetId = '2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp';
    
    // Test each sheet individually
    const sheets = [
        { name: 'Main League', gid: '2052107479' },
        { name: 'ML Primes', gid: '394788670' },
        { name: 'Dev League', gid: '732061928' },
        { name: 'DL Primes', gid: '1028354950' }
    ];
    
    for (const sheet of sheets) {
        console.log(`\n📊 Testing ${sheet.name}...`);
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv&gid=${sheet.gid}`;
        console.log(`URL: ${csvUrl}`);
        
        try {
            const response = await fetch(csvUrl);
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const text = await response.text();
                console.log(`Data length: ${text.length} characters`);
                console.log(`First 200 chars: ${text.substring(0, 200)}`);
                
                // Parse first few lines
                const lines = text.split('\n').slice(0, 3);
                console.log('First 3 lines:');
                lines.forEach((line, i) => {
                    console.log(`  ${i}: ${line}`);
                });
            } else {
                console.error(`❌ Failed to fetch ${sheet.name}`);
            }
        } catch (error) {
            console.error(`❌ Error fetching ${sheet.name}:`, error);
        }
    }
    
    console.log('\n🔍 Debug complete. Check the results above.');
}

// Make it available globally
window.quickDebugGoogleSheets = quickDebugGoogleSheets;

// Also test the main app initialization
async function debugTopRidersApp() {
    console.log('🔍 Debug: Testing TopRidersApp initialization');
    
    try {
        // Import the main app
        const { TopRidersApp } = await import('./main.js');
        
        // Create test container
        let testContainer = document.getElementById('debug-container');
        if (!testContainer) {
            testContainer = document.createElement('div');
            testContainer.id = 'debug-container';
            testContainer.style.position = 'fixed';
            testContainer.style.top = '10px';
            testContainer.style.right = '10px';
            testContainer.style.width = '300px';
            testContainer.style.height = '200px';
            testContainer.style.background = 'white';
            testContainer.style.border = '2px solid red';
            testContainer.style.zIndex = '9999';
            testContainer.style.overflow = 'auto';
            testContainer.style.padding = '10px';
            document.body.appendChild(testContainer);
        }
        
        // Create debug app
        const debugApp = new TopRidersApp({
            googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS2Bi0VWUtBxL7yQ27ctm5CQlky2rRAlZzxhKI0M0G-oDUnHnaA-fdQjmEdRF5wbbycP5bJHWL_-POp/pubhtml',
            containerSelector: '#debug-container',
            refreshInterval: 0,
            enableCaching: false,
            debugMode: true
        });
        
        console.log('🚀 Initializing debug app...');
        await debugApp.initialize();
        
        // Wait and check results
        setTimeout(() => {
            const data = debugApp.getCurrentData();
            console.log('📊 Current data:', data);
            
            if (data) {
                console.log('✅ Data loaded successfully!');
                console.log(`Main League: ${data.mainLeague?.length || 0} riders`);
                console.log(`Dev League: ${data.developmentLeague?.length || 0} riders`);
                console.log(`Prime 1: ${data.prime1?.length || 0} riders`);
                console.log(`Prime 2: ${data.prime2?.length || 0} riders`);
            } else {
                console.log('❌ No data loaded');
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Debug app failed:', error);
    }
}

window.debugTopRidersApp = debugTopRidersApp;

console.log('🔧 Debug functions loaded. Run:');
console.log('  quickDebugGoogleSheets() - Test Google Sheets access');
console.log('  debugTopRidersApp() - Test full app initialization');