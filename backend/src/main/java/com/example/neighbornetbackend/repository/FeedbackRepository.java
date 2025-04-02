package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByClassEntityIdOrderByCreatedAtDesc(Long classId);
    Optional<Feedback> findByClassEntityIdAndUserId(Long classId, Long userId);
    boolean existsByClassEntityIdAndUserId(Long classId, Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Feedback f WHERE f.classEntity.creator.id = :userId")
    void deleteByCreatorId(@Param("userId") Long userId);
}