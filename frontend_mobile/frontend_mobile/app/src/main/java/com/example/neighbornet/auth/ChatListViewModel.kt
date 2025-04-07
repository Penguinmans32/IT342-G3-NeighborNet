package com.example.neighbornet.auth

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.repository.ChatRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChatListViewModel @Inject constructor(
    private val chatRepository: ChatRepository,
    private val tokenManager: TokenManager,
    private val chatStateManager: ChatStateManager
) : ViewModel() {
    val conversations = chatStateManager.chatList
    val loading = chatStateManager.chatListLoading

    init {
        loadConversations()
    }

    fun loadConversations() {
        viewModelScope.launch {
            chatStateManager.updateChatListLoading(true)
            try {
                val userId = tokenManager.getCurrentUserId()
                userId?.let { id ->
                    val userConversations = chatRepository.getUserConversations(id)
                    chatStateManager.updateChatList(userConversations)
                }
            } catch (e: Exception) {
                Log.e("ChatListViewModel", "Error loading conversations", e)
                chatStateManager.updateChatList(emptyList())
            } finally {
                chatStateManager.updateChatListLoading(false)
            }
        }
    }

    fun clearChatListState() {
        chatStateManager.updateChatList(emptyList())
        chatStateManager.updateChatListLoading(false)
    }
}