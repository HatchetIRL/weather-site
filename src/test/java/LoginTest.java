import org.junit.jupiter.api.Test;
import pages.LoginPage;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginTest extends BaseTest {

    @Test
    void loginPageLoads() {
        driver.get(siteUrl);
        LoginPage loginPage = new LoginPage(driver);

        assertTrue(loginPage.isAtLoginPage(), "Page title does not indicate login page");
        assertTrue(loginPage.isLoginFormPresent(), "Login form not present");
    }

    @Test
    void testValidLogin() {
        driver.get(siteUrl);
        LoginPage loginPage = new LoginPage(driver);

        loginPage.loginAs("user", "pass");
        assertTrue(loginPage.isLoginSuccessful(), "Login did not reach expected page");
    }
}
