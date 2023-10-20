package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printBundle;

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

import com.example.edumatch.views.GoogleIconButtonView;
import com.example.edumatch.views.LabelAndEditTextView;
import com.example.edumatch.R;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;

public class MainActivity extends AppCompatActivity {

    private boolean useGoogle;
    private GoogleSignInAccount account = null;
    private GoogleSignInClient mGoogleSignInClient;
    final static String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initSignInButton();

        initSignUpButton();

        initGoogleSignIn();

    }

    private void initSignInButton() {
        Button signInButton = findViewById(R.id.signin_button);

        signInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleSignInClick();
            }
        });
    }

    private void initSignUpButton() {
        Button signUpButton = findViewById(R.id.signup_button);

        signUpButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                useGoogle = false;
                goToSignUpActivity();
            }
        });
    }

    private void initGoogleSignIn() {
        // Google Sign In / Sign Up
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.server_client_id))
                .requestScopes(new Scope("https://www.googleapis.com/auth/calendar"))
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        GoogleIconButtonView googleSignIn = findViewById(R.id.google);

        Button googleSignInButton = googleSignIn.getButton();

        googleSignInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                googleSignIn();
            }
        });

    }

    private void googleSignIn() {
        if (account == null) {
            Intent signInIntent = mGoogleSignInClient.getSignInIntent();
            googleSignInActivityResultLauncher.launch(signInIntent);
        } else {
            Toast.makeText(MainActivity.this, "Already signed in!", Toast.LENGTH_LONG).show();
        }

    }

    ActivityResultLauncher<Intent> googleSignInActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            new ActivityResultCallback<ActivityResult>() {
                @Override
                public void onActivityResult(ActivityResult result) {
                    Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                    handleGoogleSignInResult(task);
                }
            }
    );


    private void handleGoogleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            account = completedTask.getResult(ApiException.class);

            // Todo: Put IdToken and ServerAuthCode into a server request
            // Todo: If IdToken matches a known user in our database, go to homepage. Else, go to sign up flow
            Toast.makeText(MainActivity.this, "Successful Sign In" + account.getIdToken(), Toast.LENGTH_LONG).show();
            useGoogle = true;
            goToSignUpActivity();


        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
        }
    }


    private void handleSignInClick() {
        LabelAndEditTextView username = findViewById(R.id.username);
        EditText usernameEditText = username.getEnterUserEditText();
        LabelAndEditTextView password = findViewById(R.id.password);
        EditText passwordEditText = password.getEnterUserEditText();

        String userInput = usernameEditText.getText().toString();
        String passwordInput = passwordEditText.getText().toString();

        // Todo: Put username and password in post request to try to signin

        Toast.makeText(MainActivity.this, "User input: " + userInput, Toast.LENGTH_SHORT).show();
        Toast.makeText(MainActivity.this, "Password: " + passwordInput, Toast.LENGTH_SHORT).show();
    }


    private Bundle updateBundle() {
        Bundle userData = new Bundle();
        userData.putBoolean("useGoogle",useGoogle);
        return userData;
    }

    private void goToSignUpActivity() {
        Intent newIntent = new Intent(MainActivity.this, TutorOrTuteeActivity.class);
        Bundle userData = updateBundle();
        printBundle(userData, "");
        newIntent.putExtras(userData);
        startActivity(newIntent);
    }
}