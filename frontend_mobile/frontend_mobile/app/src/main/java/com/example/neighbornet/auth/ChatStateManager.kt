package com.example.neighbornet.auth

import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.network.Item
import com.example.neighbornet.network.Message
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChatStateManager @Inject constructor() {
    private val _messages = MutableStateFlow<List<Message>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _conversations = MutableStateFlow<List<ConversationDTO>>(emptyList())
    val conversations = _conversations.asStateFlow()

    private val _userItems = MutableStateFlow<List<Item>>(emptyList())
    val userItems = _userItems.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected = _isConnected.asStateFlow()

    private val _chatList = MutableStateFlow<List<ConversationDTO>>(emptyList())
    val chatList = _chatList.asStateFlow()

    private val _chatListLoading = MutableStateFlow(false)
    val chatListLoading = _chatListLoading.asStateFlow()

    private val _currentChatId = MutableStateFlow<Pair<Long, Long>?>(null)
    val currentChatId = _currentChatId.asStateFlow()

    fun setCurrentChat(userId1: Long, userId2: Long) {
        _currentChatId.value = Pair(userId1, userId2)
    }

    fun updateChatList(conversations: List<ConversationDTO>) {
        _chatList.value = conversations
    }

    fun updateChatListLoading(isLoading: Boolean) {
        _chatListLoading.value = isLoading
    }

    fun updateMessages(messages: List<Message>) {
        _messages.value = messages
    }

    fun updateConversations(conversations: List<ConversationDTO>) {
        _conversations.value = conversations
    }

    fun updateUserItems(items: List<Item>) {
        _userItems.value = items
    }

    fun updateConnectionState(isConnected: Boolean) {
        _isConnected.value = isConnected
    }

    fun updateMessage(update: (List<Message>) -> List<Message>) {
        _messages.value = update(_messages.value)
    }

    fun clearAll() {
        _messages.value = emptyList()
        _conversations.value = emptyList()
        _userItems.value = emptyList()
        _isConnected.value = false
        _chatList.value = emptyList()
        _chatListLoading.value = false
        _currentChatId.value = null
    }
}