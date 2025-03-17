package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.FeedbackRequest;
import com.example.neighbornetbackend.dto.FeedbackResponse;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.exception.UnauthorizedException;
import com.example.neighbornetbackend.model.CourseClass;
import com.example.neighbornetbackend.model.Feedback;
import com.example.neighbornetbackend.model.FeedbackReaction;
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
        if (!classRepository.existsById(classId)) {
            throw new ResourceNotFoundException("Class not found");
        }

        List<Feedback> feedbacks = feedbackRepository.findByClassEntityIdOrderByCreatedAtDesc(classId);

        feedbacks.forEach(feedback -> {
            if (feedback.getHelpfulCount() == null) {
                feedback.setHelpfulCount(0);
            }
            if (feedback.getReportCount() == null) {
                feedback.setReportCount(0);
            }
        });

        return feedbacks.stream()
                .map(feedback -> FeedbackResponse.fromEntity(feedback, null))
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
        return FeedbackResponse.fromEntity(feedback, userId);
    }

    public FeedbackResponse getUserFeedback(Long classId, Long userId) {
        return feedbackRepository.findByClassEntityIdAndUserId(classId, userId)
                .map(feedback -> FeedbackResponse.fromEntity(feedback, userId))
                .orElse(null);
    }

    @Transactional
    public FeedbackResponse updateFeedback(Long feedbackId, Long userId, FeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (!feedback.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own feedback");
        }

        feedback.setContent(request.getContent());
        if (request.getRating() != null) {
            feedback.setRating(request.getRating());
        }

        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback, userId);
    }

    @Transactional
    public void deleteFeedback(Long feedbackId, Long userId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        if (!feedback.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own feedback");
        }

        feedbackRepository.delete(feedback);
    }

    @Transactional
    public FeedbackResponse handleReaction(Long feedbackId, Long userId, boolean isHelpful) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (feedback.getHelpfulCount() == null) {
            feedback.setHelpfulCount(0);
        }
        if (feedback.getReportCount() == null) {
            feedback.setReportCount(0);
        }

        // Remove existing reaction if any
        boolean hadPreviousReaction = feedback.getReactions().removeIf(reaction ->
                reaction.getUser().getId().equals(userId)
        );

        FeedbackReaction reaction = new FeedbackReaction();
        reaction.setFeedback(feedback);
        reaction.setUser(user);
        reaction.setHelpful(isHelpful);
        feedback.getReactions().add(reaction);

        // Recalculate counts
        recalculateReactionCounts(feedback);

        feedback = feedbackRepository.save(feedback);
        return FeedbackResponse.fromEntity(feedback, userId);
    }

    private void recalculateReactionCounts(Feedback feedback) {
        int helpfulCount = (int) feedback.getReactions().stream()
                .filter(FeedbackReaction::isHelpful)
                .count();
        int reportCount = (int) feedback.getReactions().stream()
                .filter(r -> !r.isHelpful())
                .count();

        feedback.setHelpfulCount(helpfulCount);
        feedback.setReportCount(reportCount);
    }
}