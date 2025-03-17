package com.example.neighbornetbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean is_read;

    @JsonIgnore // Ignore the actual Instant field during serialization
    private Instant createdAt;

    public NotificationDTO() {
    }

    public NotificationDTO(String title, String message, String type) {
        this.title = title;
        this.message = message;
        this.type = type;
        this.is_read = false;
        this.createdAt = Instant.now();
    }

    public NotificationDTO(Long id, String title, String message, String type, boolean is_read, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.is_read = is_read;
        this.createdAt = createdAt;
    }

    // Add this method to format the date for JSON
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public String getFormattedCreatedAt() {
        if (createdAt == null) return null;
        return LocalDateTime.ofInstant(createdAt, ZoneId.systemDefault())
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    // Regular getters and setters
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

    @JsonIgnore // Ignore this getter during serialization
    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
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