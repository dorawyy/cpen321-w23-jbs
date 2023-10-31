package com.example.edumatch.activities;

import static com.example.edumatch.util.ConversationHelper.getMessages;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.RecyclerView;

import com.example.edumatch.R;
import com.example.edumatch.util.MessageAdapter;
import com.example.edumatch.util.MessageItem;
import com.example.edumatch.views.CustomChatInputView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class ChatActivity extends AppCompatActivity {

    private final List<MessageItem> messages = new ArrayList<>();
    private EditText messageEditText;
    private String conversationId;
    private String receiverId;

    private WebSocket webSocket;
    private final OkHttpClient client = new OkHttpClient();
    private int oldestMessageId = 1;

    private MessageAdapter messageAdapter;
    private RecyclerView recyclerView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_view);

        initWebSocket();

        conversationId = getIntent().getStringExtra("conversationId");
        String conversationName = getIntent().getStringExtra("conversationName");

//        Toast.makeText(this, "Conversation ID: " + conversationId, Toast.LENGTH_SHORT).show();
//        Toast.makeText(this, "Conversation Name: " + conversationName, Toast.LENGTH_SHORT).show();

        CustomChatInputView inputText = findViewById(R.id.customChatInput);
        inputText.bringToFront();
        messageEditText = inputText.getEditText();
        Button sendMessageButton = inputText.getSendButton();

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setHasFixedSize(true);
        recyclerView.setRecycledViewPool(null);

        messageAdapter = new MessageAdapter(messages);
        recyclerView.setAdapter(messageAdapter);

        sendMessageButton.setOnClickListener(view -> sendMessage());

        messageEditText.setOnKeyListener((v, keyCode, event) -> {
            if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                sendMessage();
                return true;
            }
            return false;
        });
        loadMoreMessages();

        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                if (!recyclerView.canScrollVertically(-1)) {
                    // User has scrolled to the top, load more messages
                    loadMoreMessages();
                }
            }
        });

    }

    @Override
    protected void onStop() {
        super.onStop();
        closeWebSocket();
    }


    private void loadMoreMessages() {
        if (oldestMessageId != -1) {
            callGetMessages(String.valueOf(oldestMessageId));
        }
    }

    private void callGetMessages(String page) {
        if (oldestMessageId != -1) {
            Log.d("MessagesGet",String.valueOf(oldestMessageId));
            JSONObject response = getMessages(ChatActivity.this, page, conversationId);
            try {
                JSONArray messagesArray = response.getJSONArray("messages");
                receiverId = response.getString("otherUserId");
                int length = messagesArray.length();
                if (length == 0) {
                    oldestMessageId = -1;
                } else {
                    for (int i = length - 1; i >= 0; i--) {
                        JSONObject messageObject = messagesArray.getJSONObject(i);
                        String text = messageObject.optString("content", "");
                        boolean isYourMessage = messageObject.optBoolean("isYourMessage", false);

                        messages.add(0, new MessageItem(text, isYourMessage));
                        messageAdapter.notifyItemInserted(0);
                    }
                    oldestMessageId++;
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private void sendMessage() {
        String messageText = messageEditText.getText().toString().trim();
        if (!messageText.isEmpty()) {
            // Add the message to the list
            messages.add(new MessageItem(messageText, true));

            // Notify the adapter of the data change
            messageAdapter.notifyItemInserted(messages.size() - 1);

            JSONObject message = new JSONObject();
            try {
                message.put("receiverId", receiverId);
                message.put("message", messageText);
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
            sendWebSocketMessage(message);

            messageEditText.getText().clear();

            // Scroll to the last message sent
            recyclerView.smoothScrollToPosition(messages.size() - 1);
        }
    }

    private void initWebSocket() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        String token = sharedPreferences.getString("jwtToken", "");
        String url = "wss://edumatch.canadacentral.cloudapp.azure.com?token=" + token;

        Request request = new Request.Builder().url(url).build();
        WebSocketListener webSocketListener = new WebSocketListener() {
            @Override
            public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                super.onOpen(webSocket, response);
                runOnUiThread(() -> {
                    ChatActivity.this.webSocket = webSocket;
                    Toast.makeText(ChatActivity.this, "WebSocket connection opened", Toast.LENGTH_SHORT).show();
                });
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull String text) {
                super.onMessage(webSocket, text);
                runOnUiThread(() -> handleReceivedMessage(text));
            }
        };
        webSocket = client.newWebSocket(request, webSocketListener);
    }

    private void handleReceivedMessage(String message) {
        try {
            JSONObject jsonObject = new JSONObject(message);
            String text = jsonObject.optString("content", "");

            // Add the received message to the list
            messages.add(new MessageItem(text, false));

            // Notify the adapter of the data change
            messageAdapter.notifyItemInserted(messages.size() - 1);

            // Scroll to the last message received
            recyclerView.smoothScrollToPosition(messages.size() - 1);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private void sendWebSocketMessage(JSONObject message) {
        if (webSocket != null) {
            webSocket.send(message.toString());
        }
    }

    private void closeWebSocket() {
        if (webSocket != null) {
            webSocket.close(1000, "WebSocket closing");
        }
    }
}


