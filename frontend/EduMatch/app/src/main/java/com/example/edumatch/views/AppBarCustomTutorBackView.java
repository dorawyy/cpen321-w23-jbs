package com.example.edumatch.views;

import android.content.Context;
import android.content.Intent;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;

import com.example.edumatch.R;
import com.example.edumatch.activities.TutorHomeActivity;


public class AppBarCustomTutorBackView extends LinearLayout {
    public AppBarCustomTutorBackView(Context context) {
        super(context);
        init(context);
    }

    public AppBarCustomTutorBackView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AppBarCustomTutorBackView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        // Inflating the custom app bar layout
        LayoutInflater.from(context).inflate(R.layout.go_back_bar, this, true);


        // Listener for the back button
        ImageButton backButton = findViewById(R.id.back_button);
        backButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                Context context2 = v.getContext();
                Intent intent = new Intent(context2, TutorHomeActivity.class);
                context2.startActivity(intent);
            }
        });
    }
}
