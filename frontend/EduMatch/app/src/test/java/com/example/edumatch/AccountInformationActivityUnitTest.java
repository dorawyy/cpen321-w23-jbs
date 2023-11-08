package com.example.edumatch;

import static com.example.edumatch.util.LoginSignupHelper.constructEditCourseRates;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.MockitoJUnitRunner;
import org.powermock.api.mockito.PowerMockito;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mock;

import com.example.edumatch.activities.AccountInformationActivity;
import com.example.edumatch.util.LoginSignupHelper;

@RunWith(MockitoJUnitRunner.class)
public class AccountInformationActivityUnitTest {

    @Mock
    private SharedPreferences sharedPreferences;

    @Before
    public void setUp() {
        MockitoAnnotations.initMocks(this);
    }

    @Test
    public void testConstructEditCourseRates() {
        // Mock the behavior of SharedPreferences
        when(sharedPreferences.getString("name", "")).thenReturn("John Doe");
        when(sharedPreferences.getString("email", "")).thenReturn("johndoe@example.com");
        when(sharedPreferences.getString("phoneNumber", "")).thenReturn("1234567890");
        when(sharedPreferences.getString("bio", "")).thenReturn("This is a test bio");

        // Call the function under test from the JSONBuilder class
        JSONObject requestBody = LoginSignupHelper.constructEditCourseRates(sharedPreferences);

        // Verify that the constructed JSON object matches the expected value
        JSONObject expectedRequestBody = new JSONObject();
        try {
            expectedRequestBody.put("displayedName", "John Doe");
            expectedRequestBody.put("email", "johndoe@example.com");
            expectedRequestBody.put("phoneNumber", "1234567890");
            expectedRequestBody.put("bio", "This is a test bio");
        } catch (JSONException e) {
            e.printStackTrace();
        }

        assertEquals(expectedRequestBody.toString(), requestBody.toString());
    }

    @Test
    public void testConstructEditCourseRatesWithJSONException() {
        // Force a JSONException to be thrown
        when(sharedPreferences.getString("name", "")).thenThrow(new JSONException("Test JSON exception"));

        // Call the function under test
        JSONObject requestBody = LoginSignupHelper.constructEditCourseRates(sharedPreferences);

        // Verify that the returned JSONObject is null (due to JSONException)
        assertNull(requestBody);
    }
}
