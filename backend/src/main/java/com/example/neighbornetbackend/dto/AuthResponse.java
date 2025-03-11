package com.example.neighbornetbackend.dto;


public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";
    private String username;

    public AuthResponse(String accessToken, String refreshToken, String type, String username) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.type = type;
        this.username = username;
    }


    // Getters and Setters
    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
