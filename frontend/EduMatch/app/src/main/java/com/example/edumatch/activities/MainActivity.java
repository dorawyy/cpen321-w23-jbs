package com.example.edumatch.activities;

import static com.example.edumatch.util.LoginSignupHelper.printSharedPreferences;
import static com.example.edumatch.util.NetworkUtils.sendHttpRequest;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.edumatch.R;
import com.example.edumatch.views.GoogleIconButtonView;
import com.example.edumatch.views.LabelAndEditTextView;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;
import com.google.api.services.calendar.CalendarScopes;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private boolean useGoogle;
    private GoogleSignInClient mGoogleSignInClient;
    final static String TAG = "MainActivity";

    private String userInput, passwordInput;

    private String authCode, idToken;

    private Boolean newUser;

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

        signInButton.setOnClickListener(v -> handleSignInClick());
    }

    private void initSignUpButton() {
        Button signUpButton = findViewById(R.id.signup_button);

        signUpButton.setOnClickListener(v -> {
            useGoogle = false;
            clearPreferences();
            goToSignUpActivity();
        });
    }

    private void initGoogleSignIn() {
        // Google Sign In / Sign Up


        GoogleIconButtonView googleSignIn = findViewById(R.id.google);

        Button googleSignInButton = googleSignIn.getButton();

        googleSignInButton.setOnClickListener(v -> googleSignIn());

    }

    private void googleSignIn() {

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .requestScopes(new Scope(CalendarScopes.CALENDAR))
                .requestIdToken(getString(R.string.server_client_id))
                .requestServerAuthCode(getString(R.string.server_client_id))
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
        GoogleSignIn.getClient(this, gso).signOut()
                .addOnCompleteListener(this, task -> {
                    if (task.isSuccessful()) {
                        // After signing out, request account selection explicitly
                        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
                        googleSignInActivityResultLauncher.launch(signInIntent);
                    } else {
                        // Handle sign-out error
                        Log.e("GoogleSignIn","Problem Signing Out");
                        throw new RuntimeException();

                    }
                });

        // Request account selection explicitly
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        googleSignInActivityResultLauncher.launch(signInIntent);
    }

    ActivityResultLauncher<Intent> googleSignInActivityResultLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(result.getData());
                handleGoogleSignInResult(task);
            }
    );


    private void handleGoogleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);
            idToken = account.getIdToken();
            authCode = account.getServerAuthCode();
            Log.d("GooglePost", idToken);
            Log.d("GooglePost", "authcode is " + authCode);
            useGoogle = true;
            Boolean success = postGoogleAuth();
            if (success) {

                if(newUser){
                    goToSignUpActivity();
                } else {
                    goToHomePage();
                }
            }
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

        userInput = usernameEditText.getText().toString();
        passwordInput = passwordEditText.getText().toString();

        Boolean success = postSignIn();

        if (success) {
            Log.d("SignInPost", "Sign In Worked");
            goToHomePage();
        }
    }

    private void clearPreferences() {
        Context context = getApplicationContext();
        SharedPreferences sharedPreferences = context.getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();

        editor.clear(); // Clears all the data in the SharedPreferences file
        editor.apply(); // Apply the changes
    }

    private SharedPreferences updatePreferences() {
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean("isEditing", false);
        editor.putBoolean("useGoogle", useGoogle);
        editor.apply();
        return sharedPreferences;
    }

    private void goToSignUpActivity() {
        Intent newIntent = new Intent(MainActivity.this,
                TutorOrTuteeActivity.class);
        SharedPreferences sharedPreferences = updatePreferences();
        printSharedPreferences(sharedPreferences);
        startActivity(newIntent);
    }

    private void goToHomePage(){
        SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);

        String userType = sharedPreferences.getString("userType", ""); // Assuming the key for user type is "type"

        Intent newIntent;
        switch (userType) {
            case "admin":
                newIntent = new Intent(MainActivity.this, AdminHomeActivity.class);
                break;
            case "tutee":
                newIntent = new Intent(MainActivity.this, TuteeHomeActivity.class);
                break;
            case "tutor":
                newIntent = new Intent(MainActivity.this, TutorHomeActivity.class);
                break;
            default:
                // Handle unexpected cases or errors here
                Toast.makeText(this, "Invalid user type", Toast.LENGTH_SHORT).show();
                return;
        }
        startActivity(newIntent);
    }


    private Boolean postSignIn() {
        clearPreferences();
        JSONObject requestBody = constructSignInRequest();// Create your JSON request body
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/api/auth/login";

        JSONObject jsonResponse = sendHttpRequest(apiUrl, "","POST",requestBody);

        try {
            Log.d("SignInPost","response is " + jsonResponse.toString(4));
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        try {
            if (jsonResponse.has("errorDetails")) {
                JSONObject errorDetails = new JSONObject(jsonResponse.getString("errorDetails"));
                if (errorDetails.has("message")) {
                    String message = errorDetails.getString("message");
                    if ("Username or password is incorrect".equals(message)) {
                        // Handle the case where the username already exists
                        runOnUiThread(() -> Toast.makeText(getApplicationContext(), "Username or password is incorrect", Toast.LENGTH_SHORT).show());
                        return false; // Return false to indicate failure
                    }
                }
            } else {
                SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putString("jwtToken", jsonResponse.getString("jwtToken"));
                editor.putString("userType", jsonResponse.getString("type"));
                editor.apply();
                printSharedPreferences(sharedPreferences);
                return true;
            }
            Log.d("SignInPost", jsonResponse.toString());

        } catch (JSONException e) {
            e.printStackTrace();
            return false;
        }
        return false;
    }


    private Boolean postGoogleAuth() {
        clearPreferences();
        JSONObject requestBody = constructGoogleRequest();// Create your JSON request body
        String apiUrl = "https://edumatch.canadacentral.cloudapp.azure.com/api/auth/google";

        JSONObject jsonResponse = sendHttpRequest(apiUrl,"", "POST",requestBody);

        Log.d("GooglePost", "Finished postDataToBackend" + jsonResponse);

        if (jsonResponse != null) {
            try {
                SharedPreferences sharedPreferences = getSharedPreferences("AccountPreferences", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putString("jwtToken", jsonResponse.getString("jwtToken"));
                newUser = jsonResponse.getBoolean("newUser");
                if(jsonResponse.getString("type").equals("null")){
                    Log.d("GooglePost","NULLLL");
                    newUser = true;
                } else{
                    editor.putString("userType", jsonResponse.getString("type"));

                }
                editor.apply();
                printSharedPreferences(sharedPreferences);
                Log.d("GooglePost", jsonResponse.toString());
                return true;
            } catch (JSONException e) {
                e.printStackTrace();
                return false;
            }
        } else {
            Log.d("GooglePost", "jsonResponse was NULL");
            return false;
        }
    }


    private JSONObject constructSignInRequest() {
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("password", passwordInput);
            requestBody.put("username", userInput);

            logRequestToConsole(requestBody, "SignInPost");
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    private JSONObject constructGoogleRequest() {
        try {
            JSONObject requestBody = new JSONObject();
            requestBody.put("idToken", idToken);
            requestBody.put("authCode", authCode);

            logRequestToConsole(requestBody, "GooglePost");
            return requestBody;
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void logRequestToConsole(JSONObject request, String tag) {
        Log.d(tag, "Request JSON: " + request.toString());
    }
}