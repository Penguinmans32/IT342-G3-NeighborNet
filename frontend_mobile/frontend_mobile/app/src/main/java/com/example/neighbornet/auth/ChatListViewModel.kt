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
    private val tokenManager: TokenManager
) : ViewModel() {
    private val _conversations = MutableStateFlow<List<ConversationDTO>>(emptyList())
    val conversations: StateFlow<List<ConversationDTO>> = _conversations.asStateFlow()

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading.asStateFlow()

    init {
        loadConversations()
    }

    private fun loadConversations() {
        viewModelScope.launch {
            _loading.value = true
            try {
                val userId = tokenManager.getCurrentUserId()
                userId?.let { id ->
                    val userConversations = chatRepository.getUserConversations(id)
                    _conversations.value = userConversations
                }
            } catch (e: Exception) {
                Log.e("ChatListViewModel", "Error loading conversations", e)
            } finally {
                _loading.value = false
            }
        }
    }
}