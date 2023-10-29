package com.example.edumatch.views;

import static androidx.core.content.ContextCompat.startActivity;

import android.content.Context;
import android.content.Intent;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;

import com.example.edumatch.R;
import com.example.edumatch.activities.EditProfileListActivity;

public class AppBarCustomView extends LinearLayout {

    public AppBarCustomView(Context context) {
        super(context);
        init(context);
    }

    public AppBarCustomView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AppBarCustomView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.empty_bar, this, true);
        // Initialization code, e.g., findViewById, listeners, etc.

        ImageButton settingsButton = findViewById(R.id.settings);
        settingsButton.setOnClickListener(v -> {
            Context context1 = v.getContext();
            Intent intent = new Intent(context1, EditProfileListActivity.class);
            context1.startActivity(intent);
        });


    }
}