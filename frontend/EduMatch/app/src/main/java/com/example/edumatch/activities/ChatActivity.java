package com.example.edumatch.activities;

import static com.example.edumatch.util.ConversationHelper.getMessages;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.SharedPreferences;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class ChatActivity extends AppCompatActivity {

    private List<List<String>> messages = new ArrayList<>();
    private LinearLayout messageContainer;
    private EditText messageEditText;
    private Button sendMessageButton;
    private String conversationId;

    private String receiverId;

    private WebSocketListener webSocketListener;

    private WebSocket webSocket;
    // Create an OkHttpClient instance
    private OkHttpClient client = new OkHttpClient();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_view);
        initWebSocket();

         conversationId = getIntent().getStringExtra("conversationId");
        String conversationName = getIntent().getStringExtra("conversationName");

        Toast.makeText(this, "Conversation ID: " + conversationId, Toast.LENGTH_SHORT).show();
        Toast.makeText(this, "Conversation Name: " + conversationName, Toast.LENGTH_SHORT).show();
        // Initialize your views
        messageContainer = findViewById(R.id.messageContainer);
        CustomChatInputView inputText = findViewById(R.id.customChatInput);
        inputText.bringToFront();
        messageEditText = inputText.getEditText(); // Replace with your EditText's ID
        sendMessageButton = inputText.getSendButton(); // Replace with your Button's ID

        callGetMessages();

//        messages.add(Arrays.asList("receiver", "Hey, how's it going? How was your test."));
//        messages.add(Arrays.asList("sender", "Good morning! How are you today?"));
//        messages.add(Arrays.asList("receiver", "I'm doing well, thank you. How about you?"));
//        messages.add(Arrays.asList("sender", "I'm great! The weather is fantastic."));
//        messages.add(Arrays.asList("receiver", "That's awesome. I wish I could be outside right now."));
//        messages.add(Arrays.asList("sender", "Yes, it's a perfect day for a picnic."));
//        messages.add(Arrays.asList("sender", "I'm planning to go to the park this afternoon."));
//        messages.add(Arrays.asList("receiver", "Sounds lovely! Don't forget to take some photos."));
        // Add more existing messages here...

        // Initialize messages
//        initMessages();

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
    private void callGetMessages(){
        JSONObject response = getMessages(ChatActivity.this,"1",conversationId);
        try {
            JSONArray messages = response.getJSONArray("messages");
            receiverId = response.getString("otherUserId");
            int length = messages.length(); // Get the length of the array

            for (int i = 0; i < length; i++) {
                JSONObject messageObject = messages.getJSONObject(i); // Get each JSON object from the array

                // Extract data from the messageObject
                String text = messageObject.optString("content", ""); // Example: Get the "text" field
                boolean isYourMessage = messageObject.optBoolean("isYourMessage", false); // Example: Get the "isReceiver" field

                // Process the extracted data
                MessageChipView messageChipView = new MessageChipView(this, null);
                messageChipView.setChipText(text);
                messageChipView.setIsReceiver(!isYourMessage);

                // Add the new message to the message container
                messageContainer.addView(messageChipView);
            }


        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

//    private void initMessages() {
//        for (List<String> message : messages) {
//            String sender = message.get(0);
//            String text = message.get(1);
//            boolean isReceiver = "receiver".equals(sender);
//
//            MessageChipView messageChipView = new MessageChipView(this, null);
//            messageChipView.setChipText(text);
//            messageChipView.setIsReceiver(isReceiver);
//
//            messageContainer.addView(messageChipView);
//        }
//    }

    private void sendMessage(){
        //TODO: need to send message to socket somehow too

        String messageText = messageEditText.getText().toString().trim();
        if (!messageText.isEmpty()) {
            // Create a new message with isReceiver set to false
            MessageChipView messageChipView = new MessageChipView(this, null);
            messageChipView.setChipText(messageText);
            messageChipView.setIsReceiver(false);

            // Add the new message to the message container
            messageContainer.addView(messageChipView);

            // send message to websocket
            JSONObject message = new JSONObject();
            try {
                message.put("receiverId",receiverId);
                message.put("message",messageText);
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
            sendWebSocketMessage(message);

            // Clear the EditText
            messageEditText.getText().clear();

            ScrollView sv = (ScrollView) findViewById(R.id.scrollView);
            sv.scrollTo(0, sv.getBottom());
        }
    }




    // Define a WebSocketListene

    // Initialize WebSocket
    private void initWebSocket() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        String token = sharedPreferences.getString("jwtToken", "");
        String url = "wss://edumatch.canadacentral.cloudapp.azure.com?token=" + token;

        Request request = new Request.Builder().url(url).build();
        webSocketListener = new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                super.onOpen(webSocket, response);
                // Handle the connection open event
                runOnUiThread(() -> {
                    ChatActivity.this.webSocket = webSocket;
                    Toast.makeText(ChatActivity.this, "WebSocket connection opened", Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onMessage(WebSocket webSocket, String text) {
                super.onMessage(webSocket, text);
                // Handle text messages received over WebSocket
                runOnUiThread(() -> handleReceivedMessage(text));
            }

            // ... (other WebSocketListener methods)
        };
        webSocket = client.newWebSocket(request, webSocketListener);
    }

    // Handle received WebSocket messages
    private void handleReceivedMessage(String message) {
        try {
            // Parse the received message as a JSONObject
            JSONObject jsonObject = new JSONObject(message);
            // Extract data from the JSONObject and use it as needed
            String text = jsonObject.optString("content", "");

            // Process the extracted data
            MessageChipView messageChipView = new MessageChipView(this, null);
            messageChipView.setChipText(text);
            messageChipView.setIsReceiver(true); // Set the value based on the JSON data

            // Add the new message to the message container
            messageContainer.addView(messageChipView);
        } catch (JSONException e) {
            // Handle any JSON parsing errors
            e.printStackTrace();
        }
    }
    // Send a text message
    private void sendWebSocketMessage(JSONObject message) {
        if (webSocket != null) {
            webSocket.send(message.toString());
        }
    }

    // Call this method when you want to close the WebSocket connection
    private void closeWebSocket() {
        if (webSocket != null) {
            webSocket.close(1000, "WebSocket closing");
        }
    }




}