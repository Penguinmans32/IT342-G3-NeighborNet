package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);

    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.user.id = :userId ORDER BY qa.score DESC LIMIT 1")
    Optional<QuizAttempt> findBestAttempt(@Param("quizId") Long quizId, @Param("userId") Long userId);
}