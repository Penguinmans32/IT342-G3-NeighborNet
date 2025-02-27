package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByClassEntityIdOrderByCreatedAtDesc(Long classId);
    Optional<Feedback> findByClassEntityIdAndUserId(Long classId, Long userId);
    boolean existsByClassEntityIdAndUserId(Long classId, Long userId);
}