package com.example.edumatch.activities;


import static com.example.edumatch.util.LoginSignupHelper.getCourseCodes;
import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.ProfileHelper.logRequestToConsole;
import static com.example.edumatch.util.ProfileHelper.putEditProfile;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.util.CustomException;
import com.example.edumatch.views.CustomAutoCompleteView;
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

    CustomAutoCompleteView customAutoCompleteView;

    List<String> selectedCourses;

    String selectedUniversity;

    SharedPreferences sharedPreferences;
    SharedPreferences.Editor editor;
    String[] coursesArray;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_university_information);

        selectedCourses = new ArrayList<>();

        initSharedPreferences();

        initSuggestions(new String[]{});

        initUniversitySpinner();
        // Add an OnClickListener to the "add_button"
        initAddButton();

        initNextButton();

        initFields();

        initEditTextWatcher();
    }

    // ChatGPT usage: Yes
    private void initEditTextWatcher() {
        customAutoCompleteView.getAutoCompleteTextView().addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                // Not needed in this context
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String enteredText = s.toString();
                String[] concatCoursesArray;
                if (enteredText.length() == 4) {
                    JSONObject response = getCourseCodes(UniversityInformationActivity.this,enteredText);

                    try {
                        JSONArray jsonArray = response.getJSONArray("courses");
                        int length = jsonArray.length();
                        coursesArray = new String[length];
                        concatCoursesArray = new String[length];
                        for (int i = 0; i < length; i++) {
                            coursesArray[i] = jsonArray.getJSONObject(i).getString("code");
                            concatCoursesArray[i] = jsonArray.getJSONObject(i).getString("code").concat("\n").concat(jsonArray.getJSONObject(i).getString("title"));
                        }
                    } catch (JSONException e) {
                        throw new CustomException("JSON parsing error");
                    }
                    initSuggestions(concatCoursesArray);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                if (s.length() > 8) {
                    // Keep only the first 8 characters
                    String newText = s.subSequence(0, 8).toString();

                    // Update the text in the EditText
                    s.replace(0, s.length(), newText);
                }
            }
        });
    }

    // ChatGPT usage: Yes
    private void initSuggestions(String[] suggestions) {
        customAutoCompleteView = findViewById(R.id.search_courses_auto_complete);
        customAutoCompleteView.setSuggestions(suggestions);
    }


    private void initNextButton() {

        Button nextButton = findViewById(R.id.next_button);
        nextButton.setOnClickListener(v -> goToNewActivity());
    }

    // ChatGPT usage: Yes
    private void initAddButton() {
        Button addButton = findViewById(R.id.add_button); // Initialize the "add_button"
        addButton.setOnClickListener(view -> {
            String enteredText = customAutoCompleteView.getAutoCompleteTextView().getText().toString();
            if (!enteredText.isEmpty()) {

                if (coursesArray != null && !Arrays.asList(coursesArray).contains(enteredText)) {
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
        });
    }

    // ChatGPT usage: Yes
    private void updateSelectedCourses(String enteredText) {
        selectedCourses.add(enteredText);
        SubjectChipView subjectChipView = new SubjectChipView(UniversityInformationActivity.this);
        subjectChipView.setChipText(enteredText);

        subjectChipView.setChipRemovedListener(course -> {

            int index = selectedCourses.indexOf(course);
            if (index >= 0) {
                selectedCourses.remove(index);
            }
        });

        // Find the "chip_container" and add the SubjectChipView to it
        FlexboxLayout chipContainer = findViewById(R.id.chip_container);
        chipContainer.addView(subjectChipView);

        // Clear the AutoCompleteTextView
        customAutoCompleteView.getAutoCompleteTextView().setText("");
    }

    // ChatGPT usage: Yes
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

    // ChatGPT usage: Yes
    private boolean updatePreferences() {

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

            if (viewIds[i] == R.id.select_year_level) {
                if (TextUtils.isDigitsOnly(userDataString)) {
                    editor.putString(keys[i], userDataString);
                } else {
                    // Display an error for invalid year level
                    view.getEnterUserEditText().setError("Invalid year level. Please enter a number.");
                    return false;
                    // Optionally, you may want to clear the invalid value
                    // editor.remove(keys[i]);
                }
            } else {
                editor.putString(keys[i], userDataString);
            }
        }

        editor.commit();
        return true;
    }

    // ChatGPT usage: Yes
    private void goToNewActivity() {
        Class nextClass;
        boolean success = updatePreferences();
        if(success){
            printSharedPreferences(sharedPreferences);
            if(Objects.equals(sharedPreferences.getString("userType",""), "tutor")){
                nextClass = CourseRatesActivity.class;
            } else {
                if(sharedPreferences.getBoolean("isEditing",false)){
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
    }

    private void initSharedPreferences() {
        sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    // ChatGPT usage: Yes
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

    // ChatGPT usage: Yes
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