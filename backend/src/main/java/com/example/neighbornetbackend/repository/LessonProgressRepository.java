package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByClassEntity_IdAndUser_Id(Long classId, Long userId);
    Optional<LessonProgress> findByLesson_IdAndUser_Id(Long lessonId, Long userId);
}