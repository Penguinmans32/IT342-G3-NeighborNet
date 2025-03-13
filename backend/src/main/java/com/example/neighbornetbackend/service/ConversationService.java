package com.example.neighbornetbackend.service;

import com.example.neighbornetbackend.dto.ConversationDTO;
import com.example.neighbornetbackend.dto.ItemDTO;
import com.example.neighbornetbackend.model.ChatMessage;
import com.example.neighbornetbackend.model.Item;
import com.example.neighbornetbackend.model.User;
import com.example.neighbornetbackend.repository.ChatMessageRepository;
import com.example.neighbornetbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    private ItemDTO convertToItemDTO(Item item) {
        if (item == null) return null;
        return ItemDTO.fromItem(item);
    }

    public List<ConversationDTO> findConversationsForUser(Long userId) {  // Changed parameter type to Long
        List<ChatMessage> allMessages = chatMessageRepository.findBySenderIdOrReceiverId(userId, userId);

        Map<Long, List<ChatMessage>> conversationGroups = new HashMap<>();  // Changed Map key type to Long

        for (ChatMessage message : allMessages) {
            Long conversationPartnerId;  // Changed to Long
            if (message.getSenderId().equals(userId)) {
                conversationPartnerId = message.getReceiverId();
            } else {
                conversationPartnerId = message.getSenderId();
            }

            conversationGroups.computeIfAbsent(conversationPartnerId, k -> new ArrayList<>())
                    .add(message);
        }

        return conversationGroups.entrySet().stream()
                .map(entry -> {
                    Long partnerId = entry.getKey();  // Changed to Long
                    List<ChatMessage> messages = entry.getValue();

                    messages.sort((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()));

                    ConversationDTO dto = new ConversationDTO();

                    User participant = userRepository.findById(partnerId)
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    ConversationDTO.ParticipantDTO participantDTO = new ConversationDTO.ParticipantDTO();
                    participantDTO.setId(participant.getId());  // Now both are Long
                    participantDTO.setUsername(participant.getUsername());

                    dto.setParticipant(participantDTO);

                    if (!messages.isEmpty()) {
                        ChatMessage lastMessage = messages.get(0);
                        dto.setLastMessage(lastMessage.getContent());
                        dto.setLastMessageTimestamp(lastMessage.getTimestamp());
                        if (lastMessage.getItem() != null) {
                            dto.setLastMessageItem(convertToItemDTO(lastMessage.getItem()));
                        }
                    }

                    long unreadCount = messages.stream()
                            .filter(m -> m.getReceiverId().equals(userId) && !m.isIs_read())
                            .count();

                    dto.setUnreadCount((int) unreadCount);

                    return dto;
                })
                .sorted((c1, c2) -> c2.getLastMessageTimestamp().compareTo(c1.getLastMessageTimestamp()))
                .collect(Collectors.toList());
    }
}