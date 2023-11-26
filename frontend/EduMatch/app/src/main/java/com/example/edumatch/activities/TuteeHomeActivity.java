package com.example.edumatch.activities;

import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.RecommendationHelper.updateWhenTuteeChecksTutor;
import static com.example.edumatch.util.TutorsHelper.getTuteeHome;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.Toast;

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
    private LinearLayout chipContainer;


    StringBuilder apiUrlBuilder;

    private JSONObject jsonResponse;
    private List<String> courseList;
    private List<SubjectChipHomeView> subjectChipViews;
    private String selectedCourse;
    private String courses;

    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/recommended?";
    // ChatGPT usage: Yes
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
        //fetchAllData();

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
    // ChatGPT usage: Yes
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
                        if (selectedCourse != null && selectedCourse.equals(chipView.getText())) {
                            // Deselect the currently selected chip and clear selection
                            chipView.setClicked(false);
                            selectedCourse = null;
                            fetchAllData();
                            Log.d("maggie", "all");
                        } else {
                            // Update all chips to be deselected
                            for (SubjectChipHomeView otherChipView : subjectChipViews) {
                                otherChipView.setClicked(false);
                            }
                            // Select the clicked chip
                            chipView.setClicked(true);
                            selectedCourse = chipView.getText();
                            fetchCourseData(selectedCourse);
                            Log.d("maggie", selectedCourse);
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


    // ChatGPT usage: Yes
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

                String tutorName = tutorObject.getString("displayedName");
                String tutorDetails = tutorObject.getString("school");
                String tutorID = tutorObject.getString("tutorId");
                JSONArray tutorCourses = tutorObject.getJSONArray("courses");
                String tutorRating = tutorObject.getString("rating");
                courses = "";
                for (int j = 0; j < tutorCourses.length(); j++) {
                    String course;
                    try {
                        course = tutorCourses.getString(j).trim();
                    } catch (JSONException e) {
                        course = "";
                    }
                    courses = courses + " " + course;
                }


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);
                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);
                tutorRow.setId(tutorID);
                tutorRow.setCourses(courses.trim());
                tutorRow.setCourseCode(courses.trim());
                tutorRow.setPrice("Rating: " + tutorRating);

                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        updateWhenTuteeChecksTutor(tutorRow.id, TuteeHomeActivity.this);
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        profileIntent.putExtra("COURSES", tutorRow.courses);
                        Log.d("mag", tutorRow.courses);
                        startActivity(profileIntent);
                    }
                });
                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                // Update your UI elements here
                tutorList.invalidate();
                tutorList.requestLayout();
            }
        });

    }

    // ChatGPT usage: Yes
    private void fetchCourseData(String courseName) {
        clearTutorList();
        LinearLayout tutorList = findViewById(R.id.tutorList); // Assuming you changed the ID to tutorListLayout
        StringBuilder courseApiUrlBuilder = new StringBuilder(apiUrl);
        courseApiUrlBuilder.append("courses=").append(courseName).append("&page=1");

        jsonResponse = getTuteeHome(courseApiUrlBuilder, TuteeHomeActivity.this);
        Log.d("maggie", courseApiUrlBuilder.toString());

        try {
            JSONArray tutorsArray = jsonResponse.getJSONArray("tutors");

            if (tutorsArray.length() == 0) {
                // JSONArray is empty, display toast message
                Toast.makeText(TuteeHomeActivity.this, "No recommended tutors for this course yet!", Toast.LENGTH_SHORT).show();
            }

            for (int i = 0; i < tutorsArray.length(); i++) {
                JSONObject tutorObject = tutorsArray.getJSONObject(i);
                Log.d("response", tutorObject.toString());
                String tutorName = tutorObject.getString("displayedName");
                String tutorDetails = tutorObject.getString("school");
                String tutorID = tutorObject.getString("tutorId");
                JSONArray tutorCourses = tutorObject.getJSONArray("courses");
                String tutorRating = tutorObject.getString("rating");
                courses = "";
                for (int j = 0; j < tutorCourses.length(); j++) {
                    String course;
                    try {
                        course = tutorCourses.getString(j).trim();
                    } catch (JSONException e) {
                        course = "";
                    }
                    courses = courses + " " + course;
                }


                TutorRow tutorRow = new TutorRow(TuteeHomeActivity.this);

                tutorRow.setTutorName(tutorName);
                tutorRow.setTutorDetails(tutorDetails);
                tutorRow.setId(tutorID);
                tutorRow.setCourses(courses.trim());
                tutorRow.setCourseCode(courses.trim());
                tutorRow.setPrice("Rating: " + tutorRating);



                tutorRow.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Log.d("mag", tutorRow.id);
                        updateWhenTuteeChecksTutor(tutorRow.id, TuteeHomeActivity.this);
                        Intent profileIntent = new Intent(TuteeHomeActivity.this, ProfileActivity.class);
                        profileIntent.putExtra("TUTOR_ID", tutorRow.id);
                        profileIntent.putExtra("COURSES", tutorRow.courses);
                        Log.d("mag", tutorRow.courses);
                        startActivity(profileIntent);
                    }
                });

                tutorList.addView(tutorRow);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                // Update your UI elements here
                tutorList.invalidate();
                tutorList.requestLayout();
            }
        });


    }
    private void clearTutorList() {
        LinearLayout tutorList = findViewById(R.id.tutorList);
        tutorList.removeAllViews();
    }

    // ChatGPT usage: Yes
    private boolean isAnyChipViewPressed() {
        for (SubjectChipHomeView chipView : subjectChipViews) {
            if (chipView.isClicked) {
                return true;
            }
        }
        return false;
    }




}