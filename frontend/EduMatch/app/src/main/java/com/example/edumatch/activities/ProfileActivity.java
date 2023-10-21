package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.RatingBar;
import android.widget.TextView;

import com.example.edumatch.R;

public class ProfileActivity extends AppCompatActivity {
    private TextView nameTextView;
    private TextView descriptionTextView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        RatingBar starRatingBar = findViewById(R.id.starRatingBar);
        float tutorRating = 4.5f; // Replace this with the actual tutor's rating
        starRatingBar.setRating(tutorRating);
        starRatingBar.setIsIndicator(true); // Make it non-editable

        nameTextView = findViewById(R.id.name);
        descriptionTextView = findViewById(R.id.tutorDescription);


        SharedPreferences sharedPreferences = this.getSharedPreferences("MyPrefs", Context.MODE_PRIVATE);
        String savedName = sharedPreferences.getString("name", "");
        String savedDescription = sharedPreferences.getString("description", "Maggie is awesome");

        nameTextView.setText(savedName);
        descriptionTextView.setText(savedDescription);


    }
}