package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Question;
import com.example.neighbornetbackend.model.Question.QuestionType;
import java.util.List;

public class QuestionResponse {
    private Long id;
    private String content;
    private QuestionType type;
    private Integer points;
    private List<String> options;
    private String explanation;
    private Integer minWords;
    private Integer maxWords;

    public static QuestionResponse fromEntity(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setContent(question.getContent());
        response.setType(question.getType());
        response.setPoints(question.getPoints());

        if (question.getQuestionData() != null) {
            response.setOptions(question.getQuestionData().getOptions());
            response.setExplanation(question.getQuestionData().getExplanation());
            response.setMinWords(question.getQuestionData().getMinWords());
            response.setMaxWords(question.getQuestionData().getMaxWords());
        }

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getMinWords() {
        return minWords;
    }

    public void setMinWords(Integer minWords) {
        this.minWords = minWords;
    }

    public Integer getMaxWords() {
        return maxWords;
    }

    public void setMaxWords(Integer maxWords) {
        this.maxWords = maxWords;
    }
}