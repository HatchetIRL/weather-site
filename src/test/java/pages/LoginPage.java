//package pages;//import io.github.bonigarcia.wdm.WebDriverManager
//
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.Test;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.WebElement;
//import org.openqa.selenium.chrome.ChromeDriver;
//import io.github.bonigarcia.wdm.WebDriverManager;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//import org.openqa.selenium.support.ui.WebDriverWait;
//
//import java.time.Duration;
//
//public class LoginPage {
//
//    private WebDriver driver;
//    //private final String loginUrl = "https://jimweather.netlify.app/login.html";
//    String loginUrl = System.getProperty("siteUrl", "https://jimweather.netlify.app/login.html");
//    boolean isHeadless = Boolean.parseBoolean(System.getProperty("headless", "false"));
//
//    @BeforeEach
//    void setUp() {
//        System.out.println("🔧 Setting up WebDriver for Login Test...");
//        WebDriverManager.chromedriver().setup();
//        driver = new ChromeDriver();
//        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));  // set generic implicit wait
//    }
//
//    @Test
//    void testLoginPageLoads() {
//        //String loginUrl = "https://jimweather.netlify.app/login.html";
//        System.out.println("🌐 Navigating to login page: " + loginUrl);
//        driver.get(loginUrl);
//
//        String pageTitle = driver.getTitle();
//        System.out.println("📄 Page title received: \"" + pageTitle + "\"");
//
//        boolean titleLooksCorrect = pageTitle.toLowerCase().contains("login");
//        System.out.println("🔍 Checking if page title contains 'login': " + titleLooksCorrect);
//
//        Assertions.assertTrue(titleLooksCorrect, "❌ Page title does not indicate a login page");
//        System.out.println("✅ Login page title verified successfully.");
//    }
//
//
//    @Test
//    void testValidLogin(){
//        System.out.println("Test for a valid login");
//        System.out.println("Navigating to the login page: " + loginUrl);
//        driver.get(loginUrl);
//        String strUser = "user";
//        String strPass = "pass";
//
//
//        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
//        System.out.println("🔍 Check that the username textbox is present");
//        WebElement txtUserName = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));
//
//        System.out.println("🔍 Check that the password textbox is present");
//        WebElement txtPassword = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));
//
//        WebElement btnLogin = driver.findElement(By.xpath("//button[text()=\"Login\"]"));
//
//        Assertions.assertTrue(txtUserName.isDisplayed(), "❌ username textbox is not displayed");
//        Assertions.assertTrue(txtPassword.isDisplayed(),"❌ password textbox is not displayed");
//        Assertions.assertTrue(btnLogin.isDisplayed(), "❌ login button is not displayed");
//
//        // Enter valid login and verify that the standings page loads
//        System.out.println("Enter valid login and click Login button");
//        txtUserName.sendKeys(strUser);
//        txtPassword.sendKeys(strPass);
//        btnLogin.click();
//
//        //Wait for the Standings page to load
//        WebElement titleText = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1")));
//        System.out.println("Standings page loaded. Title text is visible: " + titleText.getText());
//
//        boolean titleLooksCorrect = titleText.getText().toLowerCase().contains("galway");
//        System.out.println("🔍 Checking if page title contains 'galway': " + titleLooksCorrect);
//
//        Assertions.assertTrue(titleLooksCorrect, "❌ Login Unsuccessful");
//        System.out.println("✅ Valid Login verified successfully.");
//
//    }
//
//    @AfterEach
//    void tearDown() {
//        System.out.println("🧹 Cleaning up WebDriver...");
//        if (driver != null) {
//            driver.quit();
//        }
//        System.out.println("✅ WebDriver closed.");
//    }
//}
//
//

package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LoginPage extends BasePage {

    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(xpath = "//button[text()='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//h1")
    private WebElement standingsTitle;

    @FindBy(id = "error")
    private WebElement loginError;

    public LoginPage(WebDriver driver) {
        super(driver);
        PageFactory.initElements(driver, this);
    }

    public boolean isAtLoginPage() {
        return getPageTitle().toLowerCase().contains("login");
    }

    public boolean isLoginFormPresent() {
        wait.until(ExpectedConditions.visibilityOf(usernameInput));
        wait.until(ExpectedConditions.visibilityOf(passwordInput));
        wait.until(ExpectedConditions.visibilityOf(loginButton));
        return usernameInput.isDisplayed() && passwordInput.isDisplayed() && loginButton.isDisplayed();
    }

    public void loginAs(String username, String password) {
        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);
        loginButton.click();
    }

    public boolean isLoginSuccessful() {
        wait.until(ExpectedConditions.visibilityOf(standingsTitle));
        return standingsTitle.getText().toLowerCase().contains("galway");
    }

    public boolean isLoginFailed() {
        WebElement title = wait.until(ExpectedConditions.visibilityOf(loginError));
        return title.getText().toLowerCase().contains("invalid login ya ape");
    }
}

