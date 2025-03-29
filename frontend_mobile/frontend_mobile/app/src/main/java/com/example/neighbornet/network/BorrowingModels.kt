package com.example.neighbornet.network

import androidx.annotation.DrawableRes
import kotlinx.serialization.Serializable
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime

data class BorrowingItem(
    val id: Long,
    val name: String,
    val description: String,
    val category: String,
    val location: String,
    val latitude: Double,
    val longitude: Double,
    val availabilityPeriod: String?,
    val terms: String?,
    val availableFrom: LocalDate,
    val availableUntil: LocalDate,
    val contactPreference: String?,
    val email: String?,
    val phone: String?,
    val imageUrls: List<String> = emptyList(),
    val owner: BorrowingUser?,
    val borrower: BorrowingUser?,
    val borrowingAgreementId: Long?,
    val createdAt: LocalDateTime
)

data class ItemRating(
    val id: Long,
    val itemId: Long,
    val userId: Long,
    val rating: Double,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class BorrowRequest(
    val itemId: Long,
    val borrowerId: Long,
    val ownerId: Long,
    val itemName: String,
    val status: String
)


data class BorrowingUser(
    val id: Long,
    val username: String,
    val imageUrl: String?
)

data class BorrowingCategory(
    val id: Long,
    val name: String,
    val count: Int,
    @DrawableRes val iconRes: Int
)

data class RateRequestItem(
    val rating: Float
)

@Serializable
data class WebSocketMessage(
    val type: MessageType,
    val content: String,
    val timestamp: String,
    val senderId: String,
    val receiverId: String? = null
)

@Serializable
enum class BorrowingAction {
    BORROWED,
    RETURNED,
    REQUESTED,
    CANCELED
}

@Serializable
data class BorrowingUpdate(
    val itemId: String,
    val action: BorrowingAction,
    val userId: String,
    val timestamp: String
)


@Serializable
data class RatingUpdate(
    val itemId: String,
    val userId: String,
    val rating: Float,
    val timestamp: String
)

data class ConversationDTO(
    val id: Long? = null,
    val participant: ParticipantDTO,
    val lastMessage: String? = null,
    val lastMessageTimestamp: LocalDateTime? = null,
    val unreadCount: Int = 0,
    val lastMessageItem: BorrowingItem? = null
) {
    data class ParticipantDTO(
        val id: Long,
        val username: String,
        val imageUrl: String? = null
    )
}


