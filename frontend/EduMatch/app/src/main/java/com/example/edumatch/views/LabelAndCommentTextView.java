
package com.example.edumatch.views;

import android.content.Context;
import android.content.res.TypedArray;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.widget.GridLayout;
import android.widget.TextView;

import com.example.edumatch.R;

public class LabelAndCommentTextView extends GridLayout {

    private TextView content;

    // ChatGPT usage: Yes
    public LabelAndCommentTextView(Context context) {
        super(context);
        init(context, null);
    }

    // ChatGPT usage: Yes
    public LabelAndCommentTextView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public LabelAndCommentTextView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context, attrs);
    }

    // ChatGPT usage: Yes
    public TextView getContentText() {
        return content;
    }

    // ChatGPT usage: Yes
    private void init(Context context, AttributeSet attrs) {
        LayoutInflater inflater = LayoutInflater.from(context);
        inflater.inflate(R.layout.label_and_comment_text, this, true);

        TextView label = findViewById(R.id.label);
        content = findViewById(R.id.content);

        if (attrs != null) {
            TypedArray typedArray = context.obtainStyledAttributes(attrs, R.styleable.LabelAndTextView);

            String labelText = typedArray.getString(R.styleable.LabelAndTextView_label);
            String contentText = typedArray.getString(R.styleable.LabelAndTextView_contentText);

            typedArray.recycle();

            if (labelText != null) {
                label.setText(labelText);
            }

            if (contentText != null) {
                content.setText(contentText);
            }
        }
    }
}
