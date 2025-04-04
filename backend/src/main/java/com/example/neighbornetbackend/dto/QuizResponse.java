package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Quiz;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private Integer timeLimit;
    private Integer passingScore;
    private List<QuestionResponse> questions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer bestScore;
    private Boolean hasPassed;
    private Integer attemptCount;

    public static QuizResponse fromEntity(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setTimeLimit(quiz.getTimeLimit());
        response.setPassingScore(quiz.getPassingScore());
        response.setCreatedAt(quiz.getCreatedAt());
        response.setUpdatedAt(quiz.getUpdatedAt());

        response.setQuestions(quiz.getQuestions().stream()
                .map(QuestionResponse::fromEntity)
                .collect(Collectors.toList()));

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

    public Integer getTimeLimit() {
        return timeLimit;
    }

    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }

    public List<QuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResponse> questions) {
        this.questions = questions;
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

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Boolean getHasPassed() {
        return hasPassed;
    }

    public void setHasPassed(Boolean hasPassed) {
        this.hasPassed = hasPassed;
    }

    public Integer getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(Integer attemptCount) {
        this.attemptCount = attemptCount;
    }
}