//import io.github.bonigarcia.wdm.WebDriverManager;
////import static org.junit.Assert.*;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.chrome.ChromeDriver;
//
//public class LoginTest {
//
//    private WebDriver driver;
//
//    @BeforeEach
//    public void setUp() {
//        // path to chromedriver must be configured
//        WebDriverManager.chromedriver().setup();
//        driver = new ChromeDriver();
//    }
//
//    @Test
//    public void loginPageLoads() {
//        driver.get("https://jimweather.netlify.app/login.html");
//        String title = driver.getTitle();
//        assertTrue(title.contains("Login")); // adjust for your page
//    }
//
//    @AfterEach
//    public void tearDown() {
//        driver.quit();
//    }
//}

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginTest {

    private WebDriver driver;
    private final String loginUrl = "https://jimweather.netlify.app/login.html";

    @BeforeEach
    void setUp() {
        System.out.println("🔧 Setting up WebDriver for Login Test...");
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));  // set generic implicit wait
    }

    @Test
    void testLoginPageLoads() {
        //String loginUrl = "https://jimweather.netlify.app/login.html";
        System.out.println("🌐 Navigating to login page: " + loginUrl);
        driver.get(loginUrl);

        String pageTitle = driver.getTitle();
        System.out.println("📄 Page title received: \"" + pageTitle + "\"");

        boolean titleLooksCorrect = pageTitle.toLowerCase().contains("login");
        System.out.println("🔍 Checking if page title contains 'login': " + titleLooksCorrect);

        assertTrue(titleLooksCorrect, "❌ Page title does not indicate a login page");
        System.out.println("✅ Login page title verified successfully.");
    }


    @Test
    void testValidLogin(){
        System.out.println("Test for a valid login");
        System.out.println("Navigating to the login page: " + loginUrl);
        driver.get(loginUrl);
        String strUser = "user";
        String strPass = "pass";


        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        System.out.println("Check that the username textbox is present");
        WebElement txtUserName = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("username")));

        System.out.println("Check that the password textbox is present");
        WebElement txtPassword = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("password")));

        WebElement btnLogin = driver.findElement(By.xpath("//button[text()=\"Login\"]"));

        assertTrue(txtUserName.isDisplayed(), "❌ username textbox is not displayed");
        assertTrue(txtPassword.isDisplayed(),"❌ password textbox is not displayed");
        assertTrue(btnLogin.isDisplayed(), "❌ login button is not displayed");

        // Enter valid login and verify that the standings page loads
        System.out.println("Enter valid login and click Login button");
        txtUserName.sendKeys(strUser);
        txtPassword.sendKeys(strPass);
        btnLogin.click();

        //Wait for the Standings page to load
        WebElement titleText = wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1")));
        System.out.println("Standings page loaded. Title text is visible: " + titleText.getText());

        boolean titleLooksCorrect = titleText.getText().toLowerCase().contains("galway");
        System.out.println("🔍 Checking if page title contains 'galway': " + titleLooksCorrect);

        assertTrue(titleLooksCorrect, "❌ Login Unsuccessful");
        System.out.println("✅ Valid Login verified successfully.");

    }

    @AfterEach
    void tearDown() {
        System.out.println("🧹 Cleaning up WebDriver...");
        if (driver != null) {
            driver.quit();
        }
        System.out.println("✅ WebDriver closed.");
    }
}


