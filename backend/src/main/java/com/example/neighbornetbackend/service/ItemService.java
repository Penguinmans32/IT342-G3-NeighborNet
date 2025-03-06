package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.dto.CreatorDTO;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemImageStorageService itemImageStorageService;
    private final BorrowingAgreementRepository borrowingAgreementRepository;

    private static final Logger logger = LoggerFactory.getLogger(ItemService.class);

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, ItemImageStorageService itemImageStorageService, BorrowingAgreementRepository borrowingAgreementRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.itemImageStorageService = itemImageStorageService;
        this.borrowingAgreementRepository = borrowingAgreementRepository;
    }

    public ItemDTO createItem(Item item, List<MultipartFile> images, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> imageUrls = itemImageStorageService.storeItemImages(images);

        item.setImageUrls(imageUrls);
        item.setOwner(user);

        // Save the item
        Item savedItem = itemRepository.save(item);

        // Convert to DTO and return
        return convertToDTO(savedItem);
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(item -> {
                    ItemDTO dto = convertToDTO(item);
                    // Force initialization of the collection
                    dto.setImageUrls(new ArrayList<>(item.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<ItemDTO> getItemsByUser(Long userId) {
        return itemRepository.findByOwnerId(userId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    private ItemDTO convertToDTO(Item item) {
        ItemDTO dto = new ItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setLocation(item.getLocation());
        dto.setAvailabilityPeriod(item.getAvailabilityPeriod());
        dto.setTerms(item.getTerms());
        dto.setAvailableFrom(item.getAvailableFrom());
        dto.setAvailableUntil(item.getAvailableUntil());
        dto.setContactPreference(item.getContactPreference());
        dto.setEmail(item.getEmail());
        dto.setPhone(item.getPhone());
        // Force initialization of the collection
        dto.setImageUrls(new ArrayList<>(item.getImageUrls()));
        dto.setCreatedAt(item.getCreatedAt());

        if (item.getOwner() != null) {
            dto.setOwner(CreatorDTO.fromUser(item.getOwner()));
        }

        return dto;
    }

    public ItemDTO getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return convertToDTO(item);
    }

    @Transactional
    public void deleteItem(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Check if the user is the owner
        if (!item.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this item");
        }

        // Delete associated images if needed
        if (item.getImageUrls() != null && !item.getImageUrls().isEmpty()) {
            for (String imageUrl : item.getImageUrls()) {
                try {
                    itemImageStorageService.deleteItemImage(imageUrl);
                } catch (IOException e) {
                    // Log the error but continue with deletion
                    logger.error("Failed to delete image: " + imageUrl, e);
                }
            }
        }

        itemRepository.delete(item);
    }

    public ItemDTO updateItem(Long itemId, Item updatedItem, Long userId) {
        Item existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!existingItem.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this item");
        }

        // Update the fields
        existingItem.setName(updatedItem.getName());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setCategory(updatedItem.getCategory());
        existingItem.setLocation(updatedItem.getLocation());
        existingItem.setAvailabilityPeriod(updatedItem.getAvailabilityPeriod());
        existingItem.setTerms(updatedItem.getTerms());
        existingItem.setAvailableFrom(updatedItem.getAvailableFrom());
        existingItem.setAvailableUntil(updatedItem.getAvailableUntil());
        existingItem.setContactPreference(updatedItem.getContactPreference());
        existingItem.setEmail(updatedItem.getEmail());
        existingItem.setPhone(updatedItem.getPhone());

        Item savedItem = itemRepository.save(existingItem);
        return convertToDTO(savedItem);
    }

    public boolean isItemOwner(Long itemId, Long userId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null || item.getOwner() == null) {
            return false;
        }
        return item.getOwner().getId().equals(userId);
    }

    public List<BorrowingAgreement> getItemBorrowers(Long itemId) {
        return borrowingAgreementRepository.findByItemIdAndStatusAndBorrowingEndGreaterThan(
                itemId, "ACCEPTED", LocalDateTime.now());
    }
}