package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ErrorResponse;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.dto.RatingRequest;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import com.example.neighbornetbackend.service.ItemImageStorageService;
import com.example.neighbornetbackend.service.ItemRatingService;
import com.example.neighbornetbackend.service.ItemService;
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
import java.util.List;

@RestController
@RequestMapping("/api/borrowing/items")
public class ItemController {

    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);
    private final ItemService itemService;
    private final ItemImageStorageService itemImageStorageService;
    private final ItemRatingService itemRatingService;

    public ItemController(ItemService itemService, ItemImageStorageService itemImageStorageService, ItemRatingService itemRatingService) {
        this.itemService = itemService;
        this.itemImageStorageService = itemImageStorageService;
        this.itemRatingService = itemRatingService;
    }

    @PostMapping
    public ResponseEntity<ItemDTO> createItem(
            @ModelAttribute Item item,
            @RequestParam("images") List<MultipartFile> images,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ItemDTO createdItem = itemService.createItem(item, images, currentUser.getId());
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
            @RequestBody Item updatedItem,
            @CurrentUser UserPrincipal currentUser) {
        try {
            ItemDTO item = itemService.updateItem(id, updatedItem, currentUser.getId());
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
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
}