package com.example.neighbornetbackend.repository;


import com.example.neighbornetbackend.model.LessonRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRatingRepository extends JpaRepository<LessonRating, Long> {
    Optional<LessonRating> findByLessonIdAndUserId(Long lessonId, Long userId);
    List<LessonRating> findByLessonId(Long lessonId);
    @Query("SELECT AVG(r.rating) FROM LessonRating r WHERE r.lesson.id = :lessonId")
    Double findAverageRatingByLessonId(@Param("lessonId") Long lessonId);
    long countByLessonId(Long lessonId);
}
