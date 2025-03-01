package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.dto.CreatorDTO;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ItemService {
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ItemImageStorageService itemImageStorageService;

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, ItemImageStorageService itemImageStorageService) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.itemImageStorageService = itemImageStorageService;
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
}