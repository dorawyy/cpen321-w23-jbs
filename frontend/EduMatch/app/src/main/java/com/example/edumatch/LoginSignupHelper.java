package com.example.edumatch;

import android.text.InputType;
import android.util.Log;
import android.widget.Toast;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

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

    public static boolean isStartTimeBeforeEndTime(String startTimeString, String endTimeString){

        SimpleDateFormat sdf = new SimpleDateFormat("%02d:%02d");
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
}
