package com.example.neighbornet.auth

import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.AgreementRequest
import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.MessageType
import com.example.neighbornet.network.StompClient
import com.example.neighbornet.network.StompSubscription
import com.example.neighbornet.network.toJson
import com.example.neighbornet.network.toMessage
import com.example.neighbornet.network.update
import com.example.neighbornet.repository.ChatRepository
import com.example.neighbornet.utils.DateTimeUtils
import com.google.gson.Gson
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import java.time.LocalDateTime
import java.util.UUID
import java.util.concurrent.TimeUnit
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

    private val _currentUserId = MutableStateFlow<Long?>(null)
    val currentUserId: StateFlow<Long?> = _currentUserId.asStateFlow()

    private val _conversations = MutableStateFlow<List<ConversationDTO>>(emptyList())
    val conversations: StateFlow<List<ConversationDTO>> = _conversations.asStateFlow()

    init {
        viewModelScope.launch {
            _currentUser.value = tokenManager.getCurrentUser()
            _currentUserId.value = tokenManager.getCurrentUserId()
            if (_currentUser.value == null || _currentUserId.value == null) {
                Log.e("ChatViewModel", "No user logged in")
            }
        }
    }

    fun connectWebSocket(senderId: Long, receiverId: Long) {
        Log.d("ChatViewModel", "Connecting WebSocket - sender: $senderId, receiver: $receiverId")
        viewModelScope.launch {
            try {
                val token = tokenManager.getToken()
                if (token != null) {
                    _isConnected.value = false
                    setupStompClient(token)
                    subscribeToMessages(senderId.toString())
                    fetchExistingMessages(senderId, receiverId)
                } else {
                    Log.e("ChatViewModel", "No token available")
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error connecting to WebSocket", e)
                _isConnected.value = false
            }
        }
    }

    private fun setupStompClient(token: String) {
        Log.d("ChatViewModel", "Setting up STOMP client")
        val url = "http://10.0.191.212:8080/ws"
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $token")
                    .build()
                chain.proceed(request)
            }
            // Add WebSocket timeout configurations
            .pingInterval(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        stompClient = StompClient(url, client)

        viewModelScope.launch {
            try {
                stompClient?.connect(
                    onConnect = {
                        viewModelScope.launch {
                            Log.d("ChatViewModel", "WebSocket connected successfully")
                            _isConnected.value = true
                            // Resubscribe to messages when reconnected
                            _currentUserId.value?.let { userId ->
                                subscribeToMessages(userId.toString())
                            }
                        }
                    },
                    onError = { error ->
                        Log.e("ChatViewModel", "WebSocket connection error", error)
                        viewModelScope.launch {
                            _isConnected.value = false
                            delay(5000)
                            setupStompClient(token)
                        }
                    }
                )
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error connecting to WebSocket", e)
                _isConnected.value = false
            }
        }
    }

    private fun subscribeToMessages(userId: String) {
        messageSubscription?.unsubscribe()

        messageSubscription = stompClient?.subscribe(
            destination = "/user/$userId/queue/messages",
            onMessage = { message ->
                Log.d("ChatViewModel", "Received message: $message")
                val newMessage = message.toMessage()
                viewModelScope.launch {
                    _messages.update { current ->
                        (current + newMessage)
                            .distinctBy { it.id } // Prevent duplicates
                            .sortedBy { it.timestamp }
                    }
                }
            }
        )
    }

    fun sendAgreement(agreementData: Map<String, Any>) {
        viewModelScope.launch {
            try {
                // Convert IDs to String for API request
                val agreement = AgreementRequest(
                    lenderId = (agreementData["lenderId"] as Long).toString(),
                    borrowerId = (agreementData["borrowerId"] as Long).toString(),
                    itemId = (agreementData["itemId"] as Long).toString(),
                    borrowingStart = agreementData["borrowingStart"] as String,
                    borrowingEnd = agreementData["borrowingEnd"] as String,
                    terms = agreementData["terms"] as String
                )

                val response = chatRepository.sendAgreement(agreement)
                val message = Message(
                    id = null,
                    senderId = agreement.borrowerId.toLong(),
                    receiverId = agreement.lenderId.toLong(),
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

    fun sendMessage(senderId: Long, receiverId: Long, content: String) {
        if (!_isConnected.value) {
            Log.e("ChatViewModel", "Cannot send message: Not connected")
            return
        }

        viewModelScope.launch {
            try {
                val message = Message(
                    id = null,
                    senderId = senderId,
                    receiverId = receiverId,
                    content = content,
                    messageType = MessageType.TEXT,
                    timestamp = DateTimeUtils.getCurrentTimestamp()
                )

                // First send via REST API to ensure persistence
                val savedMessage = chatRepository.sendMessage(message)

                // Then send via WebSocket for real-time delivery
                stompClient?.send("/app/chat", savedMessage.toJson())

                // Update UI
                _messages.update { current ->
                    (current + savedMessage).sortedBy { it.timestamp }
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error sending message", e)
            }
        }
    }

    fun sendImage(senderId: Long, receiverId: Long, imageUri: Uri) {
        viewModelScope.launch {
            try {
                // First upload the image and get the URL
                val imageUrl = chatRepository.uploadImage(imageUri)

                // Create a message with the image URL
                val message = Message(
                    id = null,  // Let backend generate ID
                    senderId = senderId,
                    receiverId = receiverId,
                    content = "Sent an image",  // Match web implementation
                    messageType = MessageType.IMAGE,
                    timestamp = DateTimeUtils.getCurrentTimestamp(),
                    imageUrl = imageUrl  // Set the returned image URL
                )

                // Send the message through REST API
                val savedMessage = chatRepository.sendMessage(message)

                // Send through WebSocket for real-time update
                stompClient?.send("/app/chat", savedMessage.toJson())

                // Update UI
                _messages.update { current ->
                    (current + savedMessage).sortedBy { it.timestamp }
                }
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error sending image", e)
            }
        }
    }

    suspend fun fetchExistingMessages(senderId: Long, receiverId: Long) {
        try {
            val messages = chatRepository.getMessages(senderId, receiverId)
            _messages.value = messages.sortedBy { it.timestamp }
        } catch (e: Exception) {
            Log.e("ChatViewModel", "Error fetching messages", e)
        }
    }


    override fun onCleared() {
        super.onCleared()
        messageSubscription?.unsubscribe()
        stompClient?.disconnect()
    }

    suspend fun createConversation(userId1: Long, userId2: Long): ConversationDTO {
        return withContext(Dispatchers.IO) {
            chatRepository.createConversation(userId1, userId2)
        }
    }

    fun sendMessageAndCreateConversation(
        senderId: Long,
        receiverId: Long,
        message: String,
        ownerUsername: String,
        onSuccess: (Long, String) -> Unit
    ) {
        if (!_isConnected.value) {
            Log.e("ChatViewModel", "Cannot send message: Not connected")
            return
        }

        viewModelScope.launch {
            try {
                // First create/get conversation
                createConversation(senderId, receiverId)

                // Then send message
                sendMessage(senderId, receiverId, message)

                // Navigate on success
                onSuccess(receiverId, ownerUsername)
            } catch (e: Exception) {
                Log.e("ChatViewModel", "Error sending message and creating conversation", e)
            }
        }
    }
}