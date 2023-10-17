package com.example.edumatch;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.google.android.flexbox.FlexboxLayout;

import java.util.Arrays;

public class UniversityInformationActivity extends AppCompatActivity {

    CustomAutoCompleteView customAutoCompleteView;

    private FlexboxLayout chipContainer;
    Button addButton; // Add a reference to the "add_button"

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_university_information);

        customAutoCompleteView = findViewById(R.id.search_courses_auto_complete);
        addButton = findViewById(R.id.add_button); // Initialize the "add_button"

        String[] suggestions = new String[]{"CPEN 322", "CPEN 321", "ELEC 201", "MATH 220", "ELEC 221", "CPCS 320"};
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
                    } else {
                        // Create a SubjectChipView
                        SubjectChipView subjectChipView = new SubjectChipView(UniversityInformationActivity.this);
                        subjectChipView.setChipText(enteredText);

                        // Find the "chip_container" and add the SubjectChipView to it
                        chipContainer = findViewById(R.id.chip_container);
                        chipContainer.addView(subjectChipView);

                        // Clear the AutoCompleteTextView
                        customAutoCompleteView.getAutoCompleteTextView().setText("");
                    }
                }
            }
        });
    }
}
