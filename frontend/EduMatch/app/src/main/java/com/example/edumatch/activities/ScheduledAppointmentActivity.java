package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.example.edumatch.R;

public class ScheduledAppointmentActivity extends AppCompatActivity {
    //TODO: Integrate GET {API_URL}/appointment?appointmentID=123
    //TODO: Integrate PUT {API_URL}/appointment?appointmentID=123 to change status to canceled when user clicks cancel
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scheduled_appointment);
    }
}