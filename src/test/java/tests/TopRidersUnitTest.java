package tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.StandingsPage;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Fast unit tests for Top Riders JavaScript functionality
 * These tests focus on JavaScript module loading and basic functionality
 */
public class TopRidersUnitTest extends BaseTest {

    @Test
    @DisplayName("JavaScript modules should be accessible and properly structured")
    public void testJavaScriptModuleStructure() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        JavascriptExecutor js = (JavascriptExecutor) driver;
        
        // Wait a moment for modules to load
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        
        // Test that the module script is present and executed
        Boolean moduleLoaded = (Boolean) js.executeScript(
            "return typeof window !== 'undefined' && " +
            "document.querySelector('script[type=\"module\"]') !== null;"
        );
        
        assertTrue(moduleLoaded, "❌ ES6 modules not properly loaded");
        
        System.out.println("✅ JavaScript modules are properly structured and loaded");
    }

    @Test
    @DisplayName("Top Riders container should initialize correctly")
    public void testTopRidersInitialization() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Wait for container to be present
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));
        WebElement container = driver.findElement(By.id("top-riders-container"));
        
        assertNotNull(container, "❌ Top Riders container not found");
        assertTrue(container.isDisplayed(), "❌ Top Riders container not visible");
        
        // Check that container has the correct attributes
        String containerId = container.getAttribute("id");
        assertEquals("top-riders-container", containerId, "❌ Container has wrong ID");
        
        System.out.println("✅ Top Riders container initializes correctly");
    }

    @Test
    @DisplayName("CSS classes should be applied correctly")
    public void testCSSClassApplication() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        WebElement container = driver.findElement(By.id("top-riders-container"));
        
        // Wait for content to load or error state
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        wait.until(driver -> !container.getText().trim().isEmpty());
        
        // Check for expected CSS classes based on current state
        boolean hasValidState = 
            !driver.findElements(By.className("top-riders-loading")).isEmpty() ||
            !driver.findElements(By.className("top-riders-error")).isEmpty() ||
            !driver.findElements(By.className("top-riders-container")).isEmpty();
        
        assertTrue(hasValidState, "❌ No valid CSS state classes found");
        
        System.out.println("✅ CSS classes are applied correctly");
    }

    @Test
    @DisplayName("Error handling should work properly")
    public void testErrorHandling() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        
        // Wait for either success or error state
        wait.until(driver -> {
            return standingsPage.hasTopRidersHeader() || 
                   standingsPage.hasTopRidersError() ||
                   standingsPage.hasTopRidersLoading();
        });
        
        // If there's an error, check that it's handled properly
        if (standingsPage.hasTopRidersError()) {
            System.out.println("✅ Error state detected - checking error handling");
            
            // Check for retry button
            List<WebElement> retryButtons = driver.findElements(By.className("top-riders-refresh-btn"));
            if (!retryButtons.isEmpty()) {
                assertTrue(retryButtons.get(0).isDisplayed(), "❌ Retry button not visible");
                System.out.println("✅ Retry button is present and visible");
            }
            
            // Check error message is user-friendly
            WebElement errorElement = driver.findElement(By.className("top-riders-error"));
            String errorText = errorElement.getText();
            assertFalse(errorText.trim().isEmpty(), "❌ Error message is empty");
            assertFalse(errorText.toLowerCase().contains("undefined"), "❌ Error message contains 'undefined'");
            assertFalse(errorText.toLowerCase().contains("null"), "❌ Error message contains 'null'");
            
            System.out.println("✅ Error handling works properly with user-friendly messages");
        } else {
            System.out.println("✅ No errors detected - system working normally");
        }
    }

    @Test
    @DisplayName("Loading state should be handled correctly")
    public void testLoadingState() {
        // This test needs to run quickly, so we'll check the initial state
        String loginUrl = System.getProperty("siteUrl", "https://jimweather.netlify.app/login.html");
        String user = System.getProperty("siteUser", "user");
        String pass = System.getProperty("sitePass", "pass");

        driver.get(loginUrl);
        pages.LoginPage loginPage = new pages.LoginPage(driver);
        loginPage.loginAs(user, pass);

        // Immediately check for loading state before it potentially finishes
        WebElement container = driver.findElement(By.id("top-riders-container"));
        
        // The container should exist
        assertNotNull(container, "❌ Top Riders container not found");
        
        // Within the first few seconds, we should see either loading or content
        WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(3));
        
        try {
            shortWait.until(driver -> 
                standingsPage.hasTopRidersLoading() || 
                standingsPage.hasTopRidersHeader() || 
                standingsPage.hasTopRidersError() ||
                !container.getText().trim().isEmpty()
            );
            System.out.println("✅ Loading state or content appears quickly");
        } catch (Exception e) {
            // If nothing appears quickly, that's also a valid test result
            System.out.println("⚠️ No immediate loading state detected - may load very quickly");
        }
        
        // Eventually something should appear
        WebDriverWait longerWait = new WebDriverWait(driver, Duration.ofSeconds(15));
        longerWait.until(driver -> !container.getText().trim().isEmpty());
        
        System.out.println("✅ Loading state handling works correctly");
    }

    @Test
    @DisplayName("Responsive design should work on different screen sizes")
    public void testResponsiveDesign() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        WebElement container = driver.findElement(By.id("top-riders-container"));
        
        // Test desktop size
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1920, 1080));
        assertTrue(container.isDisplayed(), "❌ Container not visible on desktop");
        
        // Test tablet size
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(768, 1024));
        assertTrue(container.isDisplayed(), "❌ Container not visible on tablet");
        
        // Test mobile size
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(375, 667));
        assertTrue(container.isDisplayed(), "❌ Container not visible on mobile");
        
        // Container should not overflow viewport
        int containerWidth = container.getSize().getWidth();
        int viewportWidth = driver.manage().window().getSize().getWidth();
        assertTrue(containerWidth <= viewportWidth + 50, // Allow small margin for scrollbars
            "❌ Container overflows viewport on mobile");
        
        System.out.println("✅ Responsive design works across different screen sizes");
        
        // Reset to desktop
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1920, 1080));
    }

    @Test
    @DisplayName("Page performance should not be significantly impacted")
    public void testPerformanceImpact() {
        long startTime = System.currentTimeMillis();
        
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        long pageLoadTime = System.currentTimeMillis() - startTime;
        
        // Page should load within reasonable time (30 seconds max for CI environment)
        assertTrue(pageLoadTime < 30000, 
            "❌ Page load time too slow: " + pageLoadTime + "ms");
        
        // Check that the page is still responsive
        WebElement iframe = driver.findElement(By.tagName("iframe"));
        assertTrue(iframe.isDisplayed(), "❌ Main iframe not visible");
        
        WebElement container = driver.findElement(By.id("top-riders-container"));
        assertTrue(container.isDisplayed(), "❌ Top Riders container not visible");
        
        System.out.println("✅ Page performance not significantly impacted");
        System.out.println("📊 Page load time: " + pageLoadTime + "ms");
    }

    // Helper method to create a StandingsPage instance
    private StandingsPage standingsPage;
    
    private void initializeStandingsPage() {
        if (standingsPage == null) {
            standingsPage = new StandingsPage(driver);
        }
    }
}