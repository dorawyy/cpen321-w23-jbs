package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class SubjectChipView extends RelativeLayout {

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

    }

    public String getText() {
        if (textView != null) {
            return textView.getText().toString();
        }
        return null;
    }
}