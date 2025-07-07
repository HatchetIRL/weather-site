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

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import io.github.bonigarcia.wdm.WebDriverManager;

public class LoginTest {

    private WebDriver driver;

    @BeforeEach
    void setUp() {
        System.out.println("🔧 Setting up WebDriver for Login Test...");
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
    }

    @Test
    void testLoginPageLoads() {
        String loginUrl = "https://jimweather.netlify.app/login.html";
        System.out.println("🌐 Navigating to login page: " + loginUrl);
        driver.get(loginUrl);

        String pageTitle = driver.getTitle();
        System.out.println("📄 Page title received: \"" + pageTitle + "\"");

        boolean titleLooksCorrect = pageTitle.toLowerCase().contains("login");
        System.out.println("🔍 Checking if page title contains 'login': " + titleLooksCorrect);

        assertTrue(titleLooksCorrect, "❌ Page title does not indicate a login page");
        System.out.println("✅ Login page title verified successfully.");
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


