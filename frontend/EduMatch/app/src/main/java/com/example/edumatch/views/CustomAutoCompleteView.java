package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.inputmethod.EditorInfo;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.RelativeLayout;
import android.widget.Toast;

import com.example.edumatch.R;

import java.util.Arrays;

public class CustomAutoCompleteView extends RelativeLayout {
    private AutoCompleteTextView autoCompleteTextView;
    private String[] suggestionsArray;

    // ChatGPT usage: Yes
    public CustomAutoCompleteView(Context context) {
        super(context);
        init(context);
    }

    // ChatGPT usage: Yes
    public CustomAutoCompleteView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    // ChatGPT usage: Yes
    public CustomAutoCompleteView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    // ChatGPT usage: Yes
    public AutoCompleteTextView getAutoCompleteTextView() {
        return autoCompleteTextView;
    }

    // ChatGPT usage: Yes
    public void setSuggestions(String[] suggestions) {
        this.suggestionsArray = suggestions;

        if (autoCompleteTextView != null) {
            ArrayAdapter<String> adapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_dropdown_item_1line, suggestions);
            autoCompleteTextView.setAdapter(adapter);
        }
    }

    // ChatGPT usage: Yes
    private void init(Context context) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.auto_complete, this, true);

        autoCompleteTextView = findViewById(R.id.auto_complete);

        if (suggestionsArray != null) {
            ArrayAdapter<String> adapter = new ArrayAdapter<>(getContext(), android.R.layout.simple_dropdown_item_1line, suggestionsArray);
            autoCompleteTextView.setAdapter(adapter);
        }

        autoCompleteTextView.setOnEditorActionListener((textView, actionId, keyEvent) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE ||
                    (keyEvent != null && keyEvent.getKeyCode() == KeyEvent.KEYCODE_ENTER && keyEvent.getAction() == KeyEvent.ACTION_DOWN)) {
                String enteredText = textView.getText().toString();
                if (suggestionsArray != null && !Arrays.asList(suggestionsArray).contains(enteredText)) {
                    // Display an error if the entered text doesn't match any suggestion.
                    Toast.makeText(context, "Invalid selection", Toast.LENGTH_SHORT).show();

                    // Clear the entered text if it's invalid
                    textView.setText("");
                    return true; // Consume the event to prevent further action.
                }
            }
            return false; // Let the system perform the default action for the "Done" action.
        });

    }
}