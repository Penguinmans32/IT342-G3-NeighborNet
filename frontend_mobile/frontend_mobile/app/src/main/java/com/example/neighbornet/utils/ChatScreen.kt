package com.example.neighbornet.utils

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.neighbornet.ChatContent
import com.example.neighbornet.auth.ChatViewModel

@Composable
fun ChatScreen(
    userId: Long,
    userName: String,
    onBackClick: () -> Unit
) {
    val viewModel: ChatViewModel = hiltViewModel()
    val currentUserId by viewModel.currentUserId.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val isConnected by viewModel.isConnected.collectAsState()

    // Add connection effect
    LaunchedEffect(currentUserId, userId) {
        currentUserId?.let { senderId ->
            viewModel.connectWebSocket(senderId, userId)
        }
    }

    // Add messages effect
    LaunchedEffect(currentUserId, userId) {
        currentUserId?.let { senderId ->
            viewModel.fetchExistingMessages(senderId, userId)
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        IconButton(onClick = onBackClick) {
            Icon(
                imageVector = Icons.Default.ArrowBack,
                contentDescription = "Back to chat list"
            )
        }

        currentUserId?.let { senderId ->
            ChatContent(
                modifier = Modifier.weight(1f),
                senderId = senderId,
                receiverId = userId,
                receiverName = userName,
                messages = messages,
                isConnected = isConnected,
                onMessageSent = { message ->
                    viewModel.sendMessage(
                        senderId = senderId,
                        receiverId = userId,
                        content = message.content
                    )
                },
                onImageSelected = { uri ->
                    viewModel.sendImage(
                        senderId = senderId,
                        receiverId = userId,
                        imageUri = uri
                    )
                },
                onAgreementSubmit = { agreementData ->
                    viewModel.sendAgreement(agreementData)
                }
            )
        }
    }
}