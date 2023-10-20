package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.example.edumatch.R;

public class TutorOrTuteeActivity extends AppCompatActivity {

    private String userType;

    final static String TAG = "TutorOrTuteeActivity";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutor_or_tutee);

        initTutorButton();

        initTuteeButton();
    }

    private void initTutorButton() {
        Button tutorButton = findViewById(R.id.tutor_button);
        tutorButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                userType = "tutor";
                goToNewActivity();
            }
        });
    }

    private void initTuteeButton() {
        Button tuteeButton = findViewById(R.id.tutee_button);
        tuteeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                userType = "tutee";
                goToNewActivity();
            }
        });
    }


    private Bundle updateBundle() {

        Intent currentIntent = getIntent();
        if (currentIntent != null && currentIntent.getExtras() != null) {
            Bundle userData = currentIntent.getExtras();
            userData.putString("userType",userType);
            return userData;

        } else {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent is null or doesn't have extras");
        }
    }

    private void goToNewActivity() {
        Intent newIntent = new Intent(TutorOrTuteeActivity.this, AccountInformationActivity.class);
        Bundle userData = updateBundle();
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }
}