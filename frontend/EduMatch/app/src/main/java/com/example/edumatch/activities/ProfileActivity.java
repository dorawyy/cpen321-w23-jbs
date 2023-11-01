package com.example.edumatch.activities;

import static com.example.edumatch.util.ConversationHelper.createConversation;
import static com.example.edumatch.util.RecommendationHelper.updateWhenTutorOpensConvo;
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

import org.json.JSONObject;

public class ProfileActivity extends AppCompatActivity {

    private String tutorId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        String tutorId = getIntent().getStringExtra("TUTOR_ID");

        JSONObject jsonResponse = getTutorInfo(tutorId,ProfileActivity.this);
        Log.d("response", String.valueOf(jsonResponse));


        RatingBar starRatingBar = findViewById(R.id.starRatingBar);
        TextView nameTextView = findViewById(R.id.name);
        TextView descriptionTextView = findViewById(R.id.tutorDescription);
        TextView ratingText = findViewById(R.id.ratingText);

        try {
            // Assuming the jsonResponse has fields "name", "description", and "rating"
            String tutorName = jsonResponse.getString("displayedName");
            Log.d("response", tutorName);
            String tutorDescription = jsonResponse.getString("bio");
            float tutorRating = (float) jsonResponse.getDouble("overallRating"); // you may need to adjust this based on the data type
            Log.d("tutorid", String.valueOf(tutorRating));
            nameTextView.setText(tutorName);
            descriptionTextView.setText(tutorDescription);
            starRatingBar.setRating(tutorRating);
            starRatingBar.setIsIndicator(true); // Make it non-editable
            ratingText.setText(String.valueOf(tutorRating));

        } catch (Exception e) {
            e.printStackTrace();
            // Handle error here - maybe show a message to the user or log the error
        }

        Button bookButton = findViewById(R.id.bookButton);
        Button pricingButton = findViewById(R.id.pricingButton);
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
        pricingButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // To do: add pricing
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
                updateWhenTutorOpensConvo(tutorId, ProfileActivity.this);
                Intent intent = new Intent(ProfileActivity.this, ChatListActivity.class);
                startActivity(intent);
            }
        });
    }





    }
