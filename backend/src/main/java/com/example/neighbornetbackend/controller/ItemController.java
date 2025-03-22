package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ErrorResponse;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.dto.ItemUpdateRequest;
import com.example.neighbornetbackend.dto.RatingRequest;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import com.example.neighbornetbackend.service.*;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowing/items")
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);
    private final ItemService itemService;
    private final ItemImageStorageService itemImageStorageService;
    private final ItemRatingService itemRatingService;
    private final BorrowingAgreementService borrowingAgreementService;
    private final AchievementService achievementService;

    public ItemController(ItemService itemService, ItemImageStorageService itemImageStorageService, ItemRatingService itemRatingService, BorrowingAgreementService borrowingAgreementService, AchievementService achievementService) {
        this.itemService = itemService;
        this.itemImageStorageService = itemImageStorageService;
        this.itemRatingService = itemRatingService;
        this.borrowingAgreementService = borrowingAgreementService;
        this.achievementService = achievementService;
    }

    @PostMapping
    public ResponseEntity<ItemDTO> createItem(
            @ModelAttribute Item item,
            @RequestParam("images") List<MultipartFile> images,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ItemDTO createdItem = itemService.createItem(item, images, currentUser.getId());
            achievementService.checkItemPostingAchievements(currentUser.getId());
            return ResponseEntity.ok(createdItem);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ItemDTO>> getAllItems() {
        try {
            logger.debug("Getting all items");
            List<ItemDTO> items = itemService.getAllItems();
            // Force initialization of collections
            items.forEach(item -> {
                if (item.getImageUrls() == null) {
                    item.setImageUrls(new ArrayList<>());
                }
            });
            logger.debug("Successfully retrieved {} items", items.size());
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            logger.error("Error getting all items", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<ItemDTO>> getUserItems(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(itemService.getItemsByUser(currentUser.getId()));
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path imagePath = itemImageStorageService.getItemImagePath(filename);

            Resource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.IMAGE_JPEG))
                        .body(resource);
            } else {
                logger.debug("Image not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            logger.debug("Error getting image: " + filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> getItemById(@PathVariable Long id) {
        try {
            logger.debug("Getting item with id: {}", id);
            ItemDTO item = itemService.getItemById(id);
            if (item != null) {
                return ResponseEntity.ok(item);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error getting item with id: " + id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, @CurrentUser UserPrincipal currentUser) {
        try {
            itemService.deleteItem(id, currentUser.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> updateItem(
            @PathVariable Long id,
            @RequestBody ItemUpdateRequest updateRequest,
            @CurrentUser UserPrincipal currentUser) {
        try {
            // Convert DTO to Item
            Item updatedItem = new Item();
            updatedItem.setName(updateRequest.getName());
            updatedItem.setDescription(updateRequest.getDescription());
            updatedItem.setCategory(updateRequest.getCategory());
            updatedItem.setLocation(updateRequest.getLocation());
            updatedItem.setAvailabilityPeriod(updateRequest.getAvailabilityPeriod());
            updatedItem.setAvailableFrom(updateRequest.getAvailableFrom());
            updatedItem.setAvailableUntil(updateRequest.getAvailableUntil());
            updatedItem.setTerms(updateRequest.getTerms());
            updatedItem.setContactPreference(updateRequest.getContactPreference());
            updatedItem.setEmail(updateRequest.getEmail());
            updatedItem.setPhone(updateRequest.getPhone());

            ItemDTO item = itemService.updateItem(id, updatedItem, currentUser.getId());
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            logger.error("Error updating item", e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ItemRating> rateItem(
            @PathVariable Long id,
            @RequestBody RatingRequest ratingRequest,
            @CurrentUser UserPrincipal currentUser) {
        ItemRating rating = itemRatingService.rateItem(id, currentUser.getId(), ratingRequest.getRating());
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<Double> getItemRating(@PathVariable Long id) {
        Double averageRating = itemRatingService.getAverageRating(id);
        return ResponseEntity.ok(averageRating != null ? averageRating : 0.0);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ItemDTO>> getItemsByUserId(@PathVariable Long userId) {
        try {
            logger.debug("Getting items for user ID: {}", userId);
            List<ItemDTO> items = itemService.getItemsByUser(userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            logger.error("Error getting items for user ID: " + userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/borrowed")
    public ResponseEntity<List<ItemDTO>> getBorrowedItems(@CurrentUser UserPrincipal currentUser) {
        try {
            List<ItemDTO> borrowedItems = borrowingAgreementService.getBorrowedItems(currentUser.getId());
            return ResponseEntity.ok(borrowedItems);
        } catch (Exception e) {
            logger.error("Error getting borrowed items for user: " + currentUser.getId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{itemId}/current-borrowing")
    public ResponseEntity<?> getCurrentBorrowing(@PathVariable Long itemId) {
        try {
            BorrowingAgreement currentAgreement = borrowingAgreementService
                    .findByItemIdAndStatus(itemId, "ACCEPTED")
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (currentAgreement != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("borrowerId", currentAgreement.getBorrowerId());
                response.put("borrowingStart", currentAgreement.getBorrowingStart());
                response.put("borrowingEnd", currentAgreement.getBorrowingEnd());
                response.put("status", currentAgreement.getStatus());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.ok(new HashMap<>());
            }
        } catch (Exception e) {
            logger.error("Error getting current borrowing for item: " + itemId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all-borrowed")
    public ResponseEntity<List<ItemDTO>> getAllBorrowedItems() {
        try {
            logger.debug("Getting all borrowed items");
            List<ItemDTO> borrowedItems = itemService.getAllCurrentlyBorrowedItems();
            return ResponseEntity.ok(borrowedItems);
        } catch (Exception e) {
            logger.error("Error getting all borrowed items", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/lent")
    public ResponseEntity<List<ItemDTO>> getLentItems(@CurrentUser UserPrincipal currentUser) {
        try {
            List<ItemDTO> lentItems = borrowingAgreementService.getLentItems(currentUser.getId());
            return ResponseEntity.ok(lentItems);
        } catch (Exception e) {
            logger.error("Error getting lent items for user: " + currentUser.getId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{itemId}/borrowers")
    public ResponseEntity<?> getItemBorrowers(
            @PathVariable Long itemId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            // Check if the current user owns the item
            if (!itemService.isItemOwner(itemId, currentUser.getId())) {
                return ResponseEntity.status(403).body(new ErrorResponse("You don't own this item"));
            }
            List<BorrowingAgreement> borrowers = itemService.getItemBorrowers(itemId);
            return ResponseEntity.ok(borrowers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ItemDTO>> getNearbyItems(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusInKm) {
        List<ItemDTO> nearbyItems = itemService.findNearbyItems(latitude, longitude, radiusInKm);
        return ResponseEntity.ok(nearbyItems);
    }

    @GetMapping("/within-bounds")
    public ResponseEntity<List<ItemDTO>> getItemsWithinBounds(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        List<ItemDTO> items = itemService.findItemsWithinBounds(minLat, maxLat, minLng, maxLng);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/user-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserItemStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            int itemsPosted = itemService.getItemsByUser(userId).size();
            stats.put("itemsPosted", itemsPosted);

            int borrowedItems = borrowingAgreementService.getBorrowedItems(userId).size();
            stats.put("currentlyBorrowed", borrowedItems);

            int lentItems = borrowingAgreementService.getLentItems(userId).size();
            stats.put("currentlyLent", lentItems);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting user item stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}