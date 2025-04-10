package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.ClassEnrollment;
import com.example.neighbornetbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Long> {
    boolean existsByCourseClassIdAndUser(Long classId, User user);

    @Query("SELECT COUNT(e) FROM ClassEnrollment e WHERE e.courseClass.id = :courseClassId")
    long countByCourseClassId(@Param("courseClassId") Long courseClassId);

    List<ClassEnrollment> findTop10ByOrderByEnrolledAtDesc();

    List<ClassEnrollment> findByUserId(Long userId);

    List<ClassEnrollment> findByUserIdOrderByEnrolledAtDesc(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ClassEnrollment ce WHERE ce.courseClass.creator.id = :userId OR ce.user.id = :userId")
    void deleteByCreatorOrEnrolledUserId(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ClassEnrollment ce WHERE ce.courseClass.id = :classId")
    void deleteByClassId(@Param("classId") Long classId);

    @Modifying
    @Query("DELETE FROM ClassEnrollment ce WHERE ce.courseClass.id = :classId")
    void deleteAllByCourseClassId(@Param("classId") Long classId);
}