package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.LessonResponse;
import com.example.neighbornetbackend.dto.RatingResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.Lesson;
import com.example.neighbornetbackend.model.LessonRating;
import com.example.neighbornetbackend.repository.LessonRatingRepository;
import com.example.neighbornetbackend.repository.LessonRepository;
import com.example.neighbornetbackend.repository.ClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ClassRepository classRepository;
    private final VideoStorageService videoStorageService;
    private final LessonRatingRepository lessonRatingRepository;

    public LessonService(
            LessonRepository lessonRepository,
            ClassRepository classRepository,
            VideoStorageService videoStorageService, LessonRatingRepository lessonRatingRepository) {
        this.lessonRepository = lessonRepository;
        this.classRepository = classRepository;
        this.videoStorageService = videoStorageService;
        this.lessonRatingRepository = lessonRatingRepository;
    }

    @Transactional
    public Lesson createLesson(
            Long classId,
            String title,
            String description,
            MultipartFile videoFile,
            Long parentLessonId
    ) throws IOException {
        CourseClass classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Lesson lesson = new Lesson();
        lesson.setTitle(title);
        lesson.setDescription(description);
        lesson.setClassEntity(classEntity);

        if (parentLessonId != null) {
            Lesson parentLesson = lessonRepository.findById(parentLessonId)
                    .orElseThrow(() -> new RuntimeException("Parent lesson not found"));
            lesson.setParentLesson(parentLesson);
        }

        if (videoFile != null && !videoFile.isEmpty()) {
            String videoUrl = videoStorageService.storeVideo(videoFile);
            lesson.setVideoUrl(videoUrl);
        }

        return lessonRepository.save(lesson);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getLessonsByClassId(Long classId) {
        return lessonRepository.findByClassId(classId);
    }

    @Transactional(readOnly = true)
    public List<Lesson> getTopLevelLessons(Long classId) {
        return lessonRepository.findTopLevelLessonsByClassId(classId);
    }

    public Lesson getNextLesson(Long classId, Long currentLessonId) {
        return lessonRepository.findNextLesson(classId, currentLessonId);
    }

    public Lesson getPrevLesson(Long classId, Long currentLessonId) {
        return lessonRepository.findPrevLesson(classId, currentLessonId);
    }

    @Transactional(readOnly = true)
    public Lesson getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with id: " + lessonId));
    }

    @Transactional
    public LessonResponse rateLesson(Long lessonId, Long userId, Double ratingValue) {
        if (ratingValue < 1.0 || ratingValue > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found with id " + lessonId));

        LessonRating rating = lessonRatingRepository.findByLessonIdAndUserId(lessonId, userId)
                .orElse(new LessonRating());

        rating.setLesson(lesson);
        rating.setUserId(userId);
        rating.setRating(ratingValue);
        rating.setUpdatedAt(LocalDateTime.now());

        if (rating.getCreatedAt() == null) {
            rating.setCreatedAt(LocalDateTime.now());
        }

        lessonRatingRepository.save(rating);

        updateLessonAverageRating(lessonId);

        return LessonResponse.fromEntity(lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found")));
    }


    @Transactional
    protected void updateLessonAverageRating(Long lessonId) {
        Double averageRating = lessonRatingRepository.findAverageRatingByLessonId(lessonId);
        long ratingCount = lessonRatingRepository.countByLessonId(lessonId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));

        // Set default value of 0.0 if averageRating is null
        lesson.setAverageRating(averageRating != null ? averageRating : 0.0);
        lesson.setRatingCount(ratingCount);

        lessonRepository.save(lesson);
    }

    public RatingResponse getUserRating(Long lessonId, Long userId) {
        LessonRating rating = lessonRatingRepository.findByLessonIdAndUserId(lessonId, userId)
                .orElse(null);

        if (rating == null) {
            return new RatingResponse(null, lessonId, userId, 0.0, null, null);
        }

        return new RatingResponse(
                rating.getId(),
                lessonId,
                userId,
                rating.getRating(),
                rating.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toInstant(),
                rating.getUpdatedAt().atZone(java.time.ZoneOffset.UTC).toInstant()
        );
    }

    public List<RatingResponse> getLessonRatings(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new ResourceNotFoundException("Lesson not found with id " + lessonId);
        }

        return lessonRatingRepository.findByLessonId(lessonId).stream()
                .map(rating -> new RatingResponse(
                        rating.getId(),
                        lessonId,
                        rating.getUserId(),
                        rating.getRating(),
                        rating.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toInstant(),
                        rating.getUpdatedAt().atZone(java.time.ZoneOffset.UTC).toInstant()
                ))
                .toList();
    }
}