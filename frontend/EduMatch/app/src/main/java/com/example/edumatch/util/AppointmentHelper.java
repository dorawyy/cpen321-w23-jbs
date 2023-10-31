package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.handlePutPostResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONObject;

public class AppointmentHelper {

    public static String api = "https://edumatch.canadacentral.cloudapp.azure.com/";


    public static boolean putAppointment(Context context, JSONObject requestBody, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "PUT", requestBody);

        String successMessage = "Successfully Canceled Appointment";
        String logTag = "AppointmentPut";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }




    public static JSONObject getAppointment(Context context, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "AppointmentGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }

    public static JSONObject getAvailability(Context context, String userId, String date) {
        String apiUrl = api + "availability?userId=" + userId + "&date=";

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "AppointmentGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }


}
