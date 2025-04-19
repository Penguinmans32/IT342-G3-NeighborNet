package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.CourseClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<CourseClass, Long> {
    @Query("SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator WHERE c.id = :classId")
    Optional<CourseClass> findByIdWithCreator(@Param("classId") Long classId);

    List<CourseClass> findByCreatorId(Long userId);
    boolean existsByTitleAndCreatorId(String title, Long userId);
    List<CourseClass> findByCategoryAndIdNot(String category, Long id);

    @Query(value = "SELECT c FROM CourseClass c LEFT JOIN FETCH c.creator",
            countQuery = "SELECT COUNT(c) FROM CourseClass c")
    Page<CourseClass> findAllWithCreator(Pageable pageable);

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

    int countByCreatorId(Long creatorId);

    List<CourseClass> findTop3ByOrderByEnrolledCountDesc();

    @Modifying
    @Transactional
    @Query("DELETE FROM ClassEnrollment ce WHERE ce.courseClass.creator.id = :userId OR ce.user.id = :userId")
    void deleteByCreatorOrEnrolledUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM CourseClass c ORDER BY c.createdAt DESC")
    List<CourseClass> findTop50ByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT SUM(c.enrolledCount) FROM CourseClass c")
    long countTotalEnrolledStudents();

    @Query("SELECT AVG(c.averageRating) FROM CourseClass c WHERE c.averageRating > 0")
    double findAverageRatingAcrossAllClasses();

    @Query("SELECT COUNT(c) FROM CourseClass c WHERE c.enrolledCount > 0")
    long countClassesWithEnrollments();

    @Query("SELECT c FROM CourseClass c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<CourseClass> searchClassesPaged(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM CourseClass c WHERE " +
            "LOWER(c.category) = :category AND " +
            "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<CourseClass> searchClassesByCategoryPaged(
            @Param("category") String category,
            @Param("query") String query,
            Pageable pageable
    );
}


