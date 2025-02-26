package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.RatingResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.ClassRating;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.RatingRepository;
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

    @Autowired
    public RatingService(RatingRepository ratingRepository, ClassRepository classRepository) {
        this.ratingRepository = ratingRepository;
        this.classRepository = classRepository;
    }

    /**
     * Rate a class or update an existing rating
     */
    @Transactional
    public RatingResponse rateClass(Long classId, Long userId, Double ratingValue) {
        // Ensure the rating value is valid (1-5)
        if (ratingValue < 1.0 || ratingValue > 5.0) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        // Find the class
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id " + classId));

        // Check if user has already rated this class
        ClassRating rating = ratingRepository.findByClassIdAndUserId(classId, userId)
                .orElse(new ClassRating(courseClass, userId, ratingValue));

        // Update the rating value and updated timestamp
        rating.setRating(ratingValue);
        rating.setUpdatedAt(Instant.now());

        rating = ratingRepository.save(rating);

        // Update class average rating
        updateClassAverageRating(classId);

        return convertToRatingResponse(rating);
    }

    /**
     * Get a user's rating for a class
     */
    public RatingResponse getUserRating(Long classId, Long userId) {
        try {
            ClassRating rating = ratingRepository.findByClassIdAndUserId(classId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rating not found"));

            return convertToRatingResponse(rating);
        } catch (ResourceNotFoundException e) {
            // If no rating exists, return a default response with 0 rating
            return new RatingResponse(null, classId, userId, 0.0, null, null);
        }
    }

    /**
     * Get all ratings for a class
     */
    public List<RatingResponse> getClassRatings(Long classId) {
        // Check if class exists
        if (!classRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Class not found with id " + classId);
        }

        List<ClassRating> ratings = ratingRepository.findByClassId(classId);
        return ratings.stream()
                .map(this::convertToRatingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update the average rating for a class
     */
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

    /**
     * Convert ClassRating entity to RatingResponse DTO
     */
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