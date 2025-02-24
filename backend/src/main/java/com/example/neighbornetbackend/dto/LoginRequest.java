package com.example.neighbornetbackend.dto;


public class LoginRequest {
    private String username;
    private String password;

    public String getUsername() {
        return username != null ? username.trim() : null;
    }

    public void setUsername(String username) {
        this.username = username != null ? username.trim() : null;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
