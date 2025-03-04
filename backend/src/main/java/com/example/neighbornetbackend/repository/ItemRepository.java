package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByOwnerId(Long userId);
    List<Item> findByCategory(String category);
}