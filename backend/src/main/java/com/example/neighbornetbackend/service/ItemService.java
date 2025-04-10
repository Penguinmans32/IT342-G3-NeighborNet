package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.dto.CreatorDTO;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.exception.ResourceNotFoundException;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.ItemRating;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {
    @PersistenceContext
    private EntityManager entityManager;


    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemImageStorageService itemImageStorageService;
    private final BorrowingAgreementRepository borrowingAgreementRepository;
    private final ActivityService activityService;
    private final ItemRatingRepository itemRatingRepository;
    private final ChatMessageRepository chatMessageRepository;

    private static final Logger logger = LoggerFactory.getLogger(ItemService.class);

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, ItemImageStorageService itemImageStorageService, BorrowingAgreementRepository borrowingAgreementRepository, ActivityService activityService, ItemRatingRepository itemRatingRepository,  ChatMessageRepository chatMessageRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.itemImageStorageService = itemImageStorageService;
        this.borrowingAgreementRepository = borrowingAgreementRepository;
        this.activityService = activityService;
        this.itemRatingRepository = itemRatingRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public ItemDTO createItem(Item item, List<MultipartFile> images, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> imageUrls = itemImageStorageService.storeItemImages(images);
        item.setImageUrls(imageUrls);
        item.setOwner(user);

        Item savedItem = itemRepository.save(item);

        activityService.trackActivity(
                userId,
                "item_shared",
                "Shared a new item",
                savedItem.getName(),
                "Package",
                savedItem.getId()
        );

        return convertToDTO(savedItem);
    }

    public List<ItemDTO> findNearbyItems(double latitude, double longitude, double radiusInKm) {
        return itemRepository.findItemsWithinRadius(latitude, longitude, radiusInKm)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemDTO> getAllItems() {
        LocalDate today = LocalDate.now();
        LocalDate nearExpirationThreshold = today.plusDays(3);

        return itemRepository.findAll().stream()
                .filter(item -> {
                    LocalDate availableUntil = item.getAvailableUntil();
                    if (availableUntil == null || availableUntil.isBefore(today)) {
                        if (availableUntil != null && availableUntil.isBefore(today)) {
                            notifyOwnerAboutExpiredItem(item);
                        }
                        return false;
                    }

                    if (availableUntil.isBefore(nearExpirationThreshold) || availableUntil.isEqual(nearExpirationThreshold)) {
                        notifyOwnerAboutExpiringItem(item);
                    }

                    return true;
                })
                .map(item -> {
                    ItemDTO dto = convertToDTO(item);
                    dto.setExpirationStatus(getExpirationStatus(item.getAvailableUntil()));
                    dto.setImageUrls(new ArrayList<>(item.getImageUrls()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private String getExpirationStatus(LocalDate availableUntil) {
        if (availableUntil == null) return "NO_DATE";

        LocalDate today = LocalDate.now();
        if (availableUntil.isBefore(today)) return "EXPIRED";

        LocalDate nearExpirationThreshold = today.plusDays(3);
        if (availableUntil.isBefore(nearExpirationThreshold) || availableUntil.isEqual(nearExpirationThreshold))
            return "EXPIRING_SOON";

        return "ACTIVE";
    }


    private void notifyOwnerAboutExpiredItem(Item item) {
        activityService.trackActivity(
                item.getOwner().getId(),
                "item_expired",
                "Your item has expired",
                item.getName(),
                "Warning",
                item.getId()
        );
    }

    private void notifyOwnerAboutExpiringItem(Item item) {
        activityService.trackActivity(
                item.getOwner().getId(),
                "item_expiring",
                "Your item will expire soon",
                item.getName(),
                "Info",
                item.getId()
        );
    }

    public List<ItemDTO> getItemsByUser(Long userId) {
        return itemRepository.findByOwnerId(userId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<ItemDTO> findItemsWithinBounds(double minLat, double maxLat, double minLng, double maxLng) {
        return itemRepository.findItemsWithinBounds(minLat, maxLat, minLng, maxLng)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
        dto.setLatitude(item.getLatitude());
        dto.setLongitude(item.getLongitude());
        if (item.getOwner() != null) {
            dto.setOwner(CreatorDTO.fromUser(item.getOwner()));
        }

        if (item.getBorrower() != null) {
            CreatorDTO borrowerDTO = CreatorDTO.fromUser(item.getBorrower());
            dto.setBorrower(borrowerDTO);
            Long agreementId = findActiveAgreementId(item.getId(), item.getBorrower().getId());
            dto.setBorrowingAgreementId(agreementId);
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

        activityService.trackActivity(
                userId,
                "item_deleted",
                "Deleted an item",
                item.getName(),
                "Trash",
                itemId
        );

        if (!item.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to delete this item");
        }

        if (item.getImageUrls() != null && !item.getImageUrls().isEmpty()) {
            for (String imageUrl : item.getImageUrls()) {
                try {
                    itemImageStorageService.deleteItemImage(imageUrl);
                } catch (IOException e) {
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

        activityService.trackActivity(
                userId,
                "item_updated",
                "Updated an item",
                savedItem.getName(),
                "Edit",
                savedItem.getId()
        );


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

    public List<ItemDTO> getAllCurrentlyBorrowedItems() {
        List<BorrowingAgreement> activeAgreements = borrowingAgreementRepository
                .findByStatusInAndBorrowingEndGreaterThan(
                        List.of(
                                "ACCEPTED",
                                "RETURN_PENDING",
                                "RETURN_REQUESTED",
                                "RETURN_REJECTED"
                        ),
                        LocalDateTime.now());

        return activeAgreements.stream()
                .map(agreement -> {
                    Item item = itemRepository.findById(agreement.getItemId()).orElse(null);
                    if (item != null) {
                        ItemDTO itemDTO = ItemDTO.fromItem(item);
                        User borrower = userRepository.findById(agreement.getBorrowerId()).orElse(null);
                        if (borrower != null) {
                            CreatorDTO borrowerDTO = CreatorDTO.fromUser(borrower);
                            itemDTO.setBorrower(borrowerDTO);
                            itemDTO.setBorrowingAgreementId(agreement.getId());
                        }
                        return itemDTO;
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private Long findActiveAgreementId(Long itemId, Long borrowerId) {
        BorrowingAgreement agreement = borrowingAgreementRepository
                .findFirstByItemIdAndBorrowerIdAndStatusIn(
                        itemId,
                        borrowerId,
                        List.of(
                                "ACCEPTED",
                                "RETURN_PENDING",
                                "RETURN_REQUESTED",
                                "RETURN_REJECTED"
                        )
                )
                .orElse(null);
        return agreement != null ? agreement.getId() : null;
    }

    @Transactional
    public void deleteItemAdmin(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Delete physical image files first
        if (item.getImageUrls() != null && !item.getImageUrls().isEmpty()) {
            for (String imageUrl : item.getImageUrls()) {
                try {
                    String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    itemImageStorageService.deleteItemImage(filename);
                } catch (IOException e) {
                    logger.error("Failed to delete image: " + imageUrl, e);
                }
            }
        }

        // Clear the persistence context
        entityManager.clear();

        // Delete chat messages referencing this item
        entityManager.createNativeQuery(
                        "DELETE FROM chat_message WHERE item_id = ?")
                .setParameter(1, itemId)
                .executeUpdate();

        // Delete image URLs from the item_image_urls table
        entityManager.createNativeQuery(
                        "DELETE FROM item_image_urls WHERE item_id = ?")
                .setParameter(1, itemId)
                .executeUpdate();

        // Delete borrow requests
        entityManager.createNativeQuery(
                        "DELETE FROM borrow_requests WHERE item_id = ?")
                .setParameter(1, itemId)
                .executeUpdate();

        // Delete borrowing agreements
        entityManager.createNativeQuery(
                        "DELETE FROM borrowing_agreement WHERE item_id = ?")
                .setParameter(1, itemId)
                .executeUpdate();

        // Finally delete the item
        entityManager.createNativeQuery(
                        "DELETE FROM items WHERE id = ?")
                .setParameter(1, itemId)
                .executeUpdate();

        // Ensure all changes are synchronized
        entityManager.flush();
    }

    public double getOverallAverageRating() {
        return itemRatingRepository.findAll().stream()
                .mapToDouble(ItemRating::getRating)
                .average()
                .orElse(0.0);
    }

    public List<ItemDTO> searchItems(String query) {
        return getAllItems().stream()
                .filter(item ->
                        item.getName().toLowerCase().contains(query.toLowerCase()) ||
                                item.getDescription().toLowerCase().contains(query.toLowerCase()) ||
                                item.getCategory().toLowerCase().contains(query.toLowerCase())
                )
                .collect(Collectors.toList());
    }
}