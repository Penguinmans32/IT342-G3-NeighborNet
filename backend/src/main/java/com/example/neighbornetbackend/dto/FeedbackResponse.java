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
    private Integer helpfulCount = 0;
    private Integer reportCount = 0;
    private boolean isHelpful;
    private boolean isReported;
    private boolean canEdit;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime updatedAt;

    public static FeedbackResponse fromEntity(Feedback feedback, Long currentUserId) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setContent(feedback.getContent());
        response.setRating(feedback.getRating());
        if (feedback.getUser() != null) {
            response.setUserName(feedback.getUser().getUsername());
            response.setUserImage(feedback.getUser().getImageUrl());
            response.setCanEdit(feedback.getUser().getId().equals(currentUserId));
        }
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());

        // Handle null counts
        response.setHelpfulCount(feedback.getHelpfulCount() != null ? feedback.getHelpfulCount() : 0);
        response.setReportCount(feedback.getReportCount() != null ? feedback.getReportCount() : 0);

        if (currentUserId != null) {
            feedback.getReactions().stream()
                    .filter(reaction -> reaction.getUser().getId().equals(currentUserId))
                    .findFirst()
                    .ifPresent(reaction -> {
                        if (reaction.isHelpful()) {
                            response.setHelpful(true);
                        } else {
                            response.setReported(true);
                        }
                    });
        }

        return response;
    }


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

    public boolean isCanEdit() {
        return canEdit;
    }

    public void setCanEdit(boolean canEdit) {
        this.canEdit = canEdit;
    }

    public boolean isHelpful() {
        return isHelpful;
    }

    public void setHelpful(boolean helpful) {
        isHelpful = helpful;
    }

    public boolean isReported() {
        return isReported;
    }

    public void setReported(boolean reported) {
        isReported = reported;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getHelpfulCount() {
        return helpfulCount;
    }

    public void setHelpfulCount(Integer helpfulCount) {
        this.helpfulCount = helpfulCount;
    }

    public Integer getReportCount() {
        return reportCount;
    }

    public void setReportCount(Integer reportCount) {
        this.reportCount = reportCount;
    }
}