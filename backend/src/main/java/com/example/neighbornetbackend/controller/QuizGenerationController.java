package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.ContentProcessingService;
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
    private final ContentProcessingService contentProcessingService;

    @Autowired
    public QuizGenerationController(
            GeminiService geminiService,
            QuizService quizService,
            ContentProcessingService contentProcessingService) {
        this.geminiService = geminiService;
        this.quizService = quizService;
        this.contentProcessingService = contentProcessingService;
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

    @PostMapping("/from-content")
    public ResponseEntity<QuizRequest> generateFromContent(
            @PathVariable Long classId,
            @Valid @RequestBody ContentImportRequest request) {

        QuizRequest generatedQuiz = contentProcessingService.generateQuizFromContent(request);
        return ResponseEntity.ok(generatedQuiz);
    }

    @PostMapping("/from-content/save")
    public ResponseEntity<QuizResponse> generateFromContentAndSave(
            @PathVariable Long classId,
            @Valid @RequestBody ContentImportRequest request,
            @CurrentUser UserPrincipal currentUser) {

        QuizRequest generatedQuiz = contentProcessingService.generateQuizFromContent(request);
        QuizResponse savedQuiz = quizService.createQuiz(classId, generatedQuiz, currentUser.getId());

        return ResponseEntity.ok(savedQuiz);
    }
}