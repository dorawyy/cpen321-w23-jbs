package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class TutorsHelper {


    public static JSONObject getTuteeHome(StringBuilder apiUrl, Context context) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl.toString(),sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "TutorsGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }
}
