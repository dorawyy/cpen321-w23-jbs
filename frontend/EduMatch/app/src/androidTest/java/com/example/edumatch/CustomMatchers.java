package com.example.edumatch;

import android.view.View;
import android.view.ViewParent;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

public class CustomMatchers {

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
