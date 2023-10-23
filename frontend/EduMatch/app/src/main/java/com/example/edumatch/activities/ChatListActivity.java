package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;

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

public class ChatListActivity extends AppCompatActivity {

    //todo: assuming that when the user clicked the button to go to chatlist a GET to conversations
    // endpoint was called and populated sharedPreferences
    //
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_list);
        String[] conversations = { "Stanley Zhao", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan", "Arya Phan" };

// Get the container where you want to add the buttons (e.g., a LinearLayout)
        LinearLayout buttonContainer = findViewById(R.id.messageContainer); // Replace with your container ID

// Loop through the array and create buttons
        for (String conversation : conversations) {
            Button customButton = (Button) LayoutInflater.from(this)
                    .inflate(R.layout.big_button, buttonContainer, false);

            // Set the text for the button using the conversation name
            customButton.setText(conversation);

            // Add the button to the container
            buttonContainer.addView(customButton);

            // Add a click listener to handle button click events
            customButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Handle button click event here, e.g., open the chat with the selected user

                }
            });
        }
    }


    private void goToNewActivity(){
        Intent newIntent = new Intent(ChatListActivity.this,
                ChatActivity.class);
        SharedPreferences sharedPreferences = updatePreferences();
        printSharedPreferences(sharedPreferences);
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
}