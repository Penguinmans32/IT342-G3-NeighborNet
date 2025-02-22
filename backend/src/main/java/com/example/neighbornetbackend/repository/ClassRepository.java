package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<CourseClass, Long> {
    @Query("SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator WHERE c.id = :classId")
    Optional<CourseClass> findByIdWithCreator(@Param("classId") Long classId);

    List<CourseClass> findByCreatorId(Long userId);
    List<CourseClass> findByCategory(String category);
    List<CourseClass> findByDifficulty(CourseClass.DifficultyLevel difficulty);
    boolean existsByTitleAndCreatorId(String title, Long userId);

    @Query("SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator")
    List<CourseClass> findAllWithCreator();
}


