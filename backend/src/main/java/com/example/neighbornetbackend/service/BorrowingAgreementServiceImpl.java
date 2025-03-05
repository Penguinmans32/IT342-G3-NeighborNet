package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BorrowingAgreementServiceImpl implements BorrowingAgreementService {

    @Autowired
    private BorrowingAgreementRepository borrowingAgreementRepository;

    @Override
    public BorrowingAgreement create(BorrowingAgreement agreement) {
        // Check for overlapping agreements
        List<BorrowingAgreement> overlappingAgreements = borrowingAgreementRepository
                .findOverlappingAgreements(
                        agreement.getItemId(),
                        agreement.getBorrowingStart(),
                        agreement.getBorrowingEnd()
                );

        if (!overlappingAgreements.isEmpty()) {
            throw new RuntimeException("Item is not available during the requested period");
        }

        agreement.setCreatedAt(LocalDateTime.now());
        agreement.setStatus("PENDING");
        return borrowingAgreementRepository.save(agreement);
    }

    @Override
    public BorrowingAgreement getById(Long id) {
        return borrowingAgreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agreement not found"));
    }

    @Override
    public BorrowingAgreement updateStatus(Long id, String status) {
        BorrowingAgreement agreement = getById(id);
        agreement.setStatus(status);
        return borrowingAgreementRepository.save(agreement);
    }

    @Override
    public List<BorrowingAgreement> getByBorrowerId(Long borrowerId) {
        return borrowingAgreementRepository.findByBorrowerId(borrowerId);
    }

    @Override
    public List<BorrowingAgreement> getByLenderId(Long lenderId) {
        return borrowingAgreementRepository.findByLenderId(lenderId);
    }

    public List<BorrowingAgreement> findByItemIdAndUsersAndStatus(
            Long itemId, Long borrowerId, Long lenderId, String status) {
        // Only check for PENDING agreements with the same itemId
        return borrowingAgreementRepository.findByItemIdAndStatusAndBorrowingEndGreaterThan(
                itemId,
                "PENDING",
                LocalDateTime.now()
        );
    }
}