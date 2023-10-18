package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.R;

public class AccountInformationActivity extends AppCompatActivity {

    private Button nextButton;

    private Intent newIntent;

    Intent currentIntent;

    final static String TAG = "AccountInformationActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_information);

        currentIntent = getIntent();

        nextButton = findViewById(R.id.next_button);

        newIntent = new Intent(AccountInformationActivity.this, UniversityInformationActivity.class);


        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addToUserData();
                startActivity(newIntent);
            }
        });

    }

    private void addToUserData() {
        if (currentIntent != null && currentIntent.getExtras() != null) {
            Bundle userData = currentIntent.getExtras();

            int[] viewIds = {R.id.create_name, R.id.create_email, R.id.create_phone_number, R.id.create_userName, R.id.create_password};

            for (int id : viewIds) {
                LabelAndEditTextView view = findViewById(id);
                userData.putString(getResources().getResourceEntryName(id), view.getEnterUserEditText().getText().toString());
                Log.d(TAG,getResources().getResourceEntryName(id));
                Log.d(TAG,view.getEnterUserEditText().getText().toString());
            }
            newIntent.putExtras(userData);

        }
    }

}
