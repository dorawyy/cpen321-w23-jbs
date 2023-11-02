package com.example.edumatch.activities;

import static com.example.edumatch.util.ConversationHelper.createConversation;
import static com.example.edumatch.util.TutorsHelper.getTutorInfo;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.RatingBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ProfileActivity extends AppCompatActivity {

    private String tutorId;
    private String coursesList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        tutorId = getIntent().getStringExtra("TUTOR_ID");
        coursesList = getIntent().getStringExtra("COURSES");

        JSONObject jsonResponse = getTutorInfo(tutorId,ProfileActivity.this);
        Log.d("response", String.valueOf(jsonResponse));


        RatingBar starRatingBar = findViewById(R.id.starRatingBar);
        TextView nameTextView = findViewById(R.id.name);
        TextView descriptionTextView = findViewById(R.id.tutorDescription);
        TextView ratingText = findViewById(R.id.ratingText);
        TextView majorText = findViewById(R.id.majorDescripion);
        TextView courseText = findViewById(R.id.courses);
        TextView pricingText = findViewById(R.id.pricingList);
        try {
            String tutorName = jsonResponse.getString("displayedName");
            String tutorDescription = jsonResponse.getString("bio");
            float tutorRating = (float) jsonResponse.getDouble("overallRating");
            String major = jsonResponse.getString("program");
            String school = jsonResponse.getString("school");
            majorText.setText(major + " @" + school);
            courseText.setText(coursesList);
            String prices = getPricing(jsonResponse.getJSONArray("subjectHourlyRate"));
            pricingText.setText(prices);
            nameTextView.setText(tutorName);
            descriptionTextView.setText(tutorDescription);
            starRatingBar.setRating(tutorRating);
            starRatingBar.setIsIndicator(true);
            ratingText.setText(String.valueOf(tutorRating));

        } catch (Exception e) {
            e.printStackTrace();
            // Handle error here - maybe show a message to the user or log the error
        }

        Button bookButton = findViewById(R.id.bookButton);
        Button chatButton = findViewById(R.id.chatButton);
        bookButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Logic for Book button click
                Toast.makeText(ProfileActivity.this, "Book button clicked", Toast.LENGTH_SHORT).show();
                // You can replace the Toast with your actual logic.

                Intent intent = new Intent(ProfileActivity.this, BookingFlowActivity.class);

                // Pass the user id to the new activity
                intent.putExtra("TUTOR_ID", tutorId);

                // Start the activity
                startActivity(intent);
            }
        });
        chatButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(ProfileActivity.this, "Chat button clicked", Toast.LENGTH_SHORT).show();
                createConversation(ProfileActivity.this, tutorId);
                Intent intent = new Intent(ProfileActivity.this, ChatListActivity.class);
                startActivity(intent);
            }
        });
    }


    private String getPricing(JSONArray subjectHourlyRateArray) {
        String course = "";
        Double hourlyRate = 0.0;
        String all = "";
        for (int i = 0; i < subjectHourlyRateArray.length(); i++) {
            JSONObject courseObject = null;
            try {
                courseObject = subjectHourlyRateArray.getJSONObject(i);
            } catch (JSONException e) {
                Log.d("Error","could not parse");
            }
            try {
                course = courseObject.getString("course").trim();
            } catch (JSONException e) {
                Log.d("Error","could not parse");
            }
            try {
                hourlyRate = courseObject.getDouble("hourlyRate");
            } catch (JSONException e) {
                Log.d("Error","could not parse");
            }
           all = all + course + ": $" + hourlyRate + "\n";
        }
        return all;
    }




}
