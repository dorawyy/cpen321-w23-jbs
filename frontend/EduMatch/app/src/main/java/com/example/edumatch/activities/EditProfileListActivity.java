package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

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

        updatePreferences();
        accountInfoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //todo: maybe add a get here to refresh the preferences from the server?
                Intent newIntent = new Intent(EditProfileListActivity.this,
                        AccountInformationActivity.class);
                startActivity(newIntent);

            }
        });

        uniInfoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //todo: maybe add a get here to refresh the preferences from the server?
                Intent newIntent = new Intent(EditProfileListActivity.this,
                        UniversityInformationActivity.class);
                startActivity(newIntent);
            }
        });

        locationInfoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //todo: maybe add a get here to refresh the preferences from the server?
                Intent newIntent = new Intent(EditProfileListActivity.this,
                        LocationInformationActivity.class);
                startActivity(newIntent);
            }
        });

        availabilityInfoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //todo: maybe add a get here to refresh the preferences from the server?
                Intent newIntent = new Intent(EditProfileListActivity.this,
                        AvailabilityActivity.class);
                startActivity(newIntent);
            }
        });
    }


    private void updatePreferences() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean("isEditing",true);
        editor.commit();
    }

}