package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.model.ItemRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ItemRatingRepository extends JpaRepository<ItemRating, Long> {
    List<ItemRating> findByItemId(Long itemId);
    Optional<ItemRating> findByItemIdAndUserId(Long itemId, Long userId);

    @Query("SELECT AVG(r.rating) FROM ItemRating r WHERE r.itemId = ?1")
    Double getAverageRatingForItem(Long itemId);
}