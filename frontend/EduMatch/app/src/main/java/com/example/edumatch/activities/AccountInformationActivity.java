package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.R;


public class AccountInformationActivity extends AppCompatActivity {

    final static String TAG = "SignUpFlow";

    Bundle userData;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_information);

        verifyAndInitBundle();

        initInvisibleFields();

        initNextButton();

    }

    private void verifyAndInitBundle() {
        Intent currentIntent = getIntent();
        userData = currentIntent.getExtras();
        if (currentIntent == null || currentIntent.getExtras() == null) {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent is null or doesn't have extras");
        }
    }

    private void initInvisibleFields() {
        if (userData.getBoolean("useGoogle") == true) {
            int[] viewIds = {R.id.create_userName, R.id.create_password};

            for (int i = 0; i < viewIds.length; i++) {
                LabelAndEditTextView view = findViewById(viewIds[i]);
                view.setVisibility(View.GONE);
            }
        }
    }

    private void initNextButton() {
        Button nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean verified = verifyFields();
                if (verified == true) {
                    goToNewActivity();
                }
            }
        });
    }

    private Bundle updateBundle() {
        int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_phone_number, R.id.create_userName, R.id.create_password};
        String[] keys = {"name", "email", "phoneNumber", "username", "password"};

        int numberOfIters = viewIds.length;
        if (userData.getBoolean("useGoogle")) {
            numberOfIters = viewIds.length - 2;
        }
        for (int i = 0; i < numberOfIters; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            String userDataString = view.getEnterUserEditText().getText().toString();
            userData.putString(keys[i], userDataString);
        }
        return userData;
    }

    private void goToNewActivity() {
        Intent newIntent = new Intent(AccountInformationActivity.this, UniversityInformationActivity.class);
        Bundle userData = updateBundle();
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }


    private boolean verifyFields() {
        // todo need an api call to make sure username is unique?
        int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_userName, R.id.create_password};

        int numberOfIters = viewIds.length;
        if (userData.getBoolean("useGoogle")) {
            numberOfIters = viewIds.length - 2;
        }
        for (int i = 0; i < numberOfIters; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            String userDataString = view.getEnterUserEditText().getText().toString().trim();
            if (userDataString.isEmpty()) {
                view.getEnterUserEditText().setError("This field is required");
                view.getEnterUserEditText().requestFocus();
                return false;
            }
        }
        return true;
    }
}
