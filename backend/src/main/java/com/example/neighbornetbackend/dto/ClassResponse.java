package com.example.neighbornetbackend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.neighbornetbackend.model.Class;

public class ClassResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String thumbnailDescription;
    private String duration;
    private Class.DifficultyLevel difficulty;
    private String category;
    private String creatorName;
    private String creatorEmail;
    private List<String> requirements;
    private String status;
    private int enrolledCount;
    private double rating;
    private List<Class.Section> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LessonResponse> lessons;

    public static ClassResponse fromEntity(Class classEntity) {
        ClassResponse response = new ClassResponse();
        response.setId(classEntity.getId());
        response.setTitle(classEntity.getTitle());
        response.setDescription(classEntity.getDescription());
        response.setThumbnailUrl(classEntity.getThumbnailUrl());
        response.setThumbnailDescription(classEntity.getThumbnailDescription());
        response.setDuration(classEntity.getDuration());
        response.setDifficulty(classEntity.getDifficulty());
        response.setCategory(classEntity.getCategory());
        response.setCreatorName(classEntity.getCreatorName());
        response.setCreatorEmail(classEntity.getCreatorEmail());
        response.setRequirements(classEntity.getRequirements());
        response.setSections(classEntity.getSections());
        response.setCreatedAt(classEntity.getCreatedAt());
        response.setUpdatedAt(classEntity.getUpdatedAt());
        return response;

    }

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

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getThumbnailDescription() {
        return thumbnailDescription;
    }

    public void setThumbnailDescription(String thumbnailDescription) {
        this.thumbnailDescription = thumbnailDescription;
    }

    public Class.DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Class.DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public String getCreatorEmail() {
        return creatorEmail;
    }

    public void setCreatorEmail(String creatorEmail) {
        this.creatorEmail = creatorEmail;
    }

    public List<String> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<String> requirements) {
        this.requirements = requirements;
    }

    public List<Class.Section> getSections() {
        return sections;
    }

    public void setSections(List<Class.Section> sections) {
        this.sections = sections;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getEnrolledCount() {
        return enrolledCount;
    }

    public void setEnrolledCount(int enrolledCount) {
        this.enrolledCount = enrolledCount;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public List<LessonResponse> getLessons() {
        return lessons;
    }

    public void setLessons(List<LessonResponse> lessons) {
        this.lessons = lessons;
    }
}
