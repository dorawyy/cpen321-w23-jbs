package com.example.edumatch.activities;

import static com.example.edumatch.util.AdminHelper.fetchAdminUser;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONObject;

public class AdminUserProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_user_profile);

        Intent intent = getIntent();
        setupUserProfile(intent);
        JSONObject response = fetchAdminUser(intent.getStringExtra("USER_ID"), this);
        populateBio(response);
        populateComments(response);
        populateMessages(response);
    }

    private void setupUserProfile(Intent intent) {
        String userId = intent.getStringExtra("USERNAME");
        String displayId = intent.getStringExtra("DISPLAY_ID");
        String type = intent.getStringExtra("TYPE");
        String status = intent.getStringExtra("STATUS");

        setText(R.id.username, userId);
        setText(R.id.name, displayId);
        setText(R.id.userType, type);
        setText(R.id.start, status);
    }

    private void setText(int viewId, String text) {
        TextView textView = findViewById(viewId);
        if (text != null && !text.isEmpty()) {
            textView.setText(text);
        }
    }

    private void populateBio(JSONObject response) {
        String bio = response.optString("bio");
        if (!bio.isEmpty()) {
            setText(R.id.bio, bio);
        }
    }

    private void populateComments(JSONObject response) {
        JSONArray comments = response.optJSONArray("reviews");
        if (comments != null && comments.length() > 0) {
            LinearLayout commentContainer = findViewById(R.id.container);
            for (int i = 0; i < comments.length(); i++) {
                JSONObject commentObject = comments.optJSONObject(i);
                if (commentObject != null) {
                    addComment(commentContainer, commentObject.toString());
                }
            }
        }
    }

    private void populateMessages(JSONObject response) {
        JSONArray messages = response.optJSONArray("messages");
        if (messages != null) {
            LinearLayout messageContainer = findViewById(R.id.messageContainer);
            for (int i = 0; i < messages.length(); i++) {
                JSONObject messageObject = messages.optJSONObject(i);
                if (messageObject != null) {
                    String content = messageObject.optString("content");
                    addComment(messageContainer, content);
                }
            }
        }
    }

    private void addComment(LinearLayout container, String text) {
        Comment comment = new Comment(this);
        comment.setText(text);
        container.addView(comment);
    }
}
