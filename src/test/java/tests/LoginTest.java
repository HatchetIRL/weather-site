//package tests;
//
//import org.junit.jupiter.api.Test;
//import pages.LoginPage;
//
//import static org.junit.jupiter.api.Assertions.assertTrue;
//
//public class LoginTest extends BaseTest {
//
//    @Test
//    void loginPageLoads() {
//        driver.get(siteUrl);
//        LoginPage loginPage = new LoginPage(driver);
//
//        assertTrue(loginPage.isAtLoginPage(), "Page title does not indicate login page");
//        assertTrue(loginPage.isLoginFormPresent(), "Login form not present");
//        System.out.println("✅ Login Page verified successfully.");
//    }
//
//    @Test
//    void testValidLogin() {
//        driver.get(siteUrl);
//        LoginPage loginPage = new LoginPage(driver);
//
//        loginPage.loginAs("user", "pass");
//        assertTrue(loginPage.isLoginSuccessful(), "Login did not reach expected page");
//        System.out.println("✅ Valid Login verified successfully.");
//    }
//
//    @Test
//    void testInValidLogin() {
//        driver.get(siteUrl);
//        LoginPage loginPage = new LoginPage(driver);
//
//        loginPage.loginAs("users", "passs");
//        assertTrue(loginPage.isLoginFailed(), "Login with invalid creds should have failed!");
//        System.out.println("✅ InValid Login verified successfully.");
//    }
//}

package tests;

import org.junit.jupiter.api.Test;
import pages.LoginPage;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class LoginTest extends BaseTest {

    private final String loginUrl = System.getProperty("siteUrl", "https://jimweather.netlify.app/login.html");

    @Test
    public void testLoginPageLoads() {
        driver.get(loginUrl);
        LoginPage loginPage = new LoginPage(driver);
        assertTrue(loginPage.isAtLoginPage(), "Login page title not as expected");
        assertTrue(loginPage.isLoginFormPresent(), "Login form elements are not present");
    }

    @Test
    public void testValidLogin() {
        driver.get(loginUrl);
        LoginPage loginPage = new LoginPage(driver);
        loginPage.loginAs("user", "pass");
        assertTrue(loginPage.isLoginSuccessful(), "Login failed or landing page incorrect");
    }

    @Test
    void testInValidLogin() {
        driver.get(loginUrl);
        LoginPage loginPage = new LoginPage(driver);

        loginPage.loginAs("users", "passs");
        assertTrue(loginPage.isLoginFailed(), "Login with invalid creds should have failed!");
        System.out.println("✅ InValid Login verified successfully.");
    }
}

