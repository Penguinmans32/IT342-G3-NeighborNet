package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.FeedbackRequest;
import com.example.neighbornetbackend.dto.FeedbackResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.Feedback;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ClassRepository;
import com.example.neighbornetbackend.repository.FeedbackRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final RatingService ratingService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            ClassRepository classRepository,
            UserRepository userRepository,
            RatingService ratingService
    ) {
        this.feedbackRepository = feedbackRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.ratingService = ratingService;
    }

    public List<FeedbackResponse> getClassFeedbacks(Long classId) {
        // Check if class exists
        if (!classRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Class not found");
        }

        return feedbackRepository.findByClassEntityIdOrderByCreatedAtDesc(classId).stream()
                .map(FeedbackResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackResponse createFeedback(Long classId, Long userId, FeedbackRequest request) {
        CourseClass courseClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean hasFeedback = feedbackRepository.existsByClassEntityIdAndUserId(classId, userId);
        Feedback feedback;

        if (hasFeedback) {
            feedback = feedbackRepository.findByClassEntityIdAndUserId(classId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
            feedback.setContent(request.getContent());

            if (request.getRating() != null) {
                feedback.setRating(request.getRating());
                ratingService.rateClass(classId, userId, request.getRating().doubleValue());
            }
        } else {
            feedback = new Feedback();
            feedback.setClassEntity(courseClass);
            feedback.setUser(user);
            feedback.setContent(request.getContent());

            if (request.getRating() != null) {
                feedback.setRating(request.getRating());
            } else {
                try {
                    double userRating = ratingService.getUserRating(classId, userId).getRating();
                    feedback.setRating((int) Math.round(userRating));
                } catch (Exception e) {
                    feedback.setRating(5);
                }
            }
        }

        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback);
    }

    public FeedbackResponse getUserFeedback(Long classId, Long userId) {
        return feedbackRepository.findByClassEntityIdAndUserId(classId, userId)
                .map(FeedbackResponse::fromEntity)
                .orElse(null);
    }
}