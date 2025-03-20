package com.example.neighbornetbackend.repository;


import com.example.neighbornetbackend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Activity> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}