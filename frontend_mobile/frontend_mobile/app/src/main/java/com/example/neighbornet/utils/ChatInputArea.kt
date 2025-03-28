package com.example.neighbornet.utils

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@Composable
fun ChatInputArea(
    messageInput: String,
    onMessageInputChange: (String) -> Unit,
    onSendClick: () -> Unit,
    onImageClick: () -> Unit,
    onAgreementClick: () -> Unit,
    selectedImageUri: Uri?,
    onClearImage: () -> Unit,
    modifier: Modifier = Modifier
) {
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            onImageClick()
        }
    }

    Column(modifier = modifier.fillMaxWidth()) {
        // Image preview
        AnimatedVisibility(
            visible = selectedImageUri != null,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                AsyncImage(
                    model = selectedImageUri,
                    contentDescription = null,
                    modifier = Modifier
                        .height(120.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
                IconButton(
                    onClick = onClearImage,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                        .size(24.dp)
                        .background(MaterialTheme.colorScheme.error, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear image",
                        tint = Color.White
                    )
                }
            }
        }

        // Input row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Image button
            IconButton(
                onClick = { imagePickerLauncher.launch("image/*") }
            ) {
                Icon(
                    imageVector = Icons.Default.Image,
                    contentDescription = "Send image"
                )
            }

            // Agreement button
            IconButton(onClick = onAgreementClick) {
                Icon(
                    imageVector = Icons.Default.Description,
                    contentDescription = "Send agreement"
                )
            }

            // Text input
            TextField(
                value = messageInput,
                onValueChange = onMessageInputChange,
                modifier = Modifier.weight(1f),
                placeholder = { Text("Type a message") },
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                    focusedContainerColor = MaterialTheme.colorScheme.surface
                )
            )

            // Send button
            IconButton(
                onClick = onSendClick,
                enabled = messageInput.isNotBlank() || selectedImageUri != null
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = if (messageInput.isNotBlank() || selectedImageUri != null)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                )
            }
        }
    }
}