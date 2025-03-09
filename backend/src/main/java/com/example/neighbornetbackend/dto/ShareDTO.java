package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;

public class ShareDTO {
    private Long id;
    private UserDTO sharedBy;
    private PostDTO originalPost;
    private LocalDateTime sharedAt;

    public ShareDTO(Long id, UserDTO sharedBy, PostDTO originalPost, LocalDateTime sharedAt) {
        this.id = id;
        this.sharedBy = sharedBy;
        this.originalPost = originalPost;
        this.sharedAt = sharedAt;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getSharedBy() {
        return sharedBy;
    }

    public void setSharedBy(UserDTO sharedBy) {
        this.sharedBy = sharedBy;
    }

    public PostDTO getOriginalPost() {
        return originalPost;
    }

    public void setOriginalPost(PostDTO originalPost) {
        this.originalPost = originalPost;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }
}