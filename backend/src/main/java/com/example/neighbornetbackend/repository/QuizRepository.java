package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByClassEntity_Id(Long classId);

    @Query("SELECT q FROM Quiz q WHERE q.classEntity.id = :classId AND q.classEntity.creator.id = :userId")
    List<Quiz> findByClassIdAndCreatorId(@Param("classId") Long classId, @Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Quiz q WHERE q.classEntity.id = :classId")
    void deleteByClassId(@Param("classId") Long classId);
}