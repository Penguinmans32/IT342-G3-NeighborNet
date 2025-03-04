package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Override
    public ChatMessage save(ChatMessage chatMessage) {
        return chatMessageRepository.save(chatMessage);
    }

    @Override
    public List<ChatMessage> findChatMessages(Long senderId, Long receiverId) {
        return chatMessageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                senderId, receiverId, senderId, receiverId);
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        chatMessageRepository.markMessagesAsRead(senderId, receiverId);
    }
}