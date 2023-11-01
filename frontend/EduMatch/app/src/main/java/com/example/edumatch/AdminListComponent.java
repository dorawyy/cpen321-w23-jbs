package com.example.edumatch;

import static com.example.edumatch.util.AdminHelper.banUser;
import static com.example.edumatch.util.AdminHelper.unbanUser;

import android.content.Context;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

public class AdminListComponent extends LinearLayout {

    private TextView nameTextView;
    private TextView typeTextView;
    private TextView usernameTextView;
    private Button activeButton;

    public AdminListComponent(Context context) {
        super(context);
        init(context);
    }

    public AdminListComponent(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }

    public AdminListComponent(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    private void init(Context context) {
        // Inflate the layout
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View view = inflater.inflate(R.layout.admin_list_component, this, true);

        // Reference the views
        nameTextView = view.findViewById(R.id.nameTextView);
        usernameTextView = view.findViewById(R.id.usernameTextView);
        activeButton = view.findViewById(R.id.activeButton);
        typeTextView = view.findViewById(R.id.userType);

        // Setup the button listener
        activeButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                Button button = (Button) v;
                String currentStatus = button.getText().toString();
                String userId = (String) button.getTag();

                if ("ACTIVE".equalsIgnoreCase(currentStatus)) {
                    button.setText("BANNED");
                    banUser(userId, context);
                } else {
                    button.setText("ACTIVE");
                    unbanUser(userId, context);
                }
            }
        });
    }

    public void populate(JSONObject user) throws JSONException {

        if (user.getString(("isBanned")) == "true") {
            activeButton.setText("Banned");
        } else {
            activeButton.setText("Active");
        }

        activeButton.setTag(user.getString("userId"));
    }

    public void setNameText(String name) {
        nameTextView.setText(name);
    }
    public void setType(String name) {
        typeTextView.setText(name);
    }

    public void setUsernameText(String username) {
        usernameTextView.setText(username);
    }

    public void setActiveButtonText(String text) {
        activeButton.setText(text);
    }
}
