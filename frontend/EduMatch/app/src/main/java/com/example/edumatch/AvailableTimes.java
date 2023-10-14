package com.example.edumatch;

import android.app.TimePickerDialog;
import android.content.Context;
import androidx.appcompat.widget.AppCompatButton;
import androidx.gridlayout.widget.GridLayout;
import android.util.AttributeSet;
import android.view.View;
import android.widget.Button;
import android.widget.TimePicker;

import java.util.Locale;

public class AvailableTimes extends GridLayout {
    private AppCompatButton startTimeButton;
    private AppCompatButton endTimeButton;

    public AvailableTimes(Context context) {
        super(context);
        init(context, null);
    }

    public AvailableTimes(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public AvailableTimes(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    private void init(Context context, AttributeSet attrs) {
        // Inflate the layout XML
        inflate(context, R.layout.available_time_picker, this);

        // Find the start_time_button and end_time_button by their IDs
        startTimeButton = findViewById(R.id.start_time_button);
        endTimeButton = findViewById(R.id.end_time_button);
    }

    public void setStartTime(String time) {
        startTimeButton.setText(time);
    }

    public void setEndTime(String time) {
        endTimeButton.setText(time);
    }

    public String getEndTime() {
        return endTimeButton.getText().toString();
    }

    public String getStartTime() {
        return startTimeButton.getText().toString();
    }

    public Button getSetTimesButton() {
        return findViewById(R.id.set_time_button);
    }


}
