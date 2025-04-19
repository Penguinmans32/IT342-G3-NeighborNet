package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ActivityDTO;
import com.example.neighbornetbackend.dto.ActivityResponse;
import com.example.neighbornetbackend.dto.UserDTO;
import com.example.neighbornetbackend.model.*;
import com.example.neighbornetbackend.repository.*;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ActivityService {
    private static final Logger logger = LoggerFactory.getLogger(ActivityService.class);
    private final ActivityRepository activityRepository;
    private final UserService userService;
    private final BorrowingAgreementRepository borrowingAgreementRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public ActivityService(ActivityRepository activityRepository, UserRepository userRepository, ItemRepository itemRepository, UserService userService, BorrowingAgreementRepository borrowingAgreementRepository, ClassEnrollmentRepository classEnrollmentRepository) {
        this.activityRepository = activityRepository;
        this.userService = userService;
        this.borrowingAgreementRepository = borrowingAgreementRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
    }

    public void trackActivity(Long userId, String type, String title, String description, String icon, Long referenceId) {
        Activity activity = new Activity();
        activity.setUser(userService.getUserById(userId));
        activity.setType(type);
        activity.setTitle(title);
        activity.setDescription(description);
        activity.setIcon(icon);
        activity.setReferenceId(referenceId);
        activity.setCreatedAt(LocalDateTime.now());
        activityRepository.save(activity);
    }

    public List<ActivityDTO> getUserActivities(Long userId) {
        return activityRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ActivityDTO convertToDTO(Activity activity) {
        return new ActivityDTO(
                activity.getId(),
                activity.getType(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getCreatedAt().format(formatter),
                activity.getIcon(),
                activity.getReferenceId()
        );
    }

    @Cacheable(value = "recentActivities")
    public List<ActivityResponse> getRecentActivities(int page, int size) {
        try {
            int halfSize = Math.max(size / 2, 5);

            List<Long> enrollmentIds = classEnrollmentRepository.findRecentEnrollmentIds(PageRequest.of(0, halfSize));
            List<Long> borrowIds = borrowingAgreementRepository.findRecentBorrowIds(PageRequest.of(0, halfSize));

            List<ActivityResponse> activities = new ArrayList<>();

            for (Long id : enrollmentIds) {
                classEnrollmentRepository.findByIdWithDetails(id).ifPresent(enrollment ->
                        activities.add(mapEnrollmentToActivity(enrollment))
                );
            }

            for (Long id : borrowIds) {
                borrowingAgreementRepository.findByIdWithDetails(id).ifPresent(borrow ->
                        activities.add(mapBorrowToActivity(borrow))
                );
            }

            return activities.stream()
                    .sorted(Comparator.comparing(ActivityResponse::getCreatedAt).reversed())
                    .skip((long) page * size)
                    .limit(size)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching recent activities", e);
            return List.of();
        }
    }

    private ActivityResponse mapEnrollmentToActivity(ClassEnrollment enrollment) {
        ActivityResponse activity = new ActivityResponse();
        activity.setType("class");
        activity.setAction("joined");
        activity.setUser(UserDTO.fromEntity(enrollment.getUser()));
        activity.setTitle(enrollment.getCourseClass().getTitle());
        activity.setCreatedAt(enrollment.getEnrolledAt());
        activity.setThumbnailUrl(enrollment.getCourseClass().getThumbnailUrl());

        ActivityResponse.ActivityEngagement engagement = new ActivityResponse.ActivityEngagement();
        engagement.setLikes(enrollment.getCourseClass().getRatingCount().intValue());
        engagement.setComments(enrollment.getCourseClass().getFeedbacks().size());
        activity.setEngagement(engagement);

        return activity;
    }

    private ActivityResponse mapBorrowToActivity(BorrowingAgreement borrow) {
        ActivityResponse activity = new ActivityResponse();
        activity.setType("borrow");
        activity.setAction("borrowed");

        User borrower = userRepository.findById(borrow.getBorrowerId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        activity.setUser(UserDTO.fromEntity(borrower));

        Item item = itemRepository.findById(borrow.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));
        activity.setTitle(item.getName());

        activity.setCreatedAt(borrow.getCreatedAt());

        ActivityResponse.ActivityEngagement engagement = new ActivityResponse.ActivityEngagement();
        engagement.setLikes(0);
        engagement.setComments(0);
        activity.setEngagement(engagement);

        return activity;
    }
}