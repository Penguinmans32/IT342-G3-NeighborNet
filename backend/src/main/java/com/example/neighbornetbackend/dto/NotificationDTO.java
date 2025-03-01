// NotificationDTO.java
package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private String title;
    private String message;
    private String type;
    private LocalDateTime createdAt;

    public NotificationDTO() {
    }

    public NotificationDTO(String title, String message, String type) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}