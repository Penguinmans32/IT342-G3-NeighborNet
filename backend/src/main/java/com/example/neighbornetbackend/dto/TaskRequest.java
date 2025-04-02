// dto/TaskRequest.java
package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;

public class TaskRequest {
    private String title;
    private String description;
    private LocalDateTime dueDate;

    // Constructor
    public TaskRequest() {
    }

    public TaskRequest(String title) {
        this.title = title;
        this.description = "";
        this.dueDate = null;
    }

    // Getters and setters
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

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}