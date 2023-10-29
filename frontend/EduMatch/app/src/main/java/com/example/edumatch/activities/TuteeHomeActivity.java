package com.example.edumatch.activities;

import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.TutorsHelper.getTuteeHome;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TuteeHomeActivity extends AppCompatActivity {
    private FlexboxLayout chipContainer;


    StringBuilder apiUrlBuilder;

    private JSONObject jsonResponse;
    private List<String> courseList;
    private List<SubjectChipView> subjectChipViews;


    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/recommended?";

    //TODO: Do a GET on search?
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home_tutee);

        Bundle userData = getIntent().getExtras();

        chipContainer = findViewById(R.id.chipContainer);

        getProfile(TuteeHomeActivity.this);
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        Set<String> courses = sharedPreferences.getStringSet("courses", new HashSet<>());
        courseList = new ArrayList<>(courses); // Convert Set to List
        courseList.add("ALL");
        subjectChipViews = new ArrayList<>();

         apiUrlBuilder = new StringBuilder(apiUrl);


        if (courses != null) {
            for (String course : courseList) {
                // Perform an action on each course, for example, print it to the log
                SubjectChipView subjectChipView = new SubjectChipView(TuteeHomeActivity.this);
                subjectChipView.setChipText(course);
                subjectChipViews.add(subjectChipView);

                subjectChipView.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if (subjectChipView.isClicked) {
                            // Assuming you've added the isClicked boolean in SubjectChipView
                            subjectChipView.setBackgroundColor(Color.TRANSPARENT);  // or your default color
                            subjectChipView.isClicked = false;
                        } else {
                            subjectChipView.setBackgroundColor(Color.parseColor("#A9A9A9"));
                            subjectChipView.isClicked = true;
                        }
                    }
                });
                chipContainer.addView(subjectChipView);

                // Inside your loop where you instantiate the SubjectChipView
                subjectChipView.setChipClickListener(new SubjectChipView.ChipClickListener() {
                    @Override
                    public void onChipClicked(SubjectChipView chipView) {
                        if (isAnyChipViewPressed()) {
                            Log.d("Tutee", "hi");
                        } else {
                            // None of the SubjectChipViews are pressed
                        }
                    }
                });


                // Append the course to the API URL
                apiUrlBuilder.append(course);

                // Check if it's the last course before appending a comma
                if (!course.equals(courseList.get(courseList.size() - 1))) {
                    apiUrlBuilder.append(",");
                }
            }
            //TODO: implement dynamic pagination
            apiUrlBuilder.append("&page=1");
            JSONObject jsonResponse = getTuteeHome(apiUrlBuilder,TuteeHomeActivity.this);

            initSearchTutorButton();

            FloatingActionButton fabChat = findViewById(R.id.fabChat);
            fabChat.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    Intent intent = new Intent(TuteeHomeActivity.this, ChatListActivity.class);
                    startActivity(intent);
                }
            });


        }

    }

    private void fetchCourseData(String courseName) {
        String courseApiUrl = apiUrl + "course=" + courseName + "&page=1";

        // Now, make an API call using the generated URL.
        // I noticed in your code, you might be using a method named getTuteeHome to fetch data.
        // If that's the method you use to make API calls, you can call it here:

        JSONObject jsonResponse = getTuteeHome(courseApiUrl, TuteeHomeActivity.this);

        // If you need further processing on the jsonResponse, you can do it here.
    }





    private boolean isAnyChipViewPressed() {
        for (SubjectChipView chipView : subjectChipViews) {
            if (chipView.isClicked) {
                return true;
            }
        }
        return false;
    }


    private void initSearchTutorButton() {

        Button searchTutor = findViewById(R.id.search_tutors);

        searchTutor.setOnClickListener(v -> {
            StringBuilder newApiUrlBuilder = new StringBuilder(apiUrl);;
            for(String course : courseList){

                newApiUrlBuilder.append(course);
                // Check if it's the last course before appending a comma
                if (!course.equals(courseList.get(courseList.size() - 1))) {
                    newApiUrlBuilder.append(",");
                }
            }
            newApiUrlBuilder.append("&page=1");
            JSONObject jsonResponse = getTuteeHome(newApiUrlBuilder,TuteeHomeActivity.this);

            });
        }


}