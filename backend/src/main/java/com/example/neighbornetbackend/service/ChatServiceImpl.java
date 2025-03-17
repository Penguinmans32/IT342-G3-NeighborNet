package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ChatMessageRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;


    public ChatServiceImpl(ChatMessageRepository chatMessageRepository,
                           NotificationService notificationService,
                           UserRepository userRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Override
    public ChatMessage save(ChatMessage chatMessage) {
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        User sender = userRepository.findById(chatMessage.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        if (chatMessage.getItem() != null) {
            Item item = chatMessage.getItem();
            notificationService.createAndSendNotification(
                    chatMessage.getReceiverId(),
                    "New Message About Item",
                    sender.getUsername() + " sent you a message about '" + item.getName() + "'",
                    "CHAT_MESSAGE"
            );
        } else {
            notificationService.createAndSendNotification(
                    chatMessage.getReceiverId(),
                    "New Message",
                    "You have a new message from " + sender.getUsername(),
                    "CHAT_MESSAGE"
            );
        }

        return savedMessage;
    }

    @Override
    @Transactional
    public List<ChatMessage> findChatMessages(Long senderId, Long receiverId) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                        senderId, receiverId, senderId, receiverId);

        messages.forEach(message -> {
            if (message.getItem() != null) {
                Item item = message.getItem();
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