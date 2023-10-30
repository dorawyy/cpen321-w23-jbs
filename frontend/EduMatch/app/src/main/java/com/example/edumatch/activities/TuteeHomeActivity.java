package com.example.edumatch.activities;

import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.TutorsHelper.getTuteeHome;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.TutorRow;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONException;
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

                subjectChipView.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if (subjectChipView.isClicked) {
                            subjectChipView.setBackgroundColor(Color.TRANSPARENT);
                            subjectChipView.isClicked = false;
                        } else {
                            subjectChipView.setBackgroundColor(Color.parseColor("#A9A9A9"));
                            subjectChipView.isClicked = true;

                            // Fetch data for the clicked course
                            fetchCourseData(course);
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
        LinearLayout tutorList = findViewById(R.id.tutorList); // Assuming you changed the ID to tutorListLayout
        StringBuilder courseApiUrlBuilder = new StringBuilder(apiUrl);
        courseApiUrlBuilder.append("course=").append(courseName).append("&page=1");

        jsonResponse = getTuteeHome(courseApiUrlBuilder, TuteeHomeActivity.this);

        try {
            JSONArray tutorsArray = jsonResponse.getJSONArray("tutors");

            for (int i = 0; i < tutorsArray.length(); i++) {
                JSONObject tutorObject = tutorsArray.getJSONObject(i);

               // String courseCode = tutorObject.getString("courses"); // replace with your actual JSON keys
                String tutorName = tutorObject.getString("displayedName");
                String tutorDetails = tutorObject.getString("school");


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);
               // tutorRow.setCourseCode(courseCode);
                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);


                // Assuming you have a layout or container where you want to add the TutorRow
                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }


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