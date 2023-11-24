package com.example.edumatch;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
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

import org.hamcrest.Matchers;
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
    private static final String NAME = "m6Tutee";
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

        int expectedChipCount = 2; // Replace with the expected number of chips
        onView(withId(R.id.chipContainer))
                .check(matches(withChildViewCount(expectedChipCount, SubjectChipHomeView.class)));

        // Check that there are no tutors on screen yet
        onView(withId(R.id.tutorList))
                .check(matches(withChildViewCount(0, TutorRow.class)));


        onView(withText("EOSC 114")).perform(click());

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        onView(withText("No recommended tutors for this course yet!"))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));



        onView(withText("MATH 220")).perform(click());
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        onView(withId(R.id.tutorList))
                .check(matches(hasMinimumChildCount(1))); // Example assertion

        onView(withText("MATH 220")).perform(click());

        onView(withId(R.id.tutorList))
                .check(matches(hasMinimumChildCount(1))); // Example assertion

        Intents.release();

    }


}
