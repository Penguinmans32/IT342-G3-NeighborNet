package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.LessonResponse;
import com.example.neighbornetbackend.dto.RatingRequest;
import com.example.neighbornetbackend.dto.RatingResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.Lesson;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.LessonService;
import com.example.neighbornetbackend.service.VideoStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes/{classId}/lessons")
@CrossOrigin
public class LessonController {
    private final LessonService lessonService;
    private final VideoStorageService videoStorageService;

    public LessonController(LessonService lessonService, VideoStorageService videoStorageService) {
        this.lessonService = lessonService;
        this.videoStorageService = videoStorageService;
    }

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<LessonResponse> createLesson(
            @PathVariable Long classId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("videoFile") MultipartFile videoFile,
            @RequestParam(value = "parentLessonId", required = false) Long parentLessonId
    ) {
        try {
            Lesson lesson = lessonService.createLesson(
                    classId, title, description, videoFile, parentLessonId);
            return ResponseEntity.ok(LessonResponse.fromEntity(lesson));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(@PathVariable Long classId) {
        List<LessonResponse> lessons = lessonService.getLessonsByClassId(classId)
                .stream()
                .map(LessonResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(lessons);
    }


    @GetMapping("/video/{filename:.+}")
    public ResponseEntity<Resource> getVideo(
            @PathVariable String filename,
            HttpServletRequest request
    ) {
        try {
            String videoUrl = videoStorageService.getVideoUrl(filename);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(videoUrl))
                    .build();

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<LessonResponse> getLesson(
            @PathVariable Long classId,
            @PathVariable Long lessonId
    ) {
        try {
            Lesson lesson = lessonService.getLessonById(lessonId);
            if (lesson.getClassEntity().getId().equals(classId)) {
                LessonResponse response = LessonResponse.fromEntity(lesson);

                // Add next/prev lesson IDs
                Lesson nextLesson = lessonService.getNextLesson(classId, lessonId);
                Lesson prevLesson = lessonService.getPrevLesson(classId, lessonId);

                if (nextLesson != null) {
                    response.setNextLessonId(nextLesson.getId());
                }
                if (prevLesson != null) {
                    response.setPrevLessonId(prevLesson.getId());
                }

                return ResponseEntity.ok(response);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/video/check/{filename:.+}")
    public ResponseEntity<Map<String, Object>> checkVideo(@PathVariable String filename) {
        try {
            String videoUrl = videoStorageService.getVideoUrl(filename);
            Map<String, Object> response = new HashMap<>();
            response.put("exists", true);
            response.put("path", videoUrl);
            response.put("isReadable", true);
            response.put("size", -1);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/{lessonId}/rate")
    public ResponseEntity<LessonResponse> rateLesson(
            @PathVariable Long lessonId,
            @RequestBody RatingRequest ratingRequest,
            @CurrentUser UserPrincipal currentUser) {
        try {
            LessonResponse lesson = lessonService.rateLesson(lessonId, currentUser.getId(), ratingRequest.getRating());
            return ResponseEntity.ok(lesson);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{lessonId}/rating")
    public ResponseEntity<RatingResponse> getUserLessonRating(
            @PathVariable Long lessonId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            RatingResponse rating = lessonService.getUserRating(lessonId, currentUser.getId());
            return ResponseEntity.ok(rating);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}