package com.example.neighbornet

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.NavHostController
import coil.compose.AsyncImage
import com.example.neighbornet.auth.ClassViewModel
import com.example.neighbornet.network.LessonProgress
import com.example.neighbornet.network.LessonResponse
import com.example.neighbornet.utils.UrlUtils

@Composable
fun ClassDetailsScreen(
    classId: Long,
    onBackClick: () -> Unit,
    navController: NavHostController,
    viewModelStoreOwner: ViewModelStoreOwner = checkNotNull(LocalViewModelStoreOwner.current) {
        "No ViewModelStoreOwner was provided via LocalViewModelStoreOwner"
    }

) {

    val viewModel = hiltViewModel<ClassViewModel>(viewModelStoreOwner)
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    val startLearningSuccess by viewModel.startLearningSuccess.collectAsStateWithLifecycle()

    LaunchedEffect(classId) {
        viewModel.initializeWithClassId(classId)
    }

    LaunchedEffect(startLearningSuccess) {
        startLearningSuccess?.let {
            if (it) {
                snackbarHostState.showSnackbar(
                    message = "Successfully started your learning journey!",
                    actionLabel = "OK"
                )
            }
        }
    }


    val classDetails by viewModel.classDetails.collectAsStateWithLifecycle()
    val lessons by viewModel.lessons.collectAsStateWithLifecycle()
    val isLearning by viewModel.isLearning.collectAsStateWithLifecycle()
    val progress by viewModel.progress.collectAsStateWithLifecycle()
    val userRating by viewModel.userRating.collectAsStateWithLifecycle()
    var showRatingDialog by remember { mutableStateOf(false) }
    var showFeedbackDialog by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            if (!isLearning) {
                FloatingActionButton(
                    onClick = { viewModel.startLearning() },
                    containerColor = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Begin Your Journey")
                    }
                }
            }
        },
        floatingActionButtonPosition = FabPosition.End,
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            item {
                // Hero Section
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(400.dp)
                ) {
                    // Background Image
                    AsyncImage(
                        model = classDetails?.let { UrlUtils.getFullThumbnailUrl(it.thumbnailUrl) },
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )

                    // Gradient Overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.7f)
                                    )
                                )
                            )
                    )

                    // Back Button
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier
                            .padding(16.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.8f))
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.Black
                        )
                    }

                    // Content
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(16.dp)
                    ) {
                        Text(
                            text = classDetails?.title ?: "",
                            style = MaterialTheme.typography.headlineLarge,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = classDetails?.description ?: "",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Color.White.copy(alpha = 0.8f),
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Stats Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            StatItem(
                                icon = Icons.Default.Person,
                                value = "${classDetails?.enrolledCount ?: 0}",
                                label = "Students"
                            )
                            StatItem(
                                icon = Icons.Default.PlayArrow,
                                value = classDetails?.duration ?: "",
                                label = "Duration"
                            )
                            StatItem(
                                icon = Icons.Default.Star,
                                value = String.format("%.1f", classDetails?.averageRating ?: 0.0),
                                label = "${classDetails?.ratingCount ?: 0} ratings"
                            )
                        }
                    }
                }
            }

            // Quick Stats Cards
            item {
                QuickStatsSection(
                    enrolledCount = classDetails?.enrolledCount ?: 0,
                    lessonsCount = lessons.size,
                    duration = classDetails?.duration ?: "",
                    difficulty = classDetails?.difficulty?.name ?: ""
                )
            }

            // Lessons Section
            item {
                LessonsSection(
                    lessons = lessons,
                    progress = progress,
                    isLearning = isLearning,
                    onLessonClick = { lessonId ->
                        navController.navigate(Screen.Lesson.createRoute(classId, lessonId))
                    }
                )
            }

            // Instructor Section
            item {
                InstructorSection(
                    name = classDetails?.creatorName ?: "",
                    email = classDetails?.creatorEmail ?: "",
                    credentials = classDetails?.creatorCredentials,
                    linkedinUrl = classDetails?.linkedinUrl,
                    portfolioUrl = classDetails?.portfolioUrl
                )
            }

            // Requirements Section
            classDetails?.requirements?.let { reqs ->
                item {
                    RequirementsSection(requirements = reqs)
                }
            }

            // Rating and Feedback Section
            item {
                RatingAndFeedbackSection(
                    rating = userRating,
                    onRateClick = { showRatingDialog = true },
                    onFeedbackClick = { showFeedbackDialog = true }
                )
            }

            // Add extra padding at the bottom to account for FAB
            item {
                Spacer(modifier = Modifier.height(80.dp))
            }
        }
    }

    // Rating Dialog
    if (showRatingDialog) {
        RatingDialog(
            currentRating = userRating,
            onDismiss = { showRatingDialog = false },
            onSubmit = { rating ->
                viewModel.submitRating(rating)
                showRatingDialog = false
            }
        )
    }

    // Feedback Dialog
    if (showFeedbackDialog) {
        FeedbackDialog(
            onDismiss = { showFeedbackDialog = false },
            onSubmit = { content, rating ->
                viewModel.submitFeedback(content, rating)
                showFeedbackDialog = false
            }
        )
    }
}

@Composable
fun StatItem(
    icon: ImageVector,
    value: String,
    label: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color.White,
            modifier = Modifier.size(24.dp)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.7f)
        )
    }
}

@Composable
fun QuickStatsSection(
    enrolledCount: Int,
    lessonsCount: Int,
    duration: String,
    difficulty: String
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatCard(
                icon = Icons.Default.Person,
                value = enrolledCount.toString(),
                label = "Students",
                color = MaterialTheme.colorScheme.primary
            )
            StatCard(
                icon = Icons.Default.PlayArrow,
                value = lessonsCount.toString(),
                label = "Lessons",
                color = MaterialTheme.colorScheme.secondary
            )
            StatCard(
                icon = Icons.Default.PlayArrow,
                value = duration,
                label = "Duration",
                color = MaterialTheme.colorScheme.tertiary
            )
            StatCard(
                icon = Icons.Default.KeyboardArrowUp,
                value = difficulty,
                label = "Level",
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}

@Composable
fun StatCard(
    icon: ImageVector,
    value: String,
    label: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )
    }
}

@Composable
fun LessonsSection(
    lessons: List<LessonResponse>,
    progress: List<LessonProgress>,
    isLearning: Boolean,
    onLessonClick: (Long) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Class Content",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${progress.count { it.completed }} of ${lessons.size} completed",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            lessons.forEachIndexed { index, lesson ->
                val isCompleted = progress.any { it.lessonId == lesson.id && it.completed }
                val isUnlocked = isLearning && (index == 0 || progress.any {
                    it.lessonId == lessons[index - 1].id && it.completed
                })

                LessonItem(
                    lesson = lesson,
                    isCompleted = isCompleted,
                    isUnlocked = isUnlocked,
                    onClick = { onLessonClick(lesson.id) }
                )

                if (index < lessons.size - 1) {
                    Divider(
                        modifier = Modifier.padding(vertical = 8.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun LessonItem(
    lesson: LessonResponse,
    isCompleted: Boolean,
    isUnlocked: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable(enabled = isUnlocked, onClick = onClick)
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isCompleted -> MaterialTheme.colorScheme.primary
                        isUnlocked -> MaterialTheme.colorScheme.secondary
                        else -> MaterialTheme.colorScheme.surfaceVariant
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = when {
                    isCompleted -> Icons.Default.CheckCircle
                    isUnlocked -> Icons.Default.PlayArrow
                    else -> Icons.Default.Lock
                },
                contentDescription = null,
                tint = Color.White
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = lesson.title,
                style = MaterialTheme.typography.titleMedium,
                color = if (isUnlocked) {
                    MaterialTheme.colorScheme.onSurface
                } else {
                    MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                }
            )
            Text(
                text = lesson.description,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}

@Composable
fun InstructorSection(
    name: String,
    email: String,
    credentials: String?,
    linkedinUrl: String?,
    portfolioUrl: String?
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "About the Instructor",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Instructor Avatar
                Box(
                    modifier = Modifier
                        .size(72.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = name.firstOrNull()?.toString() ?: "I",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = name,
                        style = MaterialTheme.typography.titleLarge
                    )
                    Text(
                        text = email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            credentials?.let {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Credentials",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = it,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            if (!linkedinUrl.isNullOrEmpty() || !portfolioUrl.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Connect",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Row(
                    modifier = Modifier.padding(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    linkedinUrl?.let {
                        Button(
                            onClick = { /* Open LinkedIn URL */ },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0A66C2)
                            )
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_linkedin),
                                contentDescription = "LinkedIn"
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("LinkedIn")
                        }
                    }
                    portfolioUrl?.let {
                        Button(
                            onClick = { /* Open Portfolio URL */ }
                        ) {
                            Icon(Icons.Default.Info, contentDescription = "Portfolio")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Portfolio")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RequirementsSection(requirements: List<String>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Requirements",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            requirements.forEach { requirement ->
                Row(
                    modifier = Modifier.padding(vertical = 4.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = requirement,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }
}

@Composable
fun RatingAndFeedbackSection(
    rating: Double?,
    onRateClick: () -> Unit,
    onFeedbackClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Your Feedback",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Rate this class",
                        style = MaterialTheme.typography.titleMedium
                    )
                    if (rating != null) {
                        Row {
                            repeat(5) { index ->
                                Icon(
                                    imageVector = if (index < rating) {
                                        Icons.Default.Star
                                    } else {
                                        Icons.Default.Star
                                    },
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
                Button(onClick = onRateClick) {
                    Text(if (rating == null) "Rate Now" else "Update Rating")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onFeedbackClick,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Edit, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Share Your Experience")
            }
        }
    }
}


@Composable
fun RatingDialog(
    currentRating: Double?,
    onDismiss: () -> Unit,
    onSubmit: (Double) -> Unit
) {
    var rating by remember { mutableStateOf(currentRating ?: 0.0) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Rate this Class",
                style = MaterialTheme.typography.titleLarge
            )
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row {
                    repeat(5) { index ->
                        IconButton(
                            onClick = { rating = (index + 1).toDouble() }
                        ) {
                            Icon(
                                imageVector = if (index < rating) {
                                    Icons.Default.Star
                                } else {
                                    Icons.Default.Star
                                },
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
                Text(
                    text = when {
                        rating >= 4.0 -> "Excellent!"
                        rating >= 3.0 -> "Good"
                        rating >= 2.0 -> "Fair"
                        rating >= 1.0 -> "Poor"
                        else -> "Rate this class"
                    },
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(rating) },
                enabled = rating > 0
            ) {
                Text("Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun FeedbackDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, Int) -> Unit
) {
    var feedback by remember { mutableStateOf("") }
    var rating by remember { mutableStateOf(0) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Share Your Experience",
                style = MaterialTheme.typography.titleLarge
            )
        },
        text = {
            Column {
                // Rating Stars
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.Center
                ) {
                    repeat(5) { index ->
                        IconButton(
                            onClick = { rating = index + 1 }
                        ) {
                            Icon(
                                imageVector = if (index < rating) {
                                    Icons.Default.Star
                                } else {
                                    Icons.Default.Star
                                },
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }

                // Feedback Text Field
                OutlinedTextField(
                    value = feedback,
                    onValueChange = { feedback = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    label = { Text("Your feedback") },
                    placeholder = { Text("Share your thoughts about this class...") },
                    textStyle = MaterialTheme.typography.bodyLarge,
                    shape = RoundedCornerShape(8.dp)
                )

                // Character count
                Text(
                    text = "${feedback.length}/500",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier
                        .align(Alignment.End)
                        .padding(top = 4.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(feedback, rating) },
                enabled = feedback.isNotBlank() && rating > 0
            ) {
                Text("Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun RatingBar(
    rating: Double,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        repeat(5) { index ->
            val starProgress = rating - index
            when {
                starProgress >= 1 -> FullStar()
                starProgress > 0 -> HalfStar()
                else -> EmptyStar()
            }
        }
    }
}

@Composable
private fun FullStar() {
    Icon(
        imageVector = Icons.Default.Star,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.primary
    )
}

@Composable
private fun HalfStar() {
    Icon(
        imageVector = Icons.Default.Star,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.primary
    )
}

@Composable
private fun EmptyStar() {
    Icon(
        imageVector = Icons.Default.Star,
        contentDescription = null,
        tint = MaterialTheme.colorScheme.primary
    )
}

