package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.security.CurrentUser;
import com.example.neighbornetbackend.security.UserPrincipal;
import com.example.neighbornetbackend.service.BorrowingAgreementService;
import com.example.neighbornetbackend.service.NotificationService;
import com.example.neighbornetbackend.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/borrowing/returns")
@CrossOrigin(origins = "http://localhost:5173")
public class ReturnRequestController {
    private final BorrowingAgreementService borrowingAgreementService;
    private final NotificationService notificationService;

    public ReturnRequestController(
            BorrowingAgreementService borrowingAgreementService,
            NotificationService notificationService) {
        this.borrowingAgreementService = borrowingAgreementService;
        this.notificationService = notificationService;
    }

    @PostMapping("/request/{itemId}")
    public ResponseEntity<?> initiateReturn(
            @PathVariable Long itemId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            BorrowingAgreement agreement = borrowingAgreementService
                    .findByItemIdAndStatus(itemId, "ACCEPTED")
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No active borrowing found for this item"));

            if (!agreement.getBorrowerId().equals(currentUser.getId())) {
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not the borrower of this item"));
            }

            agreement.setStatus("RETURN_REQUESTED");
            BorrowingAgreement updatedAgreement = borrowingAgreementService.save(agreement);

            notificationService.createAndSendNotification(
                    agreement.getLenderId(),
                    "Return Request",
                    "User " + currentUser.getUsername() + " has requested to return your item",
                    "RETURN_REQUEST"
            );

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/confirm/{itemId}")
    public ResponseEntity<?> confirmReturn(
            @PathVariable Long itemId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            BorrowingAgreement agreement = borrowingAgreementService
                    .findByItemIdAndStatus(itemId, "RETURN_REQUESTED")
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No return request found for this item"));

            if (!agreement.getLenderId().equals(currentUser.getId())) {
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not the owner of this item"));
            }

            agreement.setStatus("RETURNED");
            BorrowingAgreement updatedAgreement = borrowingAgreementService.save(agreement);

            notificationService.createAndSendNotification(
                    agreement.getBorrowerId(),
                    "Return Confirmed",
                    "The owner has confirmed the return of the item",
                    "RETURN_CONFIRMED"
            );

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/status/{itemId}")
    public ResponseEntity<?> getReturnStatus(
            @PathVariable Long itemId,
            @CurrentUser UserPrincipal currentUser) {
        try {
            BorrowingAgreement agreement = borrowingAgreementService
                    .findByItemIdAndStatus(itemId, "RETURN_REQUESTED")
                    .stream()
                    .findFirst()
                    .orElse(null);

            if (agreement == null) {
                return ResponseEntity.ok().body(new ErrorResponse("No return request found"));
            }

            return ResponseEntity.ok().body(agreement);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/return/{agreementId}/respond")
    public ResponseEntity<?> respondToReturnRequest(
            @PathVariable Long agreementId,
            @RequestBody Map<String, String> request,
            @CurrentUser UserPrincipal currentUser) {

        try {
            String status = request.get("status");
            System.out.println("Received return request response: " + status + " for agreement: " + agreementId);

            BorrowingAgreement agreement = borrowingAgreementService.getById(agreementId);

            if (agreement == null) {
                return ResponseEntity.notFound().build();
            }

            if (!agreement.getLenderId().equals(currentUser.getId())) {
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not authorized to respond to this return request"));
            }

            // Update the agreement status
            agreement.setStatus(status.equals("CONFIRMED") ? "RETURNED" : "RETURN_REJECTED");
            agreement = borrowingAgreementService.save(agreement);

            return ResponseEntity.ok(agreement);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/send-return-request")
    public ResponseEntity<?> createReturnRequest(
            @RequestBody Map<String, Object> request,
            @CurrentUser UserPrincipal currentUser) {

        try {
            Long agreementId = Long.parseLong(request.get("agreementId").toString());
            BorrowingAgreement agreement = borrowingAgreementService.getById(agreementId);

            if (agreement == null) {
                return ResponseEntity.notFound().build();
            }

            if (!agreement.getBorrowerId().equals(currentUser.getId())) {
                return ResponseEntity.status(403)
                        .body(new ErrorResponse("You are not authorized to create a return request for this item"));
            }

            agreement.setStatus("RETURN_PENDING");
            agreement = borrowingAgreementService.save(agreement);

            return ResponseEntity.ok(agreement);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}