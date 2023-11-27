package com.example.edumatch.activities;

import static com.example.edumatch.util.AdminHelper.getAdminHome;
import static com.example.edumatch.util.RecommendationHelper.updateWhenTuteeChecksTutor;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.AdminListComponent;
import com.example.edumatch.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// ChatGPT usage: Yes
public class AdminHomeActivity extends AppCompatActivity {
    StringBuilder apiUrlBuilder;
    String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_home);

//        Button logOut = findViewById(R.id.logOut);
//        logOut.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                clearPreferences();
//                Intent newIntent = new Intent(AdminHomeActivity.this,
//                        MainActivity.class);
//                startActivity(newIntent);
//
//            }
//        });
//
//        apiUrlBuilder = new StringBuilder(apiUrl);
//        apiUrlBuilder.append("/admin/users");
//
//        JSONObject jsonResponse = getAdminHome(apiUrlBuilder,AdminHomeActivity.this);
//
//        try {
//            JSONArray usersArray = jsonResponse.getJSONArray("users");
//            Log.d("adminG", usersArray.toString());
//
//            LinearLayout linearLayout = findViewById(R.id.adminListComponentContainer);
//
//            for (int i = 0; i < usersArray.length(); i++) {
//                JSONObject user = usersArray.getJSONObject(i);
//
//                AdminListComponent adminListComponent = new AdminListComponent(this);
//                adminListComponent.populate(user);
//                adminListComponent.setNameText(user.getString("displayedName"));
//                if (user.getString("username").equals("")) {
//                    adminListComponent.setUsernameText("Signed in with Google");
//                } else {
//                    adminListComponent.setUsernameText(user.getString("username"));
//                }
//                adminListComponent.setType(user.getString("type"));
//                LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
//                        LinearLayout.LayoutParams.MATCH_PARENT,
//                        LinearLayout.LayoutParams.WRAP_CONTENT
//                );
//                layoutParams.setMargins(0, 16, 0, 16);
//                adminListComponent.setLayoutParams(layoutParams);
//
//                adminListComponent.setOnClickListener(new View.OnClickListener() {
//                    @Override
//                    public void onClick(View v) {
//                        Intent profileIntent = new Intent(AdminHomeActivity.this, ProfileActivity.class);
//                        try {
//                            profileIntent.putExtra("USER_ID", user.getString("username"));
//                        } catch (JSONException e) {
//                            profileIntent.putExtra("USER_ID", "");
//                        }
//                        startActivity(profileIntent);
//                    }
//                });
//
//                linearLayout.addView(adminListComponent);
//            }
//        } catch (JSONException e) {
//            Toast.makeText(AdminHomeActivity.this, "No users yet!", Toast.LENGTH_SHORT).show();
//        }

    }
    // ChatGPT usage: Yes
    private void clearPreferences() {
        Context context = getApplicationContext();
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();

        editor.clear();
        editor.apply();
    }


}