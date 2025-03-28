package com.example.neighbornet.network

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString

@Singleton
class BorrowingWebSocketManager @Inject constructor(
    private val stompClient: StompClient
) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private val _messages = MutableStateFlow<List<WebSocketMessage>>(emptyList())
    val messages: StateFlow<List<WebSocketMessage>> = _messages.asStateFlow()

    private val _borrowingUpdates = MutableStateFlow<List<BorrowingUpdate>>(emptyList())
    val borrowingUpdates: StateFlow<List<BorrowingUpdate>> = _borrowingUpdates.asStateFlow()

    private val _ratingUpdates = MutableStateFlow<List<RatingUpdate>>(emptyList())
    val ratingUpdates: StateFlow<List<RatingUpdate>> = _ratingUpdates.asStateFlow()

    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState.asStateFlow()

    fun connect(userId: String) {
        stompClient.connect(
            onConnect = {
                _connectionState.value = ConnectionState.Connected
                subscribeToUserTopics(userId)
            },
            onError = {
                _connectionState.value = ConnectionState.Error(it.message ?: "Unknown error")
            }
        )
    }

    private fun subscribeToUserTopics(userId: String) {
        stompClient.subscribe("/user/$userId/queue/borrowing-updates") { message ->
            try {
                val update = json.decodeFromString<BorrowingUpdate>(message)
                handleBorrowingUpdate(update)
            } catch (e: Exception) {
                _connectionState.value = ConnectionState.Error("Failed to parse borrowing update: ${e.message}")
            }
        }

        stompClient.subscribe("/topic/items/ratings") { message ->
            try {
                val update = json.decodeFromString<RatingUpdate>(message)
                handleRatingUpdate(update)
            } catch (e: Exception) {
                _connectionState.value = ConnectionState.Error("Failed to parse rating update: ${e.message}")
            }
        }

        stompClient.subscribe("/user/$userId/queue/messages") { message ->
            try {
                val chatMessage = json.decodeFromString<WebSocketMessage>(message)
                handleChatMessage(chatMessage)
            } catch (e: Exception) {
                _connectionState.value = ConnectionState.Error("Failed to parse chat message: ${e.message}")
            }
        }
    }


    private fun handleBorrowingUpdate(update: BorrowingUpdate) {
        _borrowingUpdates.value = _borrowingUpdates.value + update
        _messages.value = _messages.value + WebSocketMessage(
            type = MessageType.BORROWING_UPDATE,
            content = "Item ${update.itemId} was ${update.action.name.lowercase()}",
            timestamp = update.timestamp,
            senderId = update.userId
        )
    }

    private fun handleChatMessage(message: WebSocketMessage) {
        _messages.value = _messages.value + message
    }

    fun sendMessage(userId: String, message: String) {
        if (_connectionState.value is ConnectionState.Connected) {
            val chatMessage = WebSocketMessage(
                type = MessageType.CHAT_MESSAGE,
                content = message,
                timestamp = java.time.LocalDateTime.now().toString(),
                senderId = userId
            )
            stompClient.send("/app/chat", json.encodeToString(chatMessage))
        }
    }


    private fun handleRatingUpdate(update: RatingUpdate) {
        _ratingUpdates.value = _ratingUpdates.value + update
        _messages.value = _messages.value + WebSocketMessage(
            type = MessageType.RATING_UPDATE,
            content = "Item ${update.itemId} was rated ${update.rating} stars",
            timestamp = update.timestamp,
            senderId = update.userId
        )
    }

    fun disconnect() {
        stompClient.disconnect()
        _connectionState.value = ConnectionState.Disconnected
        _messages.value = emptyList()
        _borrowingUpdates.value = emptyList()
        _ratingUpdates.value = emptyList()
    }
}

sealed class ConnectionState {
    object Connected : ConnectionState()
    object Disconnected : ConnectionState()
    data class Error(val message: String) : ConnectionState()
}