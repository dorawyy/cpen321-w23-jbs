package com.example.edumatch;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class SubjectChipView extends RelativeLayout {

    private TextView textView;
    private Button removeButton; // Add a reference to the remove button

    public SubjectChipView(Context context) {
        super(context);
        init(context, null);
    }

    public SubjectChipView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public SubjectChipView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public void setChipText(String text) {
        if (textView != null) {
            textView.setText(text);
        }
    }

    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.subject_chip_component, this, true);

        // Find the TextView and the remove button inside the custom layout
        textView = findViewById(R.id.text);
        removeButton = findViewById(R.id.remove_subject_button);

        // Set an OnClickListener for the remove button
        if (removeButton != null) {
            removeButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (getParent() instanceof ViewGroup) {
                        ViewGroup parentView = (ViewGroup) getParent();
                        parentView.removeView(SubjectChipView.this);
                    }
                }
            });
        }

        // Retrieve and set the text attribute if it's provided
        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.SubjectChip);
            String text = typedArray.getString(R.styleable.SubjectChip_chipText);
            typedArray.recycle();

            if (text != null) {
                setChipText(text);
            }
        }
    }
}