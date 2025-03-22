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
        agreement.setCreatedAt(LocalDateTime.now());
        agreement.setStatus("PENDING");
        return borrowingAgreementRepository.save(agreement);
    }

    @Override
    public List<BorrowingAgreement> getUserBorrows(Long userId) {
        return borrowingAgreementRepository.findByBorrowerIdOrderByCreatedAtDesc(userId);
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

        if ("ACCEPTED".equals(status.toUpperCase())) {
            List<BorrowingAgreement> overlappingAgreements = borrowingAgreementRepository
                    .findOverlappingAgreements(
                            agreement.getItemId(),
                            agreement.getBorrowingStart(),
                            agreement.getBorrowingEnd()
                    );

            overlappingAgreements.forEach(otherAgreement -> {
                if (!otherAgreement.getId().equals(agreementId)) {
                    otherAgreement.setStatus("REJECTED");
                    otherAgreement.setRejectionReason("Another agreement has been accepted for this item");
                    borrowingAgreementRepository.save(otherAgreement);

                    // Send notification
                    notificationService.createAndSendNotification(
                            otherAgreement.getBorrowerId(),
                            "Borrowing Request Automatically Rejected",
                            "Your request to borrow '" + item.getName() + "' has been automatically rejected as another request has been accepted.",
                            "BORROW_REJECTED"
                    );
                }
            });
        }

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
                return borrowingAgreementRepository.save(agreement);
        }

        notificationService.createAndSendNotification(
                recipientId,
                title,
                message,
                type
        );

        return borrowingAgreementRepository.save(agreement);
    }

    private BorrowingAgreement addRejectionReasonToAgreement(BorrowingAgreement agreement, String reason) {
        agreement.setRejectionReason(reason);
        return agreement;
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
        return borrowingAgreementRepository.findByItemIdAndBorrowerIdAndLenderIdAndStatusAndBorrowingEndGreaterThan(
                itemId,
                borrowerId,
                lenderId,
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
                        item.setBorrower(borrower);

                        // Create ItemDTO with borrower information
                        ItemDTO dto = ItemDTO.fromItem(item);

                        // Add the borrowing details to the DTO
                        dto.setBorrowingEnd(agreement.getBorrowingEnd());
                        dto.setBorrowingStart(agreement.getBorrowingStart());
                        dto.setBorrowerId(agreement.getBorrowerId());

                        log.debug("Processing borrowed item: ItemId={}, BorrowerId={}, BorrowerName={}, BorrowingEnd={}",
                                item.getId(),
                                borrower != null ? borrower.getId() : "null",
                                borrower != null ? borrower.getUsername() : "null",
                                agreement.getBorrowingEnd());

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
                    if (item != null) {
                        ItemDTO dto = ItemDTO.fromItem(item);
                        dto.setBorrowingEnd(agreement.getBorrowingEnd());
                        dto.setBorrowingStart(agreement.getBorrowingStart());
                        dto.setBorrowerId(agreement.getBorrowerId());
                        return dto;
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<BorrowingAgreement> getRecentBorrows() {
        return borrowingAgreementRepository.findTop10ByStatusOrderByCreatedAtDesc("ACCEPTED");
    }

    @Override
    public List<BorrowingAgreement> findByItemIdAndStatus(Long itemId, String status) {
        return borrowingAgreementRepository.findByItemIdAndStatus(itemId, status);
    }
}