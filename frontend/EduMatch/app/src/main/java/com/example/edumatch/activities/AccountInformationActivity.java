package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.constructEditCourseRates;
import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;
import static com.example.edumatch.util.ProfileHelper.putEditProfile;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.R;

import org.json.JSONException;
import org.json.JSONObject;


public class AccountInformationActivity extends AppCompatActivity {

    public SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_information);

        initSharedPreferences();

        initFields();

        initInvisibleFields();

        initNextButton();

    }


    // ChatGPT usage: Yes
    public void initInvisibleFields() {

        if (sharedPreferences.getBoolean("useGoogle", false) || sharedPreferences.getBoolean("isEditing", false)) {
            int[] viewIds = {R.id.create_userName, R.id.create_password};

            for (int viewId : viewIds) {
                final LabelAndEditTextView view = findViewById(viewId);
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        view.setVisibility(View.GONE);
                    }
                });
            }
        }
    }

    private void initNextButton() {
        Button nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(v -> {
            boolean verified = verifyFields();
            if (verified) {
                goToNewActivity();
            }
        });
    }

    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    // ChatGPT usage: Yes
    private void updatePreferences() {
        int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_phone_number, R.id.create_userName, R.id.create_password, R.id.create_bio};
        String[] keys = {"name", "email", "phoneNumber", "username", "password", "bio"};

        int numberOfIters = viewIds.length;
        if (sharedPreferences.getBoolean("useGoogle", false)) {
            numberOfIters = viewIds.length - 2;
        }
        for (int i = 0; i < numberOfIters; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            String userDataString = view.getEnterUserEditText().getText().toString();
            editor.putString(keys[i], userDataString);
            editor.commit();
        }
    }

    // ChatGPT usage: Yes
    private void goToNewActivity() {
        updatePreferences();
        printSharedPreferences(sharedPreferences);
        Intent newIntent;
        if (sharedPreferences.getBoolean("isEditing", false)) {
            JSONObject request = constructEditCourseRates(sharedPreferences);
            putEditProfile(request, AccountInformationActivity.this);
            newIntent = new Intent(AccountInformationActivity.this, EditProfileListActivity.class);
        } else {
            newIntent = new Intent(AccountInformationActivity.this, UniversityInformationActivity.class);
        }
        startActivity(newIntent);
    }

    // ChatGPT usage: Yes
    private boolean verifyFields() {
        int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_userName, R.id.create_password};

        int numberOfIters = viewIds.length;
        if (sharedPreferences.getBoolean("useGoogle", false)) {
            numberOfIters = viewIds.length - 2;
        }
        for (int i = 0; i < numberOfIters; i++) {
            if (i >= 2 && (sharedPreferences.getBoolean("useGoogle", false) || sharedPreferences.getBoolean("isEditing", false))) {
                break;
            }
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

    // ChatGPT usage: Yes
    private void initFields() {
        int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_phone_number, R.id.create_userName, R.id.create_password, R.id.create_bio};

        String[] preferenceKeys = {"name", "email", "phoneNumber", "username", "password", "bio"};

        for (int i = 0; i < viewIds.length; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            EditText editText = view.getEnterUserEditText();
            String preferenceKey = preferenceKeys[i];
            String storedValue = sharedPreferences.getString(preferenceKey, "");
            editText.setText(storedValue);
        }
    }

}
