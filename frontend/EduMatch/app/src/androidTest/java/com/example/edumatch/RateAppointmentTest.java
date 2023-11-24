package com.example.edumatch;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.test.espresso.intent.Intents;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import com.example.edumatch.activities.AppointmentListActivity;
import com.example.edumatch.activities.MainActivity;
import com.example.edumatch.activities.ScheduledAppointmentActivity;
import com.example.edumatch.activities.TuteeHomeActivity;
import com.example.edumatch.activities.TutorHomeActivity;
import com.example.edumatch.activities.TutorRateActivity;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class RateAppointmentTest {

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
    public void testRateAppointmentFlow() {
        Intents.init();
        // Launch the initial activity (MainActivity in this example)
        onView(CustomMatchers.withAncestor(R.id.username,R.id.edit_text)).perform(replaceText(NAME));
        onView(CustomMatchers.withAncestor(R.id.password,R.id.edit_text)).perform(replaceText(PASSWORD));
        onView(withId(R.id.signin_button)).perform(click());

        intended(hasComponent(TuteeHomeActivity.class.getName()));

        onView(allOf(withId(R.id.appointments), isDescendantOfA(withId(R.id.emptyBar)))).perform(click());

        intended(hasComponent(AppointmentListActivity.class.getName()));



        // Select a specific rateable appointment
        String appointmentIdentifier = "Final Tutor1";

        onView(allOf(withText(appointmentIdentifier), isDescendantOfA(withId(R.id.appointmentList))))
                .perform(scrollTo()) // Scroll to the appointment view
                .perform(click());

        intended(hasComponent(ScheduledAppointmentActivity.class.getName()));


        // Navigate to ScheduledAppointmentActivity
        // ...

//        // Click on rate appointment button
        onView(withId(R.id.review_button)) // Replace with actual button ID
                .perform(click());

        intended(hasComponent(TutorRateActivity.class.getName()));

//
//        // In TutorRateActivity, set rating and feedback
//        onView(withId(R.id.star_rating)) // Replace with star rating widget ID
//                .perform(PickerActions.setRating(4)); // Set star rating
//        onView(withId(R.id.no_show_checkbox)) // Replace with no-show checkbox ID
//                .perform(click());
//        onView(withId(R.id.late_checkbox)) // Replace with late checkbox ID
//                .perform(click());
//        onView(withId(R.id.comment_field)) // Replace with comment field ID
//                .perform(replaceText("Great session!"));
//
//        // Click submit
//        onView(withId(R.id.submit_button)) // Replace with submit button ID
//                .perform(click());
//
//        // Expect toast notifications
//        onView(withText("weights updated"))
//                .inRoot(withDecorView(not(activityRule.getActivity().getWindow().getDecorView())))
//                .check(matches(isDisplayed()));
//        onView(withText("successfully rated tutor"))
//                .inRoot(withDecorView(not(activityRule.getActivity().getWindow().getDecorView())))
//                .check(matches(isDisplayed()));
//
//        // Failure Scenario: Entering more than 200 words in the comment box
//        String longComment = new String(new char[201]).replace("\0", "a"); // 201 characters
//        onView(withId(R.id.comment_field))
//                .perform(replaceText(longComment));
//        onView(withId(R.id.submit_button))
//                .perform(click());
//        onView(withText("Comment too long"))
//                .inRoot(withDecorView(not(activityRule.getActivity().getWindow().getDecorView())))
//                .check(matches(isDisplayed()));
    }
}
