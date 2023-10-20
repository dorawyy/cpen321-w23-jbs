package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;

import androidx.appcompat.widget.AppCompatButton;
import androidx.gridlayout.widget.GridLayout;

import com.example.edumatch.R;

public class GoogleIconButtonView extends GridLayout {
    private AppCompatButton signInButton;

    public GoogleIconButtonView(Context context, AttributeSet attrs) {
        super(context, attrs);

        // Inflate the XML layout
        inflate(context, R.layout.google_icon_button, this);

        if (attrs != null) {
            signInButton = findViewById(R.id.google_sign_in_button);

            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.GoogleIconButton);

            String buttonText = typedArray.getString(R.styleable.GoogleIconButton_buttonText);
            typedArray.recycle();

            if (buttonText != null) {
                signInButton.setText(buttonText);
            }
        }
    }

    public AppCompatButton getButton() {
        return signInButton;
    }
}
