package com.example.neighbornetbackend.dto;

public class ReactionRequest {
    private boolean helpful;

    public boolean isHelpful() {
        return helpful;
    }

    public void setHelpful(boolean helpful) {
        this.helpful = helpful;
    }
}