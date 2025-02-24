package com.example.neighbornetbackend.dto;

public class UpdateProgressRequest {
    private Long lastWatchedPosition;
    private boolean completed;
    private double progress;

    public Long getLastWatchedPosition() {
        return lastWatchedPosition;
    }

    public void setLastWatchedPosition(Long lastWatchedPosition) {
        this.lastWatchedPosition = lastWatchedPosition;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }
}