package com.example.neighbornet

import androidx.compose.animation.animateColor
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import kotlin.math.min

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

    // Parallax effect values
    val scrollState = remember { mutableFloatStateOf(0f) }
    val parallaxOffset = remember { mutableFloatStateOf(0f) }

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
                    modifier = Modifier
                        .padding(bottom = 16.dp)
                        .shadow(8.dp, RoundedCornerShape(24.dp), spotColor = MaterialTheme.colorScheme.primary.copy(0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Begin Your Journey",
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        },
        floatingActionButtonPosition = FabPosition.End,
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                modifier = Modifier.padding(16.dp)
            ) { snackbarData ->
                Snackbar(
                    containerColor = MaterialTheme.colorScheme.primaryContainer,
                    contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                    snackbarData = snackbarData,
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            item {
                // Enhanced Hero Section with Parallax Effect
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(450.dp)
                ) {
                    // Background Image with Parallax Effect
                    AsyncImage(
                        model = classDetails?.let { UrlUtils.getFullThumbnailUrl(it.thumbnailUrl) },
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxSize()
                            .graphicsLayer {
                                translationY = parallaxOffset.floatValue * 0.5f
                            },
                        contentScale = ContentScale.Crop
                    )

                    // Enhanced Gradient Overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        Color.Black.copy(alpha = 0.3f),
                                        Color.Black.copy(alpha = 0.8f)
                                    ),
                                    startY = 0f,
                                    endY = 900f
                                )
                            )
                    )

                    // Floating Card Overlay at the bottom
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp)
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp))
                            .background(Color.White.copy(alpha = 0.15f))
                            .blur(1.dp)
                    ) {
                        // This is just for the blur effect background
                    }

                    // Back Button with improved visibility
                    IconButton(
                        onClick = onBackClick,
                        modifier = Modifier
                            .padding(16.dp)
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.background.copy(alpha = 0.8f))
                            .border(1.dp, Color.White.copy(0.3f), CircleShape)
                            .shadow(4.dp, CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onBackground,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    // Content with improved typography
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(horizontal = 24.dp, vertical = 32.dp)
                    ) {
                        Text(
                            text = classDetails?.title ?: "",
                            style = MaterialTheme.typography.headlineLarge.copy(
                                fontWeight = FontWeight.ExtraBold,
                                letterSpacing = (-0.5).sp
                            ),
                            color = Color.White,
                            modifier = Modifier.graphicsLayer {
                                shadowElevation = 10f
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = classDetails?.description ?: "",
                            style = MaterialTheme.typography.bodyLarge.copy(
                                lineHeight = 22.sp
                            ),
                            color = Color.White.copy(alpha = 0.9f),
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.graphicsLayer {
                                shadowElevation = 4f
                            }
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Enhanced Stats Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            StatItem(
                                icon = Icons.Outlined.Person,
                                value = "${classDetails?.enrolledCount ?: 0}",
                                label = "Students"
                            )
                            StatItem(
                                icon = Icons.Outlined.Timer,
                                value = classDetails?.duration ?: "",
                                label = "Duration"
                            )
                            StatItem(
                                icon = Icons.Outlined.StarOutline,
                                value = String.format("%.1f", classDetails?.averageRating ?: 0.0),
                                label = "${classDetails?.ratingCount ?: 0} ratings"
                            )
                        }
                    }
                }
            }

            // Quick Stats Cards with improved visual appeal
            item {
                QuickStatsSection(
                    enrolledCount = classDetails?.enrolledCount ?: 0,
                    lessonsCount = lessons.size,
                    duration = classDetails?.duration ?: "",
                    difficulty = classDetails?.difficulty?.name ?: ""
                )
            }

            // Enhanced Lessons Section
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

            // Enhanced Instructor Section
            item {
                InstructorSection(
                    name = classDetails?.creatorName ?: "",
                    email = classDetails?.creatorEmail ?: "",
                    credentials = classDetails?.creatorCredentials,
                    linkedinUrl = classDetails?.linkedinUrl,
                    portfolioUrl = classDetails?.portfolioUrl
                )
            }

            // Enhanced Requirements Section
            classDetails?.requirements?.let { reqs ->
                item {
                    RequirementsSection(requirements = reqs)
                }
            }

            // Enhanced Rating and Feedback Section
            item {
                RatingAndFeedbackSection(
                    rating = userRating,
                    onRateClick = { showRatingDialog = true },
                    onFeedbackClick = { showFeedbackDialog = true }
                )
            }

            // Add extra padding at the bottom to account for FAB
            item {
                Spacer(modifier = Modifier.height(90.dp))
            }
        }
    }

    // Enhanced Rating Dialog
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

    // Enhanced Feedback Dialog
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
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Color.White.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            color = Color.White,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color.White.copy(alpha = 0.8f)
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
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatCard(
                icon = Icons.Outlined.Person,
                value = enrolledCount.toString(),
                label = "Students",
                color = MaterialTheme.colorScheme.primary,
                animationDelay = 100
            )
            StatCard(
                icon = Icons.Outlined.MenuBook,
                value = lessonsCount.toString(),
                label = "Lessons",
                color = MaterialTheme.colorScheme.secondary,
                animationDelay = 200
            )
            StatCard(
                icon = Icons.Outlined.Timer,
                value = duration,
                label = "Duration",
                color = MaterialTheme.colorScheme.tertiary,
                animationDelay = 300
            )
            StatCard(
                icon = Icons.Outlined.Equalizer,
                value = difficulty,
                label = "Level",
                color = getDifficultyColor(difficulty),
                animationDelay = 400
            )
        }
    }
}

fun getDifficultyColor(difficulty: String): Color {
    return when (difficulty.lowercase()) {
        "beginner" -> Color(0xFF4CAF50)
        "intermediate" -> Color(0xFFFFA000)
        "advanced" -> Color(0xFFE53935)
        else -> Color(0xFF7E57C2)
    }
}

@Composable
fun StatCard(
    icon: ImageVector,
    value: String,
    label: String,
    color: Color,
    animationDelay: Int = 0
) {
    val infiniteTransition = rememberInfiniteTransition(label = "stat_card_animation")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, delayMillis = animationDelay),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale_animation"
    )

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.graphicsLayer(scaleX = scale, scaleY = scale)
    ) {
        Box(
            modifier = Modifier
                .size(52.dp)
                .clip(CircleShape)
                .background(color.copy(alpha = 0.15f))
                .border(1.5.dp, color.copy(alpha = 0.3f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(26.dp)
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
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
            .padding(16.dp)
            .shadow(
                elevation = 10.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
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

                // Progress indicator
                val completedCount = progress.count { it.completed }
                val progressPercentage = if (lessons.isNotEmpty()) {
                    (completedCount.toFloat() / lessons.size) * 100
                } else 0f

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    LinearProgressIndicator(
                        progress = progressPercentage / 100f,
                        modifier = Modifier
                            .width(60.dp)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "$completedCount of ${lessons.size}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            lessons.forEachIndexed { index, lesson ->
                val isCompleted = progress.any { it.lessonId == lesson.id && it.completed }
                val isUnlocked = isLearning && (index == 0 || progress.any {
                    it.lessonId == lessons[index - 1].id && it.completed
                })

                LessonItem(
                    lesson = lesson,
                    isCompleted = isCompleted,
                    isUnlocked = isUnlocked,
                    onClick = { onLessonClick(lesson.id) },
                    index = index + 1
                )

                if (index < lessons.size - 1) {
                    Box(
                        modifier = Modifier
                            .padding(vertical = 12.dp)
                            .height(1.dp)
                            .fillMaxWidth()
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f),
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f),
                                        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                                    )
                                )
                            )
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
    onClick: () -> Unit,
    index: Int
) {
    var isHovered by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(
                when {
                    isHovered && isUnlocked -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    isCompleted -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.15f)
                    else -> Color.Transparent
                }
            )
            .clickable(enabled = isUnlocked) {
                onClick()
                isHovered = false
            }
            .padding(12.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Lesson number with status indicator
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(
                        when {
                            isCompleted -> MaterialTheme.colorScheme.primary
                            isUnlocked -> MaterialTheme.colorScheme.secondary
                            else -> MaterialTheme.colorScheme.surfaceVariant
                        }
                    )
                    .shadow(
                        elevation = if (isUnlocked) 4.dp else 0.dp,
                        shape = CircleShape,
                        spotColor = when {
                            isCompleted -> MaterialTheme.colorScheme.primary
                            isUnlocked -> MaterialTheme.colorScheme.secondary
                            else -> Color.Transparent
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                when {
                    isCompleted -> Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Completed",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                    isUnlocked -> Text(
                        text = index.toString(),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                    )
                    else -> Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = index.toString(),
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        )
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "Locked",
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = lesson.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = if (isUnlocked) FontWeight.SemiBold else FontWeight.Normal
                    ),
                    color = if (isUnlocked) {
                        MaterialTheme.colorScheme.onSurface
                    } else {
                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    }
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = lesson.description,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            if (isUnlocked) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(
                            if (isCompleted)
                                MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                            else
                                MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isCompleted) Icons.Default.CheckCircle else Icons.Default.PlayArrow,
                        contentDescription = if (isCompleted) "Completed" else "Start lesson",
                        tint = if (isCompleted) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
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
            .padding(16.dp)
            .shadow(
                elevation = 10.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = "About the Instructor",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Animated instructor avatar
                val infiniteTransition = rememberInfiniteTransition(label = "avatar_animation")
                val animatedColor by infiniteTransition.animateColor(
                    initialValue = MaterialTheme.colorScheme.primary,
                    targetValue = MaterialTheme.colorScheme.tertiary,
                    animationSpec = infiniteRepeatable(
                        animation = tween(3000),
                        repeatMode = RepeatMode.Reverse
                    ),
                    label = "avatar_color"
                )

                // Enhanced instructor avatar
                Box(
                    modifier = Modifier
                        .size(84.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    animatedColor,
                                    animatedColor.copy(alpha = 0.7f)
                                )
                            )
                        )
                        .border(2.dp, Color.White, CircleShape)
                        .shadow(8.dp, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = name.firstOrNull()?.toString() ?: "I",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Bold
                        ),
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.width(20.dp))

                Column {
                    Text(
                        text = name,
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Email,
                            contentDescription = "Email",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = email,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            credentials?.let {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Credentials",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(16.dp),
                        lineHeight = 24.sp
                    )
                }
            }

            if (!linkedinUrl.isNullOrEmpty() || !portfolioUrl.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Connect",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Row(
                    modifier = Modifier
                        .padding(top = 12.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    linkedinUrl?.let {
                        Button(
                            onClick = { /* Open LinkedIn URL */ },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF0A66C2)
                            ),
                            shape = RoundedCornerShape(12.dp),
                            elevation = ButtonDefaults.buttonElevation(6.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_linkedin),
                                contentDescription = "LinkedIn",
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "LinkedIn",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                    portfolioUrl?.let {
                        Button(
                            onClick = { /* Open Portfolio URL */ },
                            shape = RoundedCornerShape(12.dp),
                            elevation = ButtonDefaults.buttonElevation(6.dp)
                        ) {
                            Icon(
                                Icons.Default.Language,
                                contentDescription = "Portfolio",
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Portfolio",
                                fontWeight = FontWeight.SemiBold
                            )
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
            .padding(16.dp)
            .shadow(
                elevation = 10.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Outlined.ChecklistRtl,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Requirements",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    requirements.forEachIndexed { index, requirement ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = requirement,
                                style = MaterialTheme.typography.bodyMedium,
                                lineHeight = 24.sp
                            )
                        }

                        if (index < requirements.size - 1) {
                            Spacer(modifier = Modifier.height(4.dp))
                        }
                    }
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
    val ratingColor = when {
        rating == null -> MaterialTheme.colorScheme.outline
        rating >= 4.0 -> Color(0xFF4CAF50)
        rating >= 3.0 -> Color(0xFFFFA000)
        else -> Color(0xFFE53935)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .shadow(
                elevation = 10.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(24.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Outlined.RateReview,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Your Feedback",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)
                ),
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
                        Column {
                            Text(
                                text = "Rate this class",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            if (rating != null) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    RatingBar(rating = rating, ratingColor = ratingColor)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = String.format("%.1f", rating),
                                        style = MaterialTheme.typography.titleMedium,
                                        color = ratingColor,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            } else {
                                Text(
                                    "Not rated yet",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.outline
                                )
                            }
                        }
                        Button(
                            onClick = onRateClick,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (rating == null)
                                    MaterialTheme.colorScheme.primary
                                else
                                    ratingColor
                            )
                        ) {
                            Icon(
                                imageVector = if (rating == null)
                                    Icons.Default.Star
                                else
                                    Icons.Default.Edit,
                                contentDescription = null
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                if (rating == null) "Rate Now" else "Update",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onFeedbackClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 6.dp,
                    pressedElevation = 2.dp
                ),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    contentColor = MaterialTheme.colorScheme.onSecondaryContainer
                )
            ) {
                Icon(Icons.Outlined.Comment, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    "Share Your Experience",
                    fontWeight = FontWeight.Bold
                )
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
    val starSize = 36.dp

    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(24.dp),
        containerColor = MaterialTheme.colorScheme.surface,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Rate this Class",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Animated stars row with hover effect
                Row(
                    modifier = Modifier
                        .padding(vertical = 16.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    repeat(5) { index ->
                        val isSelected = index < rating
                        val isHovered = index < rating

                        val scale = animateFloatAsState(
                            targetValue = if (isHovered) 1.2f else 1f,
                            label = "star_scale"
                        )

                        Box(
                            modifier = Modifier
                                .size(starSize)
                                .graphicsLayer(scaleX = scale.value, scaleY = scale.value)
                                .clickable { rating = (index + 1).toDouble() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isSelected)
                                    Icons.Default.Star
                                else
                                    Icons.Outlined.StarOutline,
                                contentDescription = null,
                                tint = if (isSelected)
                                    MaterialTheme.colorScheme.primary
                                else
                                    MaterialTheme.colorScheme.outline,
                                modifier = Modifier.size(starSize)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = when {
                        rating >= 4.0 -> "Excellent!"
                        rating >= 3.0 -> "Good"
                        rating >= 2.0 -> "Fair"
                        rating >= 1.0 -> "Poor"
                        else -> "Rate this class"
                    },
                    style = MaterialTheme.typography.titleMedium,
                    textAlign = TextAlign.Center,
                    fontWeight = FontWeight.Bold,
                    color = when {
                        rating >= 4.0 -> Color(0xFF4CAF50)
                        rating >= 3.0 -> Color(0xFFFFA000)
                        rating >= 2.0 -> Color(0xFFFF9800)
                        rating >= 1.0 -> Color(0xFFE53935)
                        else -> MaterialTheme.colorScheme.onSurface
                    }
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(rating) },
                enabled = rating > 0,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Submit Rating", fontWeight = FontWeight.Bold)
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
        shape = RoundedCornerShape(24.dp),
        containerColor = MaterialTheme.colorScheme.surface,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Outlined.Comment,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "Share Your Experience",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            }
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
                        val isSelected = index < rating
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clickable { rating = index + 1 },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isSelected)
                                    Icons.Filled.Star
                                else
                                    Icons.Outlined.StarOutline,
                                contentDescription = null,
                                tint = if (isSelected)
                                    MaterialTheme.colorScheme.primary
                                else
                                    MaterialTheme.colorScheme.outline,
                                modifier = Modifier.size(28.dp)
                            )
                        }
                    }
                }

                // Feedback Text Field with enhanced styling
                OutlinedTextField(
                    value = feedback,
                    onValueChange = { feedback = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    label = {
                        Text("Your feedback")
                    },
                    placeholder = {
                        Text("Share what you loved about this class or what could be improved...")
                    },
                    textStyle = MaterialTheme.typography.bodyLarge,
                    shape = RoundedCornerShape(16.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                        focusedContainerColor = MaterialTheme.colorScheme.surface,
                        unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
                    )
                )

                // Character count with animated progress
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    contentAlignment = Alignment.CenterEnd
                ) {
                    val progress = feedback.length / 500f
                    val progressColor = when {
                        progress > 0.9f -> MaterialTheme.colorScheme.error
                        progress > 0.7f -> MaterialTheme.colorScheme.tertiary
                        else -> MaterialTheme.colorScheme.primary
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        LinearProgressIndicator(
                            progress = progress,
                            modifier = Modifier
                                .width(60.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            color = progressColor,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "${feedback.length}/500",
                            style = MaterialTheme.typography.bodySmall,
                            color = progressColor
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSubmit(feedback, rating) },
                enabled = feedback.isNotBlank() && rating > 0,
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Submit Feedback", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun RatingBar(
    rating: Double,
    modifier: Modifier = Modifier,
    ratingColor: Color = MaterialTheme.colorScheme.primary
) {
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        repeat(5) { index ->
            val starProgress = rating - index
            when {
                starProgress >= 1 -> FullStar(ratingColor)
                starProgress > 0 -> HalfStar(starProgress, ratingColor)
                else -> EmptyStar(ratingColor)
            }
        }
    }
}

@Composable
private fun FullStar(color: Color = MaterialTheme.colorScheme.primary) {
    Icon(
        imageVector = Icons.Filled.Star,
        contentDescription = null,
        tint = color,
        modifier = Modifier.size(20.dp)
    )
}

@Composable
private fun HalfStar(progress: Double, color: Color = MaterialTheme.colorScheme.primary) {
    Box(contentAlignment = Alignment.Center) {
        Icon(
            imageVector = Icons.Outlined.StarOutline,
            contentDescription = null,
            tint = color.copy(alpha = 0.3f),
            modifier = Modifier.size(20.dp)
        )

        // Creating a half-filled star effect
        Box(
            modifier = Modifier
                .size(20.dp)
                .clip(
                    GenericShape { size, _ ->
                        val width = size.width
                        val height = size.height
                        moveTo(0f, 0f)
                        lineTo(width * progress.toFloat(), 0f)
                        lineTo(width * progress.toFloat(), height)
                        lineTo(0f, height)
                        close()
                    }
                )
        ) {
            Icon(
                imageVector = Icons.Filled.Star,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun EmptyStar(color: Color = MaterialTheme.colorScheme.primary) {
    Icon(
        imageVector = Icons.Outlined.StarOutline,
        contentDescription = null,
        tint = color.copy(alpha = 0.3f),
        modifier = Modifier.size(20.dp)
    )
}