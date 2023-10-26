package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

public class RateHelper {

    public static boolean postReview(Context context, JSONObject requestBody) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/review/addReview";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""),"POST",requestBody);

        if (jsonResponse != null) {
            try {
                // TODO: get possible error messages/codes
                if (jsonResponse.has("errorDetails")) {
                    JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
                    Log.d("RatePost", "There was an error!");
                }
                Log.d("RatePost", jsonResponse.toString());

            } catch (JSONException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            Log.d("RatePost","jsonResponse was NULL");
        }
        return true;
    }
}
