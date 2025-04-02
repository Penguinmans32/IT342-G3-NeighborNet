package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ApiResponse;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.service.BorrowingAgreementService;
import com.example.neighbornetbackend.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/items")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminItemController {
    private final ItemService itemService;
    private final ItemRepository itemRepository;
    private final BorrowingAgreementService borrowingAgreementService;

    public AdminItemController(ItemService itemService,
                               ItemRepository itemRepository,
                               BorrowingAgreementService borrowingAgreementService) {
        this.itemService = itemService;
        this.itemRepository = itemRepository;
        this.borrowingAgreementService = borrowingAgreementService;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getItemStats() {
        try {
            Map<String, Object> stats = new HashMap<>();

            long totalItems = itemRepository.count();
            stats.put("totalItems", totalItems);

            long totalBorrowed = itemService.getAllCurrentlyBorrowedItems().size();
            stats.put("totalBorrowed", totalBorrowed);

            long totalBorrowers = borrowingAgreementService.getTotalBorrowers();
            stats.put("totalBorrowers", totalBorrowers);

            double averageRating = itemService.getOverallAverageRating();
            stats.put("averageRating", averageRating);

            return ResponseEntity.ok(ApiResponse.success(stats, "Item stats retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching item stats: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllItems(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            List<ItemDTO> items;
            if (search != null && !search.trim().isEmpty()) {
                items = itemService.searchItems(search.trim());
            } else {
                items = itemService.getAllItems();
            }
            return ResponseEntity.ok(ApiResponse.success(items, "Items retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching items: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id) {
        try {
            itemService.deleteItemAdmin(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting item: " + e.getMessage()));
        }
    }
}