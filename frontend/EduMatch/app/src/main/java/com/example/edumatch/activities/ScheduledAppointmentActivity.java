package com.example.edumatch.activities;

import static com.example.edumatch.util.AppointmentHelper.getAppointment;
import static com.example.edumatch.util.AppointmentHelper.putAppointment;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import com.example.edumatch.R;
import com.example.edumatch.views.LabelAndCommentTextView;
import org.json.JSONException;
import org.json.JSONObject;

public class ScheduledAppointmentActivity extends AppCompatActivity {
    //TODO: Integrate GET {API_URL}/appointment?appointmentID=123
    //TODO: Integrate PUT {API_URL}/appointment?appointmentID=123 to change status to canceled when user clicks cancel
    //TODO: Get appointmentId from previous view
    String appointmentId;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scheduled_appointment);

        initFields();
        initCancelButton();

    }

    @SuppressLint("SetTextI18n")
    private void initFields() {
        TextView name = findViewById(R.id.name);
        TextView course = findViewById(R.id.course);
        TextView date = findViewById(R.id.date);
        TextView time = findViewById(R.id.time);
        TextView location = findViewById(R.id.location);
        LabelAndCommentTextView comment = findViewById(R.id.comment);
        JSONObject response = getAppointment(ScheduledAppointmentActivity.this,appointmentId);
        if(response != null){
            try {
                if (response.has("otherUserName")) {
                    name.setText(response.getString("otherUserName"));
                }
                if (response.has("course")) {
                    course.setText(response.getString("course"));
                }
                if(response.has("date")){
                    date.setText(response.getString("date"));
                }
                if(response.has("startTime") && response.has("endTime")){
                    time.setText(response.getString("startTime") + "-" + response.getString("endTime"));
                }
                if(response.has("location")){
                    location.setText(response.getString("location"));
                }
                if(response.has("additionalComments")){
                    comment.getContentText().setText(response.getString("additionalComments"));
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private void initCancelButton() {
        Button cancelButton = findViewById(R.id.cancel_button);
        cancelButton.setOnClickListener(v -> goToNewActivity());
    }



    private void goToNewActivity() {
        JSONObject requestBody = constructCancelAppointmentRequest();
        boolean success = putAppointment(ScheduledAppointmentActivity.this,requestBody,appointmentId);
        if (success) {
            // TODO: this goes to list of scheduled appointments
            Intent newIntent = new Intent(ScheduledAppointmentActivity.this, EditProfileListActivity.class);
            startActivity(newIntent);
        }
    }


    public JSONObject constructCancelAppointmentRequest() {
        try {
            // TODO: verify that these are the request params needed
            JSONObject requestBody = new JSONObject();
            requestBody.put("status","canceled");
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }

    }
}