package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ReturnRequestDTO;
import com.example.neighbornetbackend.model.ReturnRequest;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.repository.ReturnRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReturnRequestService {
    private final ReturnRequestRepository returnRequestRepository;
    private final BorrowingAgreementService borrowingAgreementService;
    private final NotificationService notificationService;

    public ReturnRequestService(
            ReturnRequestRepository returnRequestRepository,
            BorrowingAgreementService borrowingAgreementService,
            NotificationService notificationService) {
        this.returnRequestRepository = returnRequestRepository;
        this.borrowingAgreementService = borrowingAgreementService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReturnRequest createReturnRequest(Long itemId, Long borrowerId, String returnNote) {
        // Check if there's already a pending return request
        if (returnRequestRepository.findByItemIdAndBorrowerIdAndStatus(itemId, borrowerId, "PENDING").isPresent()) {
            throw new RuntimeException("A pending return request already exists for this item");
        }

        // Get the active borrowing agreement
        BorrowingAgreement agreement = borrowingAgreementService
                .findByItemIdAndStatus(itemId, "ACCEPTED")
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No active borrowing found for this item"));

        // Verify the borrower
        if (!agreement.getBorrowerId().equals(borrowerId)) {
            throw new RuntimeException("You are not the borrower of this item");
        }

        // Create return request
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setItemId(itemId);
        returnRequest.setBorrowerId(borrowerId);
        returnRequest.setLenderId(agreement.getLenderId());
        returnRequest.setStatus("PENDING");
        returnRequest.setReturnNote(returnNote);

        return returnRequestRepository.save(returnRequest);
    }

    @Transactional
    public ReturnRequest updateReturnRequestStatus(Long returnRequestId, String status, String rejectionReason) {
        ReturnRequest returnRequest = returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        returnRequest.setStatus(status);
        if (rejectionReason != null) {
            returnRequest.setRejectionReason(rejectionReason);
        }

        return returnRequestRepository.save(returnRequest);
    }

    public ReturnRequest getReturnRequest(Long returnRequestId) {
        return returnRequestRepository.findById(returnRequestId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));
    }
}