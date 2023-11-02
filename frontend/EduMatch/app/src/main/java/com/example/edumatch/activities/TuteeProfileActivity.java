package com.example.edumatch.activities;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.util.ProfileHelper;

import java.util.HashSet;
import java.util.Set;

public class TuteeProfileActivity extends AppCompatActivity {
    // ChatGPT usage: Yes
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutee_profile);


        Boolean success = ProfileHelper.getProfile(this);
        if (success) {
            // Assuming you're inside an Activity or Fragment
            LinearLayout subjectsLayout = findViewById(R.id.subjectsLayout);
            TextView screenName = findViewById(R.id.name);
            TextView screenBio = findViewById(R.id.bio);
            TextView screenMajor = findViewById(R.id.major);
            TextView screenSchool = findViewById(R.id.school);

            // This retrieves a named preference file identified by "AccountPreferences"
            SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
            Set<String> defaultCourses = new HashSet<>();
            defaultCourses.add("Math101");
            defaultCourses.add("CompSci101");
            defaultCourses.add("Physics101");


            String name = sharedPreferences.getString("displayedName", "Maggie");
            screenName.setText(name);

            String bio = sharedPreferences.getString("bio", "I hate this class");
            screenBio.setText(bio);

            String major = sharedPreferences.getString("program", "Nothing");
            screenMajor.setText(major);

            String school = sharedPreferences.getString("school", "Nothing");
            screenSchool.setText(school);







            // Now you can get values from the shared preferences
            Set<String> subjects = sharedPreferences.getStringSet("courses", defaultCourses);


            for (String subject : subjects) {
                TextView chip = new TextView(this);
                chip.setText(subject);
                chip.setBackgroundResource(R.drawable.subject_chip);
                chip.setPadding(8, 8, 8, 8);

                LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );
                params.setMargins(0, 0, 8, 0); // Add some margin to the right
                chip.setLayoutParams(params);

                subjectsLayout.addView(chip);
            }


        }
    }
}