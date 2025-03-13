package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.model.Item;
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
    @Transactional
    public List<ChatMessage> findChatMessages(Long senderId, Long receiverId) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                        senderId, receiverId, senderId, receiverId);

        // Force initialization of items and their imageUrls
        messages.forEach(message -> {
            if (message.getItem() != null) {
                Item item = message.getItem();
                // Force initialization of imageUrls
                if (item.getImageUrls() != null) {
                    System.out.println("ImageUrls for item " + item.getId() + ": " + item.getImageUrls().size());
                }
            }
        });

        return messages;
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        chatMessageRepository.markMessagesAsRead(senderId, receiverId);
    }
}