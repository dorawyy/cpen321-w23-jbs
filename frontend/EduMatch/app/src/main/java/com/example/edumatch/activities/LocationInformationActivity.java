package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.TextView;

import com.example.edumatch.R;
import com.google.android.gms.common.api.Status;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;

import java.util.Arrays;

public class LocationInformationActivity extends AppCompatActivity {

    private RadioGroup radioGroup;

    private TextView addressText;

    private TextView addressLabel;

    final static String TAG = "LocationInformationActivity";
    private AutocompleteSupportFragment autocompleteFragment;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location_information);

        addressText = findViewById(R.id.address);
        addressLabel = findViewById(R.id.address_title);
        autocompleteFragment = (AutocompleteSupportFragment)
                getSupportFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);

        // Set the type of place data to return
        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.ID, Place.Field.NAME));

        autocompleteFragment.setPlaceFields(Arrays.asList(Place.Field.LAT_LNG, Place.Field.NAME));

        autocompleteFragment.setOnPlaceSelectedListener(new PlaceSelectionListener() {
            @Override
            public void onPlaceSelected(Place place) {
                addressText.setText(String.valueOf(place.getName()));
                place.getLatLng();
            }

            @Override
            public void onError(Status status) {
                // Handle errors
            }
        });


        radioGroup = findViewById(R.id.radio_group);

        // Set a listener for the radio group
        radioGroup.setOnCheckedChangeListener((group, checkedId) -> {
            if (checkedId == R.id.in_person_radio) {
                // Show the AutocompleteSupportFragment
                autocompleteFragment.getView().setVisibility(View.VISIBLE);
                addressText.setVisibility(View.VISIBLE);
                addressText.setText("");
            } else if (checkedId == R.id.online_radio) {
                // Hide the AutocompleteSupportFragment
                autocompleteFragment.getView().setVisibility(View.GONE);
                addressText.setText("Online");
                // Reset input of autocomplete
                EditText autocompleteSearch = autocompleteFragment.getView().findViewById(com.google.android.libraries.places.R.id.places_autocomplete_search_input);
                autocompleteSearch.setText("");
            }
        });

    }
}