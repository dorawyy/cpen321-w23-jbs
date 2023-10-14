package com.example.edumatch;
import android.content.Context;
import android.util.AttributeSet;
import androidx.appcompat.widget.AppCompatButton;
import androidx.gridlayout.widget.GridLayout;

public class DayOfTheWeek extends GridLayout {

    public DayOfTheWeek(Context context) {
        super(context);
        init(context, null);
    }

    public DayOfTheWeek(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    private void init(Context context, AttributeSet attrs) {
        // Inflate the layout from XML
        inflate(context, R.layout.day_of_the_week, this);
    }
}
