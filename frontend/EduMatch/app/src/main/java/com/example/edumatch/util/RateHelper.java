package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handlePutPostResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public class RateHelper {

    // ChatGPT usage: Yes
    public static boolean postReview(Context context, JSONObject requestBody) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/review/addReview";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""),"POST",requestBody);

        String successMessage = "Successfully Made Rating";
        String logTag = "RatePost";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }

    // ChatGPT usage: Yes
    public static boolean postRatingWeight(Context context, JSONObject requestBody) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/user_action/reviewed_tutor";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""),"POST",requestBody);

        String successMessage = "";
        String logTag = "RateWeightPost";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }
}
