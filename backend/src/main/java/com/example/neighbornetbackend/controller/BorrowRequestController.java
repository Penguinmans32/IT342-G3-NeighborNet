package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.BorrowRequestDTO;
import com.example.neighbornetbackend.dto.NotificationDTO;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.BorrowRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrowing/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class BorrowRequestController {
    private final BorrowRequestService borrowRequestService;
    private final SimpMessagingTemplate messagingTemplate;

    public BorrowRequestController(BorrowRequestService borrowRequestService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.borrowRequestService = borrowRequestService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createBorrowRequest(
            @RequestBody BorrowRequestDTO request,
            @CurrentUser UserPrincipal currentUser) {
        try {
            BorrowRequestDTO createdRequest = borrowRequestService.createBorrowRequest(request, currentUser.getId());

            NotificationDTO notification = new NotificationDTO(
                    "New Borrow Request",
                    "Someone wants to borrow your " + createdRequest.getItemName(),
                    "REQUEST"
            );

            messagingTemplate.convertAndSendToUser(
                    createdRequest.getOwnerId().toString(),
                    "/queue/notifications",
                    notification
            );

            return ResponseEntity.ok(createdRequest);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}