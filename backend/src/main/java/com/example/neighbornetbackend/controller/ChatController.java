package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.BorrowingAgreementRequest;
import com.example.neighbornetbackend.dto.ConversationDTO;
import com.example.neighbornetbackend.dto.ErrorResponse;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.service.BorrowingAgreementService;
import com.example.neighbornetbackend.service.ChatImageStorageService;
import com.example.neighbornetbackend.service.ChatService;
import com.example.neighbornetbackend.service.ConversationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.net.URI;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;
    private final ChatService chatService;
    private final ChatImageStorageService chatImageStorageService;
    private final BorrowingAgreementService borrowingAgreementService;
    private final ObjectMapper objectMapper;
    private final ItemRepository itemRepository;
    private final BorrowingAgreementRepository borrowingAgreementRepository;

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            ConversationService conversationService,
            ChatService chatService,
            ChatImageStorageService chatImageStorageService,
            BorrowingAgreementService borrowingAgreementService,
            ObjectMapper objectMapper, ItemRepository itemRepository, BorrowingAgreementRepository borrowingAgreementRepository) {
        this.messagingTemplate = messagingTemplate;
        this.conversationService = conversationService;
        this.chatService = chatService;
        this.chatImageStorageService = chatImageStorageService;
        this.borrowingAgreementService = borrowingAgreementService;
        this.objectMapper = objectMapper;
        this.itemRepository = itemRepository;
        this.borrowingAgreementRepository = borrowingAgreementRepository;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        try {
            logger.debug("Processing message: senderId={}, receiverId={}, type={}",
                    chatMessage.getSenderId(), chatMessage.getReceiverId(), chatMessage.getMessageType());

            // Skip saving if it's a borrowing agreement message since it's already saved
            if (chatMessage.getMessageType() != null &&
                    "FORM".equals(chatMessage.getMessageType()) &&
                    "Sent a borrowing agreement".equals(chatMessage.getContent())) {

                // Cache the ObjectMapper to improve performance
                JsonNode formDataNode = objectMapper.readTree(chatMessage.getFormData());
                Long itemId = formDataNode.get("itemId").asLong();

                // Get the item details
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                // Create an ObjectNode to modify the formData
                ObjectNode formDataObj = (ObjectNode) formDataNode;
                formDataObj.put("itemName", item.getName());

                // Update the formData in the message without saving
                chatMessage.setFormData(objectMapper.writeValueAsString(formDataObj));

                // Ensure timestamp is set
                if (chatMessage.getTimestamp() == null) {
                    chatMessage.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
                }

                // Just send the WebSocket message without saving
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getReceiverId()),
                        "/queue/messages",
                        chatMessage
                );

                // Also send a copy to the sender for UI consistency
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getSenderId()),
                        "/queue/messages",
                        chatMessage
                );
            } else {
                // For non-agreement messages, proceed with normal save and send
                // Ensure timestamp is set
                if (chatMessage.getTimestamp() == null) {
                    chatMessage.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
                }

                ChatMessage saved = chatService.save(chatMessage);

                // Send to receiver
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getReceiverId()),
                        "/queue/messages",
                        saved
                );

                // Also send a copy to the sender for UI consistency
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getSenderId()),
                        "/queue/messages",
                        saved
                );
            }
        } catch (Exception e) {
            logger.error("Error processing message", e);
        }
    }

    @PostMapping("/messages")
    @ResponseBody
    public ResponseEntity<ChatMessage> createMessage(@RequestBody ChatMessage message) {
        try {
            if (message.getTimestamp() == null) {
                message.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
            }

            ChatMessage savedMessage = chatService.save(message);

            // Send to receiver
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(message.getReceiverId()),
                    "/queue/messages",
                    savedMessage
            );

            // Also send to sender for UI consistency
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(message.getSenderId()),
                    "/queue/messages",
                    savedMessage
            );

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            logger.error("Error creating message", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/messages/{senderId}/{receiverId}")
    @ResponseBody
    public List<ChatMessage> findChatMessages(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        // Optimize by using eager fetching
        List<ChatMessage> messages = chatService.findChatMessages(senderId, receiverId);

        // Use bulk initialization to prevent N+1 queries
        messages.forEach(message -> {
            if (message.getItem() != null) {
                Item item = message.getItem();
                // Force initialization of lazy collection
                if (item.getImageUrls() != null) {
                    item.getImageUrls().size();
                }
            }
        });

        return messages;
    }

    @GetMapping("/conversations/{userId}")
    @ResponseBody
    public List<ConversationDTO> getUserConversations(@PathVariable Long userId) {
        return conversationService.findConversationsForUser(userId);
    }

    @PutMapping("/messages/read/{senderId}/{receiverId}")
    @ResponseBody
    public void markMessagesAsRead(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        chatService.markMessagesAsRead(senderId, receiverId);
    }

    @PostMapping("/chat/send-agreement")
    @ResponseBody
    public ResponseEntity<?> createBorrowingAgreement(@RequestBody BorrowingAgreementRequest request) {
        logger.debug("Received agreement request: {}", request);

        try {
            // Validate request
            if (request.getItemId() == null || request.getBorrowerId() == null ||
                    request.getLenderId() == null || request.getBorrowingStart() == null ||
                    request.getBorrowingEnd() == null || request.getTerms() == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Missing required fields");
            }

            // Check for existing pending agreements
            List<BorrowingAgreement> existingAgreements = borrowingAgreementService
                    .findByItemIdAndUsersAndStatus(
                            request.getItemId(),
                            request.getBorrowerId(),
                            request.getLenderId(),
                            "PENDING"
                    );

            if (!existingAgreements.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("A pending agreement already exists for this item");
            }

            BorrowingAgreement agreement = new BorrowingAgreement();
            agreement.setItemId(request.getItemId());
            agreement.setLenderId(request.getLenderId());
            agreement.setBorrowerId(request.getBorrowerId());
            agreement.setBorrowingStart(request.getBorrowingStart());
            agreement.setBorrowingEnd(request.getBorrowingEnd());
            agreement.setTerms(request.getTerms());
            agreement.setStatus("PENDING");
            agreement.setCreatedAt(LocalDateTime.now(ZoneOffset.UTC));

            BorrowingAgreement savedAgreement = borrowingAgreementService.create(agreement);

            // Create and send a chat message about the agreement
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSenderId(request.getBorrowerId());
            chatMessage.setReceiverId(request.getLenderId());
            chatMessage.setMessageType("FORM");
            chatMessage.setContent("Sent a borrowing agreement");
            chatMessage.setFormData(toJson(savedAgreement));
            chatMessage.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

            ChatMessage savedMessage = chatService.save(chatMessage);

            // Send to both parties
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(request.getLenderId()),
                    "/queue/messages",
                    savedMessage
            );

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(request.getBorrowerId()),
                    "/queue/messages",
                    savedMessage
            );

            return ResponseEntity.ok(savedAgreement);
        } catch (Exception e) {
            logger.error("Error creating agreement", e);
            return ResponseEntity
                    .badRequest()
                    .body(new ErrorResponse("Error creating agreement: " + e.getMessage()));
        }
    }

    private String toJson(BorrowingAgreement agreement) {
        try {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("id", agreement.getId());
            node.put("status", agreement.getStatus());
            node.put("itemId", agreement.getItemId());
            node.put("borrowerId", agreement.getBorrowerId());
            node.put("lenderId", agreement.getLenderId());
            node.put("borrowingStart", agreement.getBorrowingStart().atOffset(ZoneOffset.UTC).toString());
            node.put("borrowingEnd", agreement.getBorrowingEnd().atOffset(ZoneOffset.UTC).toString());
            node.put("terms", agreement.getTerms());
            node.put("rejectionReason",
                    agreement.getRejectionReason() != null ?
                            agreement.getRejectionReason() : null);
            node.put("createdAt", agreement.getCreatedAt().atOffset(ZoneOffset.UTC).toString());

            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            logger.error("Error serializing agreement to JSON", e);
            return "{}";
        }
    }

    @PostMapping("/chat/upload-image")
    @ResponseBody
    public String uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            return chatImageStorageService.store(image);
        } catch (IOException e) {
            logger.error("Failed to upload image", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    @GetMapping("/chat/images/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Object> getChatImage(@PathVariable String filename) {
        try {
            String imageUrl = chatImageStorageService.getChatImageUrl(filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(imageUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        } catch (Exception e) {
            logger.error("Error serving image", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/chat/agreement/{id}/respond")
    @ResponseBody
    public ResponseEntity<BorrowingAgreement> respondToAgreement(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            logger.debug("Responding to agreement {}: status={}", id, status);

            // Get the agreement we're responding to
            BorrowingAgreement currentAgreement = borrowingAgreementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Agreement not found"));

            // Update the current agreement first
            BorrowingAgreement updatedAgreement = borrowingAgreementService.updateStatus(id, status);

            if ("ACCEPTED".equals(status)) {
                Long itemId = updatedAgreement.getItemId();
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                // Find ALL agreements for this item
                List<BorrowingAgreement> allItemAgreements = borrowingAgreementRepository
                        .findByItemId(itemId);

                // Process each agreement
                for (BorrowingAgreement agreement : allItemAgreements) {
                    // Skip the agreement we just accepted
                    if (agreement.getId().equals(id)) {
                        continue;
                    }

                    // Update all other agreements to rejected
                    agreement.setStatus("REJECTED");
                    agreement.setRejectionReason("This item has been lent to another user");
                    borrowingAgreementRepository.save(agreement);

                    // Create rejection update message
                    ObjectNode rejectedFormDataObj = objectMapper.createObjectNode();
                    rejectedFormDataObj.put("id", agreement.getId());
                    rejectedFormDataObj.put("status", "REJECTED");
                    rejectedFormDataObj.put("itemId", itemId);
                    rejectedFormDataObj.put("itemName", item.getName());
                    rejectedFormDataObj.put("borrowerId", agreement.getBorrowerId());
                    rejectedFormDataObj.put("lenderId", agreement.getLenderId());
                    rejectedFormDataObj.put("borrowingStart", agreement.getBorrowingStart().toString());
                    rejectedFormDataObj.put("borrowingEnd", agreement.getBorrowingEnd().toString());
                    rejectedFormDataObj.put("terms", agreement.getTerms());
                    rejectedFormDataObj.put("rejectionReason", "This item has been lent to another user");

                    String rejectedFormData = objectMapper.writeValueAsString(rejectedFormDataObj);

                    // Update all chat messages containing this agreement in background
                    CompletableFuture.runAsync(() -> {
                        try {
                            updateChatMessagesForAgreement(agreement.getId(), rejectedFormData);
                        } catch (Exception e) {
                            logger.error("Error updating chat messages", e);
                        }
                    });

                    // Send websocket updates to both parties
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getBorrowerId()),
                            "/queue/messages",
                            new ChatMessage() {{
                                setMessageType("AGREEMENT_UPDATE");
                                setFormData(rejectedFormData);
                                setSenderId(agreement.getLenderId());
                                setReceiverId(agreement.getBorrowerId());
                                setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
                            }}
                    );
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getLenderId()),
                            "/queue/messages",
                            new ChatMessage() {{
                                setMessageType("AGREEMENT_UPDATE");
                                setFormData(rejectedFormData);
                                setSenderId(agreement.getBorrowerId());
                                setReceiverId(agreement.getLenderId());
                                setTimestamp(LocalDateTime.now(ZoneOffset.UTC));
                            }}
                    );
                }
            }

            // Create update for the accepted/rejected agreement
            ObjectNode acceptedFormDataObj = objectMapper.createObjectNode();
            acceptedFormDataObj.put("id", updatedAgreement.getId());
            acceptedFormDataObj.put("status", updatedAgreement.getStatus());
            acceptedFormDataObj.put("itemId", updatedAgreement.getItemId());
            acceptedFormDataObj.put("itemName", itemRepository.findById(updatedAgreement.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found")).getName());
            acceptedFormDataObj.put("borrowerId", updatedAgreement.getBorrowerId());
            acceptedFormDataObj.put("lenderId", updatedAgreement.getLenderId());
            acceptedFormDataObj.put("borrowingStart", updatedAgreement.getBorrowingStart().toString());
            acceptedFormDataObj.put("borrowingEnd", updatedAgreement.getBorrowingEnd().toString());
            acceptedFormDataObj.put("terms", updatedAgreement.getTerms());
            acceptedFormDataObj.putNull("rejectionReason");

            String acceptedFormData = objectMapper.writeValueAsString(acceptedFormDataObj);

            // Update the chat messages for the accepted agreement in background
            CompletableFuture.runAsync(() -> {
                try {
                    updateChatMessagesForAgreement(id, acceptedFormData);
                } catch (Exception e) {
                    logger.error("Error updating chat messages", e);
                }
            });

            // Send websocket updates with proper sender/receiver info
            ChatMessage updateMsgToBorrower = new ChatMessage();
            updateMsgToBorrower.setMessageType("AGREEMENT_UPDATE");
            updateMsgToBorrower.setFormData(acceptedFormData);
            updateMsgToBorrower.setSenderId(updatedAgreement.getLenderId());
            updateMsgToBorrower.setReceiverId(updatedAgreement.getBorrowerId());
            updateMsgToBorrower.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

            ChatMessage updateMsgToLender = new ChatMessage();
            updateMsgToLender.setMessageType("AGREEMENT_UPDATE");
            updateMsgToLender.setFormData(acceptedFormData);
            updateMsgToLender.setSenderId(updatedAgreement.getBorrowerId());
            updateMsgToLender.setReceiverId(updatedAgreement.getLenderId());
            updateMsgToLender.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getBorrowerId()),
                    "/queue/messages",
                    updateMsgToBorrower
            );

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getLenderId()),
                    "/queue/messages",
                    updateMsgToLender
            );

            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            logger.error("Error responding to agreement", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // Helper method to update chat messages
    private void updateChatMessagesForAgreement(Long agreementId, String newFormData) {
        List<ChatMessage> messages = chatService.findAllMessagesWithAgreement(agreementId);
        for (ChatMessage message : messages) {
            if ("FORM".equals(message.getMessageType())) {
                message.setFormData(newFormData);
                chatService.save(message);
            }
        }
    }

    @PostMapping("/conversations/create")
    @ResponseBody
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Long> request) {
        try {
            Long userId1 = request.get("userId1");
            Long userId2 = request.get("userId2");

            if (userId1 == null || userId2 == null) {
                return ResponseEntity.badRequest().body("Both user IDs are required");
            }

            ConversationDTO conversation = conversationService.createOrGetConversation(userId1, userId2);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error creating conversation", e);
            return ResponseEntity.badRequest().body("Error creating conversation: " + e.getMessage());
        }
    }

    @GetMapping("/chat/item-status/{itemId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getItemStatus(@PathVariable Long itemId) {
        try {
            // Check if there's any accepted agreement for this item
            List<BorrowingAgreement> acceptedAgreements = borrowingAgreementRepository
                    .findByItemIdAndStatus(itemId, "ACCEPTED");

            Map<String, Object> response = new HashMap<>();
            response.put("hasAcceptedAgreement", !acceptedAgreements.isEmpty());
            if (!acceptedAgreements.isEmpty()) {
                response.put("acceptedAgreementId", acceptedAgreements.get(0).getId());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching item status", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/chat/return/{id}/respond")
    @ResponseBody
    public ResponseEntity<BorrowingAgreement> respondToReturnRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            logger.debug("Responding to return request for agreement {}: status={}", id, status);

            BorrowingAgreement currentAgreement = borrowingAgreementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Agreement not found"));

            if ("CONFIRMED".equals(status)) {
                currentAgreement.setStatus("RETURNED");
            } else if ("REJECTED".equals(status)) {
                currentAgreement.setStatus("RETURN_REJECTED");
            }

            BorrowingAgreement updatedAgreement = borrowingAgreementRepository.save(currentAgreement);

            ObjectNode returnUpdateObj = objectMapper.createObjectNode();
            returnUpdateObj.put("id", updatedAgreement.getId());
            returnUpdateObj.put("status", status);
            returnUpdateObj.put("itemId", updatedAgreement.getItemId());
            Item item = itemRepository.findById(updatedAgreement.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));
            returnUpdateObj.put("itemName", item.getName());
            returnUpdateObj.put("borrowerId", updatedAgreement.getBorrowerId());
            returnUpdateObj.put("lenderId", updatedAgreement.getLenderId());
            returnUpdateObj.put("borrowingStart", updatedAgreement.getBorrowingStart().toString());
            returnUpdateObj.put("borrowingEnd", updatedAgreement.getBorrowingEnd().toString());
            returnUpdateObj.put("agreementId", updatedAgreement.getId());

            String returnUpdateData = objectMapper.writeValueAsString(returnUpdateObj);

            // Update messages in background
            CompletableFuture.runAsync(() -> {
                try {
                    List<ChatMessage> messages = chatService.findAllReturnMessages(id);
                    for (ChatMessage message : messages) {
                        if ("RETURN_REQUEST".equals(message.getMessageType())) {
                            message.setFormData(returnUpdateData);
                            chatService.save(message);
                        }
                    }
                } catch (Exception e) {
                    logger.error("Error updating return messages", e);
                }
            });

            // Send websocket updates to both parties with proper sender/receiver info
            ChatMessage updateMsgToBorrower = new ChatMessage();
            updateMsgToBorrower.setMessageType("RETURN_UPDATE");
            updateMsgToBorrower.setFormData(returnUpdateData);
            updateMsgToBorrower.setSenderId(updatedAgreement.getLenderId());
            updateMsgToBorrower.setReceiverId(updatedAgreement.getBorrowerId());
            updateMsgToBorrower.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

            ChatMessage updateMsgToLender = new ChatMessage();
            updateMsgToLender.setMessageType("RETURN_UPDATE");
            updateMsgToLender.setFormData(returnUpdateData);
            updateMsgToLender.setSenderId(updatedAgreement.getBorrowerId());
            updateMsgToLender.setReceiverId(updatedAgreement.getLenderId());
            updateMsgToLender.setTimestamp(LocalDateTime.now(ZoneOffset.UTC));

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getBorrowerId()),
                    "/queue/messages",
                    updateMsgToBorrower
            );
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getLenderId()),
                    "/queue/messages",
                    updateMsgToLender
            );

            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            logger.error("Error responding to return request", e);
            return ResponseEntity.badRequest().build();
        }
    }
}