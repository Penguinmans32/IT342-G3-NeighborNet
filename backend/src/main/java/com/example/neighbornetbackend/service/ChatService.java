package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.ChatMessage;
import java.util.List;

public interface ChatService {
    ChatMessage save(ChatMessage chatMessage);
    List<ChatMessage> findChatMessages(Long senderId, Long receiverId);

    void markMessagesAsRead(Long senderId, Long receiverId);
}