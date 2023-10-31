package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.widget.RelativeLayout;
import android.widget.TextView;
import com.example.edumatch.R;

public class MessageChipView extends RelativeLayout {
    private TextView textView;
    private RelativeLayout chipLayout; // Reference to the RelativeLayout

    private boolean isUserMessage;


    public MessageChipView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    public MessageChipView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    public MessageChipView(Context context) {
        super(context);
        init(context, null);
    }


    public void setChipText(String text) {
        if (textView != null) {
            textView.setText(text);
        }
        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        layoutParams.setMargins(0, 4, 0, 4);
        chipLayout.setLayoutParams(layoutParams);
    }

    public boolean getIsUserMessage() {
        return isUserMessage;
    }

    public void setIsReceiver(Boolean isReceiver) {
        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
        );
        layoutParams.setMargins(0, 4, 0, 4);
        chipLayout.setLayoutParams(layoutParams);
        if (isReceiver) {
            chipLayout.setBackgroundResource(R.drawable.received_message);
            // Adjust layout parameters for received messages, e.g., gravity, margins, etc.
            layoutParams = (RelativeLayout.LayoutParams) chipLayout.getLayoutParams();
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_LEFT);
            isUserMessage = false;
        } else {
            chipLayout.setBackgroundResource(R.drawable.sent_message);
            // Adjust layout parameters for sent messages, e.g., gravity, margins, etc.
            layoutParams = (RelativeLayout.LayoutParams) chipLayout.getLayoutParams();
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
            isUserMessage = true;
        }
    }


    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.chat_chip_component, this, true);

        // Find the TextView and the RelativeLayout inside the custom layout
        textView = findViewById(R.id.text);
        chipLayout = findViewById(R.id.message_chip);

        // Set the fixed width to 200dp
        RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.WRAP_CONTENT, // Replace with your dimension resource
                RelativeLayout.LayoutParams.WRAP_CONTENT
        );

        // Additional parameters for message_chip
        layoutParams.setMargins(0, 4, 0, 4);
        chipLayout.setBackgroundResource(R.drawable.sent_message);

        // Apply the layout parameters to chipLayout
        chipLayout.setLayoutParams(layoutParams);

        // Retrieve and set the text attribute if it's provided
        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.MessageChip);
            String text = typedArray.getString(R.styleable.MessageChip_messageText);
            typedArray.recycle();

            if (text != null) {
                setChipText(text);
            }
        }
    }
}
