package com.example.edumatch;

import static androidx.test.espresso.matcher.ViewMatchers.isAssignableFrom;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;

import static org.hamcrest.Matchers.allOf;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.widget.TextView;

import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.matcher.BoundedMatcher;
import androidx.test.espresso.matcher.ViewMatchers;

import com.example.edumatch.views.SubjectChipHomeView;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class CustomMatchers {

    // ChatGPT usage: Yes
    public static TypeSafeMatcher<View> withChildViewCount(final int expectedCount, final Class<?> childClass) {
        return new TypeSafeMatcher<View>() {
            @Override
            protected boolean matchesSafely(View item) {
                if (!(item instanceof ViewGroup)) {
                    return false;
                }
                ViewGroup viewGroup = (ViewGroup) item;
                int count = 0;
                for (int i = 0; i < viewGroup.getChildCount(); i++) {
                    if (childClass.isInstance(viewGroup.getChildAt(i))) {
                        count++;
                    }
                }
                return count == expectedCount;
            }

            @Override
            public void describeTo(Description description) {
                description.appendText("with " + expectedCount + " children of type " + childClass.getSimpleName());
            }
        };
    }

    // ChatGPT usage: Yes
    public static Matcher<View> hasMinimumChildCount(final int minimumCount) {
        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("a ViewGroup with at least " + minimumCount + " children");
            }

            @Override
            public boolean matchesSafely(View view) {
                return view instanceof ViewGroup && ((ViewGroup) view).getChildCount() >= minimumCount;
            }
        };
    }


    // ChatGPT usage: Yes
    public static Matcher<View> withAncestor(final int ancestorId, final int targetId) {
        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("with ancestor with ID " + ancestorId);
            }

            @Override
            protected boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                while (parent != null) {
                    if (parent instanceof View) {
                        View ancestorView = (View) parent;
                        if (ancestorView.getId() == ancestorId) {
                            return view.getId() == targetId;
                        }
                    }
                    parent = parent.getParent();
                }
                return false;
            }
        };
    }
}
