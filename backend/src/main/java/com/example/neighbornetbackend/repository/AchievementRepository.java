package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Achievement;
import com.example.neighbornetbackend.model.AchievementType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Optional<Achievement> findByType(AchievementType type);
}