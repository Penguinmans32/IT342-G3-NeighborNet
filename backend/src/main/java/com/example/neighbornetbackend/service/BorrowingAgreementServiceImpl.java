package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class BorrowingAgreementServiceImpl implements BorrowingAgreementService {

    @Autowired
    private BorrowingAgreementRepository borrowingAgreementRepository;

    @Autowired
    private final NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private final ItemRepository itemRepository;

    private static final Logger log = LoggerFactory.getLogger(BorrowingAgreementServiceImpl.class);

    public BorrowingAgreementServiceImpl(NotificationService notificationService, ItemRepository itemRepository) {
        this.notificationService = notificationService;
        this.itemRepository = itemRepository;
    }

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

    @Transactional
    public BorrowingAgreement updateStatus(Long agreementId, String status) {
        BorrowingAgreement agreement = borrowingAgreementRepository.findById(agreementId)
                .orElseThrow(() -> new RuntimeException("Agreement not found"));

        Item item = itemRepository.findById(agreement.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        User borrower = userRepository.findById(agreement.getBorrowerId())
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        agreement.setStatus(status);
        BorrowingAgreement updatedAgreement = borrowingAgreementRepository.save(agreement);

        // Send notification based on status
        String title;
        String message;
        String type;
        Long recipientId;

        switch (status.toUpperCase()) {
            case "ACCEPTED":
                title = "Borrowing Request Accepted";
                message = "Your request to borrow '" + item.getName() + "' has been accepted";
                type = "BORROW_ACCEPTED";
                recipientId = agreement.getBorrowerId();
                break;
            case "REJECTED":
                title = "Borrowing Request Rejected";
                message = "Your request to borrow '" + item.getName() + "' has been rejected";
                type = "BORROW_REJECTED";
                recipientId = agreement.getBorrowerId();
                break;
            case "CANCELLED":
                title = "Borrowing Request Cancelled";
                message = borrower.getUsername() + " cancelled their request to borrow '" + item.getName() + "'";
                type = "BORROW_CANCELLED";
                recipientId = agreement.getLenderId();
                break;
            default:
                return updatedAgreement;
        }

        notificationService.createAndSendNotification(
                recipientId,
                title,
                message,
                type
        );

        return updatedAgreement;
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

    @Override
    public List<ItemDTO> getBorrowedItems(Long userId) {
        List<BorrowingAgreement> agreements = borrowingAgreementRepository.findByBorrowerId(userId)
                .stream()
                .filter(agreement -> "ACCEPTED".equals(agreement.getStatus()))
                .filter(agreement -> agreement.getBorrowingEnd().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        return agreements.stream()
                .map(agreement -> {
                    Item item = itemRepository.findById(agreement.getItemId()).orElse(null);
                    if (item != null) {
                        // Set the borrower information from the agreement
                        User borrower = userRepository.findById(agreement.getBorrowerId()).orElse(null);
                        item.setBorrower(borrower); // Make sure you've added setBorrower to Item class

                        // Create ItemDTO with borrower information
                        ItemDTO dto = ItemDTO.fromItem(item);

                        // Log for debugging
                        log.debug("Processing borrowed item: ItemId={}, BorrowerId={}, BorrowerName={}",
                                item.getId(),
                                borrower != null ? borrower.getId() : "null",
                                borrower != null ? borrower.getUsername() : "null");

                        return dto;
                    }
                    return null;
                })
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<ItemDTO> getLentItems(Long userId) {
        List<BorrowingAgreement> agreements = borrowingAgreementRepository.findByLenderId(userId)
                .stream()
                .filter(agreement -> "ACCEPTED".equals(agreement.getStatus()))
                .filter(agreement -> agreement.getBorrowingEnd().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        return agreements.stream()
                .map(agreement -> {
                    Item item = itemRepository.findById(agreement.getItemId()).orElse(null);
                    return item != null ? ItemDTO.fromItem(item) : null;
                })
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    public List<BorrowingAgreement> getRecentBorrows() {
        return borrowingAgreementRepository.findTop10ByStatusOrderByCreatedAtDesc("ACCEPTED");
    }
}