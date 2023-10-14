package com.example.edumatch;

import static com.example.edumatch.LoginSignupHelper.isStartTimeBeforeEndTime;
import static java.security.AccessController.getContext;

import androidx.appcompat.app.AppCompatActivity;

import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class AvailabilityActivity extends AppCompatActivity {
    //TODO Add navigation to next activity on both set buttons
    //TODO Add a check that google account isn't null if set automatically, IE account needs to be added to the bundle
    //TODO Add choose specific date maybe
    //TODO either add the availability to bundle or make api call here need to send available times, and boolean representing if using calendar or manual times
    final static String TAG = "AvailabilityActivity";
    private Map<String,List<String>> availabilityMap;

    private AvailableTimes availableTimes;

    private Button setTimeButton;

    private String currentDay;
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_availability);

        availableTimes = findViewById(R.id.available_times);

        availabilityMap = new HashMap<>();

        // Define the IDs of the DayOfTheWeekButton instances
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
            final Button dayButton = findViewById(buttonId);

            final String dayString = getDayString(buttonId);

            availabilityMap.put(dayString, Arrays.asList("00:00", "23:59"));
            dayButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Toggle the clicked state

                    // Get the day associated with the button
                    Log.w(TAG, "Day " + dayString);
                    updateAvailability(dayString);

                    if (availabilityMap.containsKey(dayString)) {
                        List<String> availability = availabilityMap.get(dayString);

                        Log.w(TAG, dayString + availability.get(0) + availability.get(1));
                    } else {
                        Toast.makeText(AvailabilityActivity.this, "No availability data for " + dayString, Toast.LENGTH_SHORT).show();
                        Log.w(TAG, "No availability data");
                    }
                    availableTimes.setVisibility(View.VISIBLE);
                }
            });

            setTimeButton = availableTimes.getSetTimesButton();

            setTimeButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Toggle the clicked state
                    if (availabilityMap.containsKey(currentDay)) {
                        List<String> availability = availabilityMap.get(currentDay);
                        String startTimeString = availableTimes.getStartTime();
                        String endTimeString = availableTimes.getEndTime();

                        Boolean isValid = isStartTimeBeforeEndTime(startTimeString,endTimeString);
                            if (!isValid) {
                                Toast.makeText(AvailabilityActivity.this, "Start Time Not Before End Time, Not Saved!", Toast.LENGTH_SHORT).show();
                            } else {
                                availability.set(0,availableTimes.getStartTime());
                                availability.set(1,availableTimes.getEndTime());
                            }

                    } else{
                    }
                }
            });

        }
    }

    private String getDayString(int id) {
        if (id== R.id.sunday_button) {
            return "Sunday";
        } else if (id == R.id.monday_button) {
            return "Monday";
        } else if (id == R.id.tuesday_button) {
            return "Tuesday";
        } else if (id == R.id.wednesday_button) {
            return "Wednesday";
        } else if (id == R.id.thursday_button) {
            return "Thursday";
        } else if (id == R.id.friday_button) {
            return "Friday";
        } else if (id == R.id.saturday_button) {
            return "Saturday";
        } else {
            return "";
        }
    }

    private void updateAvailability(String day) {
        // Update the availabilityMap based on the button state
        TextView dayText = findViewById(R.id.selected_day);
        currentDay = day;
        if (availabilityMap.containsKey(day)) {
            List<String> availability = availabilityMap.get(day);
            String startTime = availability.get(0);
            String endTime = availability.get(1);
            availableTimes.setStartTime(startTime);
            availableTimes.setEndTime(endTime);
        }

        dayText.setText("Selected Day: " +day);

    }

    public void showTimePickerStart(View view) {
        TimePickerDialog timePickerDialog = new TimePickerDialog(AvailabilityActivity.this, new TimePickerDialog.OnTimeSetListener() {
            @Override
            public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                // Handle the selected time (hourOfDay and minute)
                String selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
                availableTimes.setStartTime(selectedTime);
            }
        }, 8, 0, true); // Default time (8:00 AM)

        timePickerDialog.show();
    }

    public void showTimePickerEnd(View view) {
        TimePickerDialog timePickerDialog = new TimePickerDialog(AvailabilityActivity.this, new TimePickerDialog.OnTimeSetListener() {
            @Override
            public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                // Handle the selected time (hourOfDay and minute)
                String selectedTime = String.format(Locale.getDefault(), "%02d:%02d", hourOfDay, minute);
                availableTimes.setEndTime(selectedTime);
            }
        }, 18, 0, true); // Default time (8:00 AM)

        timePickerDialog.show();
    }
}
