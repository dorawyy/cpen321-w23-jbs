package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.NetworkUtils.postDataToBackend;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.example.edumatch.R;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ChatListActivity extends AppCompatActivity {

    //todo: assuming that when the user clicked the button to go to chatlist a GET to conversations
    // endpoint was called and populated sharedPreferences
    List<List<String>> conversationsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_list);

        initConvos();
// Get the container where you want to add the buttons (e.g., a LinearLayout)


// Loop through the array and create buttons

    }

    private void initConvos() {
        conversationsList = new ArrayList<>();

// Simulate data from a GET request
        String[] conversationIds = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "10"};
        String[] conversationNames = {"Stanley Zhao", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan"};

        for (int i = 0; i < conversationIds.length; i++) {
            List<String> conversationInfo = new ArrayList<>();
            conversationInfo.add(conversationIds[i]);
            conversationInfo.add(conversationNames[i]);
            conversationsList.add(conversationInfo);
        }
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

    private SharedPreferences updatePreferences() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
//        editor.putBoolean("isEditing", false);
//        editor.putBoolean("useGoogle", useGoogle);
        editor.commit();
        return sharedPreferences;
    }

    //todo: create a get all conversations function here
//    private Boolean getConversations() {
//        JSONObject requestBody = constructSignInRequest();// Create your JSON request body
//        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/api/auth/login";
//
//        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
//        SharedPreferences.Editor editor = sharedPreferences.edit();
//        JSONObject jsonResponse = getDatafrombackend...(apiUrl, requestBody, sharedPreferences.getString("jwtToken",""));
//
//        if (jsonResponse != null) {
//            try {
//                if (jsonResponse.has("errorDetails")) {
//                    JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
//                    if (errorDetails.has("message")) {
//                        String message = errorDetails.getString("message");
//                        if ("Username or password is incorrect".equals(message)) {
//                            // Handle the case where the username already exists
//                            runOnUiThread(() -> {
//                                Toast.makeText(getApplicationContext(), "Username or password is incorrect", Toast.LENGTH_SHORT).show();
//                            });
//                            return false; // Return false to indicate failure
//                        }
//                    }
//                } else {
//                    SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
//                    SharedPreferences.Editor editor = sharedPreferences.edit();
//                    editor.putString("jwtToken", jsonResponse.getString("jwtToken"));
//                    editor.putString("userType", jsonResponse.getString("type"));
//                    editor.commit();
//                    printSharedPreferences(sharedPreferences);
//                    return true;
//                }
//                Log.d("ConversationsGet", jsonResponse.toString());
//
//            } catch (JSONException e) {
//                e.printStackTrace();
//                return false;
//            }
//        } else {
//            Log.d("ConversationsGet", "jsonResponse was NULL");
//            return false;
//        }
//        return false;
//    }
}