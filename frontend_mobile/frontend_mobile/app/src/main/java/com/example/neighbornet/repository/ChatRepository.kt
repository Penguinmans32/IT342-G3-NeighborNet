package com.example.neighbornet.repository

import android.content.Context
import android.net.Uri
import android.util.Log
import com.example.neighbornet.api.ChatApiService
import com.example.neighbornet.auth.TokenManager
import com.example.neighbornet.network.AgreementRequest
import com.example.neighbornet.network.AgreementResponse
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

    suspend fun getMessages(senderId: String, receiverId: String): List<Message> {
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
                api.uploadImage(part)
            } catch (e: Exception) {
                Log.e("ChatRepository", "Error uploading image", e)
                throw e
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
        val stream = context.contentResolver.openInputStream(uri)
        val file = File.createTempFile("upload", ".jpg", context.cacheDir)
        stream.use { input ->
            file.outputStream().use { output ->
                input?.copyTo(output)
            }
        }
        return file
    }
}