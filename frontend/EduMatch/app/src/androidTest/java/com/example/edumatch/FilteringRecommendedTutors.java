package com.example.edumatch;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;
import static androidx.test.espresso.matcher.ViewMatchers.isRoot;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static com.example.edumatch.CustomMatchers.clickChildWithText;
import static com.example.edumatch.CustomMatchers.clickOnChipWithText;
import static com.example.edumatch.CustomMatchers.hasMinimumChildCount;
import static com.example.edumatch.CustomMatchers.withChildViewCount;
import static com.example.edumatch.CustomMatchers.withChildViewCountGreaterThanOrEqualTo;
import static com.example.edumatch.CustomMatchers.withItemCount;
import static org.hamcrest.Matchers.greaterThan;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.instanceOf;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.test.espresso.contrib.RecyclerViewActions;
import androidx.test.espresso.intent.Intents;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import com.example.edumatch.activities.MainActivity;
import com.example.edumatch.activities.TuteeHomeActivity;
import com.example.edumatch.activities.UniversityInformationActivity;
import com.example.edumatch.views.SubjectChipHomeView;
import com.example.edumatch.views.SubjectChipView;
import com.example.edumatch.views.TutorRow;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FilteringRecommendedTutors {

    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);
    Context context;
    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;
    private static final String NAME = "finalTutee";
    private static final String PASSWORD = "password";

    @Before
    public void setUp() {
        // Set up SharedPreferences with your desired initial values
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        sharedPreferences.edit().putString("JWTtoken", "eyJhbGciOiJIUzI1NiJ9.NjU0MzE3MWQzNWQ0ZTYxMzQzN2I5MzJi.LgNYfo-o2chIt1Rgd-QOZaL-If_wM5qS2rGYCy82hIQ").apply();
    }

    @Test
    public void testTutorFiltering() {
        Intents.init();
        // Launch the initial activity (MainActivity in this example)
        onView(CustomMatchers.withAncestor(R.id.username,R.id.edit_text)).perform(replaceText(NAME));
        onView(CustomMatchers.withAncestor(R.id.password,R.id.edit_text)).perform(replaceText(PASSWORD));
        onView(withId(R.id.signin_button)).perform(click());

        intended(hasComponent(TuteeHomeActivity.class.getName()));

        //onView(withId(R.id.tutorList)).check(matches(withItemCount(greaterThan(0))));

        int expectedChipCount = 3; // Replace with the expected number of chips
        onView(withId(R.id.chipContainer))
                .check(matches(withChildViewCount(expectedChipCount, SubjectChipHomeView.class)));

        // Check that there are no tutors on screen yet
        onView(withId(R.id.tutorList))
                .check(matches(withChildViewCount(0, TutorRow.class)));

        // Click on ELEC 201 MATH 220 CPEN 221

       // onView(allOf(instanceOf(SubjectChipHomeView.class), withText("MATH 220"), isDescendantOfA(withId(R.id.chipContainer))))
              //  .perform(click());

        String[] chipTexts = {"ELEC 201", "MATH 220", "CPEN 221"};

        for (String chipText : chipTexts) {
            // Click on the chip with the specified text
            onView(withText(chipText)).perform(click());

            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }

            // Now check the number of tutor rows. Replace this with your actual logic
            // for checking the number of tutor rows. This is just a placeholder.
            onView(withId(R.id.tutorList))
                    .check(matches(hasMinimumChildCount(1))); // Example assertion

            // Add any additional logic needed after clicking each chip
        }



//        onView(withId(R.id.chipContainer))
//                .perform(RecyclerViewActions.actionOnItemAtPosition(0, click()));

//        onView(allOf(
//                isDescendantOfA(withId(R.id.chipContainer)),
//                withText("ELEC 201")))
//                .perform(clickOnChipWithText("ELEC 201"));


//        try {
//            Thread.sleep(3000); // Sleep for 1 second
//        } catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }
//
//
//        onView(withId(R.id.tutorList))
//                .check(matches(withChildViewCountGreaterThanOrEqualTo(2, TutorRow.class)));
//
//        onView(withId(R.id.chipContainer))
//                .perform(clickChildWithText("MATH 220"));
//
//        onView(withId(R.id.tutorList))
//                .check(matches(withChildViewCountGreaterThanOrEqualTo(10, TutorRow.class)));
//
//        onView(withId(R.id.chipContainer))
//                .perform(clickChildWithText("CPEN 221"));
//
//        onView(withId(R.id.tutorList))
//                .check(matches(withChildViewCountGreaterThanOrEqualTo(10, TutorRow.class)));


    }


}
