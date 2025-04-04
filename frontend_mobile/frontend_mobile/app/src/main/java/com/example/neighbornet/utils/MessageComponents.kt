package com.example.neighbornet.utils

import android.graphics.drawable.ColorDrawable
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.neighbornet.auth.ChatListViewModel
import com.example.neighbornet.network.AgreementResponse
import com.example.neighbornet.network.ReturnRequest
import com.example.neighbornet.network.ReturnRequestStatus
import com.google.gson.Gson
import java.time.LocalDateTime

@Composable
fun TextMessage(content: String) {
    Text(
        text = content,
        modifier = Modifier.padding(12.dp),
        style = MaterialTheme.typography.bodyMedium
    )
}

@Composable
fun ImageMessage(imageUrl: String?) {
    if (imageUrl != null) {
        val transformedUrl = UrlUtils.getFullImageUrl(imageUrl)
        AsyncImage(
            model = transformedUrl,
            contentDescription = "Shared image",
            modifier = Modifier
                .padding(4.dp)
                .clip(RoundedCornerShape(8.dp))
                .fillMaxWidth()
                .height(200.dp),
            contentScale = ContentScale.Crop,
        )
    }
}

@Composable
fun AgreementMessage(
    formData: String?,
    currentUserId: Long? = null,
    onAccept: (Long) -> Unit = {},
    onReject: (Long) -> Unit = {}
) {
    if (formData == null) return

    val agreement = remember(formData) {
        runCatching {
            Gson().fromJson(formData, AgreementResponse::class.java)
        }.getOrNull()
    }

    if (agreement != null) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "📋 Borrowing Agreement",
                style = MaterialTheme.typography.titleMedium
            )
            Text("Item ID: ${agreement.itemId}")
            Text("Period: ${agreement.borrowingStart} - ${agreement.borrowingEnd}")
            Text("Terms: ${agreement.terms}")
            Text(
                text = when (agreement.status) {
                    "PENDING" -> "⏳ Pending"
                    "ACCEPTED" -> "✅ Accepted"
                    "REJECTED" -> "❌ Rejected"
                    else -> agreement.status
                },
                color = when (agreement.status) {
                    "PENDING" -> MaterialTheme.colorScheme.tertiary
                    "ACCEPTED" -> MaterialTheme.colorScheme.primary
                    "REJECTED" -> MaterialTheme.colorScheme.error
                    else -> MaterialTheme.colorScheme.onSurface
                }
            )

            // Show accept/reject buttons only if:
            // 1. Agreement is pending
            // 2. Current user is the lender
            // 3. Current user ID is not null
            if (agreement.status == "PENDING" &&
                currentUserId != null &&
                currentUserId.toString() == agreement.lenderId  // Compare with String
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { onAccept(agreement.id.toLong()) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Accept")
                    }
                    Button(
                        onClick = { onReject(agreement.id.toLong()) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Reject")
                    }
                }
            }
        }
    } else {
        Text(
            text = "Invalid agreement data",
            modifier = Modifier.padding(12.dp),
            color = MaterialTheme.colorScheme.error
        )
    }
}

@Composable
fun ReturnRequestMessage(formData: String?) {
    if (formData == null) return

    val returnRequest = remember(formData) {
        runCatching {
            Gson().fromJson(formData, ReturnRequest::class.java)
        }.getOrNull()
    }

    if (returnRequest != null) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "🔄 Return Request",
                style = MaterialTheme.typography.titleMedium
            )
            Text("Item: ${returnRequest.itemName}")
            Text("Return Note: ${returnRequest.returnNote ?: "No note provided"}")
            Text(
                text = when (returnRequest.status) {
                    ReturnRequestStatus.PENDING -> "⏳ Pending"
                    ReturnRequestStatus.CONFIRMED -> "✅ Confirmed"
                    ReturnRequestStatus.REJECTED -> "❌ Rejected"
                },
                color = when (returnRequest.status) {
                    ReturnRequestStatus.PENDING -> MaterialTheme.colorScheme.tertiary
                    ReturnRequestStatus.CONFIRMED -> MaterialTheme.colorScheme.primary
                    ReturnRequestStatus.REJECTED -> MaterialTheme.colorScheme.error
                }
            )
        }
    } else {
        Text(
            text = "Invalid return request data",
            modifier = Modifier.padding(12.dp),
            color = MaterialTheme.colorScheme.error
        )
    }
}

@Composable
fun Avatar(name: String) {
    Box(
        modifier = Modifier
            .size(32.dp)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.secondary
                    )
                ),
                shape = CircleShape
            ),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = name.first().uppercase(),
            color = Color.White,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}


@Composable
fun ChatListScreen(
    onChatSelected: (userId: Long, userName: String) -> Unit
) {
    val viewModel: ChatListViewModel = hiltViewModel()
    val conversations by viewModel.conversations.collectAsState()
    val loading by viewModel.loading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Header
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(64.dp),
            shadowElevation = 4.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Messages",
                    style = MaterialTheme.typography.titleLarge
                )
            }
        }

        // Chat list
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier
                    .fillMaxSize()
                    .wrapContentSize()
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(
                    items = conversations,
                    key = { it.id ?: it.participant.id }
                ) { conversation ->
                    ChatListItem(
                        userName = conversation.participant.username,
                        lastMessage = conversation.lastMessage ?: "",
                        timestamp = formatTimestamp(conversation.lastMessageTimestamp),
                        unreadCount = conversation.unreadCount,
                        onClick = {
                            onChatSelected(
                                conversation.participant.id,
                                conversation.participant.username
                            )
                        }
                    )
                }
            }
        }
    }
}

private fun formatTimestamp(timestamp: LocalDateTime?): String {
    if (timestamp == null) return ""
    return timestamp.toString()
}

@Composable
private fun ChatListItem(
    userName: String,
    lastMessage: String,
    timestamp: String,
    unreadCount: Int,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .height(72.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.secondary
                            )
                        ),
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = userName.first().toString(),
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = userName,
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = lastMessage,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = timestamp,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
                if (unreadCount > 0) {
                    Box(
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .size(24.dp)
                            .background(
                                color = MaterialTheme.colorScheme.primary,
                                shape = CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = unreadCount.toString(),
                            color = MaterialTheme.colorScheme.onPrimary,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }
    }
}