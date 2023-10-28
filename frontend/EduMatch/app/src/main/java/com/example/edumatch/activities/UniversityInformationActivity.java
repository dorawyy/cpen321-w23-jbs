package com.example.edumatch.activities;


import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;
import static com.example.edumatch.util.ProfileHelper.putEditProfile;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import com.example.edumatch.views.CustomAutoCompleteView;
import com.example.edumatch.R;
import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.views.SubjectChipView;
import com.google.android.flexbox.FlexboxLayout;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class UniversityInformationActivity extends AppCompatActivity {

    final static String TAG = "SignUpFlow";

    CustomAutoCompleteView customAutoCompleteView;

    List<String> selectedCourses;

    String selectedUniversity;

    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_university_information);

        selectedCourses = new ArrayList<>();

        initSharedPreferences();



        initUniversitySpinner();
        String[] suggestions = initSuggestions();
        // Add an OnClickListener to the "add_button"
        initAddButton(suggestions);

        initNextButton();

        initFields();
    }

    @NonNull

    private String[] initSuggestions() {
        customAutoCompleteView = findViewById(R.id.search_courses_auto_complete);

        // TODO: replace this with an api call to get courses
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

    private void updatePreferences() {

        // Store the relevant data in SharedPreferences
        editor.putString("university", selectedUniversity);

        // Store the selected courses as a Set<String> (e.g., using a HashSet)
        Set<String> selectedCoursesSet = new HashSet<>(selectedCourses);
        editor.putStringSet("courses", selectedCoursesSet);

        // Store program and year level
        int[] viewIds = {R.id.choose_program, R.id.select_year_level};
        String[] keys = {"program", "yearLevel"};
        for (int i = 0; i < viewIds.length; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            String userDataString = view.getEnterUserEditText().getText().toString();
            editor.putString(keys[i], userDataString);
        }

        editor.commit();
    }

    private void goToNewActivity() {
        Class nextClass;
        updatePreferences();
        printSharedPreferences(sharedPreferences);
        if(Objects.equals(sharedPreferences.getString("userType",""), "tutor")){
            nextClass = CourseRatesActivity.class;
        } else {
            if(sharedPreferences.getBoolean("isEditing",false)){
                //TODO: do a PUT here (make a common function)
                JSONObject request = constructEditUniversityInformation();
                putEditProfile(request,UniversityInformationActivity.this);
                nextClass =  EditProfileListActivity.class;
            } else {
                nextClass = LocationInformationActivity.class;
            }
        }
        Intent newIntent = new Intent(UniversityInformationActivity.this, nextClass);
        startActivity(newIntent);
    }



    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    private void initFields() {
        // Initialize University Spinner
        Spinner universitySpinner = findViewById(R.id.select_university_spinner);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this, R.array.universities, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        universitySpinner.setAdapter(adapter);
        String savedUniversity = sharedPreferences.getString("university", "");
        if (!savedUniversity.isEmpty()) {
            int position = adapter.getPosition(savedUniversity);
            if (position != AdapterView.INVALID_POSITION) {
                universitySpinner.setSelection(position);
                selectedUniversity = savedUniversity;
            }
        }

        // Initialize Courses (create a copy of selectedCourses to avoid ConcurrentModificationException)
        List<String> selectedCoursesCopy = new ArrayList<>(sharedPreferences.getStringSet("courses", Collections.emptySet()));
        for (String course : selectedCoursesCopy) {
            updateSelectedCourses(course);
        }

        // Initialize Program and Year Level
        int[] viewIds = {R.id.choose_program, R.id.select_year_level};
        String[] keys = {"program", "yearLevel"};
        for (int i = 0; i < viewIds.length; i++) {
            LabelAndEditTextView view = findViewById(viewIds[i]);
            String savedValue = sharedPreferences.getString(keys[i], "");
            view.getEnterUserEditText().setText(savedValue);
        }
    }


    public JSONObject constructEditUniversityInformation() {
        try {
            // Retrieve data from SharedPreferences

            SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

            JSONObject requestBody = new JSONObject();

            // For education
            JSONObject education = new JSONObject();
            education.put("school", sharedPreferences.getString("university", ""));
            education.put("program", sharedPreferences.getString("program", ""));
            education.put("level", sharedPreferences.getString("yearLevel", ""));
            Set<String> courses = sharedPreferences.getStringSet("courses", new HashSet<>());
            JSONArray coursesArray = new JSONArray(courses);
            education.put("courses", coursesArray);
            requestBody.put("education",education);


            logRequestToConsole(requestBody);
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

}
