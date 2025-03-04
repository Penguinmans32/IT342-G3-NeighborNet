package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.BorrowingAgreementRequest;
import com.example.neighbornetbackend.dto.ConversationDTO;
import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.service.BorrowingAgreementService;
import com.example.neighbornetbackend.service.ChatImageStorageService;
import com.example.neighbornetbackend.service.ChatService;
import com.example.neighbornetbackend.service.ConversationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.Map;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;
    private final ChatService chatService;
    private final ChatImageStorageService chatImageStorageService;
    private final BorrowingAgreementService borrowingAgreementService;

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            ConversationService conversationService,
            ChatService chatService,
            ChatImageStorageService chatImageStorageService,
            BorrowingAgreementService borrowingAgreementService) {
        this.messagingTemplate = messagingTemplate;
        this.conversationService = conversationService;
        this.chatService = chatService;
        this.chatImageStorageService = chatImageStorageService;
        this.borrowingAgreementService = borrowingAgreementService;
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage saved = chatService.save(chatMessage);
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getReceiverId()),
                "/queue/messages",
                saved
        );
    }

    @GetMapping("/messages/{senderId}/{receiverId}")
    @ResponseBody
    public List<ChatMessage> findChatMessages(
            @PathVariable Long senderId,
            @PathVariable Long receiverId) {
        return chatService.findChatMessages(senderId, receiverId);
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
    public ResponseEntity<BorrowingAgreement> createBorrowingAgreement(@RequestBody BorrowingAgreementRequest request) {
        try {
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

            ChatMessage savedMessage = chatService.save(chatMessage);

            // Send the message through WebSocket
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(request.getLenderId()),
                    "/queue/messages",
                    savedMessage
            );

            return ResponseEntity.ok(savedAgreement);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    private String toJson(BorrowingAgreement agreement) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.writeValueAsString(agreement);
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
            return ResponseEntity.ok(updatedAgreement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}