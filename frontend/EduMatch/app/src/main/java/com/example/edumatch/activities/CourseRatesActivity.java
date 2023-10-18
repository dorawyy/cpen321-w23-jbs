package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;

import com.example.edumatch.views.CourseRateItemView;
import com.example.edumatch.R;

public class CourseRatesActivity extends AppCompatActivity {

    private Button nextButton;

    private Intent newIntent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_rates);

        LinearLayout courseRateContainer = findViewById(R.id.course_rate_container);

        Bundle userData = getIntent().getExtras();
        if (userData != null) {
            String[] coursesArray = userData.getStringArray("courses");

            if (coursesArray != null) {
                for (String course : coursesArray) {
                    // Create a CourseRateChip
                    CourseRateItemView courseRateItemView = new CourseRateItemView(this);
                    courseRateItemView.setCourseText(course);

                    // Add the CourseRateChip to the container
                    courseRateContainer.addView(courseRateItemView);
                }
            }
        }


        nextButton = findViewById(R.id.next_button);

        newIntent = new Intent(CourseRatesActivity.this, AvailabilityActivity.class);


        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Todo: add things to bundle
                startActivity(newIntent);
            }
        });
    }
}