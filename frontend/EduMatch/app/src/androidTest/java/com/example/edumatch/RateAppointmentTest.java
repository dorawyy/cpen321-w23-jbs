package com.example.edumatch;

import static android.app.PendingIntent.getActivity;
import static androidx.core.util.Predicate.not;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.action.ViewActions.typeText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.intent.Intents.intended;
import static androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent;
import static androidx.test.espresso.matcher.RootMatchers.withDecorView;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static com.google.api.client.repackaged.com.google.common.base.CharMatcher.is;
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
import com.example.edumatch.views.LabelAndCommentTextView;

import org.hamcrest.Matchers;
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
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        sharedPreferences.edit().putString("JWTtoken", "eyJhbGciOiJIUzI1NiJ9.NjU0MzE3MWQzNWQ0ZTYxMzQzN2I5MzJi.LgNYfo-o2chIt1Rgd-QOZaL-If_wM5qS2rGYCy82hIQ").apply();

    }

    // ChatGPT usage: Yes
    @Test
    public void testRateAppointmentFlow() {
        Intents.init();
        // Sign-in with credentials
        onView(CustomMatchers.withAncestor(R.id.username,R.id.edit_text)).perform(replaceText(NAME));
        onView(CustomMatchers.withAncestor(R.id.password,R.id.edit_text)).perform(replaceText(PASSWORD));
        onView(withId(R.id.signin_button)).perform(click());

        intended(hasComponent(TuteeHomeActivity.class.getName()));

        onView(allOf(withId(R.id.appointments), isDescendantOfA(withId(R.id.emptyBar)))).perform(click());

        intended(hasComponent(AppointmentListActivity.class.getName()));

        // Select a specific rateable appointment
        String appointmentIdentifier = "2023-11-23";
        onView(allOf(withText(appointmentIdentifier), isDescendantOfA(withId(R.id.appointmentList))))
                .perform(scrollTo())
                .perform(click());

        intended(hasComponent(ScheduledAppointmentActivity.class.getName()));

        // Click on rate appointment button
        onView(withId(R.id.review_button))
                .perform(click());

        intended(hasComponent(TutorRateActivity.class.getName()));

        String longText = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12 word13 word14 word15 word16 word17 word18 word19 word20 word21 word22 word23 word24 word25 word26 word27 word28 word29 word30 word31 word32 word33 word34 word35 word36 word37 word38 word39 word40 word41 word42 word43 word44 word45 word46 word47 word48 word49 word50 word51 word52 word53 word54 word55 word56 word57 word58 word59 word60 word61 word62 word63 word64 word65 word66 word67 word68 word69 word70 word71 word72 word73 word74 word75 word76 word77 word78 word79 word80 word81 word82 word83 word84 word85 word86 word87 word88 word89 word90 word91 word92 word93 word94 word95 word96 word97 word98 word99 word100 word101 word102 word103 word104 word105 word106 word107 word108 word109 word110 word111 word112 word113 word114 word115 word116 word117 word118 word119 word120 word121 word122 word123 word124 word125 word126 word127 word128 word129 word130 word131 word132 word133 word134 word135 word136 word137 word138 word139 word140 word141 word142 word143 word144 word145 word146 word147 word148 word149 word150 word151 word152 word153 word154 word155 word156 word157 word158 word159 word160 word161 word162 word163 word164 word165 word166 word167 word168 word169 word170 word171 word172 word173 word174 word175 word176 word177 word178 word179 word180 word181 word182 word183 word184 word185 word186 word187 word188 word189 word190 word191 word192 word193 word194 word195 word196 word197 word198 word199 word200 word201";
        onView(withId(R.id.content)).perform(replaceText(longText));

        // Check for the toast message that we have gone over the word limit
        onView(withText("Word limit exceeded. Please limit comments to 200 words."))
                .inRoot(withDecorView(Matchers.not(activityRule.getActivity().getWindow().getDecorView())))
                .check(matches(isDisplayed()));

        Intents.release();

    }
}
