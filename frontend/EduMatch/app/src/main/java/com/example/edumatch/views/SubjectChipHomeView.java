package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class SubjectChipHomeView extends RelativeLayout {

    private SubjectChipHomeView.ChipClickListener chipClickListener;
    private TextView textView;
    public boolean isClicked = false;

    public interface ChipClickListener {
        void onChipClicked(SubjectChipHomeView chipView);
    }

    public void setChipClickListener(SubjectChipHomeView.ChipClickListener listener) {
        this.chipClickListener = listener;
    }

    public SubjectChipHomeView(Context context) {
        super(context);
        init(context, null);
    }

    public SubjectChipHomeView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public SubjectChipHomeView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public void setChipText(String text) {
        if (textView != null) {
            textView.setText(text);
        }
    }

    // ChatGPT usage: Yes
    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.subject_chip_home, this, true);

        // Find the TextView and the remove button inside the custom layout
        textView = findViewById(R.id.text);
        isClicked = false;


        // Retrieve and set the text attribute if it's provided
        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.SubjectChip);
            String text = typedArray.getString(R.styleable.SubjectChip_chipText);
            typedArray.recycle();

            if (text != null) {
                setChipText(text);
            }
        }


        this.setOnClickListener(v -> {
            // Toggle the clicked state and update background color accordingly
            isClicked = !isClicked;
            updateBackgroundColor();
            if(chipClickListener != null) {
                chipClickListener.onChipClicked(SubjectChipHomeView.this);
            }
        });
    }
    // ChatGPT usage: Yes
    private void updateBackgroundColor() {
        if (isClicked) {
            setBackgroundColor(Color.parseColor("#A9A9A9")); // Dark Grey color when clicked
        } else {
            setBackgroundColor(Color.TRANSPARENT); // Reset to original or transparent color
        }
    }

    public String getText() {
        if (textView != null) {
            return textView.getText().toString();
        }
        return null;
    }


}
