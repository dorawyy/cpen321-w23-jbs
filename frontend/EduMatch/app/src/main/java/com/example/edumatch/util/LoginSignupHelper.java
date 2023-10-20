package com.example.edumatch.util;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.util.Log;
import android.widget.Toast;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

public class LoginSignupHelper {
    private final static String TAG = "LoginSignupHelper";

    public static int getInputTypeFromString(String inputType) {
        int inputTypeValue = InputType.TYPE_CLASS_TEXT; // Default value

        if (inputType != null) {
            switch (inputType) {
                case "text":
                    inputTypeValue = InputType.TYPE_CLASS_TEXT;
                    break;
                case "textPassword":
                    inputTypeValue = InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD;
                    break;
                // Add more cases for other input types as needed
            }
        }

        return inputTypeValue;
    }

    public static boolean isStartTimeBeforeEndTime(String startTimeString, String endTimeString) {

        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
        Date startTime = null;
        Date endTime = null;

        try {
            startTime = sdf.parse(startTimeString);
            endTime = sdf.parse(endTimeString);
        } catch (ParseException e) {
            e.printStackTrace();
        }

        if (startTime != null && endTime != null) {
            if (endTime.before(startTime)) {
                return false;
            } else {
                return true;
            }
        } else {
            Log.e(TAG, "Parsing Error");
            return false;
        }
    }

    public static void printBundle(Bundle bundle, String prefix) {
        Log.d("BundleData", prefix + "Start of Bundle");

        for (String key : bundle.keySet()) {
            Object value = bundle.get(key);
            if (value instanceof Bundle) {
                Log.d("BundleData", prefix + "Nested Bundle: " + key);
                printBundle((Bundle) value, prefix + "  "); // Recursively print nested bundle
            } else if (value instanceof String[]) {
                String[] stringArray = (String[]) value;
                for (int i = 0; i < stringArray.length; i++) {
                    Log.d("BundleData", prefix + "Key: " + key + "[" + i + "], Value: " + stringArray[i]);
                }
            } else {
                Log.d("BundleData", prefix + "Key: " + key + ", Value: " + value);
            }
        }

        Log.d("BundleData", prefix + "End of Bundle");
    }

}
