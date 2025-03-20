package com.example.neighbornetbackend.dto;

public class AchievementResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private boolean unlocked;
    private int currentProgress;
    private int requiredProgress;
    private String unlockedAt;

    public AchievementResponse(Long id, String name, String description, String icon, boolean unlocked, int currentProgress, int requiredProgress, String unlockedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.unlocked = unlocked;
        this.currentProgress = currentProgress;
        this.requiredProgress = requiredProgress;
        this.unlockedAt = unlockedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isUnlocked() {
        return unlocked;
    }

    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }

    public int getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(int currentProgress) {
        this.currentProgress = currentProgress;
    }

    public int getRequiredProgress() {
        return requiredProgress;
    }

    public void setRequiredProgress(int requiredProgress) {
        this.requiredProgress = requiredProgress;
    }

    public String getUnlockedAt() {
        return unlockedAt;
    }

    public void setUnlockedAt(String unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
}