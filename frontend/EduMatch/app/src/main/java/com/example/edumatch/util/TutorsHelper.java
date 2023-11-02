package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public class TutorsHelper {

    public static JSONObject getTuteeHome(StringBuilder apiUrl, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl.toString(),sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "TutorsGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }
    // ChatGPT usage: Yes
    public static JSONObject getTutorInfo(String id, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        String apiUrlWithUserId = "https://edumatch.canadacentral.cloudapp.azure.com" + "/user/publicProfile?userId=" + id;

        JSONObject jsonResponse = sendHttpRequest(apiUrlWithUserId.toString(),sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "TutorInfoGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }


}
