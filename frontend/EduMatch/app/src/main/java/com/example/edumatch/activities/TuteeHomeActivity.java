package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.isStartTimeBeforeEndTime;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;
import static com.example.edumatch.util.ProfileHelper.constructSignUpRequest;
import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;
import static com.example.edumatch.util.TutorsHelper.getTuteeHome;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;

import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mortbay.util.ajax.JSON;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TuteeHomeActivity extends AppCompatActivity {
    private FlexboxLayout chipContainer;


    StringBuilder apiUrlBuilder;

    private JSONObject jsonResponse;
    private List<String> courseList;

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

         apiUrlBuilder = new StringBuilder(apiUrl);


        if (courses != null) {
            for (String course : courseList) {
                // Perform an action on each course, for example, print it to the log
                SubjectChipView subjectChipView = new SubjectChipView(TuteeHomeActivity.this);
                subjectChipView.setChipText(course);
                chipContainer.addView(subjectChipView);
                subjectChipView.setChipRemovedListener(new SubjectChipView.OnChipRemovedListener() {
                    @Override
                    public void onChipRemoved(String course) {
                        int index = courseList.indexOf(course);
                        if (index >= 0) {
                            courseList.remove(index);
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


        }

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