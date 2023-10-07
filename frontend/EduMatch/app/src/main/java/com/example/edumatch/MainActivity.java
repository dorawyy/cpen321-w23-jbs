package com.example.edumatch;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;

public class MainActivity extends AppCompatActivity {
    private EditText enterUserEditText;
    private Button signInButton;
    private Button googleSignInButton;

    private GoogleSignInAccount account;
    private GoogleSignInClient mGoogleSignInClient;
    final static String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // Replace 'your_layout' with the actual layout XML file name

        // Find the EditText view by its ID
        enterUserEditText = findViewById(R.id.enteruser);

        // Find the Button view by its ID (if you have a submit button)
        signInButton = findViewById(R.id.signin_button); // Replace with your actual button ID


        // Set an OnClickListener for the submit button (if you have one)
        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Get the user input from the EditText
                String userInput = enterUserEditText.getText().toString();

                // Do something with the user input, for example, display it in a Toast
                Toast.makeText(MainActivity.this, "User input: " + userInput, Toast.LENGTH_SHORT).show();
            }
        });

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        googleSignInButton = findViewById(R.id.google_sign_in_button);

        googleSignInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Get the user input from the EditText
                signIn();
            }
        });


    }

    private void signIn() {
        if(account == null){
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            signInActivityResultLauncher.launch(signInIntent);
        } else{
            Toast.makeText(MainActivity.this, "Already signed in!", Toast.LENGTH_LONG).show();
        }

    }

    ActivityResultLauncher<Intent> signInActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                    handleSignInResult(task);
                }
            }
    );


    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            account = completedTask.getResult(ApiException.class);

            // Signed in successfully, show authenticated UI.

            Toast.makeText(MainActivity.this, "Successful Sign In" + account.getId(), Toast.LENGTH_LONG).show();
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
        }
    }
}