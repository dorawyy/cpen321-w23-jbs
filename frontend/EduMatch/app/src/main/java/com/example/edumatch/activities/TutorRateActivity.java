package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;

import com.example.edumatch.R;
import com.example.edumatch.views.LabelAndCommentEditTextView;
import com.example.edumatch.views.LabelAndRatingView;

import org.json.JSONException;
import org.json.JSONObject;

public class TutorRateActivity extends AppCompatActivity {
    private double ratingValue;
    private boolean noShowValue;
    private boolean lateValue;

    private String commentValue;

    private String receiverId; // todo: Get this value from the previous view
    private String receiverName; // todo: Get this value from the previous view

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_rate);

        initName();
        initComponents();
        initSubmitButton();
    }

    private void initComponents() {
        CheckBox noShowCheckBox = findViewById(R.id.no_show);
        CheckBox lateCheckBox = findViewById(R.id.late);

        noShowCheckBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
            noShowValue = isChecked;
        });

        lateCheckBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
            lateValue = isChecked;
        });


        LabelAndRatingView organizationRatingView = findViewById(R.id.rating);
        organizationRatingView.getRatingView().setOnRatingBarChangeListener((ratingBar, rating, fromUser) -> {
            ratingValue = rating;
        });
    }

    private void initName() {
        TextView nameTextView = findViewById(R.id.tutor_name);
        nameTextView.setText(receiverName);
    }

    private void initSubmitButton() {
        Button submitButton = findViewById(R.id.submit_button);

        submitButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                LabelAndCommentEditTextView comment = findViewById(R.id.comments);
                commentValue = comment.getEnterUserEditText().getText().toString();
                Boolean success = postReview();
                goToNewActivity();
            }
        });
    }

    private boolean postReview() {
        // todo: Implement your post request logic here
        JSONObject requestBody = constructRatingRequest();
        // You can post the rating to your server here and handle the response.
        return true; // For demonstration, return true if the post is successful.
    }

    private JSONObject constructRatingRequest() {
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("receiverId", receiverId);
            requestBody.put("rating", ratingValue);
            requestBody.put("noShow", noShowValue);
            requestBody.put("late", lateValue);
            requestBody.put("comment",commentValue);
            // Add any other fields you need in the request.

            logRequestToConsole(requestBody, "RatingPost");
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void goToNewActivity() {

        // todo: Navigate to the next activity or go back to the previous view
    }

    private void logRequestToConsole(JSONObject request, String tag) {
        Log.d(tag, "Request JSON: " + request.toString());
    }
}
