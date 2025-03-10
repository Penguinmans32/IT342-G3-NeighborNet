package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Lesson;
import java.time.LocalDateTime;

public class LessonResponse {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private Long classId;
    private Long parentLessonId;
    private Long nextLessonId;
    private Long prevLessonId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private double averageRating;
    private long ratingCount;
    private boolean completed;

    public static LessonResponse fromEntity(Lesson lesson) {
        LessonResponse response = new LessonResponse();
        response.setId(lesson.getId());
        response.setTitle(lesson.getTitle());
        response.setDescription(lesson.getDescription());
        response.setVideoUrl(lesson.getVideoUrl());
        response.setAverageRating(lesson.getAverageRating());
        response.setRatingCount(lesson.getRatingCount());
        response.setClassId(lesson.getClassEntity().getId());
        if (lesson.getParentLesson() != null) {
            response.setParentLessonId(lesson.getParentLesson().getId());
        }
        response.setCreatedAt(lesson.getCreatedAt());
        response.setUpdatedAt(lesson.getUpdatedAt());
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public Long getParentLessonId() {
        return parentLessonId;
    }

    public void setParentLessonId(Long parentLessonId) {
        this.parentLessonId = parentLessonId;
    }

    public Long getNextLessonId() {
        return nextLessonId;
    }

    public void setNextLessonId(Long nextLessonId) {
        this.nextLessonId = nextLessonId;
    }

    public Long getPrevLessonId() {
        return prevLessonId;
    }

    public void setPrevLessonId(Long prevLessonId) {
        this.prevLessonId = prevLessonId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public long getRatingCount() {
        return ratingCount;
    }

    public void setRatingCount(long ratingCount) {
        this.ratingCount = ratingCount;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}