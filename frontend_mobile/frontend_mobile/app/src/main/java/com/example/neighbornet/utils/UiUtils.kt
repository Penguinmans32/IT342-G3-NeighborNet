package com.example.neighbornet.utils

import androidx.compose.animation.core.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.graphicsLayer

fun Modifier.shimmerEffect() = composed {
    var shimmerAlpha by remember { mutableFloatStateOf(1f) }
    LaunchedEffect(Unit) {
        animate(
            initialValue = 0.6f,
            targetValue = 1f,
            animationSpec = infiniteRepeatable(
                animation = tween(1000),
                repeatMode = RepeatMode.Reverse
            )
        ) { value, _ -> shimmerAlpha = value }
    }
    this.graphicsLayer(alpha = shimmerAlpha)
}