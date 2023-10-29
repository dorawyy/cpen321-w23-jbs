package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.graphics.Color; // import Color class

import com.example.edumatch.R;

public class SubjectChipView extends RelativeLayout {
    public interface ChipClickListener {
        void onChipClicked(SubjectChipView chipView);
    }

    private ChipClickListener chipClickListener;

    public void setChipClickListener(ChipClickListener listener) {
        this.chipClickListener = listener;
    }

    private TextView textView;
    public Button removeButton; // Add a reference to the remove button

    public boolean isClicked = false;

    private OnChipRemovedListener chipRemovedListener;

    public interface OnChipRemovedListener {
        void onChipRemoved(String course);
    }
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

    public void hideRemoveButton() {
            removeButton.setVisibility(View.GONE);
    }


    public void setChipRemovedListener(OnChipRemovedListener listener) {
        this.chipRemovedListener = listener;
    }

    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.subject_chip_component, this, true);

        // Find the TextView and the remove button inside the custom layout
        textView = findViewById(R.id.text);
        removeButton = findViewById(R.id.remove_subject_button);
        isClicked = false;

        // Set an OnClickListener for the remove button
        if (removeButton != null) {
            removeButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (getParent() instanceof ViewGroup) {
                        ViewGroup parentView = (ViewGroup) getParent();
                        String removedCourse = textView.getText().toString();
                        parentView.removeView(SubjectChipView.this);
                        if (chipRemovedListener != null) {
                            chipRemovedListener.onChipRemoved(removedCourse);
                        }
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
        this.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Toggle the clicked state and update background color accordingly
                isClicked = !isClicked;
                updateBackgroundColor();
                if(chipClickListener != null) {
                    chipClickListener.onChipClicked(SubjectChipView.this);
                }
            }
        });
    }

    private void updateBackgroundColor() {
        if (isClicked) {
            setBackgroundColor(Color.parseColor("#A9A9A9")); // Dark Grey color when clicked
        } else {
            setBackgroundColor(Color.TRANSPARENT); // Reset to original or transparent color
        }
    }
}