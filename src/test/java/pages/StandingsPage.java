package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class StandingsPage extends BasePage{
    private final By iframeLocator = By.tagName("iframe");
    private final By jamesRowLocator = By.xpath("//tr[contains(., 'James')]");

    @FindBy(id = "sheets-viewport")
    private WebElement standingsTbl;




    public StandingsPage(WebDriver driver) {
        super(driver);
        PageFactory.initElements(driver, this);
    }

    public Boolean isAtStandingsPage(){
        return getPageTitle().toLowerCase().contains("galway league 2025 standings");
    }

    public String JamesScore() {
        // Wait for iframe and switch to it
        wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(iframeLocator));

        // Wait for James' row to be visible
        WebElement jamesRow = wait.until(ExpectedConditions.visibilityOfElementLocated(jamesRowLocator));

        // Extract the 4th column value from the row
        WebElement fourthCell = jamesRow.findElement(By.xpath(".//td[4]"));
        String score =  fourthCell.getText();

        // Switch back to the main content
        driver.switchTo().defaultContent();

        return score;
    }



    // Top Riders functionality methods
    public boolean isTopRidersContainerPresent() {
        try {
            WebElement container = driver.findElement(By.id("top-riders-container"));
            return container.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTopRidersContentLoaded() {
        try {
            WebElement container = driver.findElement(By.id("top-riders-container"));
            return !container.getText().trim().isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasTopRidersError() {
        try {
            WebElement errorElement = driver.findElement(By.className("top-riders-error"));
            return errorElement.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean hasTopRidersLoading() {
        try {
            WebElement loadingElement = driver.findElement(By.className("top-riders-loading"));
            return loadingElement.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getTopRidersSectionCount() {
        try {
            return driver.findElements(By.className("top-riders-section")).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasTopRidersHeader() {
        try {
            WebElement header = driver.findElement(By.className("top-riders-header"));
            return header.isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void clickTopRidersRefresh() {
        try {
            WebElement refreshBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.className("top-riders-refresh-btn")));
            refreshBtn.click();
        } catch (Exception e) {
            throw new RuntimeException("Could not click Top Riders refresh button", e);
        }
    }


}
