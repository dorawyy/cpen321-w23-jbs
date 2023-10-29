package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.LinearLayout;

import com.example.edumatch.R;

public class AppBarCustomView extends LinearLayout {

    public AppBarCustomView(Context context) {
        super(context);
        init(context);
    }

    public AppBarCustomView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AppBarCustomView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        LayoutInflater.from(context).inflate(R.layout.empty_bar, this, true);
        // Initialization code, e.g., findViewById, listeners, etc.
    }
}