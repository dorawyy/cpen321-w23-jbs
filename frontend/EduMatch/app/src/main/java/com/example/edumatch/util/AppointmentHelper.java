package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;
import static com.example.edumatch.util.NetworkUtils.showToastOnUiThread;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

public class AppointmentHelper {


    public static boolean putAppointment(Context context, JSONObject requestBody, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "PUT", requestBody);

        if (jsonResponse != null) {
            try {
                if (jsonResponse.has("errorDetails")) {
                    JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
                    if (errorDetails.has("message")) {
                        String message = errorDetails.getString("message");
                        Log.d("AppointmentPut", "There was an error: " + message);
                        showToastOnUiThread(context, message);
                        return false; // Return false to indicate failure
                    }
                }
                else {
                    String message = "Successfully Canceled Appointment";
                    showToastOnUiThread(context, message);
                }
                Log.d("AppointmentPut", jsonResponse.toString());

            } catch (JSONException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            Log.d("AppointmentPut", "jsonResponse was NULL");
        }
        return true;
    }


    public static JSONObject getAppointment(Context context, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        if (jsonResponse != null) {
            try {
                if (jsonResponse.has("errorDetails")) {
                    JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
                    if (errorDetails.has("message")) {
                        String message = errorDetails.getString("message");
                        Log.d("AppointmentGet", "There was an error: " + message);
                        showToastOnUiThread(context, message);
                        return null; // Return null to indicate failure
                    }
                }
                Log.d("AppointmentGet", jsonResponse.toString());

            } catch (JSONException e) {
                e.printStackTrace();
                return jsonResponse;
            }
        } else {
            Log.d("AppointmentGet", "jsonResponse was NULL");
        }
        return jsonResponse;
    }
}
