package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String imageUrl;
    private boolean emailVerified;
    private LocalDateTime createdDate;
    private String status; // active, inactive, pending
    private String bio;
    private String githubUrl;
    private String twitterUrl;
    private String linkedinUrl;
    private String facebookUrl;
    private LocalDateTime deletionDate;
    private LocalDateTime scheduledDeletionDate;

    // Constructor
    public UserResponse(Long id, String username, String email, String role,
                        String imageUrl, boolean emailVerified, LocalDateTime createdDate,
                        String bio, String githubUrl, String twitterUrl,
                        String linkedinUrl, String facebookUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.imageUrl = imageUrl;
        this.emailVerified = emailVerified;
        this.createdDate = createdDate;
        this.status = emailVerified ? "active" : "pending";
        this.bio = bio;
        this.githubUrl = githubUrl;
        this.twitterUrl = twitterUrl;
        this.linkedinUrl = linkedinUrl;
        this.facebookUrl = facebookUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getTwitterUrl() {
        return twitterUrl;
    }

    public void setTwitterUrl(String twitterUrl) {
        this.twitterUrl = twitterUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(String facebookUrl) {
        this.facebookUrl = facebookUrl;
    }

    public LocalDateTime getDeletionDate() {
        return deletionDate;
    }

    public void setDeletionDate(LocalDateTime deletionDate) {
        this.deletionDate = deletionDate;
    }

    public LocalDateTime getScheduledDeletionDate() {
        return scheduledDeletionDate;
    }

    public void setScheduledDeletionDate(LocalDateTime scheduledDeletionDate) {
        this.scheduledDeletionDate = scheduledDeletionDate;
    }
}