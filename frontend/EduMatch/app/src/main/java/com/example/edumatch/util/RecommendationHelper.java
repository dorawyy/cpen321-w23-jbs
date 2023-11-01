package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class RecommendationHelper {
    public static JSONObject updateWhenTuteeChecksTutor(String id, Context context) {
        Log.d("mag", "maggie");
        String url = "https://edumatch.canadacentral.cloudapp.azure.com/user_action/checked_profile";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("userId", id);
        } catch (JSONException e) {
            Log.d("mag", "error");
        }
        JSONObject jsonResponse = sendHttpRequest(url,sharedPreferences.getString("jwtToken", ""), "POST", jsonObject);
        Log.d("mag", jsonResponse.toString());
        String logTag = "updateTutor";

        return handleGetResponse(context,jsonResponse,logTag);
    }
}
