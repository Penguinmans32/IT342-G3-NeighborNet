package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Task> findTop5ByOrderByCreatedAtDesc();
    List<Task> findByCompletedOrderByCreatedAtDesc(boolean completed);
}