package com.example.edumatch.activities;

import static com.example.edumatch.util.AdminHelper.fetchAdminUser;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AdminUserProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_user_profile);
        Intent intent = getIntent();
        String userId = intent.getStringExtra("USERNAME");
        String displayId = intent.getStringExtra("DISPLAY_ID");
        String type = intent.getStringExtra("TYPE");
        String status = intent.getStringExtra("STATUS");

        TextView userText = findViewById(R.id.username);
        if (!userId.equals("")) {
            userText.setText(userId);
        }
        TextView displayText = findViewById(R.id.name);
        displayText.setText(displayId);
        TextView typeView = findViewById(R.id.userType);
        typeView.setText(type);
        TextView statusView = findViewById(R.id.start);
        statusView.setText(status);

        JSONObject response = fetchAdminUser(intent.getStringExtra("USER_ID"), AdminUserProfileActivity.this);

        try {
            String bio = "";
            if (response != null && response.has("bio") && !response.getString("bio").equals("")) {
                bio = response.getString("bio");
                TextView bioText = findViewById(R.id.bio);
                bioText.setText(bio);
            }
        } catch (JSONException e) {
            Toast.makeText(AdminUserProfileActivity.this, "No bio yet!", Toast.LENGTH_SHORT).show();
        }

        JSONArray comments;
        try {
            comments = response.getJSONArray("reviews");
        } catch (JSONException e) {
            comments = null;
        }
        if (comments.length() > 0) {
            for (int i = 0; i < comments.length(); i++) {
                LinearLayout commentContainer = findViewById(R.id.container);
                JSONObject commentObject;
                try {
                    commentObject = comments.getJSONObject(i);
                } catch (JSONException e) {
                    commentObject = null;
                }
                if (commentObject != null) {
                    Comment comment = new Comment(this);
                    comment.setText(commentObject.toString());
                    commentContainer.addView(comment);
                }
            }
        }

        JSONArray messages;
        try {
            messages = response.getJSONArray("messages");
            Log.d("fetchAd", messages.toString());
        } catch (JSONException e) {
            messages = null;
        }
        if (messages != null) {
            LinearLayout messageContainer = findViewById(R.id.messageContainer);
            for (int i = 0; i < messages.length(); i++) {
                JSONObject messageObject;
                try {
                    messageObject = messages.getJSONObject(i);
                    Log.d("fetchAd", messageObject.toString());

                } catch (JSONException e) {
                    messageObject = null;
                }
                if (messageObject != null) {
                    Comment comment = new Comment(this);
                    try {
                        comment.setText(messageObject.getString("content"));
                        Log.d("fetchAd", messageObject.getString("content"));
                    } catch (JSONException e) {
                        comment.setText("");
                    }
                    messageContainer.addView(comment);
                }
            }
        }


    }
}