package com.example.neighbornetbackend.controller;

import com.example.neighbornetbackend.dto.ConversationDTO;
import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.service.ChatService;
import com.example.neighbornetbackend.service.ConversationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;
    private final ChatService chatService;

    public ChatController(
            SimpMessagingTemplate messagingTemplate,
            ConversationService conversationService,
            ChatService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.conversationService = conversationService;
        this.chatService = chatService;
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
}