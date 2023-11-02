package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.GridLayout;
import android.widget.RatingBar;
import android.widget.TextView;

import com.example.edumatch.R;

public class LabelAndRatingView extends GridLayout {

    // ChatGPT usage: Yes
    public LabelAndRatingView(Context context) {
        super(context);
        init(context, null);
    }

    // ChatGPT usage: Yes
    public LabelAndRatingView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public LabelAndRatingView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public RatingBar getRatingView(){
        return findViewById(R.id.starRatingBar);
    }

    // ChatGPT usage: Yes
    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.label_and_rating, this, true);

        TextView label = findViewById(R.id.label);

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

