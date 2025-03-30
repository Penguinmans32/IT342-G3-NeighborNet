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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ChatController {

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
            // Skip saving if it's a borrowing agreement message since it's already saved
            if (chatMessage.getMessageType() != null &&
                    "FORM".equals(chatMessage.getMessageType()) &&
                    "Sent a borrowing agreement".equals(chatMessage.getContent())) {
                // Just update item name if needed
                ObjectMapper mapper = new ObjectMapper();
                JsonNode formDataNode = mapper.readTree(chatMessage.getFormData());
                Long itemId = formDataNode.get("itemId").asLong();

                // Get the item details
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                // Create an ObjectNode to modify the formData
                ObjectNode formDataObj = (ObjectNode) formDataNode;
                formDataObj.put("itemName", item.getName());

                // Update the formData in the message without saving
                chatMessage.setFormData(mapper.writeValueAsString(formDataObj));

                // Just send the WebSocket message without saving
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getReceiverId()),
                        "/queue/messages",
                        chatMessage
                );
            } else {
                // For non-agreement messages, proceed with normal save and send
                ChatMessage saved = chatService.save(chatMessage);
                messagingTemplate.convertAndSendToUser(
                        String.valueOf(chatMessage.getReceiverId()),
                        "/queue/messages",
                        saved
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PostMapping("/messages")
    @ResponseBody
    public ResponseEntity<ChatMessage> createMessage(@RequestBody ChatMessage message) {
        try {
            if (message.getTimestamp() == null) {
                message.setTimestamp(LocalDateTime.now());
            }

            ChatMessage savedMessage = chatService.save(message);

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(message.getReceiverId()),
                    "/queue/messages",
                    savedMessage
            );

            return ResponseEntity.ok(savedMessage);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/messages/{senderId}/{receiverId}")
    @ResponseBody
    public List<ChatMessage> findChatMessages(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        List<ChatMessage> messages = chatService.findChatMessages(senderId, receiverId);

        messages.forEach(message -> {
            if (message.getItem() != null) {
                Item item = message.getItem();
                item.getImageUrls().size();
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
        System.out.println("Received request: " + request);
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
            agreement.setCreatedAt(LocalDateTime.now());

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

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(request.getLenderId()),
                    "/queue/messages",
                    savedMessage
            );

            return ResponseEntity.ok(savedAgreement);
        } catch (Exception e) {
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
            e.printStackTrace();
            return "{}";
        }
    }

    @PostMapping("/chat/upload-image")
    @ResponseBody
    public String uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            return chatImageStorageService.store(image);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    @GetMapping("/chat/images/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getChatImage(@PathVariable String filename) {
        try {
            Path imagePath = chatImageStorageService.getChatImagePath(filename);
            Resource resource = new UrlResource(imagePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.IMAGE_JPEG))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
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

                    // Update all chat messages containing this agreement
                    updateChatMessagesForAgreement(agreement.getId(), rejectedFormData);

                    // Send websocket updates only
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getBorrowerId()),
                            "/queue/messages",
                            new ChatMessage() {{
                                setMessageType("AGREEMENT_UPDATE");
                                setFormData(rejectedFormData);
                            }}
                    );
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getLenderId()),
                            "/queue/messages",
                            new ChatMessage() {{
                                setMessageType("AGREEMENT_UPDATE");
                                setFormData(rejectedFormData);
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

            // Update the chat messages for the accepted agreement
            updateChatMessagesForAgreement(id, acceptedFormData);

            // Send websocket updates only
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getBorrowerId()),
                    "/queue/messages",
                    new ChatMessage() {{
                        setMessageType("AGREEMENT_UPDATE");
                        setFormData(acceptedFormData);
                    }}
            );
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getLenderId()),
                    "/queue/messages",
                    new ChatMessage() {{
                        setMessageType("AGREEMENT_UPDATE");
                        setFormData(acceptedFormData);
                    }}
            );

            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            e.printStackTrace();
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

            List<ChatMessage> messages = chatService.findAllReturnMessages(id);
            for (ChatMessage message : messages) {
                if ("RETURN_REQUEST".equals(message.getMessageType())) {
                    message.setFormData(returnUpdateData);
                    chatService.save(message);
                }
            }

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getBorrowerId()),
                    "/queue/messages",
                    new ChatMessage() {{
                        setMessageType("RETURN_UPDATE");
                        setFormData(returnUpdateData);
                    }}
            );
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getLenderId()),
                    "/queue/messages",
                    new ChatMessage() {{
                        setMessageType("RETURN_UPDATE");
                        setFormData(returnUpdateData);
                    }}
            );

            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}