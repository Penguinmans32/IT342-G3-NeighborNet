package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClassRepository extends JpaRepository<Class, Long> {

    List<Class> findByCreatorId(Long userId);
    List<Class> findByCategory(String category);
    List<Class> findByDifficulty(Class.DifficultyLevel difficulty);
    boolean existsByTitleAndCreatorId(String title, Long userId);
    @Query("SELECT c FROM Class c LEFT JOIN FETCH c.creator")
    List<Class> findAllWithCreator();

}


