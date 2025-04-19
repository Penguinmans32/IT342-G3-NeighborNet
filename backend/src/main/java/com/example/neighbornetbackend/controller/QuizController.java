package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/classes/{classId}/quizzes")
@CrossOrigin
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @Operation(summary = "Create a new quiz")
    @PostMapping
    @CacheEvict(value = {"quizzesByClass"}, key = "#classId")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long classId,
            @Valid @RequestBody QuizRequest request,
            @CurrentUser UserPrincipal currentUser) {
        QuizResponse quiz = quizService.createQuiz(classId, request, currentUser.getId());
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{quizId}")
    @Cacheable(value = "quizById", key = "#quizId + '-' + #currentUser.id")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @CurrentUser UserPrincipal currentUser) {
        QuizResponse quiz = quizService.getQuiz(quizId, currentUser.getId());
        return ResponseEntity.ok(quiz);
    }

    @GetMapping
    @Cacheable(value = "quizzesByClass", key = "#classId")
    public ResponseEntity<List<QuizResponse>> getQuizzesByClass(
            @PathVariable Long classId) {
        List<QuizResponse> quizzes = quizService.getQuizzesByClass(classId);
        return ResponseEntity.ok(quizzes);
    }

    @PutMapping("/{quizId}")
    @CacheEvict(value = {"quizById", "quizzesByClass"}, allEntries = true)
    public ResponseEntity<QuizResponse> updateQuiz(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @Valid @RequestBody QuizRequest request,
            @CurrentUser UserPrincipal currentUser) {
        QuizResponse quiz = quizService.updateQuiz(quizId, request, currentUser.getId());
        return ResponseEntity.ok(quiz);
    }

    @DeleteMapping("/{quizId}")
    @CacheEvict(value = {"quizById", "quizzesByClass"}, allEntries = true)
    public ResponseEntity<?> deleteQuiz(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @CurrentUser UserPrincipal currentUser) {
        quizService.deleteQuiz(quizId, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<QuizAttemptResponse> startQuiz(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @CurrentUser UserPrincipal currentUser) {
        QuizAttemptResponse attempt = quizService.startQuizAttempt(quizId, currentUser.getId());
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/{quizId}/attempts/{attemptId}/submit")
    @CacheEvict(value = {"quizAttempts"}, key = "#quizId + '-' + #currentUser.id")
    public ResponseEntity<QuizAttemptResponse> submitQuiz(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @PathVariable Long attemptId,
            @Valid @RequestBody QuizAttemptRequest request,
            @CurrentUser UserPrincipal currentUser) {
        QuizAttemptResponse result = quizService.submitQuizAttempt(quizId, attemptId, request, currentUser.getId());
        return ResponseEntity.ok(result);
    }


    @GetMapping("/{quizId}/attempts")
    @Cacheable(value = "quizAttempts", key = "#quizId + '-' + #currentUser.id")
    public ResponseEntity<List<QuizAttemptResponse>> getQuizAttempts(
            @PathVariable Long classId,
            @PathVariable Long quizId,
            @CurrentUser UserPrincipal currentUser) {
        List<QuizAttemptResponse> attempts = quizService.getQuizAttempts(quizId, currentUser.getId());
        return ResponseEntity.ok(attempts);
    }
}