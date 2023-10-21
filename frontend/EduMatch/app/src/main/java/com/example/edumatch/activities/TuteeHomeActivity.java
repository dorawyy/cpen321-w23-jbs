package com.example.edumatch.activities;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;


public class TuteeHomeActivity extends AppCompatActivity {
    private FlexboxLayout chipContainer;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutee_home);

        Bundle userData = getIntent().getExtras();



        chipContainer = findViewById(R.id.chip_container);
        if (userData != null) {
            String[] coursesArray = userData.getStringArray("coursesArray");

            if (coursesArray != null) {
                for (int i = 0; i < coursesArray.length; i++) {
                    // Perform an action on each course, for example, print it to the log
                    SubjectChipView subjectChipView = new SubjectChipView(TuteeHomeActivity.this);
                    subjectChipView.setChipText(coursesArray[i]);
                    chipContainer.addView(subjectChipView);
                }
            }
        }


    }

}
