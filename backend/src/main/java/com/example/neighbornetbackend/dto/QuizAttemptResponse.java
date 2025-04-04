package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.QuizAttempt;
import java.time.LocalDateTime;
import java.util.Map;

public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private Integer score;
    private Integer maxScore;
    private Boolean passed;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Map<String, String> answers;
    private Map<String, String> correctAnswers;
    private Map<String, String> explanations;
    private Boolean isTimeUp;
    private Integer remainingTime;

    public static QuizAttemptResponse fromEntity(QuizAttempt attempt, boolean includeAnswers) {
        QuizAttemptResponse response = new QuizAttemptResponse();
        response.setId(attempt.getId());
        response.setQuizId(attempt.getQuiz().getId());
        response.setQuizTitle(attempt.getQuiz().getTitle());
        response.setScore(attempt.getScore());
        response.setMaxScore(attempt.getMaxScore());
        response.setPassed(attempt.getPassed());
        response.setStartedAt(attempt.getStartedAt());
        response.setCompletedAt(attempt.getCompletedAt());

        if (includeAnswers) {
            response.setAnswers(attempt.getAnswers());
        }

        // Calculate remaining time if quiz has time limit
        if (attempt.getQuiz().getTimeLimit() != null && attempt.getCompletedAt() == null) {
            LocalDateTime deadline = attempt.getStartedAt().plusMinutes(attempt.getQuiz().getTimeLimit());
            LocalDateTime now = LocalDateTime.now();
            if (now.isAfter(deadline)) {
                response.setIsTimeUp(true);
                response.setRemainingTime(0);
            } else {
                response.setIsTimeUp(false);
                response.setRemainingTime((int) java.time.Duration.between(now, deadline).getSeconds());
            }
        }

        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Integer maxScore) {
        this.maxScore = maxScore;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Map<String, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, String> answers) {
        this.answers = answers;
    }

    public Map<String, String> getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Map<String, String> correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Map<String, String> getExplanations() {
        return explanations;
    }

    public void setExplanations(Map<String, String> explanations) {
        this.explanations = explanations;
    }

    public Boolean getIsTimeUp() {
        return isTimeUp;
    }

    public void setIsTimeUp(Boolean timeUp) {
        isTimeUp = timeUp;
    }

    public Integer getRemainingTime() {
        return remainingTime;
    }

    public void setRemainingTime(Integer remainingTime) {
        this.remainingTime = remainingTime;
    }
}