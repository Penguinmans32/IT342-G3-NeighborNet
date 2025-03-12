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

@Singleton
class ClassRepository @Inject constructor(
    private val classApiService: ClassApiService
) {
    suspend fun getAllClasses(): List<Class> {
        val response = classApiService.getAllClasses()
        if (response.isSuccessful) {
            return response.body() ?: emptyList()
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
}