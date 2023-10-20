package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;

import com.example.edumatch.views.CourseRateItemView;
import com.example.edumatch.R;
import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;

import java.util.ArrayList;
import java.util.List;

public class CourseRatesActivity extends AppCompatActivity {

    final static String TAG = "SignUpFlow";

    private FlexboxLayout chipContainer;

    private LabelAndEditTextView tagText;

    LinearLayout courseRateContainer;

    List<String> selectedTags;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_rates);
        courseRateContainer = findViewById(R.id.course_rate_container);
        selectedTags = new ArrayList<>();

        initCourses();
        initNextButton();
        initAddButton();
    }

    private void initCourses() {
        Bundle userData = getIntent().getExtras();
        if (userData != null) {
            Bundle educationBundle = userData.getBundle("education");
            String[] coursesArray = educationBundle.getStringArray("courses");

            if (coursesArray != null) {
                for (String course : coursesArray) {
                    // Create a CourseRateChip
                    CourseRateItemView courseRateItemView = new CourseRateItemView(this);
                    courseRateItemView.setCourseText(course);

                    // Add the CourseRateChip to the container
                    courseRateContainer.addView(courseRateItemView);
                }
            }
        } else {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent doesn't have extras");
        }
    }

    private void initAddButton() {
        Button addButton = findViewById(R.id.add_button);

        tagText = findViewById(R.id.add_tags);
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String enteredText = tagText.getEnterUserEditText().getText().toString();
                if (!enteredText.isEmpty()) {

                    // Create a SubjectChipView
                    selectedTags.add(enteredText);
                    SubjectChipView subjectChipView = new SubjectChipView(CourseRatesActivity.this);
                    subjectChipView.setChipText(enteredText);

                    subjectChipView.setChipRemovedListener(new SubjectChipView.OnChipRemovedListener() {
                        @Override
                        public void onChipRemoved(String course) {

                            int index = selectedTags.indexOf(course);
                            if (index >= 0) {
                                selectedTags.remove(index);
                            }
                        }
                    });

                    // Find the "chip_container" and add the SubjectChipView to it
                    chipContainer = findViewById(R.id.chip_container);
                    chipContainer.addView(subjectChipView);

                    // Clear the AutoCompleteTextView
                    tagText.getEnterUserEditText().setText("");
                }
            }
        });
    }

    private void initNextButton() {
        Button nextButton = findViewById(R.id.next_button);

        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                goToNewActivity();
            }
        });
    }


    private Bundle updateBundle() {
        Bundle subjectHourlyRate = new Bundle();
        Intent currentIntent = getIntent();
        if (currentIntent != null && currentIntent.getExtras() != null) {
            Bundle userData = currentIntent.getExtras();
            Bundle educationBundle = userData.getBundle("education");

            String[] tagsArray = selectedTags.toArray(new String[selectedTags.size()]);
            educationBundle.putStringArray("tags", tagsArray);

            for (int i = 0; i < courseRateContainer.getChildCount(); i++) {
                View child = courseRateContainer.getChildAt(i);

                if (child instanceof CourseRateItemView) {
                    CourseRateItemView courseRateItemView = (CourseRateItemView) child;
                    String course = courseRateItemView.getCourseText();
                    String courseRate = courseRateItemView.getRateText();
                    subjectHourlyRate.putString(course, courseRate);
                }
            }
            userData.putBundle("subjectHourlyRate", subjectHourlyRate);
            return userData;

        } else {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent is null or doesn't have extras");
        }
    }

    private void goToNewActivity() {
        Intent newIntent = new Intent(CourseRatesActivity.this, LocationInformationActivity.class);
        Bundle userData = updateBundle();
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }
}