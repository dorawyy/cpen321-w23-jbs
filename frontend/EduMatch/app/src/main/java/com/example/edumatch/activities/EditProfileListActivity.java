package com.example.edumatch.activities;

import static com.example.edumatch.util.ProfileHelper.getProfile;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;

public class EditProfileListActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile_list);
        Button accountInfoButton = findViewById(R.id.account_info);
        Button uniInfoButton = findViewById(R.id.uni_info);
        Button locationInfoButton = findViewById(R.id.location_info);
        Button availabilityInfoButton = findViewById(R.id.availability_info);
        Button signOutButton = findViewById(R.id.sign_out);

        updatePreferences();

        getProfile(EditProfileListActivity.this);
        accountInfoButton.setOnClickListener(v -> {
            Intent newIntent = new Intent(EditProfileListActivity.this,
                    AccountInformationActivity.class);
            startActivity(newIntent);

        });

        uniInfoButton.setOnClickListener(v -> {
            Intent newIntent = new Intent(EditProfileListActivity.this,
                    UniversityInformationActivity.class);
            startActivity(newIntent);
        });

        locationInfoButton.setOnClickListener(v -> {
            Intent newIntent = new Intent(EditProfileListActivity.this,
                    LocationInformationActivity.class);
            startActivity(newIntent);
        });

        availabilityInfoButton.setOnClickListener(v -> {
            Intent newIntent = new Intent(EditProfileListActivity.this,
                    AvailabilityActivity.class);
            startActivity(newIntent);
        });

        signOutButton.setOnClickListener(v -> {
            clearPreferences();
            Intent newIntent = new Intent(EditProfileListActivity.this,
                    MainActivity.class);
            startActivity(newIntent);
        });
    }


    private void updatePreferences() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean("isEditing",true);
        editor.apply();
    }

    private void clearPreferences() {
        Context context = getApplicationContext();
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();

        editor.clear(); // Clears all the data in the SharedPreferences file
        editor.apply(); // Apply the changes
    }

}