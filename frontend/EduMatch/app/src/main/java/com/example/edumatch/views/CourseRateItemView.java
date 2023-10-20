package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.RelativeLayout;

import com.example.edumatch.R;

public class CourseRateItemView extends RelativeLayout {

    private TextView courseTextView;
    private EditText rateEditText;

    public CourseRateItemView(Context context) {
        super(context);
        init(context, null);
    }

    public CourseRateItemView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public CourseRateItemView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public void setCourseText(String text) {
        if (courseTextView != null) {
            courseTextView.setText(text);
        }
    }

    public String getRateText() {
        if (rateEditText != null) {
            return rateEditText.getText().toString();
        }
        return "";
    }

    public String getCourseText() {
        if (courseTextView != null) {
            return courseTextView.getText().toString();
        }
        return "";
    }

    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.course_rate_item, this, true);

        courseTextView = findViewById(R.id.course);
        rateEditText = findViewById(R.id.rate);
    }
}
