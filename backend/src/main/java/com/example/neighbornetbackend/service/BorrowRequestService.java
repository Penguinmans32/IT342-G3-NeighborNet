package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.model.BorrowRequest;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.BorrowRequestRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class BorrowRequestService {
    private static final Logger logger = LoggerFactory.getLogger(BorrowRequestService.class);

    private final BorrowRequestRepository borrowRequestRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public BorrowRequestService(BorrowRequestRepository borrowRequestRepository,
                                ItemRepository itemRepository,
                                UserRepository userRepository, ActivityService activityService) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
    }

    @Transactional
    public BorrowRequestDTO createBorrowRequest(BorrowRequestDTO requestDTO, Long borrowerId) {
        try {
            logger.info("Creating borrow request for item {} by user {}", requestDTO.getItemId(), borrowerId);

            Item item = itemRepository.findById(requestDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found with ID: " + requestDTO.getItemId()));

            LocalDate startDate = requestDTO.getStartDate();
            LocalDate endDate = requestDTO.getEndDate();
            LocalDate itemAvailableFrom = item.getAvailableFrom();
            LocalDate itemAvailableUntil = item.getAvailableUntil();

            if (startDate.isBefore(itemAvailableFrom) || endDate.isAfter(itemAvailableUntil)) {
                throw new IllegalArgumentException(
                        String.format("Request dates must be between %s and %s",
                                itemAvailableFrom, itemAvailableUntil)
                );
            }

            User borrower = userRepository.findById(borrowerId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + borrowerId));

            BorrowRequest request = new BorrowRequest();
            request.setItem(item);
            request.setBorrower(borrower);
            request.setStartDate(startDate);
            request.setEndDate(endDate);
            request.setMessage(requestDTO.getMessage());


            BorrowRequest savedRequest = borrowRequestRepository.save(request);
            logger.info("Successfully created borrow request with ID: {}", savedRequest.getId());

            activityService.trackActivity(
                    borrowerId,
                    "item_requested",
                    "Requested to borrow an item",
                    item.getName(),
                    "HandShake",
                    item.getId()
            );

            return convertToDTO(savedRequest);
        } catch (Exception e) {
            logger.error("Error creating borrow request: ", e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private boolean isItemAvailable(Item item, LocalDate startDate, LocalDate endDate) {
        return item.getAvailableFrom().isBefore(startDate) &&
                item.getAvailableUntil().isAfter(endDate) &&
                !borrowRequestRepository.existsByItemAndStatusAndDateRangeOverlap(
                        item, "ACCEPTED", startDate, endDate);
    }

    private BorrowRequestDTO convertToDTO(BorrowRequest request) {
        BorrowRequestDTO dto = new BorrowRequestDTO();
        dto.setId(request.getId());
        dto.setItemId(request.getItem().getId());
        dto.setItemName(request.getItem().getName());
        dto.setBorrowerId(request.getBorrower().getId());
        dto.setBorrowerName(request.getBorrower().getUsername());
        dto.setOwnerId(request.getItem().getOwner().getId());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setMessage(request.getMessage());
        dto.setStatus(request.getStatus());
        return dto;
    }

    @Transactional
    public BorrowRequestDTO approveBorrowRequest(Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        request.setStatus("ACCEPTED");
        BorrowRequest savedRequest = borrowRequestRepository.save(request);

        // Track for the owner (lender)
        activityService.trackActivity(
                request.getItem().getOwner().getId(),
                "item_lent",
                "Approved lending request",
                request.getItem().getName(),
                "Check",
                request.getItem().getId()
        );

        // Track for the borrower
        activityService.trackActivity(
                request.getBorrower().getId(),
                "item_borrowed",
                "Started borrowing an item",
                request.getItem().getName(),
                "HandShake",
                request.getItem().getId()
        );

        return convertToDTO(savedRequest);
    }

    @Transactional
    public BorrowRequestDTO completeReturn(Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        request.setStatus("RETURNED");
        BorrowRequest savedRequest = borrowRequestRepository.save(request);

        // Track the item return
        activityService.trackActivity(
                request.getBorrower().getId(),
                "item_returned",
                "Returned a borrowed item",
                request.getItem().getName(),
                "RotateCcw",
                request.getItem().getId()
        );

        return convertToDTO(savedRequest);
    }

    @Transactional
    public BorrowRequestDTO rejectBorrowRequest(Long requestId) {
        BorrowRequest request = borrowRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        request.setStatus("REJECTED");
        BorrowRequest savedRequest = borrowRequestRepository.save(request);

        // Track the rejection
        activityService.trackActivity(
                request.getItem().getOwner().getId(),
                "item_request_rejected",
                "Rejected borrowing request",
                request.getItem().getName(),
                "X",
                request.getItem().getId()
        );

        return convertToDTO(savedRequest);
    }
}