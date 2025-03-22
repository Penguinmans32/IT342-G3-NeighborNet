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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            if (chatMessage.getMessageType() != null &&
                    "FORM".equals(chatMessage.getMessageType()) &&
                    "Sent a borrowing agreement".equals(chatMessage.getContent())) {

                // Parse the form data
                ObjectMapper mapper = new ObjectMapper();
                JsonNode formDataNode = mapper.readTree(chatMessage.getFormData());
                Long itemId = formDataNode.get("itemId").asLong();

                // Get the item details
                Item item = itemRepository.findById(itemId)
                        .orElseThrow(() -> new RuntimeException("Item not found"));

                // Create an ObjectNode to modify the formData
                ObjectNode formDataObj = (ObjectNode) formDataNode;
                formDataObj.put("itemName", item.getName());

                // Update the formData in the message
                chatMessage.setFormData(mapper.writeValueAsString(formDataObj));
            }

            ChatMessage saved = chatService.save(chatMessage);
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(chatMessage.getReceiverId()),
                    "/queue/messages",
                    saved
            );
        } catch (Exception e) {
            e.printStackTrace();
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
            chatMessage.setTimestamp(LocalDateTime.now());

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
            node.put("borrowingStart", agreement.getBorrowingStart().toString());
            node.put("borrowingEnd", agreement.getBorrowingEnd().toString());
            node.put("terms", agreement.getTerms());
            // Add this line
            node.put("rejectionReason",
                    agreement.getRejectionReason() != null ?
                            agreement.getRejectionReason() : null);

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
            BorrowingAgreement updatedAgreement = borrowingAgreementService.updateStatus(id, status);

            if ("ACCEPTED".equals(status)) {
                Long itemId = updatedAgreement.getItemId();

                List<BorrowingAgreement> pendingAgreements = borrowingAgreementRepository
                        .findByItemIdAndStatus(itemId, "PENDING");

                for (BorrowingAgreement agreement : pendingAgreements) {
                    if (agreement.getId().equals(id)) {
                        continue;
                    }

                    agreement.setStatus("REJECTED");
                    agreement.setRejectionReason("Another request has been accepted for this item");
                    borrowingAgreementRepository.save(agreement);

                    ObjectNode rejectedFormDataObj = objectMapper.createObjectNode();
                    rejectedFormDataObj.put("id", agreement.getId());
                    rejectedFormDataObj.put("status", "REJECTED");
                    rejectedFormDataObj.put("itemId", agreement.getItemId());

                    Item rejectedItem = itemRepository.findById(agreement.getItemId())
                            .orElseThrow(() -> new RuntimeException("Item not found"));
                    rejectedFormDataObj.put("itemName", rejectedItem.getName());

                    rejectedFormDataObj.put("borrowerId", agreement.getBorrowerId());
                    rejectedFormDataObj.put("lenderId", agreement.getLenderId());
                    rejectedFormDataObj.put("borrowingStart", agreement.getBorrowingStart().toString());
                    rejectedFormDataObj.put("borrowingEnd", agreement.getBorrowingEnd().toString());
                    rejectedFormDataObj.put("terms", agreement.getTerms());
                    rejectedFormDataObj.put("rejectionReason", "Another request has been accepted for this item");

                    String rejectedFormData = objectMapper.writeValueAsString(rejectedFormDataObj);

                    ChatMessage rejectedUpdateMessage = new ChatMessage();
                    rejectedUpdateMessage.setMessageType("AGREEMENT_UPDATE");
                    rejectedUpdateMessage.setContent("Agreement Updated");
                    rejectedUpdateMessage.setFormData(rejectedFormData);

                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getBorrowerId()),
                            "/queue/messages",
                            rejectedUpdateMessage
                    );
                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(agreement.getLenderId()),
                            "/queue/messages",
                            rejectedUpdateMessage
                    );

                    List<ChatMessage> messages = chatService.findChatMessages(
                            agreement.getBorrowerId(),
                            agreement.getLenderId()
                    );

                    for (ChatMessage message : messages) {
                        if ("FORM".equals(message.getMessageType())) {
                            try {
                                JsonNode formData = objectMapper.readTree(message.getFormData());
                                if (formData.has("id") && formData.get("id").asLong() == agreement.getId()) {
                                    message.setFormData(rejectedFormData);
                                    chatService.save(message);
                                    break;
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            }

            Item item = itemRepository.findById(updatedAgreement.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            ObjectNode formDataObj = objectMapper.createObjectNode();
            formDataObj.put("id", updatedAgreement.getId());
            formDataObj.put("status", updatedAgreement.getStatus());
            formDataObj.put("itemId", updatedAgreement.getItemId());
            formDataObj.put("itemName", item.getName());
            formDataObj.put("borrowerId", updatedAgreement.getBorrowerId());
            formDataObj.put("lenderId", updatedAgreement.getLenderId());
            formDataObj.put("borrowingStart", updatedAgreement.getBorrowingStart().toString());
            formDataObj.put("borrowingEnd", updatedAgreement.getBorrowingEnd().toString());
            formDataObj.put("terms", updatedAgreement.getTerms());
            formDataObj.put("rejectionReason",
                    updatedAgreement.getRejectionReason() != null ?
                            updatedAgreement.getRejectionReason() : null);

            String updatedFormData = objectMapper.writeValueAsString(formDataObj);

            List<ChatMessage> allMessagesWithThisAgreement = chatService.findAllMessagesWithAgreement(id);

            for (ChatMessage message : allMessagesWithThisAgreement) {
                if ("FORM".equals(message.getMessageType())) {
                    try {
                        JsonNode formData = objectMapper.readTree(message.getFormData());
                        if (formData.has("id") && formData.get("id").asLong() == id) {
                            message.setFormData(updatedFormData);
                            chatService.save(message);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            ChatMessage updateMessage = new ChatMessage();
            updateMessage.setMessageType("AGREEMENT_UPDATE");
            updateMessage.setContent("Agreement Updated");
            updateMessage.setFormData(updatedFormData);

            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getBorrowerId()),
                    "/queue/messages",
                    updateMessage
            );
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(updatedAgreement.getLenderId()),
                    "/queue/messages",
                    updateMessage
            );

            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
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
}