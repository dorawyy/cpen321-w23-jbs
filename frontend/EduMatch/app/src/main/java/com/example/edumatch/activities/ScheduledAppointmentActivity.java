package com.example.edumatch.activities;

import static com.example.edumatch.util.AppointmentHelper.getAppointment;
import static com.example.edumatch.util.AppointmentHelper.putAppointment;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.util.CustomException;
import com.example.edumatch.views.LabelAndCommentTextView;
import com.example.edumatch.views.LabelAndTextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class ScheduledAppointmentActivity extends AppCompatActivity {
    String appointmentId;
    String apptDate;
    Date currentDate;
    String tutorName;
    String tutorId;
    Boolean reviewed = false;

    String set_Time;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scheduled_appointment);
        Intent intent = getIntent();
        appointmentId = intent.getStringExtra("appointmentId");
        tutorName = intent.getStringExtra("tutorName");
        tutorId = intent.getStringExtra("tutorId");
        initFields();
        long currentTimeMillis = System.currentTimeMillis();
        currentDate = new Date(currentTimeMillis);
        if (!hasApptnotPassed(currentDate.toString(), apptDate)) {
            initCancelButton();
        }
        
                Log.d("appt2", "hi");
                initRateTutorButton();


    }

    // dateStr1 = system time, dateStr2 = appointment time
    private boolean hasApptnotPassed(String dateStr1, String dateStr2) {

        SimpleDateFormat format1 = new SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy");
        SimpleDateFormat format2 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX");

        format2.setTimeZone(TimeZone.getTimeZone("PST"));

        try {
            // Parse the date strings into Date objects
            Date date1 = format1.parse(dateStr1);
            Date date2 = format2.parse(dateStr2);

            // Compare the two Date objects
            if (date1.compareTo(date2) < 0) {
                return false;
            } else if (date1.compareTo(date2) >= 0) {
                return true;
            }
        } catch (ParseException e) {
            return true;
        }

        return true;
    }

    // ChatGPT usage: Yes
    @SuppressLint("SetTextI18n")
    private void initFields() {
        Log.d("appt2", "here");
        TextView name = findViewById(R.id.name);
        LabelAndTextView course = findViewById(R.id.course);
        LabelAndTextView date = findViewById(R.id.date);
        LabelAndTextView time = findViewById(R.id.time);
        LabelAndTextView location = findViewById(R.id.location);

        LabelAndCommentTextView comment = findViewById(R.id.comment);
        JSONObject response = getAppointment(this ,appointmentId);
        Log.d("appt2", response.toString());
        try {
            if (response.has("otherUserName")) {
                name.setText(response.getString("otherUserName"));
            }

            if (response.has("participantsInfo")) {
                reviewed = true;
                Log.d("appt2", String.valueOf(reviewed));
            }

            if (response.has("course")) {
                course.setText(response.getString("course"));
            }

            if (response.has("date")) {
                date.setText(response.getString("date"));
            }

            if (response.has("pstStartDatetime") && response.has("pstEndDatetime")) {
                String pstStartTime = response.getString("pstStartDatetime");
                String pstEndTime = response.getString("pstEndDatetime");

                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                Date startDate = sdf.parse(pstStartTime);
                Date endDate = sdf.parse(pstEndTime);

                SimpleDateFormat dateSdf = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat timeSdf = new SimpleDateFormat("HH:mm");

                date.setText(dateSdf.format(startDate));
                String startTime = timeSdf.format(startDate); // Start Time
                String endTime = timeSdf.format(endDate); // End Time
                time.setText(startTime + " - " + endTime);
            }

            if (response.has("location")) {
                location.setText(response.getString("location"));
            }

            if (response.has("notes")) {
                comment.setText(response.getString("notes"));
            }
        } catch (JSONException e) {
            Log.d("ScheduledAppointmentActivity", response.toString());
            throw new CustomException("Error processing JSON data",e);
        } catch (ParseException e) {
            throw new CustomException("Error parsing date", e);
        }
    }

    private void initCancelButton() {
        Button cancelButton = findViewById(R.id.cancel_button);

            cancelButton.setVisibility(View.VISIBLE);
            cancelButton.setOnClickListener(v -> goToNewActivity());

    }


    private void goToNewActivity() {
        JSONObject requestBody = constructCancelAppointmentRequest();
        Log.d("appt", requestBody.toString());
        boolean success = putAppointment(ScheduledAppointmentActivity.this,requestBody,appointmentId);
        Log.d("appt", String.valueOf(success));
        if (success) {
            Intent newIntent = new Intent(ScheduledAppointmentActivity.this, AppointmentListActivity.class);
            startActivity(newIntent);
        }
    }

    // ChatGPT usage: Yes
    public JSONObject constructCancelAppointmentRequest() {
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("status","canceled");
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

    }
    private void initRateTutorButton() {
        Button rateTutorButton = findViewById(R.id.review_button);
            rateTutorButton.setVisibility(View.VISIBLE);
            rateTutorButton.setOnClickListener(v -> {
                Intent intent = new Intent(ScheduledAppointmentActivity.this, TutorRateActivity.class);
                intent.putExtra("appointmentId", appointmentId);
                intent.putExtra("tutorName", tutorName);
                intent.putExtra("tutorId", tutorId);
                startActivity(intent);
            });
        }


}