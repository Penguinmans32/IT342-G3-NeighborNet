package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    @Query("SELECT l FROM Lesson l WHERE l.classEntity.id = :classId")
    List<Lesson> findByClassId(@Param("classId") Long classId);

    @Query("SELECT l FROM Lesson l WHERE l.classEntity.id = :classId AND l.parentLesson IS NULL")
    List<Lesson> findTopLevelLessonsByClassId(@Param("classId") Long classId);

    @Query("SELECT l FROM Lesson l WHERE l.classEntity.id = :classId AND l.id > :currentId ORDER BY l.id ASC LIMIT 1")
    Lesson findNextLesson(@Param("classId") Long classId, @Param("currentId") Long currentId);

    @Query("SELECT l FROM Lesson l WHERE l.classEntity.id = :classId AND l.id < :currentId ORDER BY l.id DESC LIMIT 1")
    Lesson findPrevLesson(@Param("classId") Long classId, @Param("currentId") Long currentId);
}