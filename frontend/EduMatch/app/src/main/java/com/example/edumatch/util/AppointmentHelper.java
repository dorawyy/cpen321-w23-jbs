package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handleGetResponse;
import static com.example.edumatch.util.NetworkUtils.handlePutPostResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class AppointmentHelper {

    public static String api = "https://edumatch.canadacentral.cloudapp.azure.com/";

    // ChatGPT usage: Yes
    public static boolean putAppointment(Context context, JSONObject requestBody, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment/cancel?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "PUT", requestBody);
        Log.d("appt", jsonResponse.toString());
        String successMessage = "Successfully Canceled Appointment";
        String logTag = "AppointmentPut";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }
    public static boolean setAppointment(Context context, JSONObject requestBody) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment/bookAppointment";

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "POST", requestBody);
        Log.d("AppointmentPOST", requestBody.toString());

        String successMessage = "Successfully Scheduled Appointment";
        String logTag = "AppointmentPOST";

        return handlePutPostResponse(context, jsonResponse,successMessage,logTag);
    }

    public static JSONObject getAppointments(Context context) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointments";

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "AppointmentsGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }

    // ChatGPT usage: Yes
    public static JSONObject getAppointment(Context context, String appointmentId) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/appointment?appointmentId=" + appointmentId;

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        Log.d("appt2", apiUrl);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        String logTag = "AppointmentGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }

    // ChatGPT usage: Yes
    public static JSONObject getAvailability(Context context, String userId, String date) {
        String apiUrl = api + "user/availability?userId=" + userId + "&date=" + convertDateFormat(date);

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);
       Log.d("avail", jsonResponse.toString());

        String logTag = "AppointmentGet";

        return handleGetResponse(context,jsonResponse,logTag);
    }

    public static String convertDateFormat(String oldFormatDate) {
        try {
            SimpleDateFormat oldDateFormat = new SimpleDateFormat("MM/dd/yyyy", Locale.getDefault());
            Date date = oldDateFormat.parse(oldFormatDate);
            SimpleDateFormat newDateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
            return newDateFormat.format(date);
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }


}
