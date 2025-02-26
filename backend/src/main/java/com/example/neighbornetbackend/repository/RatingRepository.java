package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.ClassRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<ClassRating, Long> {

    @Query("SELECT r FROM ClassRating r WHERE r.courseClass.id = :classId AND r.userId = :userId")
    Optional<ClassRating> findByClassIdAndUserId(@Param("classId") Long classId, @Param("userId") Long userId);

    @Query("SELECT r FROM ClassRating r WHERE r.courseClass.id = :classId")
    List<ClassRating> findByClassId(@Param("classId") Long classId);

    @Query("SELECT AVG(r.rating) FROM ClassRating r WHERE r.courseClass.id = :classId")
    Double findAverageRatingByClassId(@Param("classId") Long classId);

    @Query("SELECT COUNT(r) FROM ClassRating r WHERE r.courseClass.id = :classId")
    Long countByClassId(@Param("classId") Long classId);
}