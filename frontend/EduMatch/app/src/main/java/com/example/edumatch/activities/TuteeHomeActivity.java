package com.example.edumatch.activities;

import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.RecommendationHelper.updateWhenTuteeChecksTutor;
import static com.example.edumatch.util.TutorsHelper.getTuteeHome;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipHomeView;
import com.example.edumatch.views.TutorRow;
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
    private List<SubjectChipHomeView> subjectChipViews;
    private String selectedCourse;


    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/recommended?";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home_tutee);

        chipContainer = findViewById(R.id.chipContainer);
        initializeChat();

        getProfile(TuteeHomeActivity.this);
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        Set<String> courses = sharedPreferences.getStringSet("courses", new HashSet<>());
        courseList = new ArrayList<>(courses);
        subjectChipViews = new ArrayList<>();
        apiUrlBuilder = new StringBuilder(apiUrl);
        initializeCourseTags(courses);

//
//        if (courses != null) {
//            for (String course : courseList) {
//                // Perform an action on each course, for example, print it to the log
//                SubjectChipView subjectChipView = new SubjectChipView(TuteeHomeActivity.this);
//                subjectChipView.setChipText(course);
//                subjectChipViews.add(subjectChipView);
//                subjectChipView.hideRemoveSubjectImageView();
//                int padding = (int) (4 * getResources().getDisplayMetrics().density);  // Convert 8dp to pixels
//                subjectChipView.setPadding(padding, padding, padding, padding);
//
//                subjectChipView.setOnClickListener(new View.OnClickListener() {
//                    @Override
//                    public void onClick(View v) {
//                        clearTutorList();
//                        if (subjectChipView.isClicked) {
//                            subjectChipView.setBackgroundColor(Color.TRANSPARENT);
//                            subjectChipView.isClicked = false;
//                        } else {
//                            // Clear all other chip's clicked state
//                            for (SubjectChipView chip : subjectChipViews) {
//                                chip.setBackgroundColor(Color.TRANSPARENT);
//                                chip.isClicked = false;
//                            }
//                            // Set this chip as clicked
//                            subjectChipView.setBackgroundColor(Color.parseColor("#A9A9A9"));
//                            subjectChipView.isClicked = true;
//
//                            // Fetch data for the clicked course
//                            fetchCourseData(course);
//                        }
//
//                        if (!isAnyChipViewPressed()) {
//                            // Fetch all data when no chips are clicked
//                            fetchAllData();
//                        }
//                    }
//                });
//
//                chipContainer.addView(subjectChipView);
//                // Append the course to the API URL
//                apiUrlBuilder.append(course);
//
//                // Check if it's the last course before appending a comma
//                if (!course.equals(courseList.get(courseList.size() - 1))) {
//                    apiUrlBuilder.append(",");
//                }
//            }
//            //TODO: implement dynamic pagination
//            apiUrlBuilder.append("&page=1");
//            JSONObject jsonResponse = getTuteeHome(apiUrlBuilder,TuteeHomeActivity.this);
//            fetchAllData();
//
//        }

    }

    private void initializeChat() {
        FloatingActionButton fabChat = findViewById(R.id.fabChat);
        fabChat.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(TuteeHomeActivity.this, ChatListActivity.class);
                startActivity(intent);
            }
        });
    }

    private void initializeCourseTags(Set<String> courses) {
        courseList = new ArrayList<>(courses);
        if (courses != null) {
            for (String course : courseList) {
                SubjectChipHomeView subjectChipView = new SubjectChipHomeView(TuteeHomeActivity.this);
                subjectChipView.setChipText(course);
                subjectChipViews.add(subjectChipView);
                int padding = (int) (4 * getResources().getDisplayMetrics().density);  // Convert 8dp to pixels
                subjectChipView.setPadding(padding, padding, padding, padding);
                subjectChipView.setChipClickListener(new SubjectChipHomeView.ChipClickListener() {
                    @Override
                    public void onChipClicked(SubjectChipHomeView chipView) {
                        clearTutorList();
                        selectedCourse = chipView.getText();
                        if (!isAnyChipViewPressed()) {
                            Log.d("mag", "all");
                            fetchAllData();
                        } else {
                            Log.d("mag", selectedCourse);
                            fetchCourseData(selectedCourse);
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

                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        updateWhenTuteeChecksTutor(tutorRow.id, TuteeHomeActivity.this);
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        startActivity(profileIntent);
                    }
                });
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
        Log.d("mag", jsonResponse.toString());


        try {
            JSONArray tutorsArray = jsonResponse.getJSONArray("tutors");

            for (int i = 0; i < tutorsArray.length(); i++) {
                JSONObject tutorObject = tutorsArray.getJSONObject(i);

                String tutorName = tutorObject.getString("displayedName");
                String tutorDetails = tutorObject.getString("school");
                String tutorID = tutorObject.getString("tutorId");


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);
                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);
                tutorRow.setId(tutorID);


                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Log.d("mag", tutorRow.id);
                        updateWhenTuteeChecksTutor(tutorRow.id, TuteeHomeActivity.this);
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        startActivity(profileIntent);
                    }
                });

                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }


    }
    private void clearTutorList() {
        LinearLayout tutorList = findViewById(R.id.tutorList);
        tutorList.removeAllViews();
    }


    private boolean isAnyChipViewPressed() {
        for (SubjectChipHomeView chipView : subjectChipViews) {
            if (chipView.isClicked) {
                return true;
            }
        }
        return false;
    }




}