package com.example.edumatch.util;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.net.ssl.HttpsURLConnection;

public class NetworkUtils {

    private static HttpsURLConnection createConnection(String apiUrl, String accessToken, String httpMethod, JSONObject requestBody) throws IOException {
        URL url = new URL(apiUrl);
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
        connection.setRequestMethod(httpMethod);

        connection.setRequestProperty("Content-Type", "application/json");

        // Add the Authorization header with the access token
        if (!accessToken.isEmpty()) {
            connection.setRequestProperty("Authorization", "Bearer " + accessToken);
        }

        connection.setConnectTimeout(10000);
        connection.setReadTimeout(10000);

        if (requestBody != null) {
            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = requestBody.toString().getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
        }

        return connection;
    }

    private static JSONObject handleResponse(HttpsURLConnection connection) throws IOException, JSONException {
        int responseCode = connection.getResponseCode();
        if (responseCode == HttpsURLConnection.HTTP_OK) {
            // Read and parse the response
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;

            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            String result = response.toString();

            return new JSONObject(result);
        } else {
            // Handle the error case
            JSONObject errorResponse = new JSONObject();
            errorResponse.put("error", "HTTP request failed with status code: " + responseCode);

            // Attempt to read and include the error message from the response content
            try (BufferedReader errorReader = new BufferedReader(new InputStreamReader(connection.getErrorStream()))) {
                StringBuilder errorResponseContent = new StringBuilder();
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorResponseContent.append(line);
                }
                errorResponse.put("errorDetails", errorResponseContent.toString());
            } catch (IOException e) {
                errorResponse.put("errorDetails", "Error details not available.");
            }

            return errorResponse;
        }
    }

    public static JSONObject sendHttpRequest(String apiUrl, String accessToken, String httpMethod, JSONObject requestBody) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        CompletableFuture<JSONObject> future = new CompletableFuture<>();
        final String logTag = httpMethod + "Request";

        Log.d(logTag, "Doing " + httpMethod + " request with endpoint " + apiUrl);

        Log.d(logTag, "Access Token " + accessToken);
        executor.execute(() -> {
            try {
                HttpsURLConnection connection = createConnection(apiUrl, accessToken, httpMethod, requestBody);
                JSONObject response = handleResponse(connection);
                future.complete(response);
            } catch (IOException | JSONException e) {
                // Handle exceptions
                Log.e(logTag, "Exception: " + e.getMessage());
                JSONObject errorResponse = new JSONObject();
                try {
                    errorResponse.put("error", "Exception: " + e.getMessage());
                } catch (JSONException ex) {
                    throw new RuntimeException(ex);
                }
                future.complete(errorResponse);
            }
        });

        try {
            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            JSONObject errorResponse = new JSONObject();
            try {
                errorResponse.put("error", "Exception: " + e.getMessage());
            } catch (JSONException ex) {
                throw new RuntimeException(ex);
            }
            return errorResponse;
        }
    }

    public static void showToastOnUiThread(final Context context, final String message) {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(context, message, Toast.LENGTH_SHORT).show();
            }
        });
    }
}

