package com.example.neighbornet.utils

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarHalf
import androidx.compose.material.icons.outlined.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun RatingBar(
    rating: Float,
    onRatingChanged: (Float) -> Unit,
    modifier: Modifier = Modifier,
    isEnabled: Boolean = true
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        repeat(5) { index ->
            val starProgress = rating - index
            val icon = when {
                starProgress >= 1f -> Icons.Filled.Star
                starProgress > 0f -> Icons.Filled.StarHalf
                else -> Icons.Outlined.Star
            }

            IconButton(
                onClick = { if (isEnabled) onRatingChanged(index + 1f) },
                enabled = isEnabled
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = "Rate $index",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}