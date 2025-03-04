package com.example.neighbornetbackend.repository;

import com.example.neighbornetbackend.dto.ConversationDTO;
import com.example.neighbornetbackend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampAsc(
            Long senderId, Long receiverId, Long receiverId2, Long senderId2);

    List<ChatMessage> findBySenderIdOrReceiverId(Long senderId, Long receiverId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.is_read = true WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.is_read = false")
    void markMessagesAsRead(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}
