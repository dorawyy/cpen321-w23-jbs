package com.example.edumatch.activities;


import static com.example.edumatch.util.ConversationHelper.getConversations;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.widget.Button;
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ChatListActivity extends AppCompatActivity {
    List<List<String>> conversationsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_list);

        initConvos();

    }

    // ChatGPT usage: Yes
    private void initConvos() {
        conversationsList = new ArrayList<>();
        JSONObject conversations = getConversations(ChatListActivity.this);

        if (conversations.has("conversations")) {
            try {
                JSONArray conversationArray = conversations.getJSONArray("conversations");

                for (int i = 0; i < conversationArray.length(); i++) {
                    JSONObject conversationObject = conversationArray.getJSONObject(i);

                    String conversationId = conversationObject.getString("conversationId");
                    String conversationName = conversationObject.getString("conversationName");

                    List<String> conversationInfo = new ArrayList<>();
                    conversationInfo.add(conversationId);
                    conversationInfo.add(conversationName);

                    conversationsList.add(conversationInfo);
                }

                // Now, conversationsList contains the data from the JSONArray.
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
        initConvoComponents();
    }

    // ChatGPT usage: Yes
    private void initConvoComponents() {
        LinearLayout buttonContainer = findViewById(R.id.messageContainer); // Replace with your container ID
        for (List<String> conversation : conversationsList) {
            Button customButton = (Button) LayoutInflater.from(this)
                    .inflate(R.layout.big_button, buttonContainer, false);

            // Set the text for the button using the conversation name
            customButton.setText(conversation.get(1));

            // Add the button to the container
            buttonContainer.addView(customButton);

            // Add a click listener to handle button click events
            customButton.setOnClickListener(v -> goToNewActivity(conversation.get(1),conversation.get(0)));
        }
    }


    private void goToNewActivity(String convoName, String convoId) {
        Intent newIntent = new Intent(ChatListActivity.this, ChatActivity.class);
        newIntent.putExtra("conversationId", convoId);
        newIntent.putExtra("conversationName", convoName);
        startActivity(newIntent);
    }


}