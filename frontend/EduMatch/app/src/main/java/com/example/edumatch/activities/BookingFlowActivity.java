package com.example.edumatch.activities;

import static com.example.edumatch.util.AppointmentHelper.getAvailability;
import static com.example.edumatch.util.AppointmentHelper.setAppointment;
import static com.example.edumatch.util.RecommendationHelper.updateWhenSchedules;
import static com.example.edumatch.util.TutorsHelper.getTutorInfo;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class BookingFlowActivity extends AppCompatActivity {

    public String tutorId;
    public String selectedDate;
    public String selectedTime;
    public String selectedInterval;
    public String selectedLocation;
    public String selectedCourse;
    public String selectedMethod;
    public String userNotes;
    private Button previousCourseSelection = null;
    private Button previousTimeSelection = null;
    private Button previousIntervalSelection = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_flow);

        tutorId = getIntent().getStringExtra("TUTOR_ID");
        Button bookNowButton = findViewById(R.id.bookButton);
        bookNowButton.setOnClickListener(view -> handleBooking());

        try {
            generateCourses();
        } catch (JSONException e) {
            Log.d("course", "oh no");
        }

        RadioButton inPersonOption = findViewById(R.id.inPersonOption);
        RadioButton onlineOption = findViewById(R.id.onlineOption);

        inPersonOption.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectedMethod = "In Person";
                Log.d("SelectedMethod", selectedMethod);
            }
        });

        onlineOption.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                selectedMethod = "Online";
                Log.d("SelectedMethod", selectedMethod);
            }
        });


    }

    public String convertToDesiredFormat(String selectedDate, String selectedTime)  {

            SimpleDateFormat inputDateFormat = new SimpleDateFormat("MM/dd/yyyy HH:mm");
        Date date = null;
        try {
            date = inputDateFormat.parse(selectedDate + " " + selectedTime);
        } catch (ParseException e) {
            date = null;
        }

        // Format the parsed date to desired format
            SimpleDateFormat outputDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            outputDateFormat.setTimeZone(TimeZone.getTimeZone("GMT-7")); // Set timezone to GMT-07:00

            return outputDateFormat.format(date) + "-07:00"; // Append the timezone offset

    }

    private void generateCourses() throws JSONException {
        LinearLayout intervalContainer = findViewById(R.id.courseContainer);

        JSONObject obj = getTutorInfo(tutorId, this);
        JSONArray courses = obj.getJSONArray("courses");
        Log.d("course", courses.toString());


        for (int i = 0; i < courses.length(); i++) {

            String course = courses.getString(i);

            Button timeButton = new Button(this);
            timeButton.setText(course);
            timeButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (previousCourseSelection != null) {
                        previousCourseSelection.setBackgroundColor(Color.TRANSPARENT);
                    }

                    v.setBackgroundColor(Color.GRAY);
                    previousCourseSelection = (Button) v;
                    selectedCourse = ((Button) v).getText().toString();
                    Log.d("course", selectedCourse);

                }
            });
            intervalContainer.addView(timeButton);
        }
    }

    private String addIntervalToStartTime(String selectedStart, String selectedInterval) {
        try {
            String[] startParts = selectedStart.split(":");
            int startHours = Integer.parseInt(startParts[0]);
            int startMinutes = Integer.parseInt(startParts[1]);

            int intervalHours = 0;
            int intervalMinutes = 0;

            // Pattern for just hours or minutes
            Pattern patternSingle = Pattern.compile("(\\d+)([hHmM])");
            Matcher matcherSingle = patternSingle.matcher(selectedInterval);

            // Pattern for hours and minutes
            Pattern patternDouble = Pattern.compile("(\\d+)h(\\d+)m");
            Matcher matcherDouble = patternDouble.matcher(selectedInterval);

            if (matcherDouble.matches()) {
                intervalHours = Integer.parseInt(matcherDouble.group(1));
                intervalMinutes = Integer.parseInt(matcherDouble.group(2));
            } else if (matcherSingle.matches()) {
                int value = Integer.parseInt(matcherSingle.group(1));
                char type = matcherSingle.group(2).charAt(0);
                if (type == 'h' || type == 'H') {
                    intervalHours = value;
                } else if (type == 'm' || type == 'M') {
                    intervalMinutes = value;
                }
            }

            // Create a Calendar instance to manipulate the time
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, startHours);
            calendar.set(Calendar.MINUTE, startMinutes);

            // Add the interval
            calendar.add(Calendar.HOUR_OF_DAY, intervalHours);
            calendar.add(Calendar.MINUTE, intervalMinutes);

            // Format the resultant time back to HH:mm
            SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
            return timeFormat.format(calendar.getTime());

        } catch (Exception e) {
            Log.d("appt", selectedStart);
            Log.d("appt", selectedInterval);
            return null;
        }
    }



    // Function to handle the booking logic
    private void handleBooking() {
        // Get selected location
        retrieveSelectedLocation();

        // Get notes entered by user
        retrieveUserNotes();


        String start = convertToDesiredFormat(selectedDate, selectedTime);
        String before_add = addIntervalToStartTime(selectedTime, selectedInterval);
        Log.d("mag2", before_add);
        String before = convertToDesiredFormat(selectedDate, before_add);
        Log.d("mag", before);


        JSONObject bookingDetails = new JSONObject();
        try {
            bookingDetails.put("tutorId", tutorId);
            bookingDetails.put("course", selectedCourse);  // Assuming this is fixed for now
            bookingDetails.put("pstStartDatetime", start);  // You'll want to dynamically generate this based on user selection
            bookingDetails.put("pstEndDatetime", before);   // Similarly, dynamically generate this
            bookingDetails.put("location", selectedLocation);
            bookingDetails.put("notes", userNotes);
        } catch (JSONException e) {
            Toast.makeText(this, "Booking did not work", Toast.LENGTH_LONG).show();
        }

        Boolean success =  setAppointment(this, bookingDetails);
        if (success == true) {
            Toast.makeText(this, "Booking done for: " + selectedDate + ", " + selectedTime + ",", Toast.LENGTH_LONG).show();
            Intent intent = new Intent(BookingFlowActivity.this, TuteeHomeActivity.class);
            startActivity(intent);
        } else {
            Toast.makeText(this, "Error: Booking was not able to be completed, please try again!", Toast.LENGTH_LONG).show();
        }
        updateWhenSchedules(tutorId, selectedCourse, BookingFlowActivity.this);
    }

    // Function to retrieve the selected location by the user
    private void retrieveSelectedLocation() {
        RadioGroup locationGroup = findViewById(R.id.locationGroup);
        int selectedId = locationGroup.getCheckedRadioButtonId();
        RadioButton selectedRadioButton = findViewById(selectedId);
        selectedLocation = selectedRadioButton.getText().toString();
    }

    // Function to retrieve the notes entered by the user
    private void retrieveUserNotes() {
        EditText notesEditText = findViewById(R.id.notesEditText);
        userNotes = notesEditText.getText().toString();
    }

    private String extractTime(String originalDateTime) {
        try {
            // Define the original and target date formats
            SimpleDateFormat originalFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
            SimpleDateFormat targetFormat = new SimpleDateFormat("HH:mm");

            // Parse the original date string into a Date object
            Date date = originalFormat.parse(originalDateTime);

            // Format the Date object into the target format
            String formattedTime = targetFormat.format(date);

            return formattedTime;
        } catch (ParseException e) {
            e.printStackTrace();
            return null; // or return an empty string if you prefer
        }
    }

    private String convertDateFormat(String originalDate) {
        try {
            // Define the original and target date formats
            SimpleDateFormat originalFormat = new SimpleDateFormat("MM/dd/yyyy");
            SimpleDateFormat targetFormat = new SimpleDateFormat("yyyy-MM-dd");

            // Parse the original date string into a Date object
            Date date = originalFormat.parse(originalDate);

            // Format the Date object into the target format
            String formattedDate = targetFormat.format(date);

            return formattedDate;
        } catch (ParseException e) {
            e.printStackTrace();
            return null; // or return the original date if you prefer
        }
    }
    private int convertToSeconds(String time) {
        String[] parts = time.split(":");
        int hours = Integer.parseInt(parts[0]);
        int minutes = Integer.parseInt(parts[1]);
        return hours * 3600 + minutes * 60;
    }

    // Function for Date Selector
    public void showDatePicker(View view) {
        // Get the current date
        final Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR);
        int month = c.get(Calendar.MONTH);
        int day = c.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog datePickerDialog = new DatePickerDialog(BookingFlowActivity.this, (datePicker, selectedYear, selectedMonth, selectedDay) -> {
            selectedDate = String.format(Locale.getDefault(), "%02d/%02d/%04d", selectedMonth + 1, selectedDay, selectedYear); // +1 because Calendar.MONTH starts from 0 for January

            EditText datePickerEditText = findViewById(R.id.datePickerEditText);
            datePickerEditText.setText(selectedDate);;

            populateDataBasedOnAPI();
        }, year, month, day);
        datePickerDialog.show();
    }
    public void populateDataBasedOnAPI() {
        // Fetch data from API (using Retrofit, Volley, or any other method)
        JSONObject datesFromApi = getAvailability(this, tutorId, selectedDate.toString());
        Log.d("avail", datesFromApi.toString());
        Map<String, String> availabilityMap = processAvailability(datesFromApi);
        getTimesForDate(availabilityMap);
    }

    private static Map<String, String> processAvailability(JSONObject jsonObject) {
        Map<String, String> availabilityMap = new HashMap<>();

        try {
            if (jsonObject.has("error")) {
                String errorMessage = jsonObject.getString("error");
                System.err.println("Error processing availability: " + errorMessage);
                return availabilityMap; // Return empty map or you can throw an exception if desired
            }
            JSONArray availabilityArray = jsonObject.getJSONArray("availability");

            for (int i = 0; i < availabilityArray.length(); i++) {
                JSONObject availabilityObject = availabilityArray.getJSONObject(i);

                String startTime = availabilityObject.getString("start");
                String endTime = availabilityObject.getString("end");

                availabilityMap.put(startTime, endTime);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return availabilityMap;
    }

    private void getTimesForDate(Map<String, String> availabilityMap) {
        String date = convertDateFormat(selectedDate);

        String start = null;
        String end = null;

        for (String key : availabilityMap.keySet()) {
            if (key.contains(date)) {
                start = key;
                end = availabilityMap.get(key);
            }
        }

        String formatted_start = extractTime(start);
        String formatted_end = extractTime(end);
        Log.d("avail", formatted_start);
        Log.d("avail", formatted_end);

        getIntervals(formatted_start, formatted_end);
        generateTimes(formatted_start, formatted_end);

    }
    private void getIntervals(String startTime, String endTime) {
        LinearLayout intervalContainer = findViewById(R.id.intervalContainer);
        intervalContainer.removeAllViews();

        // Convert the HH:mm formatted times to seconds
        int startSeconds = convertToSeconds(startTime);
        int endSeconds = convertToSeconds(endTime);

        // Calculate the total difference in seconds
        int totalDifference = endSeconds - startSeconds;

        // If the difference is more than 2 hours, adjust the intervals to be generated
        if (totalDifference > 2 * 60 * 60) {
            // Set the intervals to be generated from 30 minutes up to 2 hours
            startSeconds = 30 * 60;
            endSeconds = 2 * 60 * 60;
        } else {
            startSeconds = 30 * 60;
            endSeconds = totalDifference;
        }

        // Increment by 15 minutes (15*60 seconds)
        int incrementSeconds = 15 * 60;

        for (int i = startSeconds; i <= endSeconds; i += incrementSeconds) {
            int hours = i / 3600;
            int minutes = (i % 3600) / 60;

            String interval;
            if (hours == 0) {
                interval = String.format("%dm", minutes);
            } else if (minutes == 0) {
                interval = String.format("%dh", hours);
            } else {
                interval = String.format("%dh%dm", hours, minutes);
            }

            Button intervalButton = new Button(this);
            intervalButton.setText(interval);
            intervalButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (previousIntervalSelection != null) {
                        previousIntervalSelection.setBackgroundColor(Color.TRANSPARENT);
                    }

                    v.setBackgroundColor(Color.GRAY);
                    previousIntervalSelection = (Button) v;
                    selectedInterval = ((Button) v).getText().toString();
                    Log.d("course", selectedInterval);
                }
            });
            intervalContainer.addView(intervalButton);
        }
    }
    private void generateTimes(String startTime, String endTime) {
        LinearLayout intervalContainer = findViewById(R.id.timeContainer);

        // Convert the HH:mm formatted times to seconds
        int startSeconds = convertToSeconds(startTime);
        int endSeconds = convertToSeconds(endTime) - 30 * 60; // subtracting 30 minutes

        // Increment by 15 minutes (15*60 seconds)
        int incrementSeconds = 15 * 60;

        for (int i = startSeconds; i <= endSeconds; i += incrementSeconds) {
            int hours = i / 3600;
            int minutes = (i % 3600) / 60;

            String time = String.format("%02d:%02d", hours, minutes);

            Button timeButton = new Button(this);
            timeButton.setText(time);
            timeButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Call getIntervals when button is clicked
                    getIntervals(time, endTime);
                    if (previousTimeSelection != null) {
                        previousTimeSelection.setBackgroundColor(Color.TRANSPARENT);
                    }

                    v.setBackgroundColor(Color.GRAY);
                    previousTimeSelection = (Button) v;
                    selectedTime = ((Button) v).getText().toString();
                    Log.d("course", selectedTime);

                }
            });
            intervalContainer.addView(timeButton);
        }
    }


}