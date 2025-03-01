package com.example.neighbornetbackend.dto;

import java.time.LocalDate;

public class BorrowRequestDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long borrowerId;
    private String borrowerName;
    private Long ownerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String message;
    private String status;

    // Default constructor
    public BorrowRequestDTO() {
    }

    // Constructor with fields
    public BorrowRequestDTO(Long id, Long itemId, String itemName, Long borrowerId,
                            String borrowerName, Long ownerId, LocalDate startDate,
                            LocalDate endDate, String message, String status) {
        this.id = id;
        this.itemId = itemId;
        this.itemName = itemName;
        this.borrowerId = borrowerId;
        this.borrowerName = borrowerName;
        this.ownerId = ownerId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.message = message;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public Long getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(Long borrowerId) {
        this.borrowerId = borrowerId;
    }

    public String getBorrowerName() {
        return borrowerName;
    }

    public void setBorrowerName(String borrowerName) {
        this.borrowerName = borrowerName;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}