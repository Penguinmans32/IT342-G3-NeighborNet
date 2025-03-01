package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long userId);
    List<Item> findByCategory(String category);
}