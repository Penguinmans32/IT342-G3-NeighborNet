package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.SavedClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedClassRepository extends JpaRepository<SavedClass, Long> {
    List<SavedClass> findByUserId(Long userId);
    Optional<SavedClass> findByUserIdAndCourseClassId(Long userId, Long classId);
    boolean existsByUserIdAndCourseClassId(Long userId, Long classId);
    void deleteByUserIdAndCourseClassId(Long userId, Long classId);
}