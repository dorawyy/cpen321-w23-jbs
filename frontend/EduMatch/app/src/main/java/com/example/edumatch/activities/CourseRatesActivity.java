package com.example.edumatch.activities;


import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class CourseRatesActivity extends AppCompatActivity {

    final static String TAG = "SignUpFlow";

    private FlexboxLayout chipContainer;

    private LabelAndEditTextView tagText;

    LinearLayout courseRateContainer;

    List<String> selectedTags;

    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_rates);
        courseRateContainer = findViewById(R.id.course_rate_container);
        selectedTags = new ArrayList<>();
        initSharedPreferences();
//        initCourses();
        initNextButton();
        initAddButton();
        initFields();
    }

//    private void initCourses() {
//        Set<String> defaultCourses = Collections.emptySet();
//        Set<String> courses = sharedPreferences.getStringSet("courses", defaultCourses);
//
//        for (String course : courses) {
//            // Create a CourseRateChip
//            CourseRateItemView courseRateItemView = new CourseRateItemView(this);
//            courseRateItemView.setCourseText(course);
//
//            // Add the CourseRateChip to the container
//            courseRateContainer.addView(courseRateItemView);
//        }
//    }

    private void initAddButton() {
        Button addButton = findViewById(R.id.add_button);

        tagText = findViewById(R.id.add_tags);
        chipContainer = findViewById(R.id.chip_container);
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

    private void updatePreferences() {
        // Create a JSON object to store course and price pairs
        editor.remove("coursePricePairs");
        editor.commit();

        JSONObject coursePricePairs = new JSONObject();

        // Add course and price pairs to the JSON object
        for (int i = 0; i < courseRateContainer.getChildCount(); i++) {
            View child = courseRateContainer.getChildAt(i);

            if (child instanceof CourseRateItemView) {
                CourseRateItemView courseRateItemView = (CourseRateItemView) child;
                String course = courseRateItemView.getCourseText();
                String courseRate = courseRateItemView.getRateText();

                try {
                    coursePricePairs.put(course, courseRate);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        }

        // Store the JSON object as a string in SharedPreferences
        editor.putString("coursePricePairs", coursePricePairs.toString());
        Set<String> selectedTagsSet = new HashSet<>(selectedTags);
        editor.putStringSet("tags", selectedTagsSet);
        editor.commit();
    }

    private void goToNewActivity() {
        Intent newIntent;
        updatePreferences();
        printSharedPreferences(sharedPreferences);
        if(sharedPreferences.getBoolean("isEditing",false)){
            //todo do a PUT here (make a common function)
            newIntent = new Intent(CourseRatesActivity.this, EditProfileListActivity.class);
        } else {
            newIntent = new Intent(CourseRatesActivity.this, LocationInformationActivity.class);
        }
        startActivity(newIntent);
    }



    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }


    private void initFields() {
        // Initialize Courses
        Set<String> defaultCourses = Collections.emptySet();
        Set<String> courses = sharedPreferences.getStringSet("courses", defaultCourses);

        for (String course : courses) {
            // Create a CourseRateItemView
            CourseRateItemView courseRateItemView = new CourseRateItemView(this);
            courseRateItemView.setCourseText(course);

            // Retrieve the rate for the course from coursePricePairs
            String coursePricePairsStr = sharedPreferences.getString("coursePricePairs", "");
            try {
                JSONObject coursePricePairs = new JSONObject(coursePricePairsStr);
                if (coursePricePairs.has(course)) {
                    String rate = coursePricePairs.getString(course);
                    courseRateItemView.setRateText(rate);
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }

            // Add the CourseRateItemView to the container
            courseRateContainer.addView(courseRateItemView);
        }

        // Initialize Tags
        Set<String> defaultTags = Collections.emptySet();
        Set<String> tags = sharedPreferences.getStringSet("tags", defaultTags);

        for (String tag : tags) {
            // Create a SubjectChipView
            selectedTags.add(tag);
            SubjectChipView subjectChipView = new SubjectChipView(CourseRatesActivity.this);
            subjectChipView.setChipText(tag);

            subjectChipView.setChipRemovedListener(new SubjectChipView.OnChipRemovedListener() {
                @Override
                public void onChipRemoved(String chipText) {
                    // Handle chip removal
                    int index = selectedTags.indexOf(chipText);
                    if (index >= 0) {
                        selectedTags.remove(index);
                    }
                }
            });

            // Add the SubjectChipView to the chip container
            chipContainer.addView(subjectChipView);
        }
    }
}