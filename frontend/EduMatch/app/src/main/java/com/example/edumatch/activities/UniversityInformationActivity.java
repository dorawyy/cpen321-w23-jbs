package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import com.example.edumatch.util.LoginSignupHelper;
import com.example.edumatch.views.CustomAutoCompleteView;
import com.example.edumatch.R;
import com.example.edumatch.views.LabelAndEditTextView;
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
import java.util.Objects;

public class UniversityInformationActivity extends AppCompatActivity {

    final static String TAG = "SignUpFlow";

    CustomAutoCompleteView customAutoCompleteView;

    List<String> selectedCourses;

    String selectedUniversity;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_university_information);

        selectedCourses = new ArrayList<>();

        initUniversitySpinner();
        String[] suggestions = initSuggestions();
        // Add an OnClickListener to the "add_button"
        initAddButton(suggestions);

        initNextButton();
    }

    @NonNull

    private String[] initSuggestions() {
        customAutoCompleteView = findViewById(R.id.search_courses_auto_complete);

        // todo replace this with an api call to get courses
        String[] suggestions = new String[]{"CPEN 322", "CPEN 321", "ELEC 201", "MATH 220", "ELEC 221", "CPSC 320", "CPEN 300", "CPEN 301", "CPEN 999", "CPEN 666", "CPEN 696", "CPEN 123"};

        customAutoCompleteView.setSuggestions(suggestions);
        return suggestions;
    }


    private void initNextButton() {

        Button nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                goToNewActivity();
            }
        });
    }

    private void initAddButton(String[] suggestions) {
        Button addButton = findViewById(R.id.add_button); // Initialize the "add_button"
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
                    } else if (selectedCourses.contains(enteredText)) {
                        // Display an error if the course has already been selected.
                        Toast.makeText(UniversityInformationActivity.this, "Course already selected", Toast.LENGTH_SHORT).show();

                        // Clear the entered text if it's invalid
                        customAutoCompleteView.getAutoCompleteTextView().setText("");
                    } else {
                        // Create a SubjectChipView
                        updateSelectedCourses(enteredText);
                    }
                }
            }
        });
    }

    private void updateSelectedCourses(String enteredText) {
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
        FlexboxLayout chipContainer = findViewById(R.id.chip_container);
        chipContainer.addView(subjectChipView);

        // Clear the AutoCompleteTextView
        customAutoCompleteView.getAutoCompleteTextView().setText("");
    }

    private void initUniversitySpinner() {
        Spinner universitySpinner = findViewById(R.id.select_university_spinner);

        // Create an ArrayAdapter using a single item and the default spinner layout
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this, R.array.universities, android.R.layout.simple_spinner_item);

        // Specify the layout to use when the list of choices appears
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

        // Apply the adapter to the spinner
        universitySpinner.setAdapter(adapter);

        // Set an OnItemSelectedListener to capture the selected item
        universitySpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parentView, View selectedItemView, int position, long id) {
                selectedUniversity = universitySpinner.getSelectedItem().toString();
                // Handle the selected university
            }

            @Override
            public void onNothingSelected(AdapterView<?> parentView) {
                // Do nothing if nothing is selected
            }
        });
    }

    private Bundle updateBundle() {
        Bundle educationBundle = new Bundle();
        int[] viewIds = {R.id.choose_program, R.id.select_year_level};
        String[] keys = {"program", "yearLevel"};
        Intent currentIntent = getIntent();
        if (currentIntent != null && currentIntent.getExtras() != null) {
            Bundle userData = currentIntent.getExtras();
            educationBundle.putString("university", selectedUniversity);
            String[] coursesArray = selectedCourses.toArray(new String[selectedCourses.size()]);
            educationBundle.putStringArray("courses", coursesArray);
            for (int i = 0; i < viewIds.length; i++) {
                LabelAndEditTextView view = findViewById(viewIds[i]);
                String userDataString = view.getEnterUserEditText().getText().toString();
                educationBundle.putString(keys[i], userDataString);
            }
            userData.putBundle("education", educationBundle);
            return userData;

        } else {
            Log.e(TAG, "Something went wrong with the intent extras");
            throw new RuntimeException("Intent is null or doesn't have extras");
        }
    }

    private void goToNewActivity() {

        Bundle userData = updateBundle();
        Class nextClass;
        if(Objects.equals(userData.getString("userType"), "tutor")){
            nextClass = CourseRatesActivity.class;
        } else {
            nextClass = LocationInformationActivity.class;
        }
        Intent newIntent = new Intent(UniversityInformationActivity.this, nextClass);
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }

}
