package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.QuizGenerationRequest;
import com.example.neighbornetbackend.dto.QuizRequest;
import com.example.neighbornetbackend.dto.QuizResponse;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.GeminiService;
import com.example.neighbornetbackend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/classes/{classId}/quizzes/generate")
@CrossOrigin
public class QuizGenerationController {

    private final GeminiService geminiService;
    private final QuizService quizService;

    @Autowired
    public QuizGenerationController(GeminiService geminiService, QuizService quizService) {
        this.geminiService = geminiService;
        this.quizService = quizService;
    }

    @PostMapping("/preview")
    public ResponseEntity<QuizRequest> generateQuizPreview(
            @PathVariable Long classId,
            @Valid @RequestBody QuizGenerationRequest request) {

        QuizRequest generatedQuiz = geminiService.generateQuiz(request);
        return ResponseEntity.ok(generatedQuiz);
    }

    @PostMapping
    public ResponseEntity<QuizResponse> generateAndSaveQuiz(
            @PathVariable Long classId,
            @Valid @RequestBody QuizGenerationRequest request,
            @CurrentUser UserPrincipal currentUser) {

        QuizRequest generatedQuiz = geminiService.generateQuiz(request);
        QuizResponse savedQuiz = quizService.createQuiz(classId, generatedQuiz, currentUser.getId());

        return ResponseEntity.ok(savedQuiz);
    }
}