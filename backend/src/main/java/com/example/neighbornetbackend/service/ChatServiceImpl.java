package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.model.BorrowingAgreement;
import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.BorrowingAgreementRepository;
import com.example.neighbornetbackend.repository.ChatMessageRepository;
import com.example.neighbornetbackend.repository.ItemRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ItemRepository itemRepository;

    @Autowired
    private BorrowingAgreementRepository borrowingAgreementRepository;


    public ChatServiceImpl(ChatMessageRepository chatMessageRepository,
                           NotificationService notificationService,
                           UserRepository userRepository, ObjectMapper objectMapper, ItemRepository itemRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.itemRepository = itemRepository;
    }

    @Override
    public ChatMessage save(ChatMessage chatMessage) {
        try {
            // Handle form data for borrowing agreements
            if (chatMessage.getMessageType() != null &&
                    "FORM".equals(chatMessage.getMessageType()) &&
                    chatMessage.getFormData() != null) {

                JsonNode formDataNode = objectMapper.readTree(chatMessage.getFormData());

                // If it's a new agreement or an update
                if (formDataNode.has("itemId") && !formDataNode.has("itemName")) {
                    Long itemId = formDataNode.get("itemId").asLong();
                    Item item = itemRepository.findById(itemId)
                            .orElseThrow(() -> new RuntimeException("Item not found"));

                    ObjectNode formDataObj = (ObjectNode) formDataNode;
                    formDataObj.put("itemName", item.getName());
                    chatMessage.setFormData(objectMapper.writeValueAsString(formDataObj));
                }
            }

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
                String notificationContent = "You have a new message from " + sender.getUsername();
                if ("FORM".equals(chatMessage.getMessageType())) {
                    notificationContent = sender.getUsername() + " sent you a borrowing agreement";
                }

                notificationService.createAndSendNotification(
                        chatMessage.getReceiverId(),
                        "New Message",
                        notificationContent,
                        "CHAT_MESSAGE"
                );
            }

            return savedMessage;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error saving chat message", e);
        }
    }

    @Override
    @Transactional
    public List<ChatMessage> findChatMessages(Long senderId, Long receiverId) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
                        senderId, receiverId, senderId, receiverId);

        messages.forEach(message -> {
            if ("RETURN_REQUEST".equals(message.getMessageType())) {
                try {
                    JsonNode formData = objectMapper.readTree(message.getFormData());
                    if (formData.has("agreementId")) {
                        Long agreementId = formData.get("agreementId").asLong();
                        BorrowingAgreement agreement = borrowingAgreementRepository.findById(agreementId)
                                .orElse(null);

                        if (agreement != null) {
                            ObjectNode updatedFormData = (ObjectNode) formData;
                            updatedFormData.put("status", agreement.getStatus());
                            message.setFormData(objectMapper.writeValueAsString(updatedFormData));
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

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

    @Override
    public List<ChatMessage> findAllMessagesWithAgreement(Long agreementId) {
        List<ChatMessage> result = new ArrayList<>();

        List<ChatMessage> formMessages = chatMessageRepository.findByMessageType("FORM");

        for (ChatMessage message : formMessages) {
            try {
                if (message.getFormData() != null) {
                    JsonNode formData = objectMapper.readTree(message.getFormData());
                    if (formData.has("id") && formData.get("id").asLong() == agreementId) {
                        result.add(message);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return result;
    }

    @Override
    public List<ChatMessage> findAllReturnMessages(Long agreementId) {
        return chatMessageRepository.findByMessageTypeAndFormDataContaining(
                "RETURN_REQUEST",
                "\"agreementId\":" + agreementId
        );
    }
}