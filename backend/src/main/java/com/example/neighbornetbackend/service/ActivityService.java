package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ActivityDTO;
import com.example.neighbornetbackend.model.Activity;
import com.example.neighbornetbackend.repository.ActivityRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final UserService userService;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    public ActivityService(ActivityRepository activityRepository, UserService userService) {
        this.activityRepository = activityRepository;
        this.userService = userService;
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
}
