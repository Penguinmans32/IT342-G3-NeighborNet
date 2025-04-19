package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.SavedClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface SavedClassRepository extends JpaRepository<SavedClass, Long> {
    List<SavedClass> findByUserId(Long userId);
    Optional<SavedClass> findByUserIdAndCourseClassId(Long userId, Long classId);
    boolean existsByUserIdAndCourseClassId(Long userId, Long classId);
    void deleteByUserIdAndCourseClassId(Long userId, Long classId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SavedClass sc WHERE sc.courseClass.id = :classId")
    void deleteByCourseClassId(@Param("classId") Long classId);
}