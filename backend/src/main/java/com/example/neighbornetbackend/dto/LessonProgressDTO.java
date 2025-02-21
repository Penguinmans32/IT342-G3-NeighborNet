package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.LessonProgress;
import java.time.LocalDateTime;

public class LessonProgressDTO {
    private Long id;
    private Long lessonId;
    private Long classId;
    private boolean completed;
    private Long lastWatchedPosition;
    private LocalDateTime completedAt;
    private LocalDateTime updatedAt;

    public static LessonProgressDTO fromEntity(LessonProgress progress) {
        LessonProgressDTO dto = new LessonProgressDTO();
        dto.setId(progress.getId());
        dto.setLessonId(progress.getLesson().getId());
        dto.setClassId(progress.getClassEntity().getId());
        dto.setCompleted(progress.isCompleted());
        dto.setLastWatchedPosition(progress.getLastWatchedPosition());
        dto.setCompletedAt(progress.getCompletedAt());
        dto.setUpdatedAt(progress.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public Long getLastWatchedPosition() {
        return lastWatchedPosition;
    }

    public void setLastWatchedPosition(Long lastWatchedPosition) {
        this.lastWatchedPosition = lastWatchedPosition;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}