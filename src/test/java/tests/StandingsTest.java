package tests;
import org.junit.jupiter.api.Test;
import pages.LoginPage;
import pages.StandingsPage;

import static org.junit.jupiter.api.Assertions.assertTrue;


public class StandingsTest extends BaseTest{
   private final String loginUrl = System.getProperty("siteUrl", "https://jimweather.netlify.app/login.html");
   private String user = "user";
   private String pass = "pass";

    @Test
    public void testJamesAppearsInStandings() {
//        // Step 1: Navigate to login page
//        driver.get(loginUrl);
//        LoginPage loginPage = new LoginPage(driver);
//
//        // Step 2: Perform valid login
//        loginPage.loginAs(user, pass);
//
//        // Step 3: Instantiate StandingsPage
//        StandingsPage standingsPage = new StandingsPage(driver);

        StandingsPage standingsPage = loginAndGoToStandingsPage();

        // Step 4: Validate we are on standings page
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Step 5: Get and print James's score
        String score = standingsPage.JamesScore();
        System.out.println("📊 James's score is: " + score);

        // Step 6 (Optional): Assert the score is not empty
        assertTrue(!score.isEmpty(), "❌ James's score is empty.");
    }


    @Test
    public void testLogOut(){
        //1: Navigate to login page
        driver.get(loginUrl);
        LoginPage loginPage = new LoginPage(driver);

        // Step 2: Perform valid login
        loginPage.loginAs(user,pass);

        // Step 3: Instantiate StandingsPage
        StandingsPage standingsPage = new StandingsPage(driver);

        // Step 4: Validate we are on standings page
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Step 5: Click the logout button
        standingsPage.clickLogout();

        // Step 6: Verify logout success and we're back at the login page
        assertTrue(loginPage.isAtLoginPage(), "❌ Not on the Login page.");
    }
}
