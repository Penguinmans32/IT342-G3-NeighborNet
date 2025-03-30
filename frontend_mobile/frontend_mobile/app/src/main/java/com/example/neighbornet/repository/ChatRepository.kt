package com.example.neighbornet.repository

import android.content.Context
import android.net.Uri
import android.util.Log
import com.example.neighbornet.api.ChatApiService
import com.example.neighbornet.auth.TokenManager
import com.example.neighbornet.network.AgreementRequest
import com.example.neighbornet.network.AgreementResponse
import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.network.Item
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.ReturnRequest
import com.example.neighbornet.network.ReturnRequestStatus
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatRepository @Inject constructor(
    private val api: ChatApiService,
    private val tokenManager: TokenManager,
    @ApplicationContext private val context: Context
) {
    private val baseUrl = "http://10.0.191.212:8080"

    suspend fun getMessages(senderId: Long, receiverId: Long): List<Message> {
        return withContext(Dispatchers.IO) {
            try {
                api.getMessages(senderId, receiverId)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error fetching messages", e)
                emptyList()
            }
        }
    }

    suspend fun sendAgreement(agreement: AgreementRequest): AgreementResponse {
        return withContext(Dispatchers.IO) {
            try {
                api.sendAgreement(agreement)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error sending agreement", e)
                throw e
            }
        }
    }

    suspend fun uploadImage(imageUri: Uri): String {
        return withContext(Dispatchers.IO) {
            try {
                val file = createTempFileFromUri(imageUri)
                val requestBody = file.asRequestBody("image/*".toMediaTypeOrNull())
                val part = MultipartBody.Part.createFormData("image", file.name, requestBody)

                // Get the image URL from the server
                val imageUrl = api.uploadImage(part)

                // Delete the temp file
                file.delete()

                // Return the complete URL
                if (!imageUrl.startsWith("http")) {
                    "http://10.0.191.212:8080$imageUrl"  // Add your base URL
                } else {
                    imageUrl
                }
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error uploading image", e)
                throw e
            }
        }
    }


    suspend fun sendMessage(message: Message): Message {
        return api.sendMessage(message)
    }

    suspend fun createConversation(userId1: Long, userId2: Long): ConversationDTO {
        return withContext(Dispatchers.IO) {
            try {
                api.createConversation(
                    mapOf(
                        "userId1" to userId1,
                        "userId2" to userId2
                    )
                )
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error creating conversation", e)
                throw e
            }
        }
    }

    suspend fun getUserConversations(userId: Long): List<ConversationDTO> {
        return withContext(Dispatchers.IO) {
            try {
                api.getUserConversations(userId)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error fetching conversations", e)
                emptyList()
            }
        }
    }

    suspend fun sendReturnRequest(returnRequest: ReturnRequest): ReturnRequest {
        return withContext(Dispatchers.IO) {
            try {
                api.sendReturnRequest(returnRequest)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error sending return request", e)
                throw e
            }
        }
    }

    suspend fun handleReturnResponse(
        returnRequestId: String,
        status: ReturnRequestStatus
    ): ReturnRequest {
        return withContext(Dispatchers.IO) {
            try {
                api.respondToReturnRequest(
                    returnRequestId = returnRequestId,
                    status = status.name
                )
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error handling return response", e)
                throw e
            }
        }
    }

    private fun createTempFileFromUri(uri: Uri): File {
        return try {
            val stream = context.contentResolver.openInputStream(uri)
                ?: throw IllegalStateException("Couldn't open input stream")

            val file = File.createTempFile("upload", ".jpg", context.cacheDir)

            stream.use { input ->
                file.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            file
        } catch (e: Exception) {
            Log.e("ChatRepository", "Error creating temp file", e)
            throw e
        }
    }

    suspend fun getUserItems(userId: Long): List<Item> {
        return withContext(Dispatchers.IO) {
            try {
                api.getUserItems(userId)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error fetching user items", e)
                emptyList()
            }
        }
    }

    suspend fun respondToAgreement(agreementId: Long, status: String): AgreementResponse {
        return withContext(Dispatchers.IO) {
            try {
                api.respondToAgreement(agreementId, mapOf("status" to status))
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error responding to agreement", e)
                throw e
            }
        }
    }
}