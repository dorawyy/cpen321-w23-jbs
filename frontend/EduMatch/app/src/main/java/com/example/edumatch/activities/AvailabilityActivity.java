package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.isStartTimeBeforeEndTime;
import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;

import androidx.appcompat.app.AppCompatActivity;

import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.edumatch.views.AvailableTimesViews;
import com.example.edumatch.views.CourseRateItemView;
import com.example.edumatch.views.DayOfTheWeekView;
import com.example.edumatch.R;
import com.example.edumatch.views.GoogleIconButtonView;
import com.example.edumatch.views.LabelAndEditTextView;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public class AvailabilityActivity extends AppCompatActivity implements DayOfTheWeekView.DayOfTheWeekClickListener {
    //todo Add navigation to next activity on both set buttons
    //todo Add a check that google account isn't null if set automatically, IE account needs to be added to the bundle
    //todo either add the availability to bundle or make api call here need to send available times, and boolean representing if using calendar or manual times
    final static String TAG = "AvailabilityActivity";
    private Map<String, List<String>> availabilityMap;

    private AvailableTimesViews availableTimesViews;

    private Button setTimeButton;

    private String currentDay;

    private boolean useGoogleCalendar;

    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;


    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_availability);

        availableTimesViews = findViewById(R.id.available_times);

        availabilityMap = new HashMap<>();

        initSharedPreferences();
        initManualButton();
        initGoogleButton();
        initializeDayButtons();
        initializeSetTimeButton();
        initInvisibleFields();
        initFields();
    }

    private void initInvisibleFields() {

        if (!sharedPreferences.getBoolean("useGoogle", false)) {
            GoogleIconButtonView googleView = findViewById(R.id.google);
            googleView.setVisibility(View.GONE);
            TextView text = findViewById(R.id.automatically_set_title);
            text.setVisibility(View.GONE);
        }
    }

    private void initializeSetTimeButton() {
        setTimeButton = availableTimesViews.getSetTimesButton();

        setTimeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Toggle the clicked state
                if (availabilityMap.containsKey(currentDay)) {
                    List<String> availability = availabilityMap.get(currentDay);
                    String startTimeString = availableTimesViews.getStartTime();
                    String endTimeString = availableTimesViews.getEndTime();

                    Boolean isValid = isStartTimeBeforeEndTime(startTimeString, endTimeString);
                    if (isValid == false) {
                        Toast.makeText(AvailabilityActivity.this, "Start Time Not Before End Time, Not Saved!", Toast.LENGTH_SHORT).show();
                    } else {
                        availability.set(0, availableTimesViews.getStartTime());
                        availability.set(1, availableTimesViews.getEndTime());
                        Toast.makeText(AvailabilityActivity.this, "Saved for " + currentDay, Toast.LENGTH_SHORT).show();
                    }

                }
            }
        });
    }

    private void initializeDayButtons() {
        int[] buttonIds = {
                R.id.sunday_button,
                R.id.monday_button,
                R.id.tuesday_button,
                R.id.wednesday_button,
                R.id.thursday_button,
                R.id.friday_button,
                R.id.saturday_button
        };

        // Set up click listeners for each DayOfTheWeekButton
        for (int buttonId : buttonIds) {

            DayOfTheWeekView currentDayButton = findViewById(buttonId);
            final String day = currentDayButton.getDay();

            currentDayButton.setDayOfTheWeekClickListener(this);

            availabilityMap.put(day, Arrays.asList("00:00", "23:59"));
        }
    }

    @Override
    public void onDayButtonClick(String day) {
        Log.w(TAG, "Day " + day);
        updateAvailability(day);

        if (availabilityMap.containsKey(day)) {
            List<String> availability = availabilityMap.get(day);

            Log.w(TAG, day + availability.get(0) + availability.get(1));
        } else {
            Toast.makeText(AvailabilityActivity.this, "No availability data for " + day, Toast.LENGTH_SHORT).show();
            Log.w(TAG, "No availability data");
        }
        availableTimesViews.setVisibility(View.VISIBLE);
    }


    private void updateAvailability(String day) {
        TextView dayText = findViewById(R.id.selected_day);
        currentDay = day;
        if (availabilityMap.containsKey(day)) {
            List<String> availability = availabilityMap.get(day);
            String startTime = availability.get(0);
            String endTime = availability.get(1);
            availableTimesViews.setStartTime(startTime);
            availableTimesViews.setEndTime(endTime);
        }

        dayText.setText("Selected Day: " + day);
    }

    public void showTimePicker(View view) {
        boolean isStartTime = "start_time".equals(view.getTag());

        TimePickerDialog timePickerDialog = new TimePickerDialog(AvailabilityActivity.this, (pickerView, hourOfDay, minute) -> {
            String selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
            if (isStartTime) {
                availableTimesViews.setStartTime(selectedTime);
            } else {
                availableTimesViews.setEndTime(selectedTime);
            }
        }, isStartTime ? 8 : 18, 0, true); // Default time: 8:00 AM for start, 6:00 PM for end

        timePickerDialog.show();
    }

    private void initManualButton() {
        Button manualButton = findViewById(R.id.manually_set_button);

        manualButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                useGoogleCalendar = false;
                goToNewActivity();
            }
        });
    }

    private void initGoogleButton() {
        GoogleIconButtonView google = findViewById(R.id.google);
        Button googleButton = google.getButton();
        googleButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                useGoogleCalendar = true;
                goToNewActivity();
            }
        });
    }


    private void updatePreferences() {

        editor.putBoolean("useGoogleCalendar", useGoogleCalendar);

        if (!useGoogleCalendar) {
            for (Map.Entry<String, List<String>> entry : availabilityMap.entrySet()) {
                String key = entry.getKey();
                List<String> values = entry.getValue();

                // Convert the List<String> into a String set
                editor.putString(key + "StartTime", values.get(0));
                editor.putString(key + "EndTime", values.get(1));
            }
        }

        // Commit the changes to SharedPreferences
        editor.commit();


    }

    private void goToNewActivity() {
        Intent newIntent;
        updatePreferences();
        printSharedPreferences(sharedPreferences);
        if (sharedPreferences.getBoolean("isEditing", false)) {
            //todo do a PUT here (make a common function)
            newIntent = new Intent(AvailabilityActivity.this, EditProfileListActivity.class);
        } else {
            // todo: this goes into the homepage
            newIntent = new Intent(AvailabilityActivity.this, EditProfileListActivity.class);
        }
        startActivity(newIntent);
    }


    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    private void initFields() {
        // Initialize the availability for each day
        for (String day : availabilityMap.keySet()) {
            String startTimeKey = day + "StartTime";
            String endTimeKey = day + "EndTime";

            if (availabilityMap.containsKey(day) && sharedPreferences.contains(startTimeKey) && sharedPreferences.contains(endTimeKey)) {
                String startTime = sharedPreferences.getString(startTimeKey, "00:00");
                String endTime = sharedPreferences.getString(endTimeKey, "23:59");

                availabilityMap.put(day, Arrays.asList(startTime, endTime));
            }
        }
    }
}
