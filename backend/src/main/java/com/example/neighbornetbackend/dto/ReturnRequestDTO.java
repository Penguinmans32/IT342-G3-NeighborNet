package com.example.neighbornetbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class ReturnRequestDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long borrowerId;
    private Long lenderId;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS", timezone = "UTC")
    private LocalDateTime borrowingStart;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS", timezone = "UTC")
    private LocalDateTime borrowingEnd;
    private String status;
    private String returnNote;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS", timezone = "UTC")
    private LocalDateTime createdAt;
    private String rejectionReason;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public Long getBorrowerId() { return borrowerId; }
    public void setBorrowerId(Long borrowerId) { this.borrowerId = borrowerId; }

    public Long getLenderId() { return lenderId; }
    public void setLenderId(Long lenderId) { this.lenderId = lenderId; }

    public LocalDateTime getBorrowingStart() { return borrowingStart; }
    public void setBorrowingStart(LocalDateTime borrowingStart) { this.borrowingStart = borrowingStart; }

    public LocalDateTime getBorrowingEnd() { return borrowingEnd; }
    public void setBorrowingEnd(LocalDateTime borrowingEnd) { this.borrowingEnd = borrowingEnd; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReturnNote() { return returnNote; }
    public void setReturnNote(String returnNote) { this.returnNote = returnNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}