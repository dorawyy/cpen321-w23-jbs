package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.View;

import androidx.appcompat.widget.AppCompatButton;

import com.example.edumatch.R;


public class DayOfTheWeekView extends AppCompatButton {
    private String day;

    public interface DayOfTheWeekClickListener {
        void onDayButtonClick(String day);
    }

    private DayOfTheWeekClickListener clickListener;

    public DayOfTheWeekView(Context context, AttributeSet attrs) {
        super(context, attrs);

        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.DayOfTheWeekButton);

            day = typedArray.getString(R.styleable.DayOfTheWeekButton_Day);
            String dayString = typedArray.getString(R.styleable.DayOfTheWeekButton_DayString);

            typedArray.recycle();

            if (dayString != null) {
                setText(dayString);
            }
        }

        setOnClickListener(v -> handleClick());
    }

    public void setDayOfTheWeekClickListener(DayOfTheWeekClickListener listener) {
        this.clickListener = listener;
    }

    public String getDay() {
        return day;
    }

    private void handleClick() {
        if (clickListener != null) {
            clickListener.onDayButtonClick(day);
        }
    }
}