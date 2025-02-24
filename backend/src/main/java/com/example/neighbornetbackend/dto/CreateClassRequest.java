package com.example.neighbornetbackend.dto;


import com.example.neighbornetbackend.model.CourseClass;

import java.util.List;

public class CreateClassRequest {

    private String title;
    private String description;
    private String thumbnailDescription;
    private String duration;
    private String customCategory;
    private CourseClass.DifficultyLevel difficulty;
    private String category;
    private String creatorName;
    private String creatorEmail;
    private String creatorPhone;
    private String creatorCredentials;
    private String linkedinUrl;
    private String portfolioUrl;
    private List<String> requirements;
    private List<CourseClass.Section> sections;

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

    public String getThumbnailDescription() {
        return thumbnailDescription;
    }

    public void setThumbnailDescription(String thumbnailDescription) {
        this.thumbnailDescription = thumbnailDescription;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
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

    public String getCreatorPhone() {
        return creatorPhone;
    }

    public void setCreatorPhone(String creatorPhone) {
        this.creatorPhone = creatorPhone;
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

    public String getCreatorCredentials() {
        return creatorCredentials;
    }

    public void setCreatorCredentials(String creatorCredentials) {
        this.creatorCredentials = creatorCredentials;
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

    public String getCustomCategory() {
        return customCategory;
    }

    public void setCustomCategory(String customCategory) {
        this.customCategory = customCategory;
    }
}
