package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.model.BorrowingAgreement;

import java.util.List;

public interface BorrowingAgreementService {
    BorrowingAgreement create(BorrowingAgreement agreement);
    BorrowingAgreement getById(Long id);
    BorrowingAgreement updateStatus(Long id, String status);
    List<BorrowingAgreement> getByBorrowerId(Long borrowerId);
    List<BorrowingAgreement> getByLenderId(Long lenderId);
    List<BorrowingAgreement> findByItemIdAndUsersAndStatus(Long itemId, Long borrowerId, Long lenderId, String status);
    List<ItemDTO> getBorrowedItems(Long userId);
    List<ItemDTO> getLentItems(Long userId);
    List<BorrowingAgreement> getRecentBorrows();
}