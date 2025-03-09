package com.example.neighbornetbackend.dto;

public class CreatePostRequest {
    private String content;
    private String imageUrl;
    private Long userId;

    // Constructors
    public CreatePostRequest() {}

    public CreatePostRequest(String content, String imageUrl, Long userId) {
        this.content = content;
        this.imageUrl = imageUrl;
        this.userId = userId;
    }

    // Getters and Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}