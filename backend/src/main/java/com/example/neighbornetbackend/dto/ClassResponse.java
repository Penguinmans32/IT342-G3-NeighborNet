package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.CourseClass;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


public class ClassResponse {

    private Long id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String thumbnailDescription;
    private String duration;
    private CourseClass.DifficultyLevel difficulty;
    private String category;
    private String creatorName;
    private String creatorEmail;
    private List<String> requirements;
    private String status;
    private int enrolledCount;
    private double rating;
    private List<CourseClass.Section> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LessonResponse> lessons;
    private CreatorDTO creator;
    private double averageRating;
    private long ratingCount;
    private String creator_credentials;
    private String linkedinUrl;
    private String portfolioUrl;
    private String phone_number;
    private boolean isSaved;


    public static ClassResponse fromEntity(CourseClass classEntity) {
        if (classEntity == null) return null;

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
        response.setAverageRating(classEntity.getAverageRating());
        response.setRatingCount(classEntity.getRatingCount());
        response.setEnrolledCount(classEntity.getEnrolledCount());
        response.setCreator_credentials(classEntity.getCreatorCredentials());
        response.setLinkedinUrl(classEntity.getLinkedinUrl());
        response.setPortfolioUrl(classEntity.getPortfolioUrl());
        response.setPhone_number(classEntity.getCreatorPhone());
        response.setLessons(new ArrayList<>());
        if (classEntity.getCreator() != null) {
            try {
                response.setCreator(new CreatorDTO(
                        classEntity.getCreator().getId(),
                        classEntity.getCreator().getUsername(),
                        classEntity.getCreator().getImageUrl(),
                        classEntity.getCreator().getEmail()
                ));
            } catch (Exception e) {
                // Log the error and set a default creator if needed
                System.err.println("Error mapping creator: " + e.getMessage());
            }
        }
        return response;

    }

    public static ClassResponse fromEntity(CourseClass courseClass, boolean isSaved) {
        ClassResponse response = fromEntity(courseClass);
        response.setSaved(isSaved);
        return response;
    }

    public boolean isSaved() {
        return isSaved;
    }

    public void setSaved(boolean saved) {
        isSaved = saved;
    }

    public Long getCreatorId() {
        return creator != null ? creator.getId() : null;
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

    public CourseClass.DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(CourseClass.DifficultyLevel difficulty) {
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

    public List<CourseClass.Section> getSections() {
        return sections;
    }

    public void setSections(List<CourseClass.Section> sections) {
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

    public CreatorDTO getCreator() {
        return creator;
    }

    public void setCreator(CreatorDTO creator) {
        this.creator = creator;
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

    public String getCreator_credentials() {
        return creator_credentials;
    }

    public void setCreator_credentials(String creator_credentials) {
        this.creator_credentials = creator_credentials;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getPhone_number() {
        return phone_number;
    }

    public void setPhone_number(String phone_number) {
        this.phone_number = phone_number;
    }
}
