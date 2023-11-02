package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class SubjectChipView extends RelativeLayout {
    public interface ChipClickListener {
        void onChipClicked(SubjectChipView chipView);
    }

    private ChipClickListener chipClickListener;

    // ChatGPT usage: Yes
    public void setChipClickListener(ChipClickListener listener) {
        this.chipClickListener = listener;
    }

    private TextView textView;
    public Button removeButton; // Add a reference to the remove button

    public boolean isClicked = false;

    private OnChipRemovedListener chipRemovedListener;

    // ChatGPT usage: Yes
    public interface OnChipRemovedListener {
        void onChipRemoved(String course);
    }

    // ChatGPT usage: Yes
    public SubjectChipView(Context context) {
        super(context);
        init(context, null);
    }

    // ChatGPT usage: Yes
    public SubjectChipView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public SubjectChipView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public void setChipText(String text) {
        if (textView != null) {
            textView.setText(text);
        }
    }

    // ChatGPT usage: Yes
    public void setChipRemovedListener(OnChipRemovedListener listener) {
        this.chipRemovedListener = listener;
    }

    // ChatGPT usage: Yes
    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.subject_chip_component, this, true);

        // Find the TextView and the remove button inside the custom layout
        textView = findViewById(R.id.text);
        removeButton = findViewById(R.id.remove_subject_button);
        isClicked = false;

        // Set an OnClickListener for the remove button
        if (removeButton != null) {
            removeButton.setOnClickListener(v -> {
                if (getParent() instanceof ViewGroup) {
                    ViewGroup parentView = (ViewGroup) getParent();
                    String removedCourse = textView.getText().toString();
                    parentView.removeView(SubjectChipView.this);
                    if (chipRemovedListener != null) {
                        chipRemovedListener.onChipRemoved(removedCourse);
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


        // Inside your onClickListener in SubjectChipView
        this.setOnClickListener(v -> {
            // Toggle the clicked state and update background color accordingly
            isClicked = !isClicked;
            updateBackgroundColor();
            if(chipClickListener != null) {
                chipClickListener.onChipClicked(SubjectChipView.this);
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

    public void hideRemoveSubjectImageView() {
        ImageView removeImageView = findViewById(R.id.remove_subject_imageview);
        if (removeImageView != null) {
            removeImageView.setVisibility(View.GONE);
            removeImageView = null;
        }
        TextView subjectText = findViewById(R.id.text);
        if (subjectText != null) {
            // Get the current layout parameters for the TextView
            RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams) subjectText.getLayoutParams();
            // Remove the left margin (or you can set to any value you want)
            layoutParams.leftMargin = 20;
            // Apply the new layout parameters to the TextView
            subjectText.setLayoutParams(layoutParams);
            // Center the TextView in the parent RelativeLayout
            subjectText.setGravity(Gravity.CENTER);
        }

    }
}