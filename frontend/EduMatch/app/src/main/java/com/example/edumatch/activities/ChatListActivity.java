package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;

import com.example.edumatch.R;

public class ChatListActivity extends AppCompatActivity {

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
}