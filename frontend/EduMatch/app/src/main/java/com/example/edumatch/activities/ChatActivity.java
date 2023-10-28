package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.example.edumatch.R;
import com.example.edumatch.views.CustomChatInputView;
import com.example.edumatch.views.MessageChipView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ChatActivity extends AppCompatActivity {

    private List<List<String>> messages = new ArrayList<>();
    private LinearLayout messageContainer;
    private EditText messageEditText;
    private Button sendMessageButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_view);

        String conversationId = getIntent().getStringExtra("conversationId");
        String conversationName = getIntent().getStringExtra("conversationName");

        Toast.makeText(this, "Conversation ID: " + conversationId, Toast.LENGTH_SHORT).show();
        Toast.makeText(this, "Conversation Name: " + conversationName, Toast.LENGTH_SHORT).show();
        // Initialize your views
        messageContainer = findViewById(R.id.messageContainer);
        CustomChatInputView inputText = findViewById(R.id.customChatInput);
        inputText.bringToFront();
        messageEditText = inputText.getEditText(); // Replace with your EditText's ID
        sendMessageButton = inputText.getSendButton(); // Replace with your Button's ID

        messages.add(Arrays.asList("receiver", "Hey, how's it going? How was your test."));
        messages.add(Arrays.asList("sender", "Good morning! How are you today?"));
        messages.add(Arrays.asList("receiver", "I'm doing well, thank you. How about you?"));
        messages.add(Arrays.asList("sender", "I'm great! The weather is fantastic."));
        messages.add(Arrays.asList("receiver", "That's awesome. I wish I could be outside right now."));
        messages.add(Arrays.asList("sender", "Yes, it's a perfect day for a picnic."));
        messages.add(Arrays.asList("sender", "I'm planning to go to the park this afternoon."));
        messages.add(Arrays.asList("receiver", "Sounds lovely! Don't forget to take some photos."));
        // Add more existing messages here...

        // Initialize messages
        initMessages();

        sendMessageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendMessage();
            }
        });

        messageEditText.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                    sendMessage();
                    return true;
                }
                return false;
            }
        });
    }
    // TODO: need to make a get request to get the messages request: conversationId
//    private void getMessages(){
//
//    }

    private void initMessages() {
        for (List<String> message : messages) {
            String sender = message.get(0);
            String text = message.get(1);
            boolean isReceiver = "receiver".equals(sender);

            MessageChipView messageChipView = new MessageChipView(this, null);
            messageChipView.setChipText(text);
            messageChipView.setIsReceiver(isReceiver);

            messageContainer.addView(messageChipView);
        }
    }

    private void sendMessage() {
        //TODO: need to send message to socket somehow too
        String messageText = messageEditText.getText().toString().trim();
        if (!messageText.isEmpty()) {
            // Create a new message with isReceiver set to false
            MessageChipView messageChipView = new MessageChipView(this, null);
            messageChipView.setChipText(messageText);
            messageChipView.setIsReceiver(false);

            // Add the new message to the message container
            messageContainer.addView(messageChipView);


            // Clear the EditText
            messageEditText.getText().clear();

            ScrollView sv = (ScrollView) findViewById(R.id.scrollView);
            sv.scrollTo(0, sv.getBottom());
        }
    }

}