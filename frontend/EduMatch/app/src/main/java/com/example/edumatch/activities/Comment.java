package com.example.edumatch.activities;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class Comment extends LinearLayout {

    private TextView textView;

    public Comment(Context context) {
        super(context);
        init(context);
    }

    private void init(Context context) {
        // Inflate the layout
        View view = LayoutInflater.from(context).inflate(R.layout.comment_layout, this, true);
        textView = view.findViewById(R.id.comment_text);
    }

    public void setText(String text) {
        textView.setText(text);
    }
}
