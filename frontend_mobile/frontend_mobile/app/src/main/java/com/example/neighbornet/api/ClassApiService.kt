package com.example.neighbornet.api

import com.example.neighbornet.network.Class
import com.example.neighbornet.network.ClassResponse
import com.example.neighbornet.network.FeedbackRequest
import com.example.neighbornet.network.FeedbackResponse
import com.example.neighbornet.network.LessonProgress
import com.example.neighbornet.network.LessonResponse
import com.example.neighbornet.network.PaginatedClassResponse
import com.example.neighbornet.network.RatingRequest
import com.example.neighbornet.network.RatingResponse
import com.example.neighbornet.network.UpdateProgressRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ClassApiService {
    @GET("api/classes/all")
    suspend fun getAllClasses(): Response<PaginatedClassResponse>

    @GET("api/classes/{id}")
    suspend fun getClassById(@Path("id") id: Long): Response<Class>

    @GET("api/classes/{classId}")
    suspend fun getClassDetails(@Path("classId") classId: Long): Response<ClassResponse>

    @GET("api/classes/{classId}/lessons")
    suspend fun getClassLessons(@Path("classId") classId: Long): Response<List<LessonResponse>>

    @GET("api/classes/{classId}/feedbacks")
    suspend fun getClassFeedbacks(@Path("classId") classId: Long): Response<List<FeedbackResponse>>

    @GET("api/classes/{classId}/related")
    suspend fun getRelatedClasses(@Path("classId") classId: Long): Response<List<Class>>

    @GET("api/classes/{classId}/learning-status")
    suspend fun getLearningStatus(@Path("classId") classId: Long): Response<Boolean>

    @POST("api/classes/{classId}/start-learning")
    suspend fun startLearning(@Path("classId") classId: Long): Response<ClassResponse>

    @GET("api/classes/{classId}/progress")
    suspend fun getProgress(@Path("classId") classId: Long): Response<List<LessonProgress>>

    @GET("api/classes/{classId}/rating")
    suspend fun getUserRating(@Path("classId") classId: Long): Response<RatingResponse>

    @POST("api/classes/{classId}/rate")
    suspend fun rateClass(
        @Path("classId") classId: Long,
        @Body rating: RatingRequest
    ): Response<Unit>

    @POST("api/classes/{classId}/feedback")
    suspend fun submitFeedback(
        @Path("classId") classId: Long,
        @Body feedback: FeedbackRequest
    ): Response<Unit>

    @GET("api/classes/{classId}/lessons/{lessonId}")
    suspend fun getLessonById(
        @Path("classId") classId: Long,
        @Path("lessonId") lessonId: Long
    ): Response<LessonResponse>

    @POST("api/classes/{classId}/progress/lessons/{lessonId}")
    suspend fun updateProgress(
        @Path("classId") classId: Long,
        @Path("lessonId") lessonId: Long,
        @Body request: UpdateProgressRequest
    ): Response<LessonProgress>

    @POST("api/classes/{classId}/lessons/{lessonId}/rate")
    suspend fun rateLessonProgress(
        @Path("classId") classId: Long,
        @Path("lessonId") lessonId: Long,
        @Body ratingRequest: RatingRequest
    ): Response<LessonResponse>

    @GET("api/classes/{classId}/lessons/{lessonId}/rating")
    suspend fun getLessonRating(
        @Path("classId") classId: Long,
        @Path("lessonId") lessonId: Long
    ): Response<RatingResponse>
}