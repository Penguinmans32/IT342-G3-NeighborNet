package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.RatingResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.ClassRating;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.RatingRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final ClassRepository classRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public RatingService(NotificationService notificationService,
                         ClassRepository classRepository,
                         UserRepository userRepository,
                         RatingRepository ratingRepository) {
        this.notificationService = notificationService;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.ratingRepository = ratingRepository;
    }

    @Transactional
    public RatingResponse rateClass(Long classId, Long userId, Double ratingValue) {
        if (ratingValue < 1.0 || ratingValue > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id " + classId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClassRating rating = ratingRepository.findByClassIdAndUserId(classId, userId)
                .orElse(new ClassRating(courseClass, userId, ratingValue));

        rating.setRating(ratingValue);
        rating.setUpdatedAt(Instant.now());

        rating = ratingRepository.save(rating);

        updateClassAverageRating(classId);

        String formattedRating = String.format("%.1f", rating.getRating());

        String title = "New Rating";
        String message = String.format("%s rated your class '%s' with %s stars",
                user.getUsername(),
                courseClass.getTitle(),
                formattedRating
        );

        notificationService.createAndSendNotification(
                courseClass.getCreator().getId(),
                title,
                message,
                "RATING"
        );

        return convertToRatingResponse(rating);
    }

    public RatingResponse getUserRating(Long classId, Long userId) {
        try {
            ClassRating rating = ratingRepository.findByClassIdAndUserId(classId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

            return convertToRatingResponse(rating);
        } catch (ResourceNotFoundException e) {
            return new RatingResponse(null, classId, userId, 0.0, null, null);
        }
    }

    public List<RatingResponse> getClassRatings(Long classId) {
        if (!classRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Class not found with id " + classId);
        }

        List<ClassRating> ratings = ratingRepository.findByClassId(classId);
        return ratings.stream()
                .map(this::convertToRatingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    protected void updateClassAverageRating(Long classId) {
        Double averageRating = ratingRepository.findAverageRatingByClassId(classId);
        Long ratingCount = ratingRepository.countByClassId(classId);

        if (averageRating != null) {
            CourseClass courseClass = classRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with id " + classId));

            courseClass.setAverageRating(averageRating);
            courseClass.setRatingCount(ratingCount);
            classRepository.save(courseClass);
        }
    }

    private RatingResponse convertToRatingResponse(ClassRating rating) {
        return new RatingResponse(
                rating.getId(),
                rating.getCourseClass().getId(),
                rating.getUserId(),
                rating.getRating(),
                rating.getCreatedAt(),
                rating.getUpdatedAt()
        );
    }
}