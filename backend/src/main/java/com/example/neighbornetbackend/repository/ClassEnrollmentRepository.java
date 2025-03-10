package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.ClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Long> {
    boolean existsByCourseClassIdAndUserId(Long courseClassId, Long userId);

    @Query("SELECT COUNT(e) FROM ClassEnrollment e WHERE e.courseClass.id = :courseClassId")
    long countByCourseClassId(@Param("courseClassId") Long courseClassId);

    List<ClassEnrollment> findTop10ByOrderByEnrolledAtDesc();

    List<ClassEnrollment> findByUserId(Long userId);
}