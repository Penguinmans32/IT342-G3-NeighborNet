package com.example.neighbornet.auth

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.AgreementRequest
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.MessageType
import com.example.neighbornet.network.StompClient
import com.example.neighbornet.network.StompSubscription
import com.example.neighbornet.network.toJson
import com.example.neighbornet.network.toMessage
import com.example.neighbornet.network.update
import com.example.neighbornet.repository.ChatRepository
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import java.time.LocalDateTime
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val tokenManager: TokenManager
) : ViewModel() {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages: StateFlow<List<Message>> = _messages.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _currentUser = MutableStateFlow<String?>(null)
    val currentUser: StateFlow<String?> = _currentUser.asStateFlow()

    private var stompClient: StompClient? = null
    private var messageSubscription: StompSubscription? = null

    init {
        viewModelScope.launch {
            _currentUser.value = tokenManager.getCurrentUser()
            if (_currentUser.value == null) {
                Log.e("ChatViewModel", "No user logged in")
                // Handle the error case, maybe emit an error event
            }
        }
    }

    fun connectWebSocket(senderId: String, receiverId: String) {
        viewModelScope.launch {
            try {
                val token = tokenManager.getToken()
                if (token != null) {
                    setupStompClient(token)
                    subscribeToMessages(senderId)
                    fetchExistingMessages(senderId, receiverId)
                } else {
                    Log.e("ChatViewModel", "No token available")
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error connecting to WebSocket", e)
            }
        }
    }

    private fun setupStompClient(token: String) {
        val url = "ws://10.0.191.212:8080/ws"
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $token")
                    .build()
                chain.proceed(request)
            }
            .build()

        stompClient = StompClient(url, client).apply {
            connect(
                onConnect = {
                    viewModelScope.launch {
                        _isConnected.value = true
                    }
                },
                onError = { error ->
                    Log.e("ChatViewModel", "WebSocket connection error", error)
                }
            )
        }
    }

    private fun subscribeToMessages(userId: String) {
        messageSubscription = stompClient?.subscribe(
            destination = "/user/$userId/queue/messages",
            onMessage = { message ->
                val newMessage = message.toMessage()
                viewModelScope.launch {
                    _messages.update { current ->
                        (current + newMessage).sortedBy { it.timestamp }
                    }
                }
            }
        )
    }

    fun sendAgreement(agreementData: Map<String, Any>) {
        viewModelScope.launch {
            try {
                val agreement = AgreementRequest(
                    lenderId = agreementData["lenderId"] as String,
                    borrowerId = agreementData["borrowerId"] as String,
                    itemId = agreementData["itemId"] as String,
                    borrowingStart = agreementData["borrowingStart"] as String,
                    borrowingEnd = agreementData["borrowingEnd"] as String,
                    terms = agreementData["terms"] as String
                )

                val response = chatRepository.sendAgreement(agreement)
                val message = Message(
                    id = UUID.randomUUID().toString(),
                    senderId = agreement.borrowerId,
                    receiverId = agreement.lenderId,
                    content = "Sent a borrowing agreement",
                    messageType = MessageType.FORM,
                    formData = Gson().toJson(response),
                    timestamp = LocalDateTime.now().toString()
                )

                stompClient?.send("/app/chat", message.toJson())

                _messages.update { current ->
                    (current + message).sortedBy { it.timestamp }
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error sending agreement", e)
            }
        }
    }

    private suspend fun fetchExistingMessages(senderId: String, receiverId: String) {
        try {
            val messages = chatRepository.getMessages(senderId, receiverId)
            _messages.value = messages.sortedBy { it.timestamp }
        } catch (e: Exception) {
            Log.e("ChatViewModel", "Error fetching messages", e)
        }
    }

    fun sendMessage(senderId: String, receiverId: String, content: String) {
        if (!_isConnected.value) {
            Log.e("ChatViewModel", "Cannot send message: Not connected")
            return
        }

        val message = Message(
            id = UUID.randomUUID().toString(),
            senderId = senderId,
            receiverId = receiverId,
            content = content,
            messageType = MessageType.TEXT,
            timestamp = LocalDateTime.now().toString()
        )

        stompClient?.send("/app/chat", message.toJson())

        // Optimistically add message to UI
        _messages.update { current ->
            (current + message).sortedBy { it.timestamp }
        }
    }

    fun sendImage(senderId: String, receiverId: String, imageUri: Uri) {
        viewModelScope.launch {
            try {
                val imageUrl = chatRepository.uploadImage(imageUri)
                val message = Message(
                    id = UUID.randomUUID().toString(),
                    senderId = senderId,
                    receiverId = receiverId,
                    content = "Sent an image",
                    messageType = MessageType.IMAGE,
                    imageUrl = imageUrl,
                    timestamp = LocalDateTime.now().toString()
                )

                stompClient?.send("/app/chat", message.toJson())

                _messages.update { current ->
                    (current + message).sortedBy { it.timestamp }
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error uploading image", e)
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        messageSubscription?.unsubscribe()
        stompClient?.disconnect()
    }
}