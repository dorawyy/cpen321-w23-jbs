package com.example.edumatch;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static com.example.edumatch.CustomMatchers.hasMinimumChildCount;
import static com.example.edumatch.CustomMatchers.withChildViewCount;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.test.espresso.intent.Intents;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import com.example.edumatch.activities.MainActivity;
import com.example.edumatch.activities.TuteeHomeActivity;
import com.example.edumatch.views.SubjectChipHomeView;
import com.example.edumatch.views.TutorRow;

import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class FilteringRecommendedTutorsTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);
    Context context;
    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;
    private static final String NAME = "m6Tutee";
    private static final String PASSWORD = "password";

    @Before
    public void setUp() {
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        sharedPreferences.edit().putString("JWTtoken", "eyJhbGciOiJIUzI1NiJ9.NjU0MzE3MWQzNWQ0ZTYxMzQzN2I5MzJi.LgNYfo-o2chIt1Rgd-QOZaL-If_wM5qS2rGYCy82hIQ").apply();
    }

    // ChatGPT usage: Yes
    @Test
    public void testTutorFiltering() {
        Intents.init();
        // Sign-in with credentials
        onView(CustomMatchers.withAncestor(R.id.username,R.id.edit_text)).perform(replaceText(NAME));
        onView(CustomMatchers.withAncestor(R.id.password,R.id.edit_text)).perform(replaceText(PASSWORD));
        onView(withId(R.id.signin_button)).perform(click());

        intended(hasComponent(TuteeHomeActivity.class.getName()));

        // See if we have correct number of subject chips
        int expectedChipCount = 2;
        onView(withId(R.id.chipContainer))
                .check(matches(withChildViewCount(expectedChipCount, SubjectChipHomeView.class)));

        // Check that there are no tutors on screen yet
        onView(withId(R.id.tutorList))
                .check(matches(withChildViewCount(0, TutorRow.class)));

        // Click on first course subject chip
        onView(withText("EOSC 114")).perform(click());

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        // Check for Toast notification
        onView(withText("No recommended tutors for this course yet!"))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));

        // Click on second course subject chip
        onView(withText("MATH 220")).perform(click());
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        // Check that there is a minimum of one recommended tutor on screen
        onView(withId(R.id.tutorList))
                .check(matches(hasMinimumChildCount(1)));

        // Click on second course subject chip to un-select it
        onView(withText("MATH 220")).perform(click());

        // Check that there is a minimum of one recommended tutor on screen
        onView(withId(R.id.tutorList))
                .check(matches(hasMinimumChildCount(1)));

        Intents.release();

    }


}
