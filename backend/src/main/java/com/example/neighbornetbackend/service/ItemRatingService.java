package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.ItemRating;
import com.example.neighbornetbackend.repository.ItemRatingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemRatingService {
    private final ItemRatingRepository itemRatingRepository;

    public ItemRatingService(ItemRatingRepository itemRatingRepository) {
        this.itemRatingRepository = itemRatingRepository;
    }

    @Transactional
    public ItemRating rateItem(Long itemId, Long userId, double rating) {
        ItemRating itemRating = itemRatingRepository
                .findByItemIdAndUserId(itemId, userId)
                .orElse(new ItemRating());

        itemRating.setItemId(itemId);
        itemRating.setUserId(userId);
        itemRating.setRating(rating);

        return itemRatingRepository.save(itemRating);
    }

    public Double getAverageRating(Long itemId) {
        return itemRatingRepository.getAverageRatingForItem(itemId);
    }
}