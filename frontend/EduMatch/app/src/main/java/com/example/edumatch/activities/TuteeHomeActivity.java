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
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.views.TutorRow;
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

        subjectChipViews = new ArrayList<>();

         apiUrlBuilder = new StringBuilder(apiUrl);


        if (courses != null) {
            for (String course : courseList) {
                // Perform an action on each course, for example, print it to the log
                SubjectChipView subjectChipView = new SubjectChipView(TuteeHomeActivity.this);
                subjectChipView.setChipText(course);
                subjectChipViews.add(subjectChipView);
                subjectChipView.hideRemoveSubjectImageView();
                int padding = (int) (4 * getResources().getDisplayMetrics().density);  // Convert 8dp to pixels
                subjectChipView.setPadding(padding, padding, padding, padding);

                subjectChipView.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        if (subjectChipView.isClicked) {
                            subjectChipView.setBackgroundColor(Color.TRANSPARENT);
                            subjectChipView.isClicked = false;
                        } else {
                            // Clear all other chip's clicked state
                            for (SubjectChipView chip : subjectChipViews) {
                                chip.setBackgroundColor(Color.TRANSPARENT);
                                chip.isClicked = false;
                            }
                            // Set this chip as clicked
                            subjectChipView.setBackgroundColor(Color.parseColor("#A9A9A9"));
                            subjectChipView.isClicked = true;

                            // Fetch data for the clicked course
                            fetchCourseData(course);
                        }

                        if (!isAnyChipViewPressed()) {
                            // Fetch all data when no chips are clicked
                            fetchAllData();
                        }
                    }
                });

                chipContainer.addView(subjectChipView);
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
            fetchAllData();

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

    private void fetchAllData() {
        LinearLayout tutorList = findViewById(R.id.tutorList);
        clearTutorList();
        StringBuilder courseApiUrlBuilder = new StringBuilder(apiUrl);
        courseApiUrlBuilder.append("course=").append("&page=1");
        jsonResponse = getTuteeHome(courseApiUrlBuilder, TuteeHomeActivity.this);


        try {
            JSONArray tutorsArray = jsonResponse.getJSONArray("tutors");

            for (int i = 0; i < tutorsArray.length(); i++) {
                JSONObject tutorObject = tutorsArray.getJSONObject(i);

                // String courseCode = tutorObject.getString("courses"); // replace with your actual JSON keys
                String tutorName = tutorObject.getString("displayedName");
                String tutorDetails = tutorObject.getString("school");
                String tutorID = tutorObject.getString("tutorId");


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);
                // tutorRow.setCourseCode(courseCode);
                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);
                tutorRow.setId(tutorID);
                Log.d("tutorid", tutorID);
                Log.d("tutorid", tutorDetails);

                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        Log.d("tutorid", "bitch");
                        Log.d("tutorid",  tutorRow.id);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        Log.d("tutorid",  tutorRow.id);
                        startActivity(profileIntent);
                    }
                });



                // Assuming you have a layout or container where you want to add the TutorRow
                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void fetchCourseData(String courseName) {
        clearTutorList();
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
                String tutorID = tutorObject.getString("tutorId");


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);
               // tutorRow.setCourseCode(courseCode);
                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);
                tutorRow.setId(tutorID);
                Log.d("tutorid", tutorID);
                Log.d("tutorid", tutorDetails);

                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        Log.d("tutorid", "bitch");
                        Log.d("tutorid",  tutorRow.id);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        Log.d("tutorid",  tutorRow.id);
                        startActivity(profileIntent);
                    }
                });



                // Assuming you have a layout or container where you want to add the TutorRow
                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }


    }
    private void clearTutorList() {
        LinearLayout tutorList = findViewById(R.id.tutorList); // Assuming you changed the ID to tutorListLayout
        tutorList.removeAllViews();
    }


    private boolean isAnyChipViewPressed() {
        for (SubjectChipView chipView : subjectChipViews) {
            if (chipView.isClicked) {
                return true;
            }
        }
        return false;
    }




}