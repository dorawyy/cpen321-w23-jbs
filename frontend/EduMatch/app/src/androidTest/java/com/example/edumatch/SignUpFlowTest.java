package com.example.edumatch;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.ViewMatchers.hasDescendant;
import static androidx.test.espresso.matcher.ViewMatchers.hasErrorText;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static org.hamcrest.CoreMatchers.allOf;
import static org.junit.Assert.assertEquals;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;

import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.intent.Intents;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.rule.ActivityTestRule;

import com.example.edumatch.activities.AccountInformationActivity;
import com.example.edumatch.activities.EditProfileListActivity;
import com.example.edumatch.activities.MainActivity;
import com.example.edumatch.activities.TutorOrTuteeActivity;
import com.example.edumatch.activities.UniversityInformationActivity;

import org.hamcrest.Matcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.mortbay.jetty.Main;

public class SignUpFlowTest {
    @Rule
    public ActivityTestRule<MainActivity> activityRule = new ActivityTestRule<>(MainActivity.class);

    private static final String NAME = "John Doe";
    private static final String EMAIL = "johndoe@example.com";
    private static final String PHONE_NUMBER = "1234567890";
    private static final String USERNAME = "johndoe123";
    private static final String PASSWORD = "password123";
    private static final String BIO = "This is a test bio";

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


    @Test
    public void testSignUpButton() {
        activityRule.launchActivity(new Intent());
        Intents.init();
        onView(withId(R.id.signup_button)).perform(click());
        assertEquals(false, sharedPreferences.getBoolean("useGoogle", true));
        intended(hasComponent(TutorOrTuteeActivity.class.getName()));
        Intents.release();
    }

    @Test
    public void testInitInvisibleFieldsWithIsEditingTrue() {
        editor.putBoolean("isEditing", true);
        editor.commit();

        activityRule.launchActivity(new Intent());

        onView(withId(R.id.create_userName))
                .check(matches(CustomMatchers.isNotDisplayed())); // Check that it is not displayed

        onView(withId(R.id.create_password))
                .check(matches(CustomMatchers.isNotDisplayed())); // Check that it is not displayed
    }

    @Test
    public void testInitInvisibleFieldsWithIsEditingFalseUseGoogleFalse() {
        editor.putBoolean("isEditing", false);
        editor.putBoolean("useGoogle", false);
        editor.commit();

        activityRule.launchActivity(new Intent());

        onView(withId(R.id.create_userName))
                .check(matches(ViewMatchers.isDisplayed()));

        onView(withId(R.id.create_password))
                .check(matches(ViewMatchers.isDisplayed()));
    }

    @Test
    public void verifyViewsAndContent() {
        activityRule.launchActivity(new Intent());
        // Wait for the activity to be ready
        onView(withId(R.id.activity_account_information)).check(matches(ViewMatchers.isDisplayed()));
        // Verify the content of the EditText fields within LabelAndEditTextView
        verifyLabelAndEditTextContent(R.id.create_name, NAME);
        verifyLabelAndEditTextContent(R.id.create_email, EMAIL);
        verifyLabelAndEditTextContent(R.id.create_phone_number, PHONE_NUMBER);
        verifyLabelAndEditTextContent(R.id.create_userName, USERNAME);
        verifyLabelAndEditTextContent(R.id.create_password, PASSWORD);
        verifyLabelAndEditTextContent(R.id.create_bio, BIO);
    }


    @Test
    public void testVerifyFieldsWithEmptyCreateName() {

        activityRule.launchActivity(new Intent());
        Matcher<View> editText = CustomMatchers.withAncestor(R.id.create_name, R.id.edit_text);
        // Clear any pre-existing text in create_name (if any)
        onView(allOf(
                editText
        )).perform(ViewActions.clearText());

        // Click the next button to trigger the validation
        onView(withId(R.id.next_button)).perform(click());

        // Check if the error message is displayed
        onView(editText).check(matches(hasErrorText("This field is required")));
    }


    @Test
    public void testUpdatePreferences() {
        // Set the EditText fields to new values
        // For example, set the name, email, and phone number
        activityRule.launchActivity(new Intent());
        onView(CustomMatchers.withAncestor(R.id.create_name,R.id.edit_text)).perform(ViewActions.replaceText("New Name"));
        onView(CustomMatchers.withAncestor(R.id.create_email,R.id.edit_text)).perform(ViewActions.replaceText("newemail@example.com"));
        onView(CustomMatchers.withAncestor(R.id.create_phone_number,R.id.edit_text)).perform(ViewActions.replaceText("1234567890"));

        // Call the updatePreferences method to update SharedPreferences
        onView(withId(R.id.next_button)).perform(click());

        // Verify that SharedPreferences has been updated correctly

        assertEquals("newemail@example.com", sharedPreferences.getString("email", ""));
        assertEquals("1234567890", sharedPreferences.getString("phoneNumber", ""));
    }


    @Test
    public void testGoToNewActivityIfEditingIsTrue() {
        // Set up SharedPreferences to simulate the "isEditing" condition as true
        Intents.init();
        editor.putBoolean("useGoogle", false);
        editor.putBoolean("isEditing", true);
        editor.apply();

        activityRule.launchActivity(new Intent());

        // Click the "Next" button to invoke the goToNewActivity method
        onView(withId(R.id.next_button)).perform(click());
        // Verify that the correct Intent was created
        intended(hasComponent(EditProfileListActivity.class.getName()));
        Intents.release();
    }


    @Test
    public void testGoToNewActivityIfEditingIsFalse() {
        // Set up SharedPreferences to simulate the "isEditing" condition as true
        Intents.init();
        editor.putBoolean("isEditing", false);
        editor.apply();

        activityRule.launchActivity(new Intent());

        // Click the "Next" button to invoke the goToNewActivity method
        onView(withId(R.id.next_button)).perform(click());
        // Verify that the correct Intent was created
        intended(hasComponent(UniversityInformationActivity.class.getName()));
        Intents.release();
    }

    private void verifyLabelAndEditTextContent(int viewId, String expectedText) {
        onView(allOf(
                withId(viewId),
                hasDescendant(
                        allOf(
                                withId(R.id.edit_text),
                                ViewMatchers.withText(expectedText)
                        )
                )
        )).check(matches(ViewMatchers.isDisplayed()));
    }
}
