package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ItemRatingRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemRatingService {
    private final ItemRatingRepository ratingRepository;
    private final ItemRepository itemRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public ItemRatingService(ItemRatingRepository ratingRepository,
                             ItemRepository itemRepository,
                             NotificationService notificationService,
                             UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.itemRepository = itemRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }



    @Transactional
    public ItemRating rateItem(Long itemId, Long userId, Double rating) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User rater = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ItemRating itemRating = ratingRepository.findByItemIdAndUserId(itemId, userId)
                .orElse(new ItemRating());

        itemRating.setItemId(itemId);
        itemRating.setUserId(userId);
        itemRating.setRating(rating);

        ItemRating savedRating = ratingRepository.save(itemRating);

        if (!item.getOwner().getId().equals(userId)) {
            String formattedRating = String.format("%.1f", rating);
            notificationService.createAndSendNotification(
                    item.getOwner().getId(),
                    "New Item Rating",
                    rater.getUsername() + " rated your item '" + item.getName() + "' with " + formattedRating + " stars",
                    "ITEM_RATING"
            );
        }

        return savedRating;
    }

    public Double getAverageRating(Long itemId) {
        return ratingRepository.getAverageRatingForItem(itemId);
    }
}