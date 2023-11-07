package com.example.edumatch;

import android.view.View;

import androidx.test.espresso.matcher.ViewMatchers;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class CustomMatchers {

    public static Matcher<Object> isNotDisplayed() {
        return new TypeSafeMatcher<Object>() {
            @Override
            protected boolean matchesSafely(Object item) {
                return (item instanceof View && ((View) item).getVisibility() != View.VISIBLE);
            }

            @Override
            public void describeTo(Description description) {
                description.appendText("view is not displayed on the screen");
            }
        };
    }
}
