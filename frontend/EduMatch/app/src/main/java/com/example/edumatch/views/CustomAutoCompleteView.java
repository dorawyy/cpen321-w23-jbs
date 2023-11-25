package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.RelativeLayout;

import com.example.edumatch.R;

public class CustomAutoCompleteView extends RelativeLayout {
    private AutoCompleteTextView autoCompleteTextView;

    public CustomAutoCompleteView(Context context) {
        super(context);
        init(context);
    }

    public CustomAutoCompleteView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public CustomAutoCompleteView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    public AutoCompleteTextView getAutoCompleteTextView() {
        return autoCompleteTextView;
    }

    public void setThreshold(int threshold) {
        if (autoCompleteTextView != null) {
            autoCompleteTextView.setThreshold(threshold);
        }
    }

    public void setAdapter(ArrayAdapter<String> adapter) {
        if (autoCompleteTextView != null) {
            autoCompleteTextView.setAdapter(adapter);
        }
    }

    public void setOnItemClickListener(AdapterView.OnItemClickListener listener) {
        if (autoCompleteTextView != null) {
            // Pass the click event to the provided listener
            // Clear the entered text if it's invalid
            autoCompleteTextView.setOnItemClickListener(listener);
        }
    }

    public void setText(String text) {
        if (autoCompleteTextView != null) {
            autoCompleteTextView.setText(text);
        }
    }

    private void init(Context context) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.auto_complete, this, true);

        autoCompleteTextView = findViewById(R.id.auto_complete);

        autoCompleteTextView.setOnEditorActionListener((textView, actionId, keyEvent) -> {
            return false; // Let the system perform the default action for the "Done" action.
        });
    }

}
