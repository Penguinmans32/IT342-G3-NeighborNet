package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.*;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.AchievementType;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.FeedbackRepository;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.*;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


@CacheConfig(cacheNames = {"classes", "popularClasses", "classFeedbacks"})
@RestController
@RequestMapping("/api/classes")
@CrossOrigin
public class ClassController {

    private static final Logger log = LoggerFactory.getLogger(ClassController.class);

    private final ClassService classService;
    private final ClassRepository classRepository;
    private final RatingService ratingService;
    private final FeedbackService feedbackService;
    private final LessonProgressService progressService;
    private final FeedbackRepository feedbackRepository;
    private final AchievementService achievementService;

    private static final String CLASSES_CACHE = "classes";
    private static final String POPULAR_CACHE = "popularClasses";

    public ClassController(ClassService classService, ClassRepository classRepository, RatingService ratingService, FeedbackService feedbackService, LessonProgressService progressService, FeedbackRepository feedbackRepository, AchievementService achievementService) {
        this.classService = classService;
        this.classRepository = classRepository;
        this.ratingService = ratingService;
        this.feedbackService = feedbackService;
        this.progressService = progressService;
        this.feedbackRepository = feedbackRepository;
        this.achievementService = achievementService;
    }

    @Operation(summary = "Create a new class")
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ClassResponse> createClass(
            @RequestPart("thumbnail") MultipartFile thumbnail,
            @RequestPart("classData") CreateClassRequest request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            log.debug("Received thumbnail: {}", thumbnail.getOriginalFilename());
            log.debug("Received classData: {}", request);
            log.debug("Current user: {}", currentUser.getId());

            ClassResponse newClass = classService.createClass(request, thumbnail, currentUser.getId());
            achievementService.checkClassCreationAchievements(currentUser.getId());
            return ResponseEntity.ok(newClass);
        } catch (Exception e) {
            log.error("Error creating class", e);
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

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);
                long lastModified = Files.getLastModifiedTime(file).toMillis();
                String etag = "\"" + lastModified + "\"";

                return ResponseEntity.ok()
                        .eTag(etag)
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=2592000") // 30 days
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error serving thumbnail: {}", filename, e);
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
    public ResponseEntity<ClassResponse> getClass(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ClassResponse classResponse = classService.getClassById(classId);
            if (currentUser == null) {
                classResponse.setLessons(null);
            }

            String etag = "\"" + classResponse.hashCode() + "\"";
            return ResponseEntity.ok()
                    .eTag(etag)
                    .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
                    .body(classResponse);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching class with ID: {}", classId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all")
    @Cacheable(value = "classesPage", key = "'page_' + #page + '_size_' + #size + '_sort_' + #sortBy + '_dir_' + #direction")
    public ResponseEntity<Map<String, Object>> getAllClasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort sort = direction.equalsIgnoreCase("asc") ?
                    Sort.by(sortBy).ascending() :
                    Sort.by(sortBy).descending();

            Pageable pageable = PageRequest.of(page, size, sort);

            Page<ClassResponse> classPage = classService.getAllClassesPaged(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("classes", classPage.getContent());
            response.put("currentPage", classPage.getNumber());
            response.put("totalItems", classPage.getTotalElements());
            response.put("totalPages", classPage.getTotalPages());
            response.put("size", classPage.getSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all classes", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{classId}")
    @Transactional
    @CacheEvict(value = {"classes", "classesPage", "popularClasses", "relatedClasses"}, allEntries = true)
    public ResponseEntity<?> deleteClass(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            CourseClass classToDelete = classRepository.findByIdWithCreator(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            if (!classToDelete.getCreator().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).body("Not authorized to delete this class");
            }

            // Delete file if exists
            if (classToDelete.getThumbnailUrl() != null) {
                try {
                    Path thumbnailPath = Paths.get("uploads/thumbnails")
                            .resolve(Paths.get(classToDelete.getThumbnailUrl()).getFileName());
                    Files.deleteIfExists(thumbnailPath);
                } catch (IOException e) {
                    System.err.println("Could not delete thumbnail file: " + e.getMessage());
                }
            }

            classService.deleteClassAndRelatedData(classId);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Class successfully deleted",
                    "classId", classId
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete class",
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping(value = "/{classId}", consumes = { "multipart/form-data" })
    @CacheEvict(value = {"classes", "classesPage", "relatedClasses"}, key = "#classId")
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

    @GetMapping("/saved/{userId}")
    public ResponseEntity<List<ClassResponse>> getSavedClassesForUser(@PathVariable Long userId) {
        try {
            List<ClassResponse> savedClasses = classService.getSavedClassesForUser(userId);
            return ResponseEntity.ok(savedClasses);
        } catch (Exception e) {
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

            CourseClass courseClass = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            Long creatorId = courseClass.getCreator().getId();

            int totalRatings = ratingService.getCreatorTotalRatings(creatorId);

            achievementService.checkAndAwardAchievement(
                    creatorId,
                    AchievementType.TOP_RATED,
                    totalRatings
            );

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
            int enrolledCount = classService.getEnrolledClassesByUser(currentUser.getId()).size();
            achievementService.checkAndAwardAchievement(
                    currentUser.getId(),
                    AchievementType.POPULAR_TEACHER,
                    enrolledCount
            );
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
            achievementService.checkAndAwardAchievement(
                    currentUser.getId(),
                    AchievementType.FEEDBACK_GIVER,
                    1
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
    @Cacheable(value = "classFeedbacks", key = "#classId + '_' + (#currentUser != null ? #currentUser.id : 0)")
    public ResponseEntity<List<FeedbackResponse>> getClassFeedbacks(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            Long userId = currentUser != null ? currentUser.getId() : null;
            List<FeedbackResponse> feedbacks = feedbackService.getClassFeedbacksWithUserReactions(classId, userId);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            log.error("Error fetching feedbacks for class: {}", classId, e);
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

    @PutMapping("/{classId}/feedback/{feedbackId}")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable Long classId,
            @PathVariable Long feedbackId,
            @RequestBody FeedbackRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        try {
            FeedbackResponse feedback = feedbackService.updateFeedback(
                    feedbackId,
                    currentUser.getId(),
                    request
            );
            return ResponseEntity.ok(feedback);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{classId}/feedback/{feedbackId}")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long feedbackId,
            @CurrentUser UserPrincipal currentUser
    ) {
        try {
            feedbackService.deleteFeedback(feedbackId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{feedbackId}/react")
    public ResponseEntity<FeedbackResponse> reactToFeedback(
            @PathVariable Long feedbackId,
            @RequestBody ReactionRequest request,
            @CurrentUser UserPrincipal currentUser
    ) {
        try {
            FeedbackResponse feedback = feedbackService.handleReaction(
                    feedbackId,
                    currentUser.getId(),
                    request.isHelpful()
            );
            return ResponseEntity.ok(feedback);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{classId}/related")
    @Cacheable(value = "relatedClasses", key = "#classId")
    public ResponseEntity<List<ClassResponse>> getRelatedClasses(@PathVariable Long classId) {
        try {
            List<ClassResponse> relatedClasses = classService.getRelatedClasses(classId, 4);
            return ResponseEntity.ok(relatedClasses);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting related classes for ID: {}", classId, e);
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

    @GetMapping("/search")
    public ResponseEntity<List<ClassResponse>> searchClasses(
            @RequestParam String query,
            @RequestParam(required = false) String category) {
        try {
            List<ClassResponse> searchResults = classService.searchClasses(query, category);
            return ResponseEntity.ok(searchResults);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/save")
    public ResponseEntity<?> saveClass(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            boolean isSaved = classService.saveClass(classId, currentUser.getId());
            return ResponseEntity.ok(Map.of("saved", isSaved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save class: " + e.getMessage());
        }
    }

    @DeleteMapping("/{classId}/unsave")
    public ResponseEntity<?> unsaveClass(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            classService.unsaveClass(classId, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to unsave class: " + e.getMessage());
        }
    }

    @GetMapping("/saved")
    public ResponseEntity<List<ClassResponse>> getSavedClasses(
            @CurrentUser UserPrincipal currentUser) {
        try {
            List<ClassResponse> savedClasses = classService.getSavedClasses(currentUser.getId());
            return ResponseEntity.ok(savedClasses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{classId}/is-saved")
    public ResponseEntity<Boolean> isClassSaved(
            @PathVariable Long classId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            boolean isSaved = classService.isClassSaved(classId, currentUser.getId());
            return ResponseEntity.ok(isSaved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user-stats/{userId}")
    @Cacheable(value = "userStats", key = "#userId")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(classService.getUserStats(userId));
        } catch (Exception e) {
            log.error("Error fetching user stats for ID: {}", userId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/popular")
    @Cacheable(value = POPULAR_CACHE, key = "'popular'")
    public ResponseEntity<List<ClassResponse>> getPopularClasses() {
        try {
            List<ClassResponse> popularClasses = classRepository.findTop3ByOrderByEnrolledCountDesc()
                    .stream()
                    .map(ClassResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(popularClasses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recent")
    @Cacheable(value = "recentClasses", key = "#limit")
    public ResponseEntity<List<ClassResponse>> getRecentClasses(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<ClassResponse> recentClasses = classRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                    .stream()
                    .map(ClassResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(recentClasses);
        } catch (Exception e) {
            log.error("Error fetching recent classes", e);
            return ResponseEntity.badRequest().build();
        }
    }
}