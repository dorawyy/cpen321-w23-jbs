package com.example.edumatch.activities;

import static com.example.edumatch.util.AdminHelper.getAdminHome;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.LinearLayout;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.AdminListComponent;
import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AdminHomeActivity extends AppCompatActivity {
    StringBuilder apiUrlBuilder;
    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_home);

        apiUrlBuilder = new StringBuilder(apiUrl);
        apiUrlBuilder.append("/admin/users");

        JSONObject jsonResponse = getAdminHome(apiUrlBuilder,AdminHomeActivity.this);
        SharedPreferences sharedPreferences = this.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        try {
            JSONArray usersArray = jsonResponse.getJSONArray("users"); // assuming the key is "users"

            LinearLayout linearLayout = findViewById(R.id.adminListComponentContainer); // replace with your LinearLayout's ID

            for (int i = 0; i < usersArray.length(); i++) {
                JSONObject user = usersArray.getJSONObject(i);

                AdminListComponent adminListComponent = new AdminListComponent(this);
                adminListComponent.populate(user);
                adminListComponent.setNameText(user.getString("displayedName"));
                adminListComponent.setUsernameText(user.getString("username"));
                adminListComponent.setType(user.getString("type"));
                LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                );
                layoutParams.setMargins(0, 16, 0, 16); // 16dp top and bottom margins
                adminListComponent.setLayoutParams(layoutParams);

                linearLayout.addView(adminListComponent);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

    }


}