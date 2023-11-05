package com.example.edumatch.util;

import static com.example.edumatch.util.NetworkUtils.handlePutPostResponse;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;
import static com.example.edumatch.util.NetworkUtils.showToastOnUiThread;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ProfileHelper {

    // ChatGPT usage: Yes
    public static JSONObject constructSignUpRequest(Context context) {
        try {
            // Retrieve data from SharedPreferences

            SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);


            JSONObject requestBody = new JSONObject();
            requestBody.put("type", sharedPreferences.getString("userType", ""));

            requestBody.put("displayedName", sharedPreferences.getString("name", ""));
            requestBody.put("email", sharedPreferences.getString("email", ""));
            requestBody.put("phoneNumber", sharedPreferences.getString("phoneNumber", ""));
            requestBody.put("username", sharedPreferences.getString("username", ""));
            requestBody.put("password", sharedPreferences.getString("password", ""));
            requestBody.put("locationMode", sharedPreferences.getString("locationMode", ""));
            requestBody.put("bio", sharedPreferences.getString("bio", ""));

            // For location (latitude and longitude)
            JSONObject location = new JSONObject();
            location.put("lat", sharedPreferences.getFloat("latitude", 0));
            location.put("long", sharedPreferences.getFloat("longitude", 0));
            requestBody.put("location", location);

            // For education
            JSONObject education = new JSONObject();
            education.put("school", sharedPreferences.getString("university", ""));
            education.put("program", sharedPreferences.getString("program", ""));
            education.put("level", sharedPreferences.getString("yearLevel", ""));
            Set<String> courses = sharedPreferences.getStringSet("courses", new HashSet<>());
            JSONArray coursesArray = new JSONArray(courses);
            education.put("courses", coursesArray);

            Set<String> tags = sharedPreferences.getStringSet("tags", new HashSet<>());
            JSONArray tagsArray = new JSONArray(tags);
            education.put("tags", tagsArray);

            requestBody.put("education", education);

            // For useGoogleCalendar
            boolean useGoogleCalendar = sharedPreferences.getBoolean("useGoogleCalendar", false);
            requestBody.put("useGoogleCalendar", useGoogleCalendar);


            String subjectHourlyRateJson = sharedPreferences.getString("coursePricePairs", "");

            if (!subjectHourlyRateJson.isEmpty()) {
                // Parse the subjectHourlyRate JSON
                JSONArray subjectHourlyRate = new JSONArray(subjectHourlyRateJson);
                requestBody.put("subjectHourlyRate", subjectHourlyRate);
            }

            Log.d("SignUpPost","After subjectRate");

            JSONArray manualAvailabilityArray = new JSONArray();

            JSONObject sunday = new JSONObject();
            sunday.put("day", "Sunday");
            sunday.put("startTime", sharedPreferences.getString("SundayStartTime", ""));
            sunday.put("endTime", sharedPreferences.getString("SundayEndTime", ""));
            manualAvailabilityArray.put(sunday);

            JSONObject monday = new JSONObject();
            monday.put("day", "Monday");
            monday.put("startTime", sharedPreferences.getString("MondayStartTime", ""));
            monday.put("endTime", sharedPreferences.getString("MondayEndTime", ""));
            manualAvailabilityArray.put(monday);

            JSONObject tuesday = new JSONObject();
            tuesday.put("day", "Tuesday");
            tuesday.put("startTime", sharedPreferences.getString("TuesdayStartTime", ""));
            tuesday.put("endTime", sharedPreferences.getString("TuesdayEndTime", ""));
            manualAvailabilityArray.put(tuesday);

            JSONObject wednesday = new JSONObject();
            wednesday.put("day", "Wednesday");
            wednesday.put("startTime", sharedPreferences.getString("WednesdayStartTime", ""));
            wednesday.put("endTime", sharedPreferences.getString("WednesdayEndTime", ""));
            manualAvailabilityArray.put(wednesday);

            JSONObject thursday = new JSONObject();
            thursday.put("day", "Thursday");
            thursday.put("startTime", sharedPreferences.getString("ThursdayStartTime", ""));
            thursday.put("endTime", sharedPreferences.getString("ThursdayEndTime", ""));
            manualAvailabilityArray.put(thursday);

            JSONObject friday = new JSONObject();
            friday.put("day", "Friday");
            friday.put("startTime", sharedPreferences.getString("FridayStartTime", ""));
            friday.put("endTime", sharedPreferences.getString("FridayEndTime", ""));
            manualAvailabilityArray.put(friday);

            JSONObject saturday = new JSONObject();
            saturday.put("day", "Saturday");
            saturday.put("startTime", sharedPreferences.getString("SaturdayStartTime", ""));
            saturday.put("endTime", sharedPreferences.getString("SaturdayEndTime", ""));
            manualAvailabilityArray.put(saturday);

            requestBody.put("manualAvailability", manualAvailabilityArray);

            logRequestToConsole(requestBody);
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    // ChatGPT usage: Yes
    public static void logRequestToConsole(JSONObject request) {
        Log.d("RequestProfileHelper", "Request JSON: " + request.toString());
    }

    // ChatGPT usage: Yes
    public static Boolean putEditProfile(JSONObject request, Context context) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/user/editProfile";

        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        JSONObject jsonResponse = sendHttpRequest(apiUrl,sharedPreferences.getString("jwtToken", ""),"PUT",request);

        String successMessage = "Successfully Edited Profile";

        String logTag = "EditProfilePut";

        return handlePutPostResponse(context,jsonResponse,successMessage,logTag);
    }

    // ChatGPT usage: Yes
    public static Boolean getProfile(Context context) {
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/user/profile";
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        JSONObject jsonResponse = sendHttpRequest(apiUrl, sharedPreferences.getString("jwtToken", ""), "GET", null);

        if (jsonResponse != null) {
            return processProfileData(context, sharedPreferences, jsonResponse);
        } else {
            Log.d("EditProfileGet", "jsonResponse was NULL");
            return false;
        }
    }

    // ChatGPT usage: Yes
    private static Boolean processProfileData(Context context, SharedPreferences sharedPreferences, JSONObject jsonResponse) {
        try {
            Log.d("EditProfileGet", jsonResponse.toString());

            if (jsonResponse.has("errorDetails")) {
                return handleErrorResponse(context, jsonResponse);
            } else {
                saveProfileDataToSharedPreferences(sharedPreferences, jsonResponse);
            }
        } catch (JSONException e) {
            throw new CustomException("JSON parsing exception", e);
        }
        return true;
    }

    // ChatGPT usage: Yes
    private static Boolean handleErrorResponse(Context context, JSONObject jsonResponse) throws JSONException {
        JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
        if (errorDetails.has("message")) {
            String message = errorDetails.getString("message");
            Log.d("EditProfileGet", "There was an error: " + message);
            showToastOnUiThread(context, message);
            return false;
        }
        return true;
    }

    // ChatGPT usage: Yes
    private static void saveProfileDataToSharedPreferences(SharedPreferences sharedPreferences, JSONObject jsonResponse) throws JSONException {
        SharedPreferences.Editor editor = sharedPreferences.edit();

        saveBasicProfileData(editor, jsonResponse);
        saveLocationData(editor, jsonResponse);
        saveEducationData(editor, jsonResponse);
        saveGoogleCalendarData(editor, jsonResponse);
        saveManualAvailabilityData(editor, jsonResponse);
        saveSubjectHourlyRateData(editor, jsonResponse);

        editor.apply();
        Log.d("ProfileDataSaved", "User profile data saved to SharedPreferences");
    }

    // ChatGPT usage: Yes
    private static void saveBasicProfileData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("displayedName")) {
            editor.putString("name", jsonResponse.getString("displayedName"));
        }
        if (jsonResponse.has("email")) {
            editor.putString("email", jsonResponse.getString("email"));
        }
        if (jsonResponse.has("phoneNumber")) {
            editor.putString("phoneNumber", jsonResponse.getString("phoneNumber"));
        }
        if (jsonResponse.has("username")) {
            editor.putString("username", jsonResponse.getString("username"));
        }
        if (jsonResponse.has("bio")) {
            editor.putString("bio", jsonResponse.getString("bio"));
        }
    }

    // ChatGPT usage: Yes
    private static void saveLocationData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("location")) {
            JSONObject locationObj = jsonResponse.getJSONObject("location");
            if (locationObj.has("lat")) {
                editor.putFloat("latitude", (float) locationObj.getDouble("lat"));
            }
            if (locationObj.has("long")) {
                editor.putFloat("longitude", (float) locationObj.getDouble("long"));
            }
        }
    }

    // ChatGPT usage: Yes
    private static void saveEducationData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("education")) {
            JSONObject educationObj = jsonResponse.getJSONObject("education");
            saveSchool(editor, educationObj);
            saveProgram(editor, educationObj);
            saveLevel(editor, educationObj);
            saveCourses(editor, educationObj);
            saveTags(editor, educationObj);
        }
    }

    // ChatGPT usage: Yes
    private static void saveSchool(SharedPreferences.Editor editor, JSONObject educationObj) throws JSONException {
        if (educationObj.has("school")) {
            editor.putString("university", educationObj.getString("school"));
        }
    }

    // ChatGPT usage: Yes
    private static void saveProgram(SharedPreferences.Editor editor, JSONObject educationObj) throws JSONException {
        if (educationObj.has("program")) {
            editor.putString("program", educationObj.getString("program"));
        }
    }

    // ChatGPT usage: Yes
    private static void saveLevel(SharedPreferences.Editor editor, JSONObject educationObj) throws JSONException {
        if (educationObj.has("level")) {
            editor.putString("yearLevel", String.valueOf(educationObj.getInt("level")));
        }
    }

    // ChatGPT usage: Yes
    private static void saveCourses(SharedPreferences.Editor editor, JSONObject educationObj) throws JSONException {
        if (educationObj.has("courses")) {
            JSONArray coursesArray = educationObj.getJSONArray("courses");
            Set<String> coursesSet = new HashSet<>();
            for (int i = 0; i < coursesArray.length(); i++) {
                coursesSet.add(coursesArray.getString(i));
            }
            editor.putStringSet("courses", coursesSet);
        }
    }

    // ChatGPT usage: Yes
    private static void saveTags(SharedPreferences.Editor editor, JSONObject educationObj) throws JSONException {
        if (educationObj.has("tags")) {
            JSONArray tagsArray = educationObj.getJSONArray("tags");
            Set<String> tagsSet = new HashSet<>();
            for (int i = 0; i < tagsArray.length(); i++) {
                tagsSet.add(tagsArray.getString(i));
            }
            editor.putStringSet("tags", tagsSet);
        }
    }

    // ChatGPT usage: Yes
    private static void saveGoogleCalendarData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("useGoogleCalendar")) {
            editor.putBoolean("useGoogleCalendar", jsonResponse.getBoolean("useGoogleCalendar"));
        }
    }

    // ChatGPT usage: Yes
    private static void saveManualAvailabilityData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("manualAvailability")) {
            JSONArray manualAvailabilityArray = jsonResponse.getJSONArray("manualAvailability");

            // Create a map to store the day key, start time, and end time
            Map<String, String[]> availabilityData = new HashMap<>();

            // Extract day, start time, and end time data
            for (int i = 0; i < manualAvailabilityArray.length(); i++) {
                JSONObject dayAvailability = manualAvailabilityArray.getJSONObject(i);
                if (dayAvailability.has("day") && dayAvailability.has("startTime") && dayAvailability.has("endTime")) {
                    String dayKey = dayAvailability.getString("day");
                    String startTime = dayAvailability.getString("startTime");
                    String endTime = dayAvailability.getString("endTime");
                    availabilityData.put(dayKey, new String[]{startTime, endTime});
                }
            }

            // Save individual day key, start time, and end time
            for (Map.Entry<String, String[]> entry : availabilityData.entrySet()) {
                String dayKey = entry.getKey();
                String[] times = entry.getValue();
                editor.putString(dayKey + "StartTime", times[0]);
                editor.putString(dayKey + "EndTime", times[1]);
            }

            // Store the entire manualAvailability JSON in SharedPreferences
            editor.putString("manualAvailability", manualAvailabilityArray.toString());
        }
    }

    // ChatGPT usage: Yes
    private static void saveSubjectHourlyRateData(SharedPreferences.Editor editor, JSONObject jsonResponse) throws JSONException {
        if (jsonResponse.has("subjectHourlyRate")) {
            JSONArray subjectHourlyRateArray = jsonResponse.getJSONArray("subjectHourlyRate");
            editor.putString("coursePricePairs", subjectHourlyRateArray.toString());
        }
    }
}
