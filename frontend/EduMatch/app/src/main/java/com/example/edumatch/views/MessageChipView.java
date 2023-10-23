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
    }

    public void setIsReceiver(Boolean isReceiver){
        if (isReceiver) {
            // If the attribute indicates that the message is a receiver
//            int alpha = 128; // 50% transparency
//            int red = 173; // Red component
//            int green = 216; // Green component
//            int blue = 230; // Blue component
//
//            int color = Color.argb(alpha, red, green, blue);
//
//            chipLayout.setBackgroundColor(color);
            chipLayout.setBackgroundResource(R.drawable.received_message);
        } else {
            // If the attribute indicates that the message is not a receiver
            // Create new layout parameters
            RelativeLayout.LayoutParams layoutParams = (RelativeLayout.LayoutParams) chipLayout.getLayoutParams();

// Set the ALIGN_PARENT_RIGHT rule
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_RIGHT);
            chipLayout.setBackgroundResource(R.drawable.sent_message);

        }
    }

    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.chat_chip_component, this, true);

        // Find the TextView and the RelativeLayout inside the custom layout
        textView = findViewById(R.id.text);
        chipLayout = findViewById(R.id.message_chip);

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
