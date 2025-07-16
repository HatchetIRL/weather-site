package tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.StandingsPage;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class TopRidersTest extends BaseTest {

    @Test
    @DisplayName("Top Riders container should be present on standings page")
    public void testTopRidersContainerExists() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        // Check if top riders container exists
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        assertTrue(topRidersContainer.isDisplayed(), "❌ Top Riders container is not visible");
        
        System.out.println("✅ Top Riders container is present and visible");
    }

    @Test
    @DisplayName("Top Riders section should load content or show loading/error state")
    public void testTopRidersContentLoads() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        
        // Wait for either content to load, loading state, or error state
        wait.until(ExpectedConditions.or(
            ExpectedConditions.presenceOfElementLocated(By.className("top-riders-header")),
            ExpectedConditions.presenceOfElementLocated(By.className("top-riders-loading")),
            ExpectedConditions.presenceOfElementLocated(By.className("top-riders-error"))
        ));
        
        // Check that container has some content
        assertFalse(topRidersContainer.getText().trim().isEmpty(), 
            "❌ Top Riders container is empty - no content, loading, or error state");
        
        System.out.println("✅ Top Riders section shows content, loading, or error state");
        System.out.println("📊 Container content preview: " + 
            topRidersContainer.getText().substring(0, Math.min(100, topRidersContainer.getText().length())));
    }

    @Test
    @DisplayName("Top Riders CSS should be loaded")
    public void testTopRidersCSSLoaded() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        // Check if CSS link is present
        List<WebElement> cssLinks = driver.findElements(By.cssSelector("link[href*='top-riders.css']"));
        assertFalse(cssLinks.isEmpty(), "❌ Top Riders CSS file is not linked");
        
        // Check if CSS is actually loaded by testing a specific style
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        String fontFamily = topRidersContainer.getCssValue("font-family");
        
        // The CSS should set font-family to Arial, sans-serif
        assertTrue(fontFamily.toLowerCase().contains("arial") || fontFamily.toLowerCase().contains("sans-serif"), 
            "❌ Top Riders CSS styles not applied correctly. Font family: " + fontFamily);
        
        System.out.println("✅ Top Riders CSS is loaded and applied");
    }

    @Test
    @DisplayName("Top Riders JavaScript modules should load without critical errors")
    public void testTopRidersJavaScriptLoads() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        // Check for critical JavaScript errors in console (excluding CORS and network errors)
        List<org.openqa.selenium.logging.LogEntry> logs = driver.manage().logs().get("browser").getAll();
        
        boolean hasCriticalJSErrors = logs.stream()
            .anyMatch(log -> log.getLevel().getName().equals("SEVERE") && 
                           log.getMessage().toLowerCase().contains("top-riders") &&
                           !log.getMessage().toLowerCase().contains("cors") &&
                           !log.getMessage().toLowerCase().contains("network") &&
                           !log.getMessage().toLowerCase().contains("fetch") &&
                           !log.getMessage().toLowerCase().contains("404") &&
                           !log.getMessage().toLowerCase().contains("http"));
        
        // Log the errors for debugging but don't fail on CORS/network errors
        if (!logs.isEmpty()) {
            System.out.println("📋 JavaScript console logs found:");
            logs.stream()
                .filter(log -> log.getMessage().toLowerCase().contains("top-riders"))
                .forEach(log -> System.out.println("  " + log.getLevel() + ": " + log.getMessage()));
        }
        
        assertFalse(hasCriticalJSErrors, "❌ Critical JavaScript errors found related to Top Riders (excluding CORS/network)");
        
        // Check if the module script tag is present
        List<WebElement> moduleScripts = driver.findElements(By.cssSelector("script[type='module']"));
        boolean hasTopRidersModule = moduleScripts.stream()
            .anyMatch(script -> script.getAttribute("innerHTML").contains("TopRidersApp"));
        
        assertTrue(hasTopRidersModule, "❌ Top Riders module script not found");
        
        System.out.println("✅ Top Riders JavaScript modules load without critical errors");
    }

    @Test
    @DisplayName("Top Riders should handle data loading gracefully")
    public void testTopRidersDataHandling() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        
        // Wait for initial loading to complete (either success or error)
        wait.until(ExpectedConditions.or(
            ExpectedConditions.presenceOfElementLocated(By.className("top-riders-header")),
            ExpectedConditions.presenceOfElementLocated(By.className("top-riders-error"))
        ));
        
        // Check if we have either successful content or proper error handling
        boolean hasContent = !driver.findElements(By.className("top-riders-header")).isEmpty();
        boolean hasErrorHandling = !driver.findElements(By.className("top-riders-error")).isEmpty();
        
        assertTrue(hasContent || hasErrorHandling, 
            "❌ Top Riders should show either content or proper error handling");
        
        if (hasContent) {
            System.out.println("✅ Top Riders loaded content successfully");
            
            // If content loaded, check for expected sections
            List<WebElement> sections = driver.findElements(By.className("top-riders-section"));
            assertTrue(sections.size() > 0, "❌ No top riders sections found");
            System.out.println("📊 Found " + sections.size() + " top riders sections");
            
        } else if (hasErrorHandling) {
            System.out.println("✅ Top Riders shows proper error handling");
            
            // Check if retry button is present in error state
            List<WebElement> retryButtons = driver.findElements(By.className("top-riders-refresh-btn"));
            if (!retryButtons.isEmpty()) {
                System.out.println("✅ Retry button is available in error state");
            }
        }
    }

    @Test
    @DisplayName("Top Riders should be positioned correctly on page")
    public void testTopRidersPositioning() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        WebElement iframe = driver.findElement(By.tagName("iframe"));
        
        // Get positions
        int topRidersY = topRidersContainer.getLocation().getY();
        int iframeY = iframe.getLocation().getY();
        
        // Top riders should appear before the iframe
        assertTrue(topRidersY < iframeY, 
            "❌ Top Riders container should appear above the Google Sheets iframe");
        
        // Check that container is visible in viewport
        assertTrue(topRidersContainer.isDisplayed(), "❌ Top Riders container is not visible");
        
        System.out.println("✅ Top Riders is positioned correctly above the iframe");
        System.out.println("📍 Top Riders Y position: " + topRidersY + ", Iframe Y position: " + iframeY);
    }

    @Test
    @DisplayName("Top Riders should be responsive on mobile viewport")
    public void testTopRidersResponsive() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        
        // Test mobile viewport
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(375, 667));
        
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        WebElement topRidersContainer = driver.findElement(By.id("top-riders-container"));
        
        // Wait a moment for responsive styles to apply
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Container should still be visible and not overflow
        assertTrue(topRidersContainer.isDisplayed(), "❌ Top Riders not visible on mobile");
        
        int containerWidth = topRidersContainer.getSize().getWidth();
        int viewportWidth = driver.manage().window().getSize().getWidth();
        
        assertTrue(containerWidth <= viewportWidth, 
            "❌ Top Riders container overflows viewport on mobile");
        
        System.out.println("✅ Top Riders is responsive on mobile viewport");
        System.out.println("📱 Container width: " + containerWidth + "px, Viewport: " + viewportWidth + "px");
        
        // Reset to desktop size
        driver.manage().window().setSize(new org.openqa.selenium.Dimension(1920, 1080));
    }
}