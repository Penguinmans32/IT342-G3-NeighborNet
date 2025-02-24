package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByClassEntity_IdAndUser_Id(Long classId, Long userId);
    Optional<LessonProgress> findByLesson_IdAndUser_Id(Long lessonId, Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LessonProgress lp WHERE lp.classEntity.id = :classId")
    void deleteByClassId(@Param("classId") Long classId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LessonProgress lp WHERE lp.lesson.id IN (SELECT l.id FROM Lesson l WHERE l.classEntity.id = :classId)")
    void deleteByLessonClassId(@Param("classId") Long classId);
}