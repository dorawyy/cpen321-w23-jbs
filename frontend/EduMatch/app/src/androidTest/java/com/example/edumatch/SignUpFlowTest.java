package com.example.edumatch;

import static androidx.core.util.Predicate.not;
import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.RootMatchers.isPlatformPopup;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.matcher.ViewMatchers.hasDescendant;
import static androidx.test.espresso.matcher.ViewMatchers.hasErrorText;
import static androidx.test.espresso.matcher.ViewMatchers.hasSibling;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.isRoot;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static com.google.api.client.repackaged.com.google.common.base.CharMatcher.is;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasToString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.Mockito.when;

import android.app.Dialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.Button;
import android.widget.TimePicker;

import androidx.test.core.app.ActivityScenario;
import androidx.test.espresso.Espresso;
import androidx.test.espresso.Root;
import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.assertion.ViewAssertions;
import androidx.test.espresso.intent.Intents;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import com.example.edumatch.activities.AccountInformationActivity;
import com.example.edumatch.activities.AvailabilityActivity;
import com.example.edumatch.activities.CourseRatesActivity;
import com.example.edumatch.activities.LocationInformationActivity;
import com.example.edumatch.activities.MainActivity;
import com.example.edumatch.activities.TutorHomeActivity;
import com.example.edumatch.activities.TutorOrTuteeActivity;
import com.example.edumatch.activities.UniversityInformationActivity;
import com.example.edumatch.util.LoginSignupHelper;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.Matchers;
import org.hamcrest.TypeSafeMatcher;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.junit.MockitoJUnitRunner;
import androidx.test.espresso.contrib.PickerActions;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;

@RunWith(MockitoJUnitRunner.class)
public class SignUpFlowTest {

    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);

    static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMdd_HHmm", Locale.getDefault());
    static String currentDateAndTime = dateFormat.format(new Date());
    private static final String NAME = "John Doe";
    private static final String EMAIL = "johndoe" + currentDateAndTime + "@example.com";
    private static final String PHONE_NUMBER = "1234567890";

    private static final String USERNAME = "tester" + currentDateAndTime;
    private static final String PASSWORD = "password123";
    private static final String BIO = "This is a test bio";
    private static final String PROGRAM = "CPEN";

    private static final String YEAR_LEVEL = "4";

    private static final String UNIVERSITY = "The University of British Columbia";

    private static final HashSet<String> COURSES = new HashSet<>(Arrays.asList("CPEN 221", "CPEN 321"));

    private static final HashSet<String> TAGS = new HashSet<>(Arrays.asList("EASY", "FUN", "CHEAP"));

    private static final String COURSE_PRICE_PAIR = "{\"course\":\"CPEN 321\",\"hourlyRate\":100}";

    private static final String LOCATION = "online";

    private static final String SUNDAY_START_TIME = "10:30";
    private static final String SUNDAY_END_TIME = "18:30";

    private static final String MONDAY_START_TIME = "00:00";
    private static final String MONDAY_END_TIME = "23:59";
    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;

    Context context;


    @Before
    public void setUp() {
        // Set up SharedPreferences with your desired initial values
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }


//    @Test
//    public void testSignUpButton() {
//        activityRule.launchActivity(new Intent());
//        Intents.init();
//        onView(withId(R.id.signup_button)).perform(click());
//        assertEquals(false, sharedPreferences.getBoolean("useGoogle", true));
//        intended(hasComponent(TutorOrTuteeActivity.class.getName()));
//        Intents.release();
//    }
//
//    @Test
//    public void testTutorButton() {
//
//        onView(withId(R.id.tutor_button)).perform(click());
//        assertEquals("tutor", sharedPreferences.getString("userType", ""));
//        intended(hasComponent(AccountInformationActivity.class.getName()));
//        Intents.release();
//    }



    @Test
    public void testSignUpFlow() {
        Intents.init();
        // Launch the initial activity (MainActivity in this example)
        onView(withId(R.id.signup_button)).perform(click());

        // Verify that we are in the correct state after the first activity
        intended(hasComponent(TutorOrTuteeActivity.class.getName()));
        assertFalse(sharedPreferences.getBoolean("useGoogle", true));

        // Continue the flow by clicking the "Tutor" button
        onView(withId(R.id.tutor_button)).perform(click());

        // Verify that we are in the next activity (AccountInformationActivity)
        intended(hasComponent(AccountInformationActivity.class.getName()));
        assertEquals("tutor", sharedPreferences.getString("userType", ""));

        // Try to continue without filling in required field
        onView(withId(R.id.next_button)).perform(click());

        // Check if the error message is displayed
        Matcher<View> editText = CustomMatchers.withAncestor(R.id.create_name, R.id.edit_text);
        onView(editText).check(matches(hasErrorText("This field is required")));

        //Enter information in edit text

        onView(CustomMatchers.withAncestor(R.id.create_name,R.id.edit_text)).perform(replaceText(NAME));
        onView(CustomMatchers.withAncestor(R.id.create_email,R.id.edit_text)).perform(replaceText(EMAIL));
        onView(CustomMatchers.withAncestor(R.id.create_phone_number,R.id.edit_text)).perform(replaceText(PHONE_NUMBER));
        onView(CustomMatchers.withAncestor(R.id.create_userName,R.id.edit_text)).perform(replaceText(USERNAME));
        onView(CustomMatchers.withAncestor(R.id.create_password,R.id.edit_text)).perform(replaceText(PASSWORD));
        onView(CustomMatchers.withAncestor(R.id.create_bio,R.id.edit_text)).perform(replaceText(BIO));

        // Call the updatePreferences method to update SharedPreferences
        onView(withId(R.id.next_button)).perform(click());

        // Verify SharedPreferences
        assertEquals(NAME, sharedPreferences.getString("name", ""));
        assertEquals(EMAIL, sharedPreferences.getString("email", ""));
        assertEquals(PHONE_NUMBER, sharedPreferences.getString("phoneNumber", ""));
        assertEquals(USERNAME, sharedPreferences.getString("username", ""));
        assertEquals(PASSWORD, sharedPreferences.getString("password", ""));
        assertEquals(BIO, sharedPreferences.getString("bio", ""));

        intended(hasComponent(UniversityInformationActivity.class.getName()));


        // Fill in fields

        onView(CustomMatchers.withAncestor(R.id.choose_program,R.id.edit_text)).perform(replaceText(PROGRAM));
        onView(CustomMatchers.withAncestor(R.id.select_year_level,R.id.edit_text)).perform(replaceText(YEAR_LEVEL));

        // Search for courses

        Espresso.onView(CustomMatchers.withAncestor(R.id.search_courses_auto_complete, R.id.auto_complete))
                .perform(ViewActions.typeText("CPEN"), ViewActions.closeSoftKeyboard());

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }


        MainActivity mActivity = activityRule.getActivity();

        onView(withText("CPEN 221")).inRoot(withDecorView(Matchers.not(Matchers.is(mActivity.getWindow().getDecorView())))).perform(click());
        onView(withId(R.id.add_button)).perform(click());

        Espresso.onView(withId(R.id.chip_container))
                .check(matches(allOf(
                        hasDescendant(withText("CPEN 221")), // Replace with the actual subject text
                        isDisplayed()
                )));

        Espresso.onView(CustomMatchers.withAncestor(R.id.search_courses_auto_complete, R.id.auto_complete))
                .perform(ViewActions.typeText("CPEN 32"), ViewActions.closeSoftKeyboard());

        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }


// Scroll to find the AutoCompleteTextView with the desired suggestion
        onView(withText("CPEN 321")).inRoot(withDecorView(Matchers.not(Matchers.is(mActivity.getWindow().getDecorView())))).perform(click());

        onView(withId(R.id.add_button)).perform(click());

        Espresso.onView(withId(R.id.chip_container))
                .check(matches(allOf(
                        hasDescendant(withText("CPEN 321")), // Replace with the actual subject text
                        isDisplayed()
                )));


        // Call the updatePreferences method to update SharedPreferences
        onView(withId(R.id.next_button)).perform(click());

        assertEquals(PROGRAM, sharedPreferences.getString("program", ""));
        assertEquals(YEAR_LEVEL, sharedPreferences.getString("yearLevel", ""));
        assertEquals(UNIVERSITY, sharedPreferences.getString("university", ""));
        assertEquals(COURSES, sharedPreferences.getStringSet("courses", new HashSet<>()));

        // Next Activity
        intended(hasComponent(CourseRatesActivity.class.getName()));


        int expectedChildCount = 2; // Change this based on your scenario

        onView(ViewMatchers.withId(R.id.course_rate_container))
                .check(ViewAssertions.matches(ViewMatchers.hasChildCount(expectedChildCount)));


        onView(allOf(
                CustomMatchers.withAncestor(R.id.course_rate_container, R.id.rate),
                hasSibling(withText("CPEN 321"))
        )).perform(replaceText("100"));

        for(String tag : TAGS){
            onView(CustomMatchers.withAncestor(R.id.add_tags,R.id.edit_text)).perform(replaceText(tag));
            onView(withId(R.id.add_button)).perform(click());
            Espresso.onView(withId(R.id.chip_container))
                    .check(matches(allOf(
                            hasDescendant(withText(tag)), // Replace with the actual subject text
                            isDisplayed()
                    )));
        }

        onView(withId(R.id.next_button)).perform(click());

        assertEquals(TAGS, sharedPreferences.getStringSet("tags", new HashSet<>()));
        if (!sharedPreferences.getString("coursePricePairs", "").contains(COURSE_PRICE_PAIR)) {
            throw new AssertionError("Expected substring '" + COURSE_PRICE_PAIR + " not found in sharedPreferences " + sharedPreferences.getString("coursePricePairs", ""));
        }


        intended(hasComponent(LocationInformationActivity.class.getName()));


        onView(withId(R.id.next_button)).perform(click());

        // Check if the toast is displayed
        onView(withText("No Location Selected"))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));

        onView(withId(R.id.online_radio)).perform(click());

        onView(withId(R.id.next_button)).perform(click());

        assertEquals(LOCATION, sharedPreferences.getString("locationMode", ""));

        intended(hasComponent(AvailabilityActivity.class.getName()));

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        onView(withId(R.id.sunday_button)).perform(click());

        onView(withId(R.id.start_time_button)).perform(click());


// Now, interact with the TimePickerDialog
        onView(withClassName(Matchers.equalTo(TimePicker.class.getName())))
                .perform(PickerActions.setTime(10, 30));

        onView(withText("OK"))
                .perform(click());


        onView(withId(R.id.end_time_button)).perform(click());


// Now, interact with the TimePickerDialog
        onView(withClassName(Matchers.equalTo(TimePicker.class.getName()))).perform(
                PickerActions.setTime(18, 30) // Set the desired time (10:30 AM in this example)
        );

        onView(withText("OK"))
                .perform(click());


        onView(withId(R.id.set_time_button)).perform(click());


        onView(withText("Saved for Sunday"))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));



        onView(withId(R.id.monday_button)).perform(click());

        onView(withId(R.id.start_time_button)).perform(click());


// Now, interact with the TimePickerDialog
        onView(withClassName(Matchers.equalTo(TimePicker.class.getName())))
                .perform(PickerActions.setTime(18, 30));

        onView(withText("OK"))
                .perform(click());


        onView(withId(R.id.end_time_button)).perform(click());


// Now, interact with the TimePickerDialog
        onView(withClassName(Matchers.equalTo(TimePicker.class.getName()))).perform(
                PickerActions.setTime(10, 30) // Set the desired time (10:30 AM in this example)
        );

        onView(withText("OK"))
                .perform(click());

        onView(withId(R.id.set_time_button)).perform(click());


        onView(withText("Start Time Not Before End Time, Not Saved!"))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        onView(withId(R.id.manually_set_button))
                .perform(click());

        assertEquals(SUNDAY_START_TIME, sharedPreferences.getString("SundayStartTime", ""));
        assertEquals(SUNDAY_END_TIME, sharedPreferences.getString("SundayEndTime", ""));

        assertEquals(MONDAY_START_TIME, sharedPreferences.getString("MondayStartTime", ""));
        assertEquals(MONDAY_END_TIME, sharedPreferences.getString("MondayEndTime", ""));


        intended(hasComponent(TutorHomeActivity.class.getName()));

        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }

        onView(isRoot()).perform(ViewActions.pressBack());

        editor.putString("jwtToken","");
        editor.commit();

//        try {
//            Thread.sleep(100000);
//        } catch (InterruptedException e) {
//            throw new RuntimeException(e);
//        }

        onView(withId(R.id.manually_set_button))
                .perform(click());

        onView(withText("Username already exists."))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));

        try {
            Thread.sleep(100000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        // Enter information
        Intents.release();
    }

}

