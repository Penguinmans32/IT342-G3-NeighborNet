package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDeletionService {
    @PersistenceContext
    private EntityManager entityManager;

    private final PostRepository postRepository;
    private final RefreshTokenService refreshTokenService;
    private final ActivityRepository activityRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final ItemRepository itemRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final FeedbackRepository feedbackRepository;
    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public UserDeletionService(
            PostRepository postRepository,
            RefreshTokenService refreshTokenService,
            ActivityRepository activityRepository,
            BorrowRequestRepository borrowRequestRepository,
            ItemRepository itemRepository,
            ClassEnrollmentRepository classEnrollmentRepository,
            LessonProgressRepository lessonProgressRepository,
            LessonRepository lessonRepository,
            FeedbackRepository feedbackRepository,
            ClassRepository classRepository,
            UserRepository userRepository) {
        this.postRepository = postRepository;
        this.refreshTokenService = refreshTokenService;
        this.activityRepository = activityRepository;
        this.borrowRequestRepository = borrowRequestRepository;
        this.itemRepository = itemRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.feedbackRepository = feedbackRepository;
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteUserAndRelatedData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete email verification tokens first
        entityManager.createNativeQuery(
                        "DELETE FROM email_verification_tokens WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();

        // Delete notifications
        entityManager.createNativeQuery(
                        "DELETE FROM notifications WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();

        // Clear user relationships
        entityManager.createNativeQuery(
                        "DELETE FROM user_followers WHERE follower_id = ? OR followed_id = ?")
                .setParameter(1, userId)
                .setParameter(2, userId)
                .executeUpdate();

        entityManager.createNativeQuery(
                        "DELETE FROM saved_classes WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();

        // Handle posts deletion using temporary table approach
        entityManager.createNativeQuery(
                        "CREATE TEMPORARY TABLE IF NOT EXISTS temp_user_posts AS (SELECT id FROM posts WHERE user_id = ?)")
                .setParameter(1, userId)
                .executeUpdate();

        // Delete post relationships using the temporary table
        entityManager.createNativeQuery(
                        "DELETE FROM post_likes WHERE user_id = ? OR post_id IN (SELECT id FROM temp_user_posts)")
                .setParameter(1, userId)
                .executeUpdate();

        entityManager.createNativeQuery(
                        "DELETE FROM comments WHERE post_id IN (SELECT id FROM temp_user_posts)")
                .executeUpdate();

        entityManager.createNativeQuery(
                        "DELETE FROM shares WHERE post_id IN (SELECT id FROM temp_user_posts)")
                .executeUpdate();

        // Update original post references
        entityManager.createNativeQuery(
                        "UPDATE posts SET original_post_id = NULL WHERE original_post_id IN (SELECT id FROM temp_user_posts)")
                .executeUpdate();

        // Delete the posts
        entityManager.createNativeQuery(
                        "DELETE FROM posts WHERE user_id = ?")
                .setParameter(1, userId)
                .executeUpdate();

        // Drop the temporary table
        entityManager.createNativeQuery("DROP TEMPORARY TABLE IF EXISTS temp_user_posts")
                .executeUpdate();

        // Delete other related data
        refreshTokenService.deleteByUserId(userId);
        activityRepository.deleteByUserId(userId);
        borrowRequestRepository.deleteByUserInvolvement(userId);
        itemRepository.clearBorrowerByUserId(userId);
        itemRepository.deleteByOwnerId(userId);

        classEnrollmentRepository.deleteByCreatorOrEnrolledUserId(userId);
        lessonProgressRepository.deleteByCreatorId(userId);
        lessonRepository.deleteByCreatorId(userId);
        feedbackRepository.deleteByCreatorId(userId);
        classRepository.deleteByCreatorOrEnrolledUserId(userId);

        // Finally delete the user
        entityManager.createNativeQuery(
                        "DELETE FROM users WHERE id = ?")
                .setParameter(1, userId)
                .executeUpdate();

        entityManager.flush();
    }
}