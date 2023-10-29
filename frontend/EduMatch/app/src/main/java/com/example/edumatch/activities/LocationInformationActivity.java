package com.example.edumatch.activities;


import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;
import static com.example.edumatch.util.ProfileHelper.putEditProfile;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.BuildConfig;
import com.example.edumatch.R;
import com.google.android.gms.common.api.Status;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.Objects;

public class LocationInformationActivity extends AppCompatActivity {

    private TextView addressText;

    private double latitude = Double.NaN;

    private double longitude = Double.NaN;

    private boolean isOnline = false;

    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;

    private AutocompleteSupportFragment autocompleteFragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location_information);

        // Initialize Places API
        String apiKey = BuildConfig.MAPS_API_KEY;
        if (!Places.isInitialized()) {
            Places.initialize(getApplicationContext(), apiKey);
        }

        addressText = findViewById(R.id.address);
        initSharedPreferences();
        initAutoComplete();

        initRadioGroup();

        initNextButton();

    }

    @SuppressLint("SetTextI18n")
    private void initRadioGroup() {
        RadioGroup radioGroup = findViewById(R.id.radio_group);

        // Set a listener for the radio group
        radioGroup.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.in_person_radio) {
                // Show the AutocompleteSupportFragment
                autocompleteFragment.requireView().setVisibility(View.VISIBLE);
                addressText.setVisibility(View.VISIBLE);
                addressText.setText("");
                isOnline = false;
            } else if (checkedId == R.id.online_radio) {
                // Hide the AutocompleteSupportFragment
                autocompleteFragment.requireView().setVisibility(View.GONE);
                addressText.setText("Online");
                // Reset input of autocomplete
                EditText autocompleteSearch = autocompleteFragment.requireView().findViewById(com.google.android.libraries.places.R.id.places_autocomplete_search_input);
                autocompleteSearch.setText("");
                latitude = Double.NaN;
                longitude = Double.NaN;
                isOnline = true;
            }
        });
    }

    private void initAutoComplete() {
        autocompleteFragment = (AutocompleteSupportFragment)
                getSupportFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);

        // Set the type of place data to return
        assert autocompleteFragment != null;
        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.ID, Place.Field.NAME));

        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.LAT_LNG, Place.Field.NAME));

        autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
            @Override
            public void onPlaceSelected(@NonNull Place place) {
                addressText.setText(String.valueOf(place.getName()));
                latitude = Objects.requireNonNull(place.getLatLng()).latitude;
                longitude = place.getLatLng().longitude;
            }

            @Override
            public void onError(@NonNull Status status) {
                throw new RuntimeException("Google Place API Error");
            }
        });
    }

    private void initNextButton() {
        Button nextButton = findViewById(R.id.next_button);

        nextButton.setOnClickListener(v -> {
            if (!isOnline && (Double.isNaN(latitude) || Double.isNaN(longitude))) {
                Toast.makeText(LocationInformationActivity.this, "No Location Selected", Toast.LENGTH_LONG).show();
            } else {
                goToNewActivity();
            }
        });
    }

    private void updatePreferences() {

        editor.putString("locationMode", isOnline ? "online" : "in person");

        if (!isOnline) {
            // Update the location data in SharedPreferences
            editor.putFloat("latitude", (float) latitude);
            editor.putFloat("longitude", (float) longitude);
        }

        // Commit the changes
        editor.commit();

    }

    private void goToNewActivity() {
        Intent newIntent;
        updatePreferences();
        printSharedPreferences(sharedPreferences);
        if(sharedPreferences.getBoolean("isEditing",false)){
            JSONObject request = constructEditLocationInformation();
            putEditProfile(request,LocationInformationActivity.this);
            //TODO: do a PUT here (make a common function)
            newIntent = new Intent(LocationInformationActivity.this, EditProfileListActivity.class);
        } else {
            newIntent = new Intent(LocationInformationActivity.this, AvailabilityActivity.class);
        }
        startActivity(newIntent);
    }


    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }


    public JSONObject constructEditLocationInformation() {

        try {
            // Retrieve data from SharedPreferences

            SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
            JSONObject requestBody = new JSONObject();

            // For education

            JSONObject location = new JSONObject();
            location.put("lat", sharedPreferences.getFloat("latitude", 0));
            location.put("long", sharedPreferences.getFloat("longitude", 0));
            requestBody.put("location", location);
            requestBody.put("locationMode", sharedPreferences.getString("locationMode", ""));

            logRequestToConsole(requestBody);
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

    }
}