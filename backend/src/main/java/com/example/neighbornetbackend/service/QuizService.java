package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.model.*;
import java.util.List;

public interface QuizService {
    QuizResponse createQuiz(Long classId, QuizRequest request, Long userId);
    QuizResponse getQuiz(Long quizId, Long userId);
    List<QuizResponse> getQuizzesByClass(Long classId);
    QuizResponse updateQuiz(Long quizId, QuizRequest request, Long userId);
    void deleteQuiz(Long quizId, Long userId);
    QuizAttemptResponse startQuizAttempt(Long quizId, Long userId);
    QuizAttemptResponse submitQuizAttempt(Long quizId, Long attemptId, QuizAttemptRequest request, Long userId);
    List<QuizAttemptResponse> getQuizAttempts(Long quizId, Long userId);
}