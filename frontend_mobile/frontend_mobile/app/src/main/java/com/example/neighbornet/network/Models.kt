package com.example.neighbornet.network

import androidx.annotation.DrawableRes
import androidx.compose.ui.graphics.Color
import com.example.neighbornet.utils.ArrayDate
import com.example.neighbornet.utils.StringDate
import com.google.gson.annotations.SerializedName
import kotlinx.serialization.Serializable
import java.time.LocalDateTime

data class LoginRequest(
    val username: String,
    val password: String
)

data class SignupRequest(
    val username: String,
    val email: String,
    val password: String
)

data class AuthResponse(
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val tokenType: String? = null,
    val username: String? = null
)

data class ApiResponse<T>(
    val data: T?,
    val message: String,
    val success: Boolean
)


data class TokenRefreshRequest(
    val refreshToken: String
)

data class TokenRefreshResponse(
    val accessToken: String,
    val refreshToken: String
)

data class MessageResponse(
    val message: String
)

data class VerificationRequest(
    val otp: String
)

data class SignupResponse(
    val message: String,
    val success: Boolean = true
)

data class FirebaseTokenRequest(
    val token: String
)

data class LogOutRequest(
    val userId: Long
) {
    init {
        require(userId > -1) { "Invalid user ID" }
    }
}

data class Class(
    val id: Long,
    val title: String,
    val description: String,
    val category: String,
    val thumbnailUrl: String,
    val creatorName: String,
    val creatorImageUrl: String?,
    val duration: String,
    val sections: List<Section>? = null,
    val sectionsCount: Int = sections?.size ?: 0,
    val rating: Float = 0f,
    @SerializedName("createdAt")
    val createdAt: ArrayDate? = null,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate? = null
)

data class ClassResponse(
    val id: Long,
    val title: String,
    val description: String,
    val thumbnailUrl: String,
    val thumbnailDescription: String?,
    val duration: String,
    val difficulty: DifficultyLevel,
    val category: String,
    val creatorName: String,
    val creatorEmail: String,
    val creatorPhone: String?,
    val creatorCredentials: String?,
    val linkedinUrl: String?,
    val portfolioUrl: String?,
    val requirements: List<String>,
    val sections: List<Section>,
    val sectionsCount: Int = sections.size,
    val creator: CreatorDTO?,
    @SerializedName("createdAt")
    val createdAt: ArrayDate,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate,
    val enrolledCount: Int = 0,
    val averageRating: Double = 0.0,
    val ratingCount: Long = 0,
    val lessons: List<LessonResponse>? = null,
    val progressRecords: List<LessonProgressDTO>? = null,
    val feedbacks: List<FeedbackResponse>? = null
)

enum class DifficultyLevel {
    BEGINNER,
    INTERMEDIATE,
    ADVANCED,
    EXPERT
}

data class Section(
    val title: String,
    val content: String,
    val duration: String,
    @SerializedName("createdAt")
    val createdAt: ArrayDate? = null,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate? = null
)


data class CreatorDTO(
    val id: Long,
    val username: String,
    val imageUrl: String?,
    val email: String,
    @SerializedName("createdAt")
    val createdAt: ArrayDate? = null,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate? = null
)


data class LessonResponse(
    val id: Long,
    val title: String,
    val description: String,
    val videoUrl: String?,
    val classId: Long,
    val parentLessonId: Long?,
    val nextLessonId: Long?,
    val prevLessonId: Long?,
    @SerializedName("createdAt")
    val createdAt: ArrayDate,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate,
    val averageRating: Double,
    val ratingCount: Long,
    val completed: Boolean
)

data class LessonProgressDTO(
    val id: Long,
    val lessonId: Long,
    val classId: Long,
    val completed: Boolean,
    val lastWatchedPosition: Long?,
    @SerializedName("completedAt")
    val completedAt: ArrayDate?,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate?,
    val lessons: LessonResponse?
)

data class LessonProgress(
    val id: Long? = null,
    val lessonId: Long,
    val classId: Long? = null,
    val completed: Boolean,
    val lastWatchedPosition: Long? = null,
    @SerializedName("completedAt")
    val completedAt: ArrayDate? = null,
    @SerializedName("updatedAt")
    val updatedAt: ArrayDate? = null,
    val lessons: LessonResponse? = null
)

data class FeedbackResponse(
    val id: Long,
    val content: String,
    val rating: Int,
    val userName: String,
    val userImage: String?,
    @SerializedName("createdAt")
    val createdAt: StringDate
)

data class FeedbackRequest(
    val content: String,
    val rating: Int
)

data class RatingRequest(
    val rating: Double
)

data class RatingResponse(
    val id: Long?,
    val classId: Long?,
    val userId: Long?,
    val rating: Double,
    @SerializedName("createdAt")
    val createdAt: String?,
    @SerializedName("updatedAt")
    val updatedAt: String?
)


data class CategoryData(
    val name: String,
    @DrawableRes val iconResId: Int
)

data class CategoryInfo(
    val title: String,
    @DrawableRes val iconResId: Int,
    val backgroundColor: Color
)

data class UpdateProgressRequest(
    val lastWatchedPosition: Long? = null,
    val completed: Boolean,
    val progress: Double
)

data class Message(
    val id: Long? = null,
    val senderId: Long,
    val receiverId: Long,
    val content: String,
    val messageType: MessageType,
    @SerializedName("timestamp")
    val timestamp: String,
    val formData: String? = null,
    val imageUrl: String? = null,
    val item: Item? = null
)

@Serializable
enum class MessageType {
    TEXT,
    IMAGE,
    FORM,
    RETURN_REQUEST,
    BORROWING_UPDATE,
    AGREEMENT_UPDATE,
    RATING_UPDATE,
    CHAT_MESSAGE
}

data class Item(
    val id: String,
    val name: String,
    val category: String,
    val description: String?,
    val imageUrls: List<String>,
    val availableFrom: String,
    val availableUntil: String,
    val location: String,
    val contactPreference: String,
    val terms: String
)

data class ReturnRequest(
    val agreementId: String,
    val itemName: String,
    val borrowingStart: String,
    val borrowingEnd: String,
    val returnNote: String?,
    val status: ReturnRequestStatus,
    val lenderId: String,
    val borrowerId: String
)

enum class ReturnRequestStatus {
    PENDING,
    CONFIRMED,
    REJECTED
}

data class AgreementRequest(
    val lenderId: String,
    val borrowerId: String,
    val itemId: String,
    val borrowingStart: String,
    val borrowingEnd: String,
    val terms: String
)

data class AgreementResponse(
    val id: String,
    val status: String,
    val lenderId: String,
    val borrowerId: String,
    val itemId: String,
    val borrowingStart: String,
    val borrowingEnd: String,
    val terms: String,
    val createdAt: String
)


data class ProfileState(
    val data: ProfileData? = null,
    val isLoading: Boolean = true,
    val error: String? = null
)

data class ProfileData(
    val username: String = "",
    val email: String = "",
    val imageUrl: String? = null,
    val bio: String = "",
    val skills: List<Skill> = emptyList(),
    val interests: List<String> = emptyList(),
    val socialLinks: SocialLinks = SocialLinks()
)

data class SocialLinks(
    val github: String = "",
    val twitter: String = "",
    val linkedin: String = "",
    val facebook: String = ""
)

data class UserStats(
    val classesCreated: Int = 0,
    val itemsPosted: Int = 0,
    val communityScore: Int = 0
)

data class FollowData(
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val isFollowing: Boolean = false
)

data class ImageResponse(
    val imageUrl: String
)

data class FollowResponse(
    val followersCount: Int,
    val isFollowing: Boolean
)

data class Achievement(
    val id: Long,
    val name: String,
    val description: String,
    val iconName: String,
    val unlocked: Boolean,
    val currentProgress: Int,
    val requiredProgress: Int,
    val unlockedAt: String?,
    val progress: Double = (currentProgress.toDouble() / requiredProgress.toDouble()) * 100
)

data class ClassItem(
    val id: Long,
    val title: String,
    val description: String,
    val thumbnailUrl: String?,
    val category: String,
    val creatorName: String,
    val creatorImageUrl: String?,
    val averageRating: Double?,
    val createdAt: String
)


data class UserActivity(
    val id: Long? = null,
    val type: String = "",
    val action: String = "",
    val user: UserDTO? = null,
    val title: String = "",
    val createdAt: LocalDateTime? = null,
    val engagement: ActivityEngagement? = null,
    val thumbnailUrl: String? = null
) {
    data class ActivityEngagement(
        val likes: Int = 0,
        val comments: Int = 0
    )
}

data class UserDTO(
    val id: Long,
    val username: String,
    val imageUrl: String?,
    val email: String?,
    val bio: String?,
    val skills: List<SkillDTO> = emptyList(),
    val interests: List<String> = emptyList(),
    val socialLinks: Map<String, String?> = emptyMap(),
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val provider: String? = null,
    val following: Boolean = false
)

data class SkillDTO(
    val name: String,
    val proficiencyLevel: Int
)

data class Skill(
    val name: String,
    val level: Int
)

enum class ProfileTab {
    PROFILE, ACHIEVEMENTS, ACTIVITY
}

data class FCMTokenRequest(
    val token: String
)

data class ForgotPasswordRequest(
    val email: String
)

data class VerifyOtpRequest(
    val email: String,
    val otp: String
)

data class ResetPasswordRequest(
    val email: String,
    val otp: String,
    val currentPassword: String,
    val newPassword: String
)
