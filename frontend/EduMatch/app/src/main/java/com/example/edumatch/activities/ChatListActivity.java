package com.example.edumatch.activities;


import static com.example.edumatch.util.ConversationHelper.getConversations;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
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

    private void initConvos() {
        conversationsList = new ArrayList<>();
        //TODO: uncomment this when backend is ready
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

        // Simulated data from a GET request
//        String[] conversationIds = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"};
//        String[] conversationNames = {"Stanley Zhao", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan"};
//
//        for (int i = 0; i < conversationIds.length; i++) {
//            List<String> conversationInfo = new ArrayList<>();
//            conversationInfo.add(conversationIds[i]);
//            conversationInfo.add(conversationNames[i]);
//            conversationsList.add(conversationInfo);
//        }
        initConvoComponents();
    }


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
            customButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    goToNewActivity(conversation.get(1),conversation.get(0));

                }
            });
        }
    }


    private void goToNewActivity(String convoName, String convoId) {
        Intent newIntent = new Intent(ChatListActivity.this, ChatActivity.class);
        newIntent.putExtra("conversationId", convoId);
        newIntent.putExtra("conversationName", convoName);
        startActivity(newIntent);
    }


}