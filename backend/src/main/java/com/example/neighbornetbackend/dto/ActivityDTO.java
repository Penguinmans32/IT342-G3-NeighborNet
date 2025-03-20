package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Activity;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ActivityDTO {
    private Long id;
    private String type;
    private String title;
    private String description;
    private String icon;
    private String createdAt;
    private Long referenceId;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    // Default constructor
    public ActivityDTO() {
    }

    // Constructor with all fields
    public ActivityDTO(Long id, String type, String title, String description,
                       String createdAt, String icon, Long referenceId) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.icon = icon;
        this.referenceId = referenceId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        // Format the date as ISO-8601 string
        this.createdAt = createdAt.toString();
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    // Static factory method to create from Activity entity
    public static ActivityDTO fromEntity(Activity activity) {
        return new ActivityDTO(
                activity.getId(),
                activity.getType(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getCreatedAt().format(formatter), // Convert LocalDateTime to String
                activity.getIcon(),
                activity.getReferenceId()
        );
    }
}