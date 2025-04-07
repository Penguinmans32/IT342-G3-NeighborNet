package com.example.neighbornet.utils

import android.graphics.drawable.ColorDrawable
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.rounded.Done
import androidx.compose.material.icons.rounded.Forum
import androidx.compose.material.icons.rounded.MarkUnreadChatAlt
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.neighbornet.AuthenticatedThumbnailImage
import com.example.neighbornet.auth.ChatListViewModel
import com.example.neighbornet.network.AgreementResponse
import com.example.neighbornet.network.ConversationDTO
import com.example.neighbornet.network.ReturnRequest
import com.example.neighbornet.network.ReturnRequestStatus
import com.google.gson.Gson
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

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

    LaunchedEffect(Unit) {
        viewModel.loadConversations()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Enhanced Header with Gradient and Wave Pattern
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
            ) {
                // Gradient Background
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary,
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                                )
                            )
                        )
                )

                // Header Content with Stats
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Top Row with Title and Search
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Messages",
                                style = MaterialTheme.typography.headlineMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            )
                            Text(
                                text = "Welcome back, there",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
                            )
                        }

                        // Search Button with Background
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.2f))
                                .clickable { /* Search functionality */ },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Search,
                                contentDescription = "Search",
                                tint = MaterialTheme.colorScheme.onPrimary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    // Stats Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        MessageStat(
                            count = conversations.count { it.unreadCount > 0 },
                            label = "Unread",
                            icon = Icons.Rounded.MarkUnreadChatAlt
                        )
                        Spacer(modifier = Modifier.width(24.dp))
                        MessageStat(
                            count = conversations.size,
                            label = "Total",
                            icon = Icons.Rounded.Forum
                        )
                    }
                }
            }

            // Content with Curved Top Corners
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .offset(y = (-20).dp),
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                color = MaterialTheme.colorScheme.background,
                shadowElevation = 8.dp
            ) {
                when {
                    loading -> LoadingContent()
                    conversations.isEmpty() -> EmptyContent()
                    else -> ConversationsList(conversations, onChatSelected)
                }
            }
        }
    }
}

@Composable
private fun MessageStat(
    count: Int,
    label: String,
    icon: ImageVector
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.1f))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onPrimary,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = count.toString(),
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onPrimary,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
        )
    }
}

@Composable
private fun LoadingContent() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            LoadingAnimation()
            Text(
                text = "Loading your conversations...",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}

@Composable
private fun LoadingAnimation() {
    val infiniteTransition = rememberInfiniteTransition()
    val angle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing)
        )
    )

    Box(
        modifier = Modifier
            .size(48.dp)
            .rotate(angle),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = MaterialTheme.colorScheme.primary,
            strokeWidth = 4.dp
        )
    }
}

@Composable
private fun EmptyContent() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.ChatBubbleOutline,
                contentDescription = null,
                modifier = Modifier
                    .size(80.dp)
                    .alpha(0.6f),
                tint = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "No messages yet",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Text(
                text = "Start a conversation with someone!",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun ConversationsList(
    conversations: List<ConversationDTO>,
    onChatSelected: (userId: Long, userName: String) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(
            top = 16.dp,
            bottom = 88.dp
        ),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(
            items = conversations,
            key = { it.id ?: it.participant.id }
        ) { conversation ->
            EnhancedChatListItem(
                userName = conversation.participant.username,
                lastMessage = when {
                    conversation.lastMessageItem != null -> "Sent an item: ${conversation.lastMessageItem.name}"
                    !conversation.lastMessage.isNullOrEmpty() -> conversation.lastMessage
                    else -> ""
                },
                timestamp = formatTimestampBetter(conversation.lastMessageTimestamp),
                unreadCount = conversation.unreadCount,
                userImage = conversation.participant.imageUrl,
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

@Composable
private fun EnhancedChatListItem(
    userName: String,
    lastMessage: String,
    timestamp: String,
    unreadCount: Int,
    userImage: String?,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable(onClick = onClick)
            .animateContentSize(),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (unreadCount > 0) 4.dp else 0.dp
        ),
        colors = CardDefaults.cardColors(
            containerColor = if (unreadCount > 0)
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.15f)
            else MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .height(65.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(55.dp)
                    .border(
                        width = if (unreadCount > 0) 2.dp else 1.dp,
                        color = if (unreadCount > 0)
                            MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                        shape = CircleShape
                    )
                    .padding(2.dp)
                    .clip(CircleShape)
                    .shimmerEffect()
            ) {
                AuthenticatedThumbnailImage(
                    url = userImage,
                    contentDescription = "Profile picture of $userName",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .clip(CircleShape)
                        .background(Color.Green)
                        .border(
                            width = 2.dp,
                            color = MaterialTheme.colorScheme.surface,
                            shape = CircleShape
                        )
                        .align(Alignment.BottomEnd)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Message Content with enhanced styling
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = userName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = if (unreadCount > 0) FontWeight.Bold else FontWeight.Medium
                        )
                        if (unreadCount > 0) {
                            Box(
                                modifier = Modifier
                                    .padding(start = 8.dp)
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary)
                            )
                        }
                    }
                    Text(
                        text = timestamp,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (unreadCount > 0)
                            MaterialTheme.colorScheme.primary
                        else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Message status indicator
                        if (lastMessage.isNotEmpty()) {
                            Icon(
                                imageVector = Icons.Rounded.Done,
                                contentDescription = null,
                                modifier = Modifier
                                    .size(16.dp)
                                    .padding(end = 4.dp),
                                tint = if (unreadCount > 0)
                                    MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                            )
                        }

                        Text(
                            text = lastMessage.ifEmpty { "No message yet" },
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(
                                alpha = if (unreadCount > 0) 0.8f else 0.6f
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }

                    if (unreadCount > 0) {
                        Box(
                            modifier = Modifier
                                .padding(start = 8.dp)
                                .size(26.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(
                                        colors = listOf(
                                            MaterialTheme.colorScheme.primary,
                                            MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)
                                        )
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = unreadCount.toString(),
                                color = MaterialTheme.colorScheme.onPrimary,
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun formatTimestampBetter(timestamp: LocalDateTime?): String {
    if (timestamp == null) return ""

    val now = LocalDateTime.now()
    val today = LocalDate.now()
    val yesterday = today.minusDays(1)

    return when {
        timestamp.toLocalDate() == today -> {
            // Today: Show time only
            timestamp.format(DateTimeFormatter.ofPattern("HH:mm"))
        }
        timestamp.toLocalDate() == yesterday -> {
            "Yesterday"
        }
        timestamp.year == now.year -> {
            // This year: Show month and day
            timestamp.format(DateTimeFormatter.ofPattern("MMM d"))
        }
        else -> {
            // Different year: Show month, day and year
            timestamp.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))
        }
    }
}