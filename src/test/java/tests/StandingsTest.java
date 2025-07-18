package tests;
import org.junit.jupiter.api.Test;
import pages.StandingsPage;

import static org.junit.jupiter.api.Assertions.assertTrue;


public class StandingsTest extends BaseTest{

    @Test
    public void testJamesAppearsInStandings() {
        StandingsPage standingsPage = goToStandingsPage();

        // Step 4: Validate we are on standings page
        assertTrue(standingsPage.isAtStandingsPage(), "❌ Not on the standings page.");

        // Step 5: Get and print James's score
        String score = standingsPage.JamesScore();
        System.out.println("📊 ######### James's score is: " + score);

        // Step 6 (Optional): Assert the score is not empty
        assertTrue(!score.isEmpty(), "❌  James's score is empty.");
    }



}
