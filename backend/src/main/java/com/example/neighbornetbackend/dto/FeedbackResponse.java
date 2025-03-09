package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Feedback;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long id;
    private String content;
    private Integer rating;
    private String userName;
    private String userImage;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime createdAt;

    public static FeedbackResponse fromEntity(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setContent(feedback.getContent());
        response.setRating(feedback.getRating());
        if (feedback.getUser() != null) {
            response.setUserName(feedback.getUser().getUsername());
            response.setUserImage(feedback.getUser().getImageUrl());
        }
        response.setCreatedAt(feedback.getCreatedAt());
        return response;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}