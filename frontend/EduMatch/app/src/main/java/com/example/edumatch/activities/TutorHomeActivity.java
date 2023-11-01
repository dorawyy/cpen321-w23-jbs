package com.example.edumatch.activities;

import static com.example.edumatch.util.AppointmentHelper.getAppointments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class TutorHomeActivity extends AppCompatActivity {

    String tutorId;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tutor_home);
        JSONObject appointments = getAppointments(TutorHomeActivity.this);
        try {
            makeComponents(appointments.getJSONArray("appointments"));
        } catch (JSONException e) {
            Toast.makeText(TutorHomeActivity.this, "You have no appointments yet!", Toast.LENGTH_SHORT).show();
        }

    }
    private void initializeChat() {
        FloatingActionButton fabChat = findViewById(R.id.fabChat);
        fabChat.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(TutorHomeActivity.this, ChatListActivity.class);
                startActivity(intent);
            }
        });
    }

    private void makeComponents(JSONArray appointments) {
        LinearLayout adminListComponentContainer = findViewById(R.id.adminListComponentContainer);
        try {
            for (int i = 0; i < appointments.length(); i++) {
                JSONObject appointmentObject = appointments.getJSONObject(i);
                LayoutInflater inflater = LayoutInflater.from(this);
                View adminListComponent = inflater.inflate(R.layout.tutor_home_list_component, null);
                String apptId = appointmentObject.getString("_id");
                adminListComponent.setTag(apptId);
                String pstStartTime = appointmentObject.getString("pstStartDatetime");
                String pstEndTime = appointmentObject.getString("pstEndDatetime");
                String status = appointmentObject.getString("status");
                JSONArray participantsInfo = appointmentObject.getJSONArray("participantsInfo");
                JSONObject participant = participantsInfo.getJSONObject(2);
                String tutorName = participant.getString("displayedName");
                tutorId = participant.getString("userId");
                String course = appointmentObject.getString("course");
                TextView nameTextView = adminListComponent.findViewById(R.id.name);
                nameTextView.setText(tutorName);

                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
                Date startDate = null;
                Date endDate = null;
                try {
                    startDate = sdf.parse(pstStartTime);
                    endDate = sdf.parse(pstEndTime);
                } catch (ParseException e) {
                    Toast.makeText(this, "Cannot find day", Toast.LENGTH_SHORT).show();
                }

                SimpleDateFormat dateSdf = new SimpleDateFormat("yyyy-MM-dd");
                SimpleDateFormat timeSdf = new SimpleDateFormat("HH:mm");

                String date = dateSdf.format(startDate); // Date
                String startTime = timeSdf.format(startDate); // Start Time
                String endTime = timeSdf.format(endDate); // End Time
                String interval = date + startTime + " - " + endTime;

                TextView dateText = adminListComponent.findViewById(R.id.date);
                dateText.setText(interval);
                TextView subjectTextView = adminListComponent.findViewById(R.id.subject);
                subjectTextView.setText(course);

                Button acceptButton = adminListComponent.findViewById(R.id.accept);
                Button declineButton = adminListComponent.findViewById(R.id.decline);
                acceptButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        // Handle the accept button click here
                        // For example, you can display a message:
                        Toast.makeText(TutorHomeActivity.this, "Accept button clicked!", Toast.LENGTH_SHORT).show();

                        // Additional code for accepting...
                    }
                });

                declineButton.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        // Handle the decline button click here
                        // For example, you can display a message:
                        Toast.makeText(TutorHomeActivity.this, "Decline button clicked!", Toast.LENGTH_SHORT).show();

                    }
                });




                adminListComponentContainer.addView(adminListComponent);


            }
        } catch (JSONException e) {
            Toast.makeText(this, "You have no appointments!", Toast.LENGTH_SHORT).show();
        }
    }

}