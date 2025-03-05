package com.example.neighbornetbackend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BorrowingAgreementRequest {
    private Long itemId;
    private Long lenderId;
    private Long borrowerId;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "UTC")
    private LocalDateTime borrowingStart;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "UTC")
    private LocalDateTime borrowingEnd;

    private String terms;
    private String status;

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public Long getLenderId() {
        return lenderId;
    }

    public void setLenderId(Long lenderId) {
        this.lenderId = lenderId;
    }

    public Long getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(Long borrowerId) {
        this.borrowerId = borrowerId;
    }

    public LocalDateTime getBorrowingStart() {
        return borrowingStart;
    }

    public void setBorrowingStart(LocalDateTime borrowingStart) {
        this.borrowingStart = borrowingStart;
    }

    public LocalDateTime getBorrowingEnd() {
        return borrowingEnd;
    }

    public void setBorrowingEnd(LocalDateTime borrowingEnd) {
        this.borrowingEnd = borrowingEnd;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}