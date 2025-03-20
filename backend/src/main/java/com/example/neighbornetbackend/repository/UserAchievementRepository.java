package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.UserAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUserId(Long userId);
    boolean existsByUserIdAndAchievementId(Long userId, Long achievementId);
    Optional<UserAchievement> findByUserIdAndAchievementId(Long userId, Long achievementId);
}

