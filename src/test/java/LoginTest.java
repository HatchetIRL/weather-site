import org.junit.jupiter.api.*;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import io.github.bonigarcia.wdm.WebDriverManager;
import pages.LoginPage;

import static org.junit.jupiter.api.Assertions.assertTrue;
import java.time.Duration;

public class LoginTest {

    private WebDriver driver;
    private LoginPage loginPage;

    String loginUrl = System.getProperty("siteUrl", "https://jimweather.netlify.app/login.html");
    boolean isHeadless = Boolean.parseBoolean(System.getProperty("headless", "false"));

    @BeforeEach
    void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions options = new ChromeOptions();

        if (isHeadless) {
            options.addArguments("--headless", "--disable-gpu", "--window-size=1920,1080");
        }

        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

        driver.get(loginUrl);
        loginPage = new LoginPage(driver);
    }

    @Test
    void loginPageLoads() {
        assertTrue(loginPage.isAtLoginPage(), "Page title does not indicate login page");
        assertTrue(loginPage.isLoginFormPresent(), "Login form not present");
    }

    @Test
    void testValidLogin() {
        loginPage.loginAs("user", "pass");
        assertTrue(loginPage.isLoginSuccessful(), "Login did not reach expected page");
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}

