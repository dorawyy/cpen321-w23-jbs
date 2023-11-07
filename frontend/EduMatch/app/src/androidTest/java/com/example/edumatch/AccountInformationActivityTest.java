package com.example.edumatch;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import androidx.test.espresso.Espresso;
import androidx.test.espresso.assertion.ViewAssertions;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.rule.ActivityTestRule;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;

import android.content.SharedPreferences;

import com.example.edumatch.activities.AccountInformationActivity;

@RunWith(AndroidJUnit4.class)
public class AccountInformationActivityTest {

    @Rule
    public ActivityTestRule<AccountInformationActivity> activityRule =
            new ActivityTestRule<>(AccountInformationActivity.class);
    @Mock
    SharedPreferences sharedPreferences;
    @Before
    public void setUp() {
        // Set up SharedPreferences with useGoogle set to true
        sharedPreferences = mock(SharedPreferences.class);
    }

    @Test
    public void testInitInvisibleFieldsWithUseGoogleTrue() {
        when(sharedPreferences.getBoolean("useGoogle", false)).thenReturn(true);
        when(sharedPreferences.getBoolean("isEditing", false)).thenReturn(false);
        // Use Espresso to perform actions on the UI
        activityRule.getActivity().initInvisibleFields(sharedPreferences);

        Espresso.onView(ViewMatchers.withId(R.id.create_userName))
                .check(ViewAssertions.matches(CustomMatchers.isNotDisplayed())); // Check that it is not displayed

        Espresso.onView(ViewMatchers.withId(R.id.create_password))
                .check(ViewAssertions.matches(CustomMatchers.isNotDisplayed())); // Check that it is not displayed
    }
}

