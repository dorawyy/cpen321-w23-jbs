package com.example.edumatch;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Typeface;
import android.text.InputType;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.TextView;

public class LoginLabelAndEditText extends GridLayout {

    private TextView label;
    private EditText editText;

    public LoginLabelAndEditText(Context context) {
        super(context);
        init(context, null);
    }

    public LoginLabelAndEditText(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public LoginLabelAndEditText(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.login_label_and_edit_text, this, true);

        // Find the TextView for the label inside the custom layout
        label = findViewById(R.id.label);

        // Find the EditText inside the custom layout
        editText = findViewById(R.id.edit_text);

        // Retrieve and set the labelText attribute if it's provided
        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.LabelAndEditText);
            String labelText = typedArray.getString(R.styleable.LabelAndEditText_labelText);
            String hintText = typedArray.getString(R.styleable.LabelAndEditText_hintText);
            String inputType = typedArray.getString(R.styleable.LabelAndEditText_inputType);
            typedArray.recycle();

            if (labelText != null) {
                label.setText(labelText);
            }

            if (hintText != null) {
                editText.setHint(hintText);
            }

            if(inputType != null){
                editText.setInputType(LoginHelper.getInputTypeFromString(inputType));
                editText.setTypeface(Typeface.SANS_SERIF);
            }
        }
    }
}