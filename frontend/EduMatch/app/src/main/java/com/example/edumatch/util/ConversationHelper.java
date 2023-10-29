package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public class ConversationHelper {

    public static JSONObject getConversations(Context context) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/conversations";

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "ConversationsGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }
}
