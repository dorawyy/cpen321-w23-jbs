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

    public static Matcher<View> withChildViewCountGreaterThanOrEqualTo(final int count, final Class<?> viewClass) {
        return new TypeSafeMatcher<View>() {

            @Override
            protected boolean matchesSafely(View item) {
                if (!(item instanceof ViewGroup)) {
                    return false;
                }
                ViewGroup viewGroup = (ViewGroup) item;
                int viewCount = 0;
                for (int i = 0; i < viewGroup.getChildCount(); i++) {
                    if (viewClass.isInstance(viewGroup.getChildAt(i))) {
                        viewCount++;
                    }
                }
                return viewCount >= count;
            }

            @Override
            public void describeTo(Description description) {
                description.appendText("ViewGroup has a child count greater than or equal to " + count);
            }
        };
    }


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

    public static Matcher<View> withChipText(final String text) {
        return new TypeSafeMatcher<View>() {

            @Override
            public void describeTo(Description description) {
                description.appendText("with chip text: " + text);
            }

            @Override
            public boolean matchesSafely(View view) {
                // Assuming SubjectChipHomeView extends a ViewGroup like LinearLayout or similar
                if (!(view instanceof ViewGroup)) {
                    return false;
                }

                ViewGroup viewGroup = (ViewGroup) view;
                for (int i = 0; i < viewGroup.getChildCount(); i++) {
                    View child = viewGroup.getChildAt(i);
                    if (child instanceof SubjectChipHomeView) {
                        SubjectChipHomeView chipView = (SubjectChipHomeView) child;
                        if (chipView.getText().equals(text)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        };
    }

    public static ViewAction clickOnChipWithText(final String text) {
        return new ViewAction() {
            @Override
            public Matcher<View> getConstraints() {
                return allOf(isDisplayed(), isAssignableFrom(SubjectChipHomeView.class));
            }

            @Override
            public String getDescription() {
                return "Click on a SubjectChipHomeView with text: " + text;
            }

            @Override
            public void perform(UiController uiController, View view) {
                if (view instanceof SubjectChipHomeView) {
                    SubjectChipHomeView chipView = (SubjectChipHomeView) view;
                    if (chipView.getText().equals(text)) {
                        chipView.performClick();
                    }
                }
            }
        };
    }

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


    public static ViewAction clickChildWithText(final String text) {
        return new ViewAction() {
            @Override
            public Matcher<View> getConstraints() {
                return isAssignableFrom(ViewGroup.class);
            }

            @Override
            public String getDescription() {
                return "Click on a child view with specified text.";
            }

            @Override
            public void perform(UiController uiController, View view) {
                ViewGroup group = (ViewGroup) view;
                for (int i = 0; i < group.getChildCount(); i++) {
                    View child = group.getChildAt(i);
                    if (child instanceof TextView && ((TextView) child).getText().equals(text)) {
                        child.performClick();
                        return;
                    }
                }
            }
        };
    }

    public static Matcher<View> withItemCount(final Matcher<Integer> matcher) {
        return new TypeSafeMatcher<View>() {
            @Override
            protected boolean matchesSafely(View item) {
                if (!(item instanceof ViewGroup)) {
                    return false;
                }
                int itemCount = ((ViewGroup) item).getChildCount();
                return matcher.matches(itemCount);
            }

            @Override
            public void describeTo(Description description) {
                description.appendText("a view with item count: ");
                matcher.describeTo(description);
            }
        };
    }

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
