package com.example.edumatch;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

public class AccountInformationActivity extends AppCompatActivity {

    private Button nextButton;

    private Intent newIntent;

    private String nameEditText;
    private String emailEditText;
    private String phoneNumberEditText;
    private String userNameEditText;
    private String passwordEditText;

    private LabelAndEditText name, email, phoneNumber, username, password;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_information);

        Intent intent = getIntent();

        nextButton = findViewById(R.id.next_button);

        newIntent = new Intent(AccountInformationActivity.this, UniversityInformationActivity.class);

        name = findViewById(R.id.create_name);
        email = findViewById(R.id.create_email);
        phoneNumber = findViewById(R.id.create_phone_number);
        username = findViewById(R.id.create_userName);
        password = findViewById(R.id.create_password);

        if (intent != null && intent.getExtras() != null) {
            Bundle userData = intent.getExtras();
            nextButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    nameEditText = name.getEnterUserEditText().getText().toString();
                    emailEditText = email.getEnterUserEditText().getText().toString();
                    phoneNumberEditText = phoneNumber.getEnterUserEditText().getText().toString();
                    userNameEditText = username.getEnterUserEditText().getText().toString();
                    passwordEditText = password.getEnterUserEditText().getText().toString();
                    userData.putString("name", nameEditText);
                    userData.putString("email", emailEditText);
                    userData.putString("phoneNumber", phoneNumberEditText);
                    userData.putString("userName", userNameEditText);
                    userData.putString("password", passwordEditText);
                    newIntent.putExtras(userData);
                    startActivity(newIntent);
                }
            });

        }
    }
}