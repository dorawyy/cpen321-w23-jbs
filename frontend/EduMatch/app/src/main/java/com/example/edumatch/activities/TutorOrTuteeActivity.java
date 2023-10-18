package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.example.edumatch.R;

public class TutorOrTuteeActivity extends AppCompatActivity {
    private Button tutorButton;
    private Button tuteeButton;
    private Bundle userData = new Bundle();

    private Intent newIntent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutor_or_tutee);

        tutorButton = findViewById(R.id.tutor_button);
        tuteeButton = findViewById(R.id.tutee_button);

        newIntent = new Intent(TutorOrTuteeActivity.this, AccountInformationActivity.class);

        tutorButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                userData.putString("userType","Tutor");
                newIntent.putExtras(userData);
                startActivity(newIntent);
            }
        });

        tuteeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                userData.putString("userType","Tutee");
                newIntent.putExtras(userData);
                startActivity(newIntent);
            }
        });
    }
}