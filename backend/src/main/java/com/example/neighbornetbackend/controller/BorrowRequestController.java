package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.dto.NotificationDTO;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.BorrowRequestService;
import com.example.neighbornetbackend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrowing/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class BorrowRequestController {
    private final BorrowRequestService borrowRequestService;
    private final NotificationService notificationService;

    public BorrowRequestController(BorrowRequestService borrowRequestService, NotificationService notificationService) {
        this.borrowRequestService = borrowRequestService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<?> createBorrowRequest(
            @RequestBody BorrowRequestDTO request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            BorrowRequestDTO createdRequest = borrowRequestService.createBorrowRequest(request, currentUser.getId());

            // Create and send notification to the item owner
            notificationService.createAndSendNotification(
                    createdRequest.getOwnerId(),
                    "New Borrow Request",
                    "User " + currentUser.getUsername() + " wants to borrow your " + createdRequest.getItemName(),
                    "REQUEST"
            );

            return ResponseEntity.ok(createdRequest);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}