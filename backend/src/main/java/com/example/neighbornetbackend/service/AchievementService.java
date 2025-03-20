package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.AchievementResponse;
import com.example.neighbornetbackend.model.*;
import com.example.neighbornetbackend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ClassRepository classRepository;
    private final ItemRepository itemRepository;

    public AchievementService(
            AchievementRepository achievementRepository,
            UserAchievementRepository userAchievementRepository,
            UserRepository userRepository,
            NotificationService notificationService, ClassRepository classRepository, ItemRepository itemRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.classRepository = classRepository;
        this.itemRepository = itemRepository;
    }

    @Transactional
    public void checkAndAwardAchievement(Long userId, AchievementType type, int progress) {
        Achievement achievement = achievementRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Achievement not found: " + type));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserAchievement userAchievement = userAchievementRepository
                .findByUserIdAndAchievementId(userId, achievement.getId())
                .orElseGet(() -> {
                    UserAchievement newAchievement = new UserAchievement();
                    newAchievement.setUser(user);
                    newAchievement.setAchievement(achievement);
                    newAchievement.setCurrentProgress(0);
                    newAchievement.setUnlocked(false);
                    return newAchievement;
                });

        // Update progress
        userAchievement.setCurrentProgress(progress);

        // Check if achievement should be unlocked
        if (!userAchievement.isUnlocked() && progress >= achievement.getRequiredCount()) {
            userAchievement.setUnlocked(true);
            userAchievement = userAchievementRepository.save(userAchievement);

            // Send notification
            notificationService.createAndSendNotification(
                    userId,
                    "Achievement Unlocked!",
                    "You've earned the " + achievement.getName() + " achievement!",
                    "ACHIEVEMENT"
            );
        } else {
            userAchievementRepository.save(userAchievement);
        }
    }

    public List<AchievementResponse> getUserAchievements(Long userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        List<Achievement> allAchievements = achievementRepository.findAll();

        return allAchievements.stream().map(achievement -> {
            UserAchievement userAchievement = userAchievements.stream()
                    .filter(ua -> ua.getAchievement().getId().equals(achievement.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        UserAchievement newUA = new UserAchievement();
                        newUA.setAchievement(achievement);
                        newUA.setCurrentProgress(0);
                        newUA.setUnlocked(false);
                        return newUA;
                    });

            return new AchievementResponse(
                    achievement.getId(),
                    achievement.getName(),
                    achievement.getDescription(),
                    achievement.getIcon(),
                    userAchievement.isUnlocked(),
                    userAchievement.getCurrentProgress(),
                    achievement.getRequiredCount(),
                    userAchievement.getUnlockedAt() != null ? userAchievement.getUnlockedAt().toString() : null
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void checkClassCreationAchievements(Long userId) {
        int classCount = classRepository.countByCreatorId(userId);
        checkAndAwardAchievement(userId, AchievementType.FIRST_CLASS_CREATED, classCount);
        checkAndAwardAchievement(userId, AchievementType.CLASS_CREATOR, classCount);
    }

    @Transactional
    public void checkItemPostingAchievements(Long userId) {
        int itemCount = itemRepository.countByOwnerId(userId);
        checkAndAwardAchievement(userId, AchievementType.FIRST_ITEM_POSTED, itemCount);
        checkAndAwardAchievement(userId, AchievementType.ITEM_SHARER, itemCount);
    }

    @Transactional
    public void checkCommunityScoreAchievements(Long userId, int communityScore) {
        checkAndAwardAchievement(userId, AchievementType.COMMUNITY_BEGINNER, communityScore);
        checkAndAwardAchievement(userId, AchievementType.COMMUNITY_EXPERT, communityScore);
        checkAndAwardAchievement(userId, AchievementType.COMMUNITY_MASTER, communityScore);
    }

    @Transactional
    public void checkSkillCollectorAchievement(Long userId) {
        int skillCount = userRepository.findById(userId)
                .map(user -> user.getSkills().size())
                .orElse(0);
        checkAndAwardAchievement(userId, AchievementType.SKILL_COLLECTOR, skillCount);
    }

    @Transactional
    public void checkSocialButterflyAchievement(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int connectedAccounts = 0;
        if (user.getGithubUrl() != null && !user.getGithubUrl().isEmpty()) connectedAccounts++;
        if (user.getTwitterUrl() != null && !user.getTwitterUrl().isEmpty()) connectedAccounts++;
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().isEmpty()) connectedAccounts++;
        if (user.getFacebookUrl() != null && !user.getFacebookUrl().isEmpty()) connectedAccounts++;

        checkAndAwardAchievement(userId, AchievementType.SOCIAL_BUTTERFLY, connectedAccounts);
    }
}