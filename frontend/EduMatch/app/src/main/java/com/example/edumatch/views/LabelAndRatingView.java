package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.EditText;
import android.widget.GridLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class LabelAndRatingView extends GridLayout {

    private TextView label;

    public LabelAndRatingView(Context context) {
        super(context);
        init(context, null);
    }

    public LabelAndRatingView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public LabelAndRatingView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }


    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.label_and_rating, this, true);

        label = findViewById(R.id.label);

        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.LabelAndTextView);

            String labelText = typedArray.getString(R.styleable.LabelAndTextView_label);

            typedArray.recycle();

            if (labelText != null) {
                label.setText(labelText);
            }
        }
    }
}

