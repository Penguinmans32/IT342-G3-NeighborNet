package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassRepository extends JpaRepository<Class, Long> {

    List<Class> findByUserId(Long userId);
    List<Class> findByCategory(String category);
    List<Class> findByDifficulty(Class.DifficultyLevel difficulty);
    boolean existsByTitleAndUserId(String title, Long userId);
}


