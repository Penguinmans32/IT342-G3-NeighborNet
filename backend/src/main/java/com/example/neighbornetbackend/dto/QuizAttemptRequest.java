package com.example.neighbornetbackend.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class QuizAttemptRequest {
    @NotNull(message = "Answers are required")
    private Map<String, String> answers;

    public Map<String, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, String> answers) {
        this.answers = answers;
    }
}