package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.CourseClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<CourseClass, Long> {
    @Query("SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator WHERE c.id = :classId")
    Optional<CourseClass> findByIdWithCreator(@Param("classId") Long classId);

    List<CourseClass> findByCreatorId(Long userId);
    List<CourseClass> findByCategory(String category);
    List<CourseClass> findByDifficulty(CourseClass.DifficultyLevel difficulty);
    boolean existsByTitleAndCreatorId(String title, Long userId);
    List<CourseClass> findByCategoryAndIdNot(String category, Long id);

    @Query("SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator")
    List<CourseClass> findAllWithCreator();

    long countByCreatedAtBefore(LocalDateTime date);

    @Query("SELECT c FROM CourseClass c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CourseClass> searchClasses(@Param("query") String query);

    @Query("SELECT c FROM CourseClass c WHERE " +
            "LOWER(c.category) = LOWER(:category) AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<CourseClass> searchClassesByCategory(
            @Param("category") String category,
            @Param("query") String query
    );
}


