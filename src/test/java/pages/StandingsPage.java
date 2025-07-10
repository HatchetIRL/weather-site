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

    @FindBy(id = "logoutBtn")
    private WebElement btnLogOut;


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

    public void clickLogout(){
        wait.until(ExpectedConditions.visibilityOf(btnLogOut));
        btnLogOut.click();
    }


}
