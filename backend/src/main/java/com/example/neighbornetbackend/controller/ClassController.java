package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.ClassService;
import com.example.neighbornetbackend.service.FeedbackService;
import com.example.neighbornetbackend.service.LessonProgressService;
import com.example.neighbornetbackend.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin
public class ClassController {
    private final ClassService classService;
    private final ClassRepository classRepository;
    private final RatingService ratingService;
    private final FeedbackService feedbackService;
    private final LessonProgressService progressService;

    public ClassController(ClassService classService, ClassRepository classRepository, RatingService ratingService, FeedbackService feedbackService, LessonProgressService progressService) {
        this.classService = classService;
        this.classRepository = classRepository;
        this.ratingService = ratingService;
        this.feedbackService = feedbackService;
        this.progressService = progressService;
    }

    @Operation(summary = "Create a new class")
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ClassResponse> createClass(
            @RequestPart("thumbnail") MultipartFile thumbnail,
            @RequestPart("classData") CreateClassRequest request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            // Add debug logging
            System.out.println("Received thumbnail: " + thumbnail.getOriginalFilename());
            System.out.println("Received classData: " + request);
            System.out.println("Current user: " + currentUser.getId());

            ClassResponse newClass = classService.createClass(request, thumbnail, currentUser.getId());
            return ResponseEntity.ok(newClass);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-classes")
    public ResponseEntity<List<ClassResponse>> getMyClasses(@CurrentUser UserPrincipal currentUser) {
        List<ClassResponse> classes = classService.getClassesByUser(currentUser.getId());
        return ResponseEntity.ok(classes);
    }


    @GetMapping("/thumbnail/{filename:.+}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String filename) {
        try {
            Path file = Paths.get("thumbnails").resolve(filename).toAbsolutePath();

            Resource resource = new UrlResource(file.toUri());
            System.out.println("Resource exists: " + resource.exists());
            System.out.println("Resource is readable: " + resource.isReadable());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type based on file extension
                String contentType = determineContentType(filename);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error serving thumbnail: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.toLowerCase().endsWith(".png")) {
            return "image/png";
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "image/jpeg"; // default
    }

    @GetMapping("/{classId}")
    public ResponseEntity<ClassResponse> getClass(@PathVariable Long classId) {
        try {
            ClassResponse classResponse = classService.getClassById(classId);
            return ResponseEntity.ok(classResponse);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        try {
            List<ClassResponse> classes = classService.getAllClasses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{classId}")
    @Transactional
    public ResponseEntity<?> deleteClass(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            // First fetch the class with its creator
            CourseClass classToDelete = classRepository.findByIdWithCreator(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            // Check if the current user is the creator
            if (!classToDelete.getCreator().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("Not authorized to delete this class");
            }

            classService.deleteClass(classId);
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{classId}", consumes = { "multipart/form-data" })
    public ResponseEntity<ClassResponse> updateClass(
            @PathVariable Long classId,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestPart("classData") CreateClassRequest request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ClassResponse updatedClass = classService.updateClass(classId, request, thumbnail, currentUser.getId());
            return ResponseEntity.ok(updatedClass);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/rate")
    public ResponseEntity<RatingResponse> rateClass(
            @PathVariable Long classId,
            @RequestBody RatingRequest ratingRequest,
            @CurrentUser UserPrincipal currentUser) {
        try {
            RatingResponse rating = ratingService.rateClass(classId, currentUser.getId(), ratingRequest.getRating());
            return ResponseEntity.ok(rating);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/rating")
    public ResponseEntity<RatingResponse> getUserRating(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            RatingResponse userRating = ratingService.getUserRating(classId, currentUser.getId());
            return ResponseEntity.ok(userRating);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/ratings")
    public ResponseEntity<List<RatingResponse>> getClassRatings(@PathVariable Long classId) {
        try {
            List<RatingResponse> ratings = ratingService.getClassRatings(classId);
            return ResponseEntity.ok(ratings);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/start-learning")
    public ResponseEntity<ClassResponse> startLearning(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ClassResponse response = classService.startLearning(classId, currentUser.getId());
            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/learning-status")
    public ResponseEntity<Boolean> getLearningStatus(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            boolean isLearning = classService.isUserLearning(classId, currentUser.getId());
            return ResponseEntity.ok(isLearning);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/feedback")
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @PathVariable Long classId,
            @RequestBody FeedbackRequest feedbackRequest,
            @CurrentUser UserPrincipal currentUser) {
        try {
            FeedbackResponse feedback = feedbackService.createFeedback(
                    classId,
                    currentUser.getId(),
                    feedbackRequest
            );
            return ResponseEntity.ok(feedback);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/feedbacks")
    public ResponseEntity<List<FeedbackResponse>> getClassFeedbacks(@PathVariable Long classId) {
        try {
            List<FeedbackResponse> feedbacks = feedbackService.getClassFeedbacks(classId);
            return ResponseEntity.ok(feedbacks);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/user-feedback")
    public ResponseEntity<FeedbackResponse> getUserFeedback(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            FeedbackResponse feedback = feedbackService.getUserFeedback(classId, currentUser.getId());
            if (feedback != null) {
                return ResponseEntity.ok(feedback);
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/related")
    public ResponseEntity<List<ClassResponse>> getRelatedClasses(
            @PathVariable Long classId) {
        try {
            CourseClass currentClass = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            List<ClassResponse> relatedClasses = classRepository.findByCategoryAndIdNot(
                            currentClass.getCategory(), classId)
                    .stream()
                    .limit(4)
                    .map(ClassResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(relatedClasses);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<ClassResponse>> getEnrolledClasses(@CurrentUser UserPrincipal currentUser) {
        try {
            List<CourseClass> enrolledClasses = classService.getEnrolledClassesByUser(currentUser.getId());
            List<ClassResponse> responses = enrolledClasses.stream()
                    .map(courseClass -> {
                        ClassResponse response = ClassResponse.fromEntity(courseClass);

                        List<LessonProgressDTO> progress = progressService.getProgressForClass(
                                courseClass.getId(),
                                currentUser.getId()
                        );

                        response.setLessons(progress.stream()
                                .map(lessonProgress -> {
                                    LessonResponse lessonResponse = lessonProgress.getLessons();
                                    lessonResponse.setCompleted(lessonProgress.isCompleted());
                                    return lessonResponse;
                                })
                                .collect(Collectors.toList()));

                        return response;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}