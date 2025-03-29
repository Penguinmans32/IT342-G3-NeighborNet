package com.example.neighbornet.api

import com.example.neighbornet.network.AgreementRequest
import com.example.neighbornet.network.AgreementResponse
import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.ReturnRequest
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface ChatApiService {
    @GET("messages/{senderId}/{receiverId}")
    suspend fun getMessages(
        @Path("senderId") senderId: Long,
        @Path("receiverId") receiverId: Long
    ): List<Message>

    @Multipart
    @POST("chat/upload-image")
    suspend fun uploadImage(
        @Part image: MultipartBody.Part
    ): String

    @POST("api/borrowing/returns/send-return-request")
    suspend fun sendReturnRequest(
        @Body returnRequest: ReturnRequest
    ): ReturnRequest

    @PUT("api/borrowing/returns/return/{returnRequestId}/respond")
    suspend fun respondToReturnRequest(
        @Path("returnRequestId") returnRequestId: String,
        @Query("status") status: String
    ): ReturnRequest

    @POST("chat/send-agreement")
    suspend fun sendAgreement(
        @Body agreementRequest: AgreementRequest
    ): AgreementResponse

    @GET("/conversations/{userId}")
    suspend fun getUserConversations(@Path("userId") userId: Long): List<ConversationDTO>

    @POST("/conversations/create")
    suspend fun createConversation(@Body request: Map<String, Long>): ConversationDTO

    @POST("messages")
    suspend fun sendMessage(@Body message: Message): Message
}