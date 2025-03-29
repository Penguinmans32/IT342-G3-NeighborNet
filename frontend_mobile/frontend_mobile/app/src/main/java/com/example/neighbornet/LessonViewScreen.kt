package com.example.neighbornet

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.neighbornet.auth.ClassViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LessonViewScreen(
    classId: Long,
    lessonId: Long,
    onBackClick: () -> Unit,
    viewModel: ClassViewModel = hiltViewModel()
) {
    val showTranscript = remember { mutableStateOf(true) }
    val isPlaying = remember { mutableStateOf(false) }
    val videoProgress = remember { mutableStateOf(0f) }
    val videoFinished = remember { mutableStateOf(false) }
    val showCompletionDialog = remember { mutableStateOf(false) }

    val lessonRating by viewModel.lessonRating.collectAsStateWithLifecycle()
    val showRatingDialog = remember { mutableStateOf(false) }

    val currentLesson by viewModel.currentLesson.collectAsStateWithLifecycle()
    val isLessonCompleted by viewModel.isLessonCompleted.collectAsStateWithLifecycle()

    // Animated progress
    val animatedProgress by animateFloatAsState(
        targetValue = videoProgress.value,
        animationSpec = tween(500),
        label = "progress"
    )

    // Theme colors for better visual appeal
    val primaryColor = MaterialTheme.colorScheme.primary
    val surfaceColor = MaterialTheme.colorScheme.surface
    val backgroundColor = MaterialTheme.colorScheme.background

    LaunchedEffect(classId, lessonId) {
        viewModel.loadLesson(classId, lessonId)
    }

    // Enhanced Rating Dialog
    if (showRatingDialog.value) {
        AlertDialog(
            onDismissRequest = { showRatingDialog.value = false },
            title = {
                Text(
                    "Rate this Lesson",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold
                    )
                )
            },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                ) {
                    StarRating(
                        rating = lessonRating ?: 0.0,
                        onRatingChanged = { rating ->
                            viewModel.submitLessonRating(classId, lessonId, rating)
                            showRatingDialog.value = false
                        },
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = when {
                            lessonRating == null -> "How would you rate this lesson?"
                            lessonRating!! >= 4.0 -> "Excellent! Thank you for the feedback."
                            lessonRating!! >= 3.0 -> "Good! Thanks for rating."
                            lessonRating!! >= 2.0 -> "Fair. We'll work to improve."
                            else -> "We'll do better next time."
                        },
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { showRatingDialog.value = false },
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text("Close")
                }
            },
            containerColor = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(24.dp)
        )
    }

    // Enhanced Completion Dialog
    if (showCompletionDialog.value && !isLessonCompleted) {
        AlertDialog(
            onDismissRequest = { showCompletionDialog.value = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Filled.Celebration,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        "Lesson Completed!",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            },
            text = {
                Text(
                    "Congratulations! You've finished watching this lesson. Would you like to mark it as completed?",
                    style = MaterialTheme.typography.bodyLarge,
                    lineHeight = 24.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.markLessonAsComplete(classId, lessonId)
                        showCompletionDialog.value = false
                    },
                    shape = RoundedCornerShape(20.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        Icons.Filled.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Mark as Completed")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showCompletionDialog.value = false },
                    shape = RoundedCornerShape(20.dp)
                ) {
                    Text("Later")
                }
            },
            containerColor = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(24.dp)
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = currentLesson?.title ?: "",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold
                            ),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Spacer(modifier = Modifier.height(4.dp))

                        // Fancy progress bar with buffer effect
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth(animatedProgress)
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(
                                        Brush.horizontalGradient(
                                            colors = listOf(
                                                MaterialTheme.colorScheme.primary,
                                                MaterialTheme.colorScheme.tertiary
                                            )
                                        )
                                    )
                            )
                        }
                    }
                },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier
                            .padding(8.dp)
                            .shadow(4.dp, CircleShape)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.9f))
                    ) {
                        Icon(
                            Icons.Rounded.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                actions = {
                    if (isLessonCompleted) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .padding(end = 16.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.8f))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Icon(
                                Icons.Filled.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                "Completed",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Medium
                                ),
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        floatingActionButton = {
            if (!isLessonCompleted && videoFinished.value) {
                FloatingActionButton(
                    onClick = { viewModel.markLessonAsComplete(classId, lessonId) },
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(16.dp),
                        spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Filled.CheckCircle,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Mark as Completed",
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Enhanced Video Player
            currentLesson?.videoUrl?.let { videoUrl ->
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .clip(RoundedCornerShape(0.dp))
                        .shadow(8.dp)
                ) {
                    VideoPlayer(
                        videoUrl = videoUrl,
                        classId = classId,
                        onProgressUpdate = { progress ->
                            videoProgress.value = progress
                        },
                        onCompletion = {
                            videoFinished.value = true
                            if (!isLessonCompleted) {
                                showCompletionDialog.value = true
                            }
                        }
                    )

                    // Play indicator overlay
                    if (!isPlaying.value) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color.Black.copy(alpha = 0.4f)),
                            contentAlignment = Alignment.Center
                        ) {
                            IconButton(
                                onClick = { isPlaying.value = true },
                                modifier = Modifier
                                    .size(64.dp)
                                    .shadow(8.dp, CircleShape)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.9f))
                            ) {
                                Icon(
                                    Icons.Filled.PlayArrow,
                                    contentDescription = "Play",
                                    tint = MaterialTheme.colorScheme.onPrimary,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Completion card with animation
            AnimatedVisibility(
                visible = videoFinished.value && !isLessonCompleted,
                enter = fadeIn(tween(400)),
                exit = fadeOut(tween(400))
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Filled.Celebration,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(28.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                "Video Completed!",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold
                                ),
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Button(
                            onClick = { viewModel.markLessonAsComplete(classId, lessonId) },
                            shape = RoundedCornerShape(20.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            Icon(Icons.Filled.Check, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Mark Complete")
                        }
                    }
                }
            }

            // Content
            LazyColumn(
                modifier = Modifier.fillMaxSize()
            ) {
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .shadow(4.dp, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        ),
                        elevation = CardDefaults.cardElevation(
                            defaultElevation = 2.dp
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Outlined.Info,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "About this Lesson",
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = currentLesson?.description ?: "",
                                style = MaterialTheme.typography.bodyLarge,
                                lineHeight = 24.sp,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }
                    }
                }

                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .shadow(4.dp, RoundedCornerShape(16.dp)),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.7f)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Outlined.Star,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Rate this Lesson",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = MaterialTheme.colorScheme.onSecondaryContainer
                                )
                            }
                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                StarRating(
                                    rating = lessonRating ?: 0.0,
                                    onRatingChanged = { /* Do nothing here */ },
                                    readOnly = true,
                                    size = 24.dp,
                                    activeColor = MaterialTheme.colorScheme.secondary
                                )

                                Button(
                                    onClick = { showRatingDialog.value = true },
                                    shape = RoundedCornerShape(20.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = MaterialTheme.colorScheme.secondary
                                    ),
                                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Icon(
                                        Icons.Filled.Star,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        if (lessonRating == null) "Rate Now" else "Update Rating",
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            if (currentLesson?.averageRating != null && currentLesson?.ratingCount != null) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    StarRating(
                                        rating = currentLesson?.averageRating ?: 0.0,
                                        onRatingChanged = { },
                                        readOnly = true,
                                        size = 16.dp,
                                        activeColor = MaterialTheme.colorScheme.secondary
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "${String.format("%.1f", currentLesson?.averageRating)} (${currentLesson?.ratingCount} ratings)",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f)
                                    )
                                }
                            }
                        }
                    }
                }

                // Navigation Buttons with enhanced styling
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 24.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        val prevEnabled = viewModel.prevLesson.collectAsStateWithLifecycle().value != null
                        val nextEnabled = viewModel.nextLesson.collectAsStateWithLifecycle().value != null && isLessonCompleted

                        OutlinedButton(
                            onClick = { /* Navigate to previous lesson */ },
                            enabled = prevEnabled,
                            shape = RoundedCornerShape(16.dp),
                            border = BorderStroke(
                                width = 1.dp,
                                color = if (prevEnabled) MaterialTheme.colorScheme.primary
                                else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .padding(end = 8.dp)
                                .height(48.dp)
                        ) {
                            Icon(
                                Icons.Filled.ChevronLeft,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "Previous",
                                fontWeight = FontWeight.Medium
                            )
                        }

                        Button(
                            onClick = { /* Navigate to next lesson */ },
                            enabled = nextEnabled,
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                disabledContainerColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .padding(start = 8.dp)
                                .height(48.dp)
                        ) {
                            Text(
                                "Next Lesson",
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                Icons.Filled.ChevronRight,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }

                // Extra bottom space for comfortable scrolling
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
fun StarRating(
    rating: Double,
    onRatingChanged: (Double) -> Unit,
    modifier: Modifier = Modifier,
    readOnly: Boolean = false,
    size: Dp = 28.dp,
    activeColor: Color = MaterialTheme.colorScheme.primary,
    inactiveColor: Color = MaterialTheme.colorScheme.surfaceVariant
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        for (i in 1..5) {
            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = "Star $i",
                tint = if (i <= rating) activeColor else inactiveColor,
                modifier = Modifier
                    .size(size)  // Now size is a Dp value
                    .then(
                        if (!readOnly) {
                            Modifier.clickable { onRatingChanged(i.toDouble()) }
                        } else {
                            Modifier
                        }
                    )
            )
        }
    }
}