package com.example.neighbornet

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.neighbornet.auth.ClassViewModel
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CardDefaults
import androidx.compose.ui.text.style.TextAlign

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

    LaunchedEffect(classId, lessonId) {
        viewModel.loadLesson(classId, lessonId)
    }

    if (showRatingDialog.value) {
        AlertDialog(
            onDismissRequest = { showRatingDialog.value = false },
            title = { Text("Rate this Lesson") },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    StarRating(
                        rating = lessonRating ?: 0.0,
                        onRatingChanged = { rating ->
                            viewModel.submitLessonRating(classId, lessonId, rating)
                            showRatingDialog.value = false
                        }
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = when {
                            lessonRating == null -> "Rate this lesson"
                            lessonRating!! >= 4.0 -> "Excellent!"
                            lessonRating!! >= 3.0 -> "Good"
                            lessonRating!! >= 2.0 -> "Fair"
                            else -> "Poor"
                        },
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = { showRatingDialog.value = false }
                ) {
                    Text("Close")
                }
            }
        )
    }

    if (showCompletionDialog.value && !isLessonCompleted) {
        AlertDialog(
            onDismissRequest = { showCompletionDialog.value = false },
            title = { Text("Lesson Completed!") },
            text = { Text("Congratulations! You've finished watching this lesson. Would you like to mark it as completed?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.markLessonAsComplete(classId, lessonId)
                        showCompletionDialog.value = false
                    }
                ) {
                    Text("Mark as Completed")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCompletionDialog.value = false }) {
                    Text("Later")
                }
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = currentLesson?.title ?: "",
                            style = MaterialTheme.typography.titleMedium
                        )
                        LinearProgressIndicator(
                            progress = videoProgress.value,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (isLessonCompleted) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(end = 16.dp)
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text("Completed")
                        }
                    }
                }
            )
        },
        floatingActionButton = {
            if (!isLessonCompleted && videoFinished.value) {
                FloatingActionButton(
                    onClick = { viewModel.markLessonAsComplete(classId, lessonId) },
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Mark as Completed")
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            currentLesson?.videoUrl?.let { videoUrl ->
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
            }

            if (videoFinished.value && !isLessonCompleted) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Video Completed!",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Button(
                            onClick = { viewModel.markLessonAsComplete(classId, lessonId) }
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null)
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
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "About this Lesson",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = currentLesson?.description ?: "",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }

                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "Rate this Lesson",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(8.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                StarRating(
                                    rating = lessonRating ?: 0.0,
                                    onRatingChanged = { /* Do nothing here */ },
                                    readOnly = true
                                )
                                Button(
                                    onClick = { showRatingDialog.value = true }
                                ) {
                                    Text(if (lessonRating == null) "Rate Now" else "Update Rating")
                                }
                            }

                            if (currentLesson?.averageRating != null && currentLesson?.ratingCount != null) {
                                Text(
                                    text = "Average rating: ${String.format("%.1f", currentLesson?.averageRating)} (${currentLesson?.ratingCount} ratings)",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(top = 8.dp)
                                )
                            }
                        }
                    }
                }
                // Navigation Buttons
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Button(
                            onClick = { /* Navigate to previous lesson */ },
                            enabled = viewModel.prevLesson.collectAsStateWithLifecycle().value != null
                        ) {
                            Text("Previous")
                        }
                        Button(
                            onClick = { /* Navigate to next lesson */ },
                            enabled = viewModel.nextLesson.collectAsStateWithLifecycle().value != null && isLessonCompleted
                        ) {
                            Text("Next")
                        }
                    }
                }
            }
        }
    }
}



