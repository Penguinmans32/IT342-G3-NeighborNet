package com.example.neighbornetbackend.dto;

public class FirebaseTokenRequest {
    private String token;

    public FirebaseTokenRequest() {}

    public FirebaseTokenRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}