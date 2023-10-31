package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class AdminHelper {
    StringBuilder apiUrlBuilder;
    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/recommended?";

    public static JSONObject getAdminHome(StringBuilder apiUrl, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl.toString(),sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "AdminGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }

    public static void banUser(String userId, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/admin/ban";
        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("userId", userId);
            Log.d("ban", userId);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""), "PUT", requestBody);

        String logTag = "BanUser";

    }

    public static void unbanUser(String userId, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/admin/unban";
        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("userId", userId);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""), "PUT", requestBody);

        String logTag = "BanUser";

    }
}
