package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.LinearLayout;
import android.widget.RatingBar;
import android.widget.TextView;

import com.example.edumatch.R;

public class TutorReviewChip extends LinearLayout {

    private RatingBar ratingBar;
    private TextView subjectTextView;
    private TextView commentTitleTextView;
    private TextView commentDescriptionTextView;

    public TutorReviewChip(Context context) {
        super(context);
        init(context);
    }

    public TutorReviewChip(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.tutor_review_chip, this, true);

        ratingBar = findViewById(R.id.ratingBar);
        subjectTextView = findViewById(R.id.subjectText);
        commentTitleTextView = findViewById(R.id.commentTitleText);
        commentDescriptionTextView = findViewById(R.id.commentDescriptionText);
    }

    public void setRating(float rating) {
        ratingBar.setRating(rating);
    }

    public void setSubject(String subject) {
        subjectTextView.setText(subject);
    }

    public void setCommentTitle(String title) {
        commentTitleTextView.setText(title);
    }

    public void setCommentDescription(String description) {
        commentDescriptionTextView.setText(description);
    }
}
