package com.example.neighbornetbackend.dto;

import java.time.Instant;


public class RatingResponse {

    private Long id;
    private Long classId;
    private Long userId;
    private double rating;
    private Instant createdAt;
    private Instant updatedAt;


    public RatingResponse() {
    }

    public RatingResponse(Long id, Long classId, Long userId, double rating, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.classId = classId;
        this.userId = userId;
        this.rating = rating;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
