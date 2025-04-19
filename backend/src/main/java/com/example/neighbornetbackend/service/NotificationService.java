package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.NotificationDTO;
import com.example.neighbornetbackend.model.Notification;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.NotificationRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FCMService fcmService;

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private static final String NOTIFICATIONS_CACHE = "userNotifications";
    private static final String UNREAD_COUNT_CACHE = "unreadNotificationsCount";

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate, FCMService fcmService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.fcmService = fcmService;
    }

    @Transactional
    @CacheEvict(value = {NOTIFICATIONS_CACHE, UNREAD_COUNT_CACHE}, key = "#userId")
    public void createAndSendNotification(Long userId, String title, String message, String type) {
        CompletableFuture<Optional<User>> userFuture = CompletableFuture.supplyAsync(() ->
                userRepository.findById(userId));

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);

        User user = userFuture.join()
                .orElseThrow(() -> new RuntimeException("User not found"));
        notification.setUser(user);

        notification = notificationRepository.save(notification);

        final NotificationDTO notificationDTO = new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );

        CompletableFuture.runAsync(() -> {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notificationDTO
            );
        });

        if (user.getFcmToken() != null && !user.getFcmToken().isEmpty()) {
            CompletableFuture.runAsync(() -> {
                try {
                    fcmService.sendNotification(
                            user.getFcmToken(),
                            title,
                            message,
                            type
                    );
                } catch (Exception e) {
                    log.error("Failed to send FCM notification: {}", e.getMessage());
                }
            });
        }
    }

    @Cacheable(value = NOTIFICATIONS_CACHE, key = "#userId")
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    @CacheEvict(value = {NOTIFICATIONS_CACHE, UNREAD_COUNT_CACHE}, key = "#notification.user.id")
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    @CacheEvict(value = {NOTIFICATIONS_CACHE, UNREAD_COUNT_CACHE}, allEntries = true)
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Cacheable(value = NOTIFICATIONS_CACHE, key = "'dto-' + #userId")
    public List<NotificationDTO> getUserNotificationsDTO(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Cacheable(value = UNREAD_COUNT_CACHE, key = "#userId")
    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }

    @Transactional
    @CacheEvict(value = {NOTIFICATIONS_CACHE, UNREAD_COUNT_CACHE}, allEntries = true)
    public void deleteAllNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }
}