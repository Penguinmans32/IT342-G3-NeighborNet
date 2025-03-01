// NotificationDTO.java
package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean is_read;
    private LocalDateTime createdAt;

    public NotificationDTO() {
    }

    public NotificationDTO(String title, String message, String type) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.is_read = false;
        this.createdAt = LocalDateTime.now();
    }

    public NotificationDTO(Long id, String title, String message, String type, boolean is_read, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.is_read = is_read;
        this.createdAt = createdAt;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isIs_read() {
        return is_read;
    }

    public void setIs_read(boolean is_read) {
        this.is_read = is_read;
    }
}