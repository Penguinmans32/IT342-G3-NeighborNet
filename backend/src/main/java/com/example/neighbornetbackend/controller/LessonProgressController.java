package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.LessonProgressDTO;
import com.example.neighbornetbackend.dto.UpdateProgressRequest;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.LessonProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes/{classId}/progress")
public class LessonProgressController {
    private final LessonProgressService progressService;

    public LessonProgressController(LessonProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<List<LessonProgressDTO>> getProgress(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(progressService.getProgressForClass(classId, currentUser.getId()));
    }

    @PostMapping("/lessons/{lessonId}")
    public ResponseEntity<LessonProgressDTO> updateProgress(
            @PathVariable Long classId,
            @PathVariable Long lessonId,
            @RequestBody UpdateProgressRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        System.out.println("Received progress update: " + request.isCompleted() + ", progress: " + request.getProgress());
        return ResponseEntity.ok(progressService.updateProgress(
                classId, lessonId, currentUser.getId(), request
        ));
    }
}