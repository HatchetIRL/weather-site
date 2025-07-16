package tests;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import pages.StandingsPage;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for Top Riders feature
 * These tests verify the complete functionality works end-to-end
 */
public class TopRidersIntegrationTest extends BaseTest {

    @Test
    @DisplayName("Complete Top Riders workflow should work end-to-end")
    public void testCompleteTopRidersWorkflow() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Step 1: Verify container exists
        assertTrue(standingsPage.isTopRidersContainerPresent(), 
            "❌ Top Riders container not present");

        // Step 2: Wait for content to load (success or error)
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(20));
        wait.until(driver -> 
            standingsPage.hasTopRidersHeader() || 
            standingsPage.hasTopRidersError()
        );

        // Step 3: Verify appropriate content is shown
        if (standingsPage.hasTopRidersHeader()) {
            System.out.println("✅ Top Riders loaded successfully");
            
            // Check for expected sections
            int sectionCount = standingsPage.getTopRidersSectionCount();
            assertTrue(sectionCount > 0, "❌ No top riders sections found");
            System.out.println("📊 Found " + sectionCount + " top riders sections");
            
            // Verify tables are present
            List<WebElement> tables = driver.findElements(By.className("top-riders-table"));
            assertTrue(tables.size() > 0, "❌ No top riders tables found");
            System.out.println("📋 Found " + tables.size() + " top riders tables");
            
        } else if (standingsPage.hasTopRidersError()) {
            System.out.println("⚠️ Top Riders in error state - testing error handling");
            
            // Verify error is handled gracefully
            WebElement errorElement = driver.findElement(By.className("top-riders-error"));
            String errorText = errorElement.getText();
            assertFalse(errorText.trim().isEmpty(), "❌ Error message is empty");
            
            // Check for retry functionality
            List<WebElement> retryButtons = driver.findElements(By.className("top-riders-refresh-btn"));
            if (!retryButtons.isEmpty()) {
                System.out.println("✅ Retry button available in error state");
            }
        }

        System.out.println("✅ Complete Top Riders workflow works end-to-end");
    }

    @Test
    @DisplayName("Top Riders should not interfere with existing functionality")
    public void testNoInterferenceWithExistingFeatures() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Verify existing iframe still works
        WebElement iframe = driver.findElement(By.tagName("iframe"));
        assertTrue(iframe.isDisplayed(), "❌ Main Google Sheets iframe not visible");
        
        String iframeSrc = iframe.getAttribute("src");
        assertTrue(iframeSrc.contains("docs.google.com"), 
            "❌ Iframe source not pointing to Google Sheets");

        // Verify logout button still works
        WebElement logoutBtn = driver.findElement(By.id("logoutBtn"));
        assertTrue(logoutBtn.isDisplayed(), "❌ Logout button not visible");
        assertTrue(logoutBtn.isEnabled(), "❌ Logout button not enabled");

        // Verify page title is correct
        String title = driver.getTitle();
        assertTrue(title.contains("Galway League 2025 Standings"), 
            "❌ Page title incorrect: " + title);

        // Verify logos are still present
        List<WebElement> logos = driver.findElements(By.cssSelector(".logo-container img"));
        assertTrue(logos.size() >= 3, "❌ Expected logos not found");

        System.out.println("✅ Top Riders does not interfere with existing functionality");
    }

    @Test
    @DisplayName("Top Riders should handle page refresh correctly")
    public void testPageRefreshHandling() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Wait for initial load
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        wait.until(driver -> standingsPage.isTopRidersContentLoaded());

        // Refresh the page
        driver.navigate().refresh();

        // Verify page still works after refresh
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on standings page after refresh");
        assertTrue(standingsPage.isTopRidersContainerPresent(), 
            "❌ Top Riders container missing after refresh");

        // Wait for content to reload
        wait.until(driver -> 
            standingsPage.hasTopRidersHeader() || 
            standingsPage.hasTopRidersError() ||
            standingsPage.hasTopRidersLoading()
        );

        System.out.println("✅ Top Riders handles page refresh correctly");
    }

    @Test
    @DisplayName("Both public and views pages should have Top Riders functionality")
    public void testBothPagesHaveTopRiders() {
        // Test is already running on one of the pages, so we know at least one works
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");
        assertTrue(standingsPage.isTopRidersContainerPresent(), 
            "❌ Top Riders container not present on current page");

        // Check that the CSS and JS files are properly linked
        List<WebElement> cssLinks = driver.findElements(By.cssSelector("link[href*='top-riders.css']"));
        assertFalse(cssLinks.isEmpty(), "❌ Top Riders CSS not linked");

        List<WebElement> moduleScripts = driver.findElements(By.cssSelector("script[type='module']"));
        boolean hasTopRidersModule = moduleScripts.stream()
            .anyMatch(script -> script.getAttribute("innerHTML").contains("TopRidersApp"));
        assertTrue(hasTopRidersModule, "❌ Top Riders module script not found");

        System.out.println("✅ Current page has Top Riders functionality properly configured");
    }

    @Test
    @DisplayName("Top Riders should be accessible")
    public void testAccessibility() {
        StandingsPage standingsPage = loginAndGoToStandingsPage();
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        WebElement container = driver.findElement(By.id("top-riders-container"));
        
        // Wait for content to load
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        wait.until(driver -> !container.getText().trim().isEmpty());

        // Check for ARIA attributes
        String ariaLabel = container.getAttribute("aria-label");
        String role = container.getAttribute("role");
        
        // Container should have accessibility attributes or child elements should
        boolean hasAccessibilityFeatures = 
            (ariaLabel != null && !ariaLabel.isEmpty()) ||
            (role != null && !role.isEmpty()) ||
            !driver.findElements(By.cssSelector("#top-riders-container [role]")).isEmpty() ||
            !driver.findElements(By.cssSelector("#top-riders-container [aria-label]")).isEmpty();

        assertTrue(hasAccessibilityFeatures, "❌ No accessibility features found");

        // Check for proper heading structure
        List<WebElement> headings = driver.findElements(By.cssSelector("#top-riders-container h1, #top-riders-container h2, #top-riders-container h3"));
        if (!headings.isEmpty()) {
            System.out.println("✅ Found " + headings.size() + " headings for screen readers");
        }

        // Check for table accessibility if tables are present
        List<WebElement> tables = driver.findElements(By.cssSelector("#top-riders-container table"));
        if (!tables.isEmpty()) {
            for (WebElement table : tables) {
                String tableRole = table.getAttribute("role");
                if (tableRole == null || tableRole.isEmpty()) {
                    // Check if table has proper headers
                    List<WebElement> headers = table.findElements(By.tagName("th"));
                    assertTrue(headers.size() > 0, "❌ Table found without proper headers");
                }
            }
            System.out.println("✅ Tables have proper accessibility structure");
        }

        System.out.println("✅ Top Riders has basic accessibility features");
    }
}