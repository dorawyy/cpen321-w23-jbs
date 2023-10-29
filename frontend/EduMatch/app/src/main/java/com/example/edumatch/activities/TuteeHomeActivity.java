package com.example.edumatch.activities;

import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;
import static com.example.edumatch.util.ProfileHelper.constructSignUpRequest;
import static com.example.edumatch.util.ProfileHelper.getProfile;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class TuteeHomeActivity extends AppCompatActivity {
    private FlexboxLayout chipContainer;

    private List<String> courseList;

    StringBuilder apiUrlBuilder;

    private JSONObject jsonResponse;

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
        List<String> courseList = new ArrayList<>(courses); // Convert Set to List
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/recommended?";
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
                        //TODO: Re-GET tutors
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
            boolean success = getTuteeHome();
            if(success){
                Toast.makeText(getApplicationContext(), "Successfully fetched tutors", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(getApplicationContext(), "Couldn't get tutors!", Toast.LENGTH_SHORT).show();
            }

        }

    }

    private Boolean getTuteeHome() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        jsonResponse = sendHttpRequest(apiUrlBuilder.toString(),sharedPreferences.getString("jwtToken", ""), "GET", null);

        if (jsonResponse != null) {
            try {
                Log.d("TuteeHomeGet", "Response is " +jsonResponse.toString());
                if (jsonResponse.has("errorDetails")) {
                    JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
                    // TODO: handle possible errors returned from BE
                }

            } catch (JSONException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            Log.d("TuteeHomeGet","jsonResponse was NULL");
        }
        return true;
    }

}