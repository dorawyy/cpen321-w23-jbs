package com.example.edumatch;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

/**
 * TODO: document your custom view class.
 */
public class TutorRow extends LinearLayout {
    private TextView tvCourseCode;
    private TextView tvTutorName;
    private TextView tvTutorDetails;
    private TextView tvPrice;
    public String id;

    public TutorRow(Context context) {
        super(context);
        initialize(context);
    }

    private void initialize(Context context) {
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View view = inflater.inflate(R.layout.tutor_row, null, false);
        this.addView(view);

        tvCourseCode = view.findViewById(R.id.tv_course_code);
        tvTutorName = view.findViewById(R.id.tutor_name);
        tvTutorDetails = view.findViewById(R.id.tv_tutor_details);
        tvPrice = view.findViewById(R.id.tv_price);
    }

    public void setCourseCode(String courseCode) {
        tvCourseCode.setText(courseCode);
    }

    public void setTutorName(String tutorName) {
        tvTutorName.setText(tutorName);
    }

    public void setTutorDetails(String tutorDetails) {
        tvTutorDetails.setText(tutorDetails);
    }

    public void setPrice(String price) {
        tvPrice.setText(price);
    }

    public void setId (String tid) {
        id = tid;
    }

}