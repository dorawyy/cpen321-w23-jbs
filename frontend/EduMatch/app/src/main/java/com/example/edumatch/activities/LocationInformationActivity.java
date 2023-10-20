package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;

import com.example.edumatch.BuildConfig;
import com.example.edumatch.R;
import com.example.edumatch.views.CourseRateItemView;
import com.google.android.gms.common.api.Status;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;

import java.util.Arrays;

public class LocationInformationActivity extends AppCompatActivity {

    private RadioGroup radioGroup;

    private TextView addressText;

    private double latitude = Double.NaN;

    private double longitude = Double.NaN;

    private boolean isOnline = false;

    final static String TAG = "LocationInformationActivity";
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
        initAutoComplete();

        initRadioGroup();

        initNextButton();

    }

    private void initRadioGroup() {
        radioGroup = findViewById(R.id.radio_group);

        // Set a listener for the radio group
        radioGroup.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.in_person_radio) {
                // Show the AutocompleteSupportFragment
                autocompleteFragment.getView().setVisibility(View.VISIBLE);
                addressText.setVisibility(View.VISIBLE);
                addressText.setText("");
                isOnline = false;
            } else if (checkedId == R.id.online_radio) {
                // Hide the AutocompleteSupportFragment
                autocompleteFragment.getView().setVisibility(View.GONE);
                addressText.setText("Online");
                // Reset input of autocomplete
                EditText autocompleteSearch = autocompleteFragment.getView().findViewById(com.google.android.libraries.places.R.id.places_autocomplete_search_input);
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
        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.ID, Place.Field.NAME));

        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.LAT_LNG, Place.Field.NAME));

        autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
            @Override
            public void onPlaceSelected(Place place) {
                addressText.setText(String.valueOf(place.getName()));
                latitude = place.getLatLng().latitude;
                longitude = place.getLatLng().longitude;
            }

            @Override
            public void onError(Status status) {
                throw new RuntimeException("Google Place API Error");
            }
        });
    }


    private void initNextButton() {
        Button nextButton = findViewById(R.id.next_button);

        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(isOnline == false && (Double.isNaN(latitude) || Double.isNaN(longitude))){
                    Toast.makeText(LocationInformationActivity.this, "No Location Selected", Toast.LENGTH_LONG).show();
                } else {
                    goToNewActivity();
                }
            }
        });
    }


    private Bundle updateBundle() {

        Intent currentIntent = getIntent();
        if (currentIntent != null && currentIntent.getExtras() != null) {
            Bundle userData = currentIntent.getExtras();
            userData.putString("locationMode", isOnline ? "online" : "in-person");
            if(isOnline == false){
                Bundle location = new Bundle();
                location.putDouble("latitude", latitude);
                location.putDouble("longitude", longitude);
                userData.putBundle("location", location);
            }
            return userData;

        } else {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent is null or doesn't have extras");
        }
    }

    private void goToNewActivity() {
        Intent newIntent = new Intent(LocationInformationActivity.this, AvailabilityActivity.class);
        Bundle userData = updateBundle();
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }
}