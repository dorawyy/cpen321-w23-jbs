package com.example.edumatch.activities;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import com.example.edumatch.views.CustomAutoCompleteView;
import com.example.edumatch.R;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;
import com.google.android.gms.common.api.Status;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.AutocompletePrediction;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest;
import com.google.android.libraries.places.api.net.PlacesClient;
import com.google.android.libraries.places.widget.AutocompleteSupportFragment;
import com.google.android.libraries.places.widget.listener.PlaceSelectionListener;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class UniversityInformationActivity extends AppCompatActivity {

    final static String TAG = "UniversityInformationActivity";

    CustomAutoCompleteView customAutoCompleteView;

    private FlexboxLayout chipContainer;
    Button addButton; // Add a reference to the "add_button"

    Button nextButton;

    Intent newIntent;

    List<String> selectedCourses;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_university_information);

        nextButton = findViewById(R.id.next_button);

        String apiKey = getResources().getString(R.string.MAPS_API_KEY);
        if (!Places.isInitialized()) {
            Places.initialize(getApplicationContext(), apiKey);
        }



        customAutoCompleteView = findViewById(R.id.search_courses_auto_complete);
        addButton = findViewById(R.id.add_button); // Initialize the "add_button"

        String[] suggestions = new String[]{"CPEN 322", "CPEN 321", "ELEC 201", "MATH 220", "ELEC 221", "CPSC 320", "CPEN 300", "CPEN 301", "CPEN 999", "CPEN 666", "CPEN 696", "CPEN 123"};
        selectedCourses = new ArrayList<>();
        customAutoCompleteView.setSuggestions(suggestions);

        // Add an OnClickListener to the "add_button"
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                String enteredText = customAutoCompleteView.getAutoCompleteTextView().getText().toString();
                if (!enteredText.isEmpty()) {

                    if (suggestions != null && !Arrays.asList(suggestions).contains(enteredText)) {
                        // Display an error if the entered text doesn't match any suggestion.
                        Toast.makeText(UniversityInformationActivity.this, "Invalid selection", Toast.LENGTH_SHORT).show();

                        // Clear the entered text if it's invalid
                        customAutoCompleteView.getAutoCompleteTextView().setText("");
                    }
                    else if (selectedCourses.contains(enteredText)) {
                        // Display an error if the course has already been selected.
                        Toast.makeText(UniversityInformationActivity.this, "Course already selected", Toast.LENGTH_SHORT).show();

                        // Clear the entered text if it's invalid
                        customAutoCompleteView.getAutoCompleteTextView().setText("");
                    }
                    else {
                        // Create a SubjectChipView
                        selectedCourses.add(enteredText);
                        SubjectChipView subjectChipView = new SubjectChipView(UniversityInformationActivity.this);
                        subjectChipView.setChipText(enteredText);

                        subjectChipView.setChipRemovedListener(new SubjectChipView.OnChipRemovedListener() {
                            @Override
                            public void onChipRemoved(String course) {

                                int index = selectedCourses.indexOf(course);
                                if (index >= 0) {
                                    selectedCourses.remove(index);
                                }
                            }
                        });

                        // Find the "chip_container" and add the SubjectChipView to it
                        chipContainer = findViewById(R.id.chip_container);
                        chipContainer.addView(subjectChipView);

                        // Clear the AutoCompleteTextView
                        customAutoCompleteView.getAutoCompleteTextView().setText("");
                    }
                }
            }
        });


        newIntent = new Intent(UniversityInformationActivity.this, LocationInformationActivity.class);

        Intent intent = getIntent();

        if (intent != null && intent.getExtras() != null) {
            Bundle userData = intent.getExtras();
            nextButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    String[] coursesArray = selectedCourses.toArray(new String[selectedCourses.size()]);
                    // Todo: add other things needed in the bundle
                    userData.putStringArray("courses", coursesArray);
                    newIntent.putExtras(userData);
                    startActivity(newIntent);
                }
            });

        }



    }

}
