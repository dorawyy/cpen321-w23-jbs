package com.example.edumatch.views;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageButton;
import android.widget.LinearLayout;

import com.example.edumatch.R;

public class LeftBackBar extends LinearLayout {
    private Runnable onBackClickListener;

    public LeftBackBar(Context context) {
        super(context);
        init(context);
    }

    public LeftBackBar(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public LeftBackBar(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        // Inflating the custom app bar layout
        LayoutInflater.from(context).inflate(R.layout.left_back_header, this, true);

        // Listener for the back button
        ImageButton backButton = findViewById(R.id.back_button);
        backButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                if (onBackClickListener != null) {
                    onBackClickListener.run();
                }
            }
        });
    }

    public void setOnBackClickListener(Runnable onBackClickListener) {
        this.onBackClickListener = onBackClickListener;
    }
}
