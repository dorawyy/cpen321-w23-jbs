package com.example.edumatch.views;

import android.content.Context;
import android.content.Intent;
import android.util.AttributeSet;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;

import com.example.edumatch.R;
import com.example.edumatch.activities.AppointmentListActivity;
import com.example.edumatch.activities.EditProfileListActivity;
import com.example.edumatch.activities.TuteeHomeActivity;

public class AppBarLogo extends LinearLayout {

    public AppBarLogo(Context context) {
        super(context);
        init(context);
    }

    public AppBarLogo(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AppBarLogo(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.header_logo, this, true);

        ImageView logoImageView = findViewById(R.id.logo);
        logoImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Context context2 = v.getContext();
                Intent intent = new Intent(context2, TuteeHomeActivity.class);
                context2.startActivity(intent);
            }
        });
    }

}