package com.example.edumatch.util;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.net.ssl.HttpsURLConnection;

public class NetworkUtils {
    private static final String TAG = "NetworkUtils";

    public interface DataCallback {
        void onDataFetched(String result) throws JSONException;
    }

    public static void fetchDataFromBackend(String apiUrl, DataCallback callback) {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Handler handler = new Handler(Looper.getMainLooper());

        executor.execute(() -> {
            try {
                // Perform your network operation here
                URL url = new URL(apiUrl);
                HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");

                int responseCode = connection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(connection.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    String result = response.toString();

                    handler.post(() -> {
                        Log.d(TAG, result);
                        Log.d(TAG, "FINISHED GETTING\n");
                        // Notify the caller with the fetched data
                        try {
                            callback.onDataFetched(result);
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    });
                } else {
                    Log.d(TAG, "No HTTP OK code: " + responseCode);
                    // Handle the error case
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }

    public static JSONObject postDataToBackend(String apiUrl, JSONObject requestBody, String accessToken) {
        ExecutorService executor = Executors.newSingleThreadExecutor();

        CompletableFuture<JSONObject> future = new CompletableFuture<>();

        executor.execute(() -> {
            try {
                URL url = new URL(apiUrl);
                HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/json");

                // Add the Authorization header with the access token
                connection.setRequestProperty("Authorization", "Bearer " + accessToken);

                connection.setConnectTimeout(10000);
                connection.setReadTimeout(10000);

                try (OutputStream os = connection.getOutputStream()) {
                    byte[] input = requestBody.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }

                int responseCode = connection.getResponseCode();
                if (responseCode == HttpsURLConnection.HTTP_OK) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;

                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();
                    String result = response.toString();

                    JSONObject jsonResponse = new JSONObject(result);

                    future.complete(jsonResponse);
                } else {
                    // Handle the error case
                    Log.e("SignUpPost", "HTTP request failed with status code: " + responseCode);

                    JSONObject errorResponse = new JSONObject();
                    errorResponse.put("error", "HTTP request failed with status code: " + responseCode);

                    // Attempt to read and include the error message from the response content
                    try (BufferedReader errorReader = new BufferedReader(
                            new InputStreamReader(connection.getErrorStream()))) {
                        StringBuilder errorResponseContent = new StringBuilder();
                        String line;
                        while ((line = errorReader.readLine()) != null) {
                            errorResponseContent.append(line);
                        }
                        errorResponse.put("errorDetails", errorResponseContent.toString());
                    } catch (IOException e) {
                        errorResponse.put("errorDetails", "Error details not available.");
                    }

                    future.complete(errorResponse);
                }
            } catch (IOException | JSONException e) {
                // Handle exceptions
                Log.e("SignUpPost", "Exception: " + e.getMessage());
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
}

