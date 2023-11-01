package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;

public class TutorOrTuteeActivity extends AppCompatActivity {

    private String userType;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutor_or_tutee);

        initTutorButton();

        initTuteeButton();
    }

    private void initTutorButton() {
        Button tutorButton = findViewById(R.id.tutor_button);
        tutorButton.setOnClickListener(v -> {
            userType = "tutor";
            goToNewActivity();
        });
    }

    private void initTuteeButton() {
        Button tuteeButton = findViewById(R.id.tutee_button);
        tuteeButton.setOnClickListener(v -> {
            userType = "tutee";
            goToNewActivity();
        });
    }

    // ChatGPT usage: Yes
    private SharedPreferences updatePreferences() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("userType", userType);
        editor.apply();
        return sharedPreferences;
    }

    // ChatGPT usage: Yes
    private void goToNewActivity() {
        Intent newIntent = new Intent(TutorOrTuteeActivity.this, AccountInformationActivity.class);
        SharedPreferences sharedPreferences =  updatePreferences();
        printSharedPreferences(sharedPreferences);
        startActivity(newIntent);
    }

}