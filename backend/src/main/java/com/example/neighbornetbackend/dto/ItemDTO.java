package com.example.neighbornetbackend.dto;

import com.example.neighbornetbackend.model.Item;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ItemDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String location;
    private String availabilityPeriod;
    private String terms;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private String contactPreference;
    private String email;
    private String phone;
    private List<String> imageUrls;
    private CreatorDTO owner;
    private LocalDateTime createdAt;
    private Double latitude;
    private Double longitude;
    private CreatorDTO borrower;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS", timezone = "UTC")
    private LocalDateTime borrowingEnd;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS", timezone = "UTC")
    private LocalDateTime borrowingStart;

    private Long borrowerId;

    public static ItemDTO fromItem(Item item) {
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
        dto.setImageUrls(item.getImageUrls());
        dto.setCreatedAt(item.getCreatedAt());
        if (item.getBorrower() != null) {
            dto.setBorrower(CreatorDTO.fromUser(item.getBorrower()));
        }

        if (item.getOwner() != null) {
            dto.setOwner(CreatorDTO.fromUser(item.getOwner()));
        }

        return dto;
    }

    public ItemDTO() {
        // Default constructor
    }

    public ItemDTO(Long id, String name, String description, String category, String location,
                   String availabilityPeriod, String terms, LocalDate availableFrom, LocalDate availableUntil,
                   String contactPreference, String email, String phone, List<String> imageUrls,
                   CreatorDTO owner, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.location = location;
        this.availabilityPeriod = availabilityPeriod;
        this.terms = terms;
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
        this.contactPreference = contactPreference;
        this.email = email;
        this.phone = phone;
        this.imageUrls = imageUrls;
        this.owner = owner;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public String getAvailabilityPeriod() {
        return availabilityPeriod;
    }

    public void setAvailabilityPeriod(String availabilityPeriod) {
        this.availabilityPeriod = availabilityPeriod;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }

    public LocalDate getAvailableUntil() {
        return availableUntil;
    }

    public void setAvailableUntil(LocalDate availableUntil) {
        this.availableUntil = availableUntil;
    }

    public String getContactPreference() {
        return contactPreference;
    }

    public void setContactPreference(String contactPreference) {
        this.contactPreference = contactPreference;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls != null ? imageUrls : new ArrayList<>();
    }

    public List<String> getImageUrls() {
        return imageUrls != null ? imageUrls : new ArrayList<>();
    }

    public CreatorDTO getOwner() {
        return owner;
    }

    public void setOwner(CreatorDTO owner) {
        this.owner = owner;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    public CreatorDTO getBorrower() {
        return borrower;
    }

    public void setBorrower(CreatorDTO borrower) {
        this.borrower = borrower;
    }

    public LocalDateTime getBorrowingEnd() {
        return borrowingEnd;
    }

    public void setBorrowingEnd(LocalDateTime borrowingEnd) {
        this.borrowingEnd = borrowingEnd;
    }

    public LocalDateTime getBorrowingStart() {
        return borrowingStart;
    }

    public void setBorrowingStart(LocalDateTime borrowingStart) {
        this.borrowingStart = borrowingStart;
    }

    public Long getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(Long borrowerId) {
        this.borrowerId = borrowerId;
    }
}