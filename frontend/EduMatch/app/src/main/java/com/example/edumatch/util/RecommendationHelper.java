package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handlePutPostResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class RecommendationHelper {
    public static boolean updateWhenTuteeChecksTutor(String id, Context context) {
        Log.d("mag", "maggie");
        String url = "https://edumatch.canadacentral.cloudapp.azure.com/user_action/checked_profile";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        JSONObject requestBody = new JSONObject();
        try {
           requestBody = new JSONObject();
           requestBody.put("tutorId", id);
        } catch (JSONException e) {
            Log.d("mag", "error");
        }
        JSONObject jsonResponse = sendHttpRequest(url,sharedPreferences.getString("jwtToken", ""), "POST", requestBody);
        Log.d("mag", jsonResponse.toString());
        String logTag = "TuteeCheckTutorUpdateWeight";
        String successMessage = "Successfully Updated Recommendation Weight";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }

    public static boolean updateWhenTutorOpensConvo(String id, Context context) {
        String url = "https://edumatch.canadacentral.cloudapp.azure.com/user_action/contacted_tutor";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        JSONObject requestBody = new JSONObject();
        try {
            requestBody = new JSONObject();
            requestBody.put("tutorId", id);
        } catch (JSONException e) {
            Log.d("mag", "error");
        }
        JSONObject jsonResponse = sendHttpRequest(url,sharedPreferences.getString("jwtToken", ""), "POST", requestBody);
        String logTag = "updateWhenTutorOpensConvo";
        String successMessage = "Successfully Updated Recommendation Weight";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }

    public static boolean updateWhenSchedules(String id, String subject, Context context) {
        String url = "https://edumatch.canadacentral.cloudapp.azure.com/user_action/scheduled_appointment";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        JSONObject requestBody = new JSONObject();
        try {
            requestBody = new JSONObject();
            requestBody.put("tutorId", id);
            requestBody.put("scheduledSubject", subject);
        } catch (JSONException e) {
            Log.d("mag", "error");
        }
        JSONObject jsonResponse = sendHttpRequest(url,sharedPreferences.getString("jwtToken", ""), "POST", requestBody);
        String logTag = "TutorUpdatesWhenScheduled";
        String successMessage = "Successfully Updated Recommendation Weight";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }
}
