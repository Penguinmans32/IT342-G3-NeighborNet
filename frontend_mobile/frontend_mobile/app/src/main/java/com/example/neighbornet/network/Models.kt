package com.example.neighbornet.network

import androidx.annotation.DrawableRes
import androidx.compose.ui.graphics.Color
import com.example.neighbornet.utils.ArrayDate
import com.example.neighbornet.utils.StringDate
import com.google.gson.annotations.SerializedName

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
    val sectionsCount: Int,
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
    val lessonId: Long,
    val completed: Boolean
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
