package com.example.edumatch.activities;

import static com.example.edumatch.util.AppointmentHelper.getAvailability;

import android.app.DatePickerDialog;
import android.os.Bundle;
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
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;

public class BookingFlowActivity extends AppCompatActivity {

    public String tutorId;
    public String selectedDate;
    public String selectedInterval;
    public String selectedLocation;
    public String userNotes;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_booking_flow);

        tutorId = getIntent().getStringExtra("TUTOR_ID");
        // Initialize the button and set its click listener
        Button bookNowButton = findViewById(R.id.bookButton);
        bookNowButton.setOnClickListener(view -> handleBooking());

    }

    // Function to handle the booking logic
    private void handleBooking() {
        // Get selected location
        retrieveSelectedLocation();

        // Get notes entered by user
        retrieveUserNotes();

        JSONObject bookingDetails = new JSONObject();
        try {
            bookingDetails.put("tutorId", tutorId);
            bookingDetails.put("course", "CPEN322");  // Assuming this is fixed for now
            bookingDetails.put("pstStartDatetime", "2023-10-25T13:30:00-07:00");  // You'll want to dynamically generate this based on user selection
            bookingDetails.put("pstEndDatetime", "2023-10-25T15:00:00-07:00");   // Similarly, dynamically generate this
            bookingDetails.put("location", selectedLocation);
            bookingDetails.put("notes", userNotes);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        // You can then send this data to your backend server or API to complete the booking.
        // For now, just displaying a toast message
        Toast.makeText(this, "Booking done for: " + selectedDate + ", " + selectedInterval + ", Location: " + selectedLocation + ", Notes: " + userNotes, Toast.LENGTH_LONG).show();
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

    public void populateDataBasedOnAPI() {
        // Fetch data from API (using Retrofit, Volley, or any other method)
        List<String> datesFromApi = getTimesForDate();


        // Populate intervals
        LinearLayout intervalContainer = findViewById(R.id.intervalContainer);
        for (String interval : datesFromApi) {
            Button intervalButton = new Button(this);
            intervalButton.setText(interval);
            intervalContainer.addView(intervalButton);
        }
    }

    private List<String> getTimesForDate() {
        JSONObject datesFromApi = getAvailability(this, tutorId, selectedDate);
        List<String> intervals = new ArrayList<>();

        try {
            JSONArray jsonArray = new JSONArray(datesFromApi);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject timeSlot = jsonArray.getJSONObject(i);

                String start = timeSlot.getString("start");
                String end = timeSlot.getString("end");

                // Extract only the time part from the string and convert to Calendar
                Calendar startTime = getCalendarFromTimeString(start);
                Calendar endTime = getCalendarFromTimeString(end);

                // While start is before end, add intervals and increment by 30 minutes
                while (startTime.before(endTime)) {
                    Calendar nextInterval = (Calendar) startTime.clone();
                    nextInterval.add(Calendar.MINUTE, 30);

                    // If nextInterval exceeds endTime, break the loop
                    if (nextInterval.after(endTime)) {
                        break;
                    }

                    String interval = formatCalendarToTime(startTime) + " - " + formatCalendarToTime(nextInterval);
                    intervals.add(interval);

                    // Set start time to next interval for next iteration
                    startTime = nextInterval;
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return intervals;

    }

    // Utility function to convert time string to Calendar object
    private Calendar getCalendarFromTimeString(String time) {
        Calendar calendar = Calendar.getInstance();
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSX", Locale.getDefault());
            calendar.setTime(sdf.parse(time));
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return calendar;
    }

    // Utility function to convert Calendar object to time string
    private String formatCalendarToTime(Calendar calendar) {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        return sdf.format(calendar.getTime());
    }

    public void showDatePicker(View view) {
        // Get the current date
        final Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR);
        int month = c.get(Calendar.MONTH);
        int day = c.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog datePickerDialog = new DatePickerDialog(BookingFlowActivity.this, (datePicker, selectedYear, selectedMonth, selectedDay) -> {
            selectedDate = String.format(Locale.getDefault(), "%02d/%02d/%04d", selectedMonth + 1, selectedDay, selectedYear); // +1 because Calendar.MONTH starts from 0 for January
            populateDataBasedOnAPI();
        }, year, month, day);

        datePickerDialog.show();
    }


}