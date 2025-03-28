package com.example.neighbornet.repository


import android.util.Log
import com.example.neighbornet.api.ClassApiService
import javax.inject.Inject
import javax.inject.Singleton
import com.example.neighbornet.network.Class
import com.example.neighbornet.network.ClassResponse
import com.example.neighbornet.network.FeedbackRequest
import com.example.neighbornet.network.LessonProgress
import com.example.neighbornet.network.LessonResponse
import com.example.neighbornet.network.RatingRequest
import com.example.neighbornet.network.FeedbackResponse
import com.example.neighbornet.network.RatingResponse
import com.example.neighbornet.network.UpdateProgressRequest

@Singleton
class ClassRepository @Inject constructor(
    private val classApiService: ClassApiService
) {
    suspend fun getAllClasses(): List<Class> {
        val response = classApiService.getAllClasses()
        if (response.isSuccessful) {
            return response.body()?.map { classResponse ->
                Class(
                    id = classResponse.id,
                    title = classResponse.title,
                    description = classResponse.description,
                    category = classResponse.category,
                    thumbnailUrl = classResponse.thumbnailUrl,
                    creatorName = classResponse.creatorName,
                    creatorImageUrl = classResponse.creator?.imageUrl,
                    duration = classResponse.duration,
                    sections = classResponse.sections,
                    sectionsCount = classResponse.sections.size, 
                    rating = classResponse.averageRating.toFloat(),
                    createdAt = classResponse.createdAt,
                    updatedAt = classResponse.updatedAt
                )
            } ?: emptyList()
        } else {
            throw Exception("Failed to fetch classes: ${response.message()}")
        }
    }

    suspend fun getClassById(id: Long): Class {
        val response = classApiService.getClassById(id)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Class not found")
        } else {
            throw Exception("Failed to fetch class: ${response.message()}")
        }
    }

    suspend fun getClassDetails(classId: Long): ClassResponse {
        val response = classApiService.getClassDetails(classId)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Class details not found")
        } else {
            throw Exception("Failed to fetch class details: ${response.message()}")
        }
    }

    suspend fun getClassLessons(classId: Long): List<LessonResponse> {
        val response = classApiService.getClassLessons(classId)
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch lessons: ${response.message()}")
        }
    }

    suspend fun getClassFeedbacks(classId: Long): List<FeedbackResponse> {
        val response = classApiService.getClassFeedbacks(classId)
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch feedbacks: ${response.message()}")
        }
    }

    suspend fun getRelatedClasses(classId: Long): List<Class> {
        val response = classApiService.getRelatedClasses(classId)
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch related classes: ${response.message()}")
        }
    }

    suspend fun getLearningStatus(classId: Long): Boolean {
        try {
            val response = classApiService.getLearningStatus(classId)
            Log.d("ClassRepository", "Learning status response: ${response.code()}")

            if (response.isSuccessful) {
                return response.body() ?: false
            } else {
                val errorBody = response.errorBody()?.string()
                Log.e("ClassRepository", "Error response: $errorBody")
                throw Exception("Failed to fetch learning status: ${response.code()} - $errorBody")
            }
        } catch (e: Exception) {
            Log.e("ClassRepository", "Exception in getLearningStatus", e)
            throw Exception("Failed to fetch learning status: ${e.message}")
        }
    }

    suspend fun startLearning(classId: Long): ClassResponse {
        val response = classApiService.startLearning(classId)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Failed to start learning")
        } else {
            throw Exception("Failed to start learning: ${response.message()}")
        }
    }

    suspend fun getProgress(classId: Long): List<LessonProgress> {
        val response = classApiService.getProgress(classId)
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
        } else {
            throw Exception("Failed to fetch progress: ${response.message()}")
        }
    }

    suspend fun getUserRating(classId: Long): RatingResponse {
        val response = classApiService.getUserRating(classId)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Rating not found")
        } else {
            throw Exception("Failed to fetch user rating: ${response.message()}")
        }
    }

    suspend fun rateClass(classId: Long, rating: Double) {
        val response = classApiService.rateClass(classId, RatingRequest(rating))
        if (!response.isSuccessful) {
            throw Exception("Failed to submit rating: ${response.message()}")
        }
    }

    suspend fun submitFeedback(classId: Long, content: String, rating: Int) {
        val response = classApiService.submitFeedback(classId, FeedbackRequest(content, rating))
        if (!response.isSuccessful) {
            throw Exception("Failed to submit feedback: ${response.message()}")
        }
    }

    suspend fun getLessonById(classId: Long, lessonId: Long): LessonResponse {
        val response = classApiService.getLessonById(classId, lessonId)
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("Lesson not found")
        } else {
            throw Exception("Failed to fetch lesson: ${response.message()}")
        }
    }

    suspend fun getLessonProgress(classId: Long, lessonId: Long): LessonProgress {
        val response = classApiService.getProgress(classId)
        if (response.isSuccessful) {
            return response.body()?.find { it.lessonId == lessonId }
                ?: LessonProgress(
                    lessonId = lessonId,
                    completed = false,
                    lastWatchedPosition = null,
                    classId = classId
                )
        } else {
            throw Exception("Failed to fetch lesson progress: ${response.message()}")
        }
    }

    suspend fun markLessonComplete(classId: Long, lessonId: Long) {
        val response = classApiService.updateProgress(
            classId = classId,
            lessonId = lessonId,
            UpdateProgressRequest(
                completed = true,
                progress = 100.0,
                lastWatchedPosition = null
            )
        )
        if (!response.isSuccessful) {
            throw Exception("Failed to mark lesson as complete: ${response.message()}")
        }
    }

    suspend fun rateLessonProgress(classId: Long, lessonId: Long, rating: Double) {
        val response = classApiService.rateLessonProgress(
            classId = classId,
            lessonId = lessonId,
            ratingRequest = RatingRequest(rating = rating)
        )
        if (!response.isSuccessful) {
            throw Exception("Failed to rate lesson: ${response.message()}")
        }
    }


    suspend fun getLessonRating(classId: Long, lessonId: Long): Double? {
        val response = classApiService.getLessonRating(classId, lessonId)
        if (response.isSuccessful) {
            return response.body()?.rating
        } else {
            if (response.code() == 404) return null
            throw Exception("Failed to get lesson rating: ${response.message()}")
        }
    }
}