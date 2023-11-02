package com.example.edumatch.views;

import android.content.Context;
import androidx.appcompat.widget.AppCompatButton;
import androidx.gridlayout.widget.GridLayout;
import android.util.AttributeSet;
import android.widget.Button;

import com.example.edumatch.R;

public class AvailableTimesViews extends GridLayout {
    private AppCompatButton startTimeButton;
    private AppCompatButton endTimeButton;

    // ChatGPT usage: Yes
    public AvailableTimesViews(Context context) {
        super(context);
        init(context);
    }

    // ChatGPT usage: Yes
    public AvailableTimesViews(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    // ChatGPT usage: Yes
    public AvailableTimesViews(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    // ChatGPT usage: Yes
    private void init(Context context) {
        // Inflate the layout XML
        inflate(context, R.layout.available_time_picker, this);

        // Find the start_time_button and end_time_button by their IDs
        startTimeButton = findViewById(R.id.start_time_button);
        endTimeButton = findViewById(R.id.end_time_button);
    }

    // ChatGPT usage: Yes
    public void setStartTime(String time) {
        startTimeButton.setText(time);
    }

    // ChatGPT usage: Yes
    public void setEndTime(String time) {
        endTimeButton.setText(time);
    }

    // ChatGPT usage: Yes
    public String getEndTime() {
        return endTimeButton.getText().toString();
    }

    // ChatGPT usage: Yes
    public String getStartTime() {
        return startTimeButton.getText().toString();
    }

    // ChatGPT usage: Yes
    public Button getSetTimesButton() {
        return findViewById(R.id.set_time_button);
    }


}
