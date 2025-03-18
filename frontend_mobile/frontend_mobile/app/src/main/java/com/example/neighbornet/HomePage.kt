package com.example.neighbornet

import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.updateTransition
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.ui.graphics.BlendMode
import com.valentinilk.shimmer.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.auth.ClassListViewModel
import kotlinx.coroutines.launch
import com.example.neighbornet.network.Class
import com.example.neighbornet.network.CategoryData
import com.example.neighbornet.network.CategoryInfo
import com.example.neighbornet.utils.UrlUtils
import kotlinx.coroutines.delay


@Composable
fun HomePage(
    navController: NavHostController
) {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedCategory by remember { mutableStateOf<String?>(null) }

    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(
            MaterialTheme.colorScheme.background,
            MaterialTheme.colorScheme.background.copy(alpha = 0.95f),
            MaterialTheme.colorScheme.surface
        )
    )

    Scaffold(
        containerColor = Color.Transparent,
        bottomBar = {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp),
                shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                tonalElevation = 8.dp,
                shadowElevation = 16.dp,
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                                    MaterialTheme.colorScheme.surface
                                )
                            )
                        )
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                brush = Brush.radialGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primary.copy(alpha = 0.05f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )

                    NavigationBar(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        containerColor = Color.Transparent,
                        tonalElevation = 0.dp
                    ) {
                        val items = listOf(
                            Triple(R.drawable.ic_home, "Home", 0),
                            Triple(R.drawable.ic_category, "Categories", 1),
                            Triple(R.drawable.ic_chat, "Chat", 2),
                            Triple(R.drawable.ic_profile, "Profile", 3)
                        )

                        items.forEach { (icon, label, index) ->
                            val isSelected = selectedTab == index
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = { selectedTab = index },
                                icon = {
                                    Box(
                                        modifier = Modifier
                                            .size(if (isSelected) 48.dp else 42.dp)
                                            .background(
                                                color = if (isSelected) {
                                                    MaterialTheme.colorScheme.primaryContainer
                                                } else {
                                                    MaterialTheme.colorScheme.surface
                                                },
                                                shape = CircleShape
                                            )
                                            .border(
                                                width = if (isSelected) 2.dp else 1.dp,
                                                brush = if (isSelected) {
                                                    Brush.sweepGradient(
                                                        listOf(
                                                            MaterialTheme.colorScheme.primary,
                                                            MaterialTheme.colorScheme.tertiary,
                                                            MaterialTheme.colorScheme.primary
                                                        )
                                                    )
                                                } else {
                                                    Brush.sweepGradient(
                                                        listOf(
                                                            MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                                                            MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                                                        )
                                                    )
                                                },
                                                shape = CircleShape
                                            ),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            painter = painterResource(id = icon),
                                            contentDescription = label,
                                            modifier = Modifier.size(24.dp),
                                            tint = if (isSelected) {
                                                MaterialTheme.colorScheme.primary
                                            } else {
                                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundGradient)
                .padding(paddingValues)
        ) {
            BackgroundPatterns()

            AnimatedVisibility(
                visible = true,
                enter = fadeIn() + expandVertically(),
                modifier = Modifier.fillMaxSize()
            ) {
                when {
                    selectedCategory != null -> {
                        CategoryDetailScreen(
                            category = selectedCategory!!,
                            onBackClick = { selectedCategory = null }
                        )
                    }
                    else -> {
                        when (selectedTab) {
                            0 -> {
                                val viewModel = hiltViewModel<ClassListViewModel>(
                                    viewModelStoreOwner = LocalViewModelStoreOwner.current ?: return@AnimatedVisibility
                                )
                                HomeScreenContent(
                                    viewModel = viewModel,
                                    onClassClick = { classId ->
                                        navController.navigate(Screen.ClassDetails.createRoute(classId))
                                    }
                                )
                            }
                            1 -> CategoriesContent(
                                onCategoryClick = { category ->
                                    selectedCategory = category
                                }
                            )
                            2 -> ChatContent()
                            3 -> ProfileContent(onLogoutSuccess = {
                                selectedTab = 0
                            })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun BackgroundPatterns() {
    val primaryColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.05f)
    val tertiaryColor = MaterialTheme.colorScheme.tertiary.copy(alpha = 0.05f)

    Canvas(
        modifier = Modifier.fillMaxSize()
    ) {
        val canvasWidth = size.width
        val canvasHeight = size.height

        val primaryGradient = Brush.radialGradient(
            colors = listOf(
                primaryColor,
                Color.Transparent
            )
        )

        val tertiaryGradient = Brush.radialGradient(
            colors = listOf(
                tertiaryColor,
                Color.Transparent
            )
        )

        drawCircle(
            brush = primaryGradient,
            radius = canvasWidth * 0.8f,
            center = Offset(canvasWidth * 0.8f, -canvasHeight * 0.2f)
        )

        drawCircle(
            brush = tertiaryGradient,
            radius = canvasWidth * 0.6f,
            center = Offset(0f, canvasHeight)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreenContent(
    viewModel: ClassListViewModel,
    onClassClick: (Long) -> Unit
) {
    val classes by viewModel.classes.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val isLoading by viewModel.isLoading.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            SmallTopAppBar(
                title = { Text("Classes") },
                colors = TopAppBarDefaults.smallTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )

            // Categories
            CategoryRow(
                selectedCategory = selectedCategory,
                onCategorySelected = { viewModel.setCategory(it) }
            )

            // Classes List
            if (isLoading) {
                LoadingView()
            } else if (error != null) {
                ErrorView(error = error!!, onRetry = { viewModel.fetchClasses() })
            } else {
                ClassesList(
                    classes = classes.filter {
                        selectedCategory == "all" || it.category.lowercase() == selectedCategory
                    },
                    onClassClick = onClassClick
                )
            }
        }
    }
}

@Composable
fun CategoryRow(
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    val categories = listOf(
        CategoryData("all", R.drawable.ic_category),
        CategoryData("programming", R.drawable.ic_code),
        CategoryData("design", R.drawable.ic_design),
        CategoryData("business", R.drawable.ic_business),
        CategoryData("marketing", R.drawable.ic_marketing),
        CategoryData("photography", R.drawable.ic_camera),
        CategoryData("music", R.drawable.ic_music),
        CategoryData("writing", R.drawable.ic_edit)
    )

    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        items(categories) { category ->
            CategoryChip(
                category = category.name,
                iconResId = category.iconResId,
                isSelected = category.name == selectedCategory,
                onSelected = { onCategorySelected(category.name) }
            )
        }
    }
}

@Composable
fun ClassesList(
    classes: List<Class>,
    onClassClick: (Long) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(
            items = classes,
            key = { it.id }
        ) { classItem ->
            ClassCard(
                classItem = classItem,
                onClick = { onClassClick(classItem.id) }
            )
        }
    }
}

@Composable
fun ClassCard(
    classItem: Class,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp, vertical = 4.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp,
            pressedElevation = 8.dp,
            hoveredElevation = 4.dp
        ),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column {
            Box(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Thumbnail with gradient overlay
                AsyncImage(
                    model = UrlUtils.getFullThumbnailUrl(classItem.thumbnailUrl),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentScale = ContentScale.Crop,
                    error = rememberAsyncImagePainter(R.drawable.default_class_image)
                )

                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.7f)
                                ),
                                startY = 0f,
                                endY = Float.POSITIVE_INFINITY
                            )
                        )
                )

                // Category chip
                Surface(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.9f)
                ) {
                    Text(
                        text = classItem.category,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }

                // Duration chip
                Surface(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopEnd),
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.9f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_time),
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        Text(
                            text = classItem.duration,
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Title with animation
                Text(
                    text = classItem.title,
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold
                    ),
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Description with custom styling
                Text(
                    text = classItem.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Divider with gradient
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                                    MaterialTheme.colorScheme.tertiary.copy(alpha = 0.5f)
                                )
                            )
                        )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Enhanced Creator Info
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .border(
                                    width = 2.dp,
                                    brush = Brush.sweepGradient(
                                        listOf(
                                            MaterialTheme.colorScheme.primary,
                                            MaterialTheme.colorScheme.tertiary
                                        )
                                    ),
                                    shape = CircleShape
                                )
                        ) {
                            AsyncImage(
                                model = UrlUtils.getFullImageUrl(classItem.creatorImageUrl),
                                contentDescription = null,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clip(CircleShape),
                                error = rememberAsyncImagePainter(R.drawable.default_profile)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = classItem.creatorName,
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Instructor",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    // Sections indicator
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_sections),
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                            Text(
                                text = "${classItem.sectionsCount} sections",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CategoriesContent(
    onCategoryClick: (String) -> Unit
) {
    val categories = listOf(
        CategoryInfo(
            title = "All Classes",
            iconResId = R.drawable.ic_category,
            backgroundColor = Color(0xFFF3E5F5)
        ),
        CategoryInfo(
            title = "Programming",
            iconResId = R.drawable.ic_code,
            backgroundColor = Color(0xFFE3F2FD)
        ),
        CategoryInfo(
            title = "Design",
            iconResId = R.drawable.ic_design,
            backgroundColor = Color(0xFFE8F5E9)
        ),
        CategoryInfo(
            title = "Business",
            iconResId = R.drawable.ic_business,
            backgroundColor = Color(0xFFFFF3E0)
        ),
        CategoryInfo(
            title = "Marketing",
            iconResId = R.drawable.ic_marketing,
            backgroundColor = Color(0xFFFFEBEE)
        ),
        CategoryInfo(
            title = "Photography",
            iconResId = R.drawable.ic_camera,
            backgroundColor = Color(0xFFE0F7FA)
        ),
        CategoryInfo(
            title = "Music",
            iconResId = R.drawable.ic_music,
            backgroundColor = Color(0xFFF3E5F5)
        ),
        CategoryInfo(
            title = "Writing",
            iconResId = R.drawable.ic_edit,
            backgroundColor = Color(0xFFFCE4EC)
        )
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        categories.forEach { category ->
            CategoryItem(
                title = category.title,
                icon = category.iconResId,
                backgroundColor = category.backgroundColor,
                onClick = { onCategoryClick(category.title) }
            )
        }
    }
}

@Composable
fun LoadingView() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator()
    }
}

@Composable
fun ErrorView(
    error: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showRetryButton by remember { mutableStateOf(false) }
    var bounceState by remember { mutableStateOf(false) }

    // Animation for the error icon
    val bounceAnimation = updateTransition(bounceState, label = "bounce")
    val scale by bounceAnimation.animateFloat(
        transitionSpec = {
            spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        },
        label = "scale"
    ) { state ->
        if (state) 1.2f else 1f
    }

    // Launch bounce animation
    LaunchedEffect(Unit) {
        delay(300)
        showRetryButton = true
        while (true) {
            delay(2000)
            bounceState = true
            delay(200)
            bounceState = false
        }
    }

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .padding(24.dp)
                .animateContentSize()
        ) {
            // Error Icon with bounce animation
            Image(
                painter = painterResource(id = R.drawable.ic_error_robot),
                contentDescription = "Error Illustration",
                modifier = Modifier
                    .size(180.dp)
                    .scale(scale)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Error Message with typing animation
            Text(
                text = "Oops!",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.error
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = error,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 32.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Animated Retry Button
            AnimatedVisibility(
                visible = showRetryButton,
                enter = fadeIn() + expandVertically(),
                modifier = Modifier.padding(16.dp)
            ) {
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    ),
                    modifier = Modifier
                        .height(48.dp)
                        .animateContentSize()
                ) {
                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_refresh),
                            contentDescription = "Retry",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Let's Try Again",
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Medium
                            )
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ShimmerEffect() {
    val transition = rememberInfiniteTransition()
    val translateAnim by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1000f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = 1200,
                easing = FastOutSlowInEasing
            ),
            repeatMode = RepeatMode.Restart
        )
    )

    val shimmerColorShades = listOf(
        Color.LightGray.copy(0.9f),
        Color.LightGray.copy(0.2f),
        Color.LightGray.copy(0.9f)
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = shimmerColorShades,
                    start = Offset(translateAnim - 1000f, translateAnim - 1000f),
                    end = Offset(translateAnim, translateAnim)
                )
            )
    )
}


@Composable
fun CategoryChip(
    category: String,
    @DrawableRes iconResId: Int,
    isSelected: Boolean,
    onSelected: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        label = "scale"
    )

    val shimmerEffect = rememberShimmer(
        shimmerBounds = ShimmerBounds.Window,
        theme = shimmerTheme(isSelected)
    )

    Surface(
        modifier = Modifier
            .scale(scale)
            .shimmer(shimmerEffect)
            .clickable(
                interactionSource = interactionSource,
                indication = rememberRipple(bounded = true),
                onClick = onSelected
            )
            .graphicsLayer {
                clip = true
                shape = RoundedCornerShape(20.dp)
            },
        shape = RoundedCornerShape(20.dp),
        color = if (isSelected) {
            MaterialTheme.colorScheme.primaryContainer
        } else {
            MaterialTheme.colorScheme.surface
        },
        border = BorderStroke(
            width = 1.dp,
            brush = if (isSelected) {
                Brush.horizontalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.primary,
                        MaterialTheme.colorScheme.tertiary,
                        MaterialTheme.colorScheme.primary
                    ),
                    startX = 0f,
                    endX = 300f
                )
            } else {
                Brush.linearGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.outline,
                        MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                    )
                )
            }
        ),
        tonalElevation = if (isSelected) 4.dp else 0.dp,
        shadowElevation = if (isSelected) 8.dp else 0.dp
    ) {
        Row(
            modifier = Modifier
                .padding(horizontal = 16.dp, vertical = 10.dp)
                .background(
                    brush = if (isSelected) {
                        Brush.horizontalGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primaryContainer,
                                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.8f),
                                MaterialTheme.colorScheme.primaryContainer
                            )
                        )
                    } else {
                        Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.surface,
                                MaterialTheme.colorScheme.surface
                            )
                        )
                    }
                ),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Animated icon container
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(
                        color = if (isSelected) {
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        } else {
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f)
                        },
                        shape = CircleShape
                    )
                    .border(
                        width = 1.dp,
                        brush = if (isSelected) {
                            Brush.sweepGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.0f)
                                )
                            )
                        } else {
                            Brush.sweepGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                                    MaterialTheme.colorScheme.outline.copy(alpha = 0.0f)
                                )
                            )
                        },
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconResId),
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = if (isSelected) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
            }

            Text(
                text = category.replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                    letterSpacing = 0.5.sp,
                    shadow = if (isSelected) {
                        Shadow(
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                            offset = Offset(0f, 2f),
                            blurRadius = 4f
                        )
                    } else null
                ),
                color = if (isSelected) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurface
                }
            )
        }
    }
}

private fun shimmerTheme(isSelected: Boolean) = ShimmerTheme(
    animationSpec = infiniteRepeatable(
        animation = tween(
            durationMillis = 1000,
            delayMillis = 300,
            easing = LinearEasing
        ),
        repeatMode = RepeatMode.Restart
    ),
    rotation = 25f,
    shaderColors = if (isSelected) {
        listOf(
            Color.White.copy(0.0f),
            Color.White.copy(0.2f),
            Color.White.copy(0.0f)
        )
    } else {
        listOf(
            Color.White.copy(0.0f),
            Color.White.copy(0.05f),
            Color.White.copy(0.0f)
        )
    },
    shaderColorStops = listOf(0.0f, 0.5f, 1.0f),
    shimmerWidth = 400.dp,
    blendMode = BlendMode.Hardlight
)

@Composable
fun CategoryItem(
    title: String,
    icon: Int,
    backgroundColor: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = icon),
                contentDescription = title,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
fun CategoryDetailScreen(
    category: String,
    onBackClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Back button
        IconButton(
            onClick = onBackClick,
            modifier = Modifier.padding(bottom = 16.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_arrow_back),
                contentDescription = "Back"
            )
        }

        // Category title
        Text(
            text = category,
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Placeholder text
        Text(
            text = "Coming soon...",
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )
    }
}

@Composable
fun ChatContent() {
    // TODO: Implement chat content
}

@Composable
fun ProfileContent(
    authViewModel: AuthViewModel = hiltViewModel(),
    onLogoutSuccess: () -> Unit
) {
    val authState by authViewModel.authState.collectAsState()
    val scope = rememberCoroutineScope()

    // Handle logout success
    LaunchedEffect(authState.isLoggedIn) {
        if (!authState.isLoggedIn) {
            onLogoutSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Profile header
        Text(
            text = "Profile",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        // User info (placeholder)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Profile picture placeholder
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = "Profile Picture",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(50.dp)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = authState.username ?: "User Name",
                    style = MaterialTheme.typography.titleLarge
                )

                authState.userId?.let { userId ->
                    Text(
                        text = "ID: $userId",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }

                Text(
                    text =  "user@email.com", // Replace with actual email
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        var showLogoutConfirmation by remember { mutableStateOf(false) }

        if (showLogoutConfirmation) {
            AlertDialog(
                onDismissRequest = { showLogoutConfirmation = false },
                title = { Text("Confirm Logout") },
                text = { Text("Are you sure you want to logout?") },
                confirmButton = {
                    Button(
                        onClick = {
                            scope.launch {
                                authViewModel.logout()
                            }
                            showLogoutConfirmation = false
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Logout")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showLogoutConfirmation = false }) {
                        Text("Cancel")
                    }
                }
            )
        }

        // Logout button
        Button(
            onClick = { showLogoutConfirmation = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error
            )
        ) {
            if (authState.isLoading) {
                CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(24.dp)
                )
            } else {
                Text("Logout")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun HomePagePreview() {
    MaterialTheme {
        HomePage(navController = rememberNavController())
    }
}

@Preview(showBackground = true)
@Composable
fun ClassCardPreview() {
    MaterialTheme {
        ClassCard(
            classItem = Class(
                id = 1L,
                title = "Introduction to Kotlin Programming",
                description = "Learn the basics of Kotlin programming language with hands-on examples and projects.",
                category = "Programming",
                duration = "8 hours",
                thumbnailUrl = "",
                creatorName = "John Doe",
                creatorImageUrl = "",
                sectionsCount = 12
            ),
            onClick = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun CategoryChipPreview() {
    MaterialTheme {
        Row(
            modifier = Modifier.padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            CategoryChip(
                category = "programming",
                iconResId = R.drawable.ic_code,
                isSelected = true,
                onSelected = {}
            )
            CategoryChip(
                category = "design",
                iconResId = R.drawable.ic_design,
                isSelected = false,
                onSelected = {}
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun CategoryItemPreview() {
    MaterialTheme {
        CategoryItem(
            title = "Programming",
            icon = R.drawable.ic_code,
            backgroundColor = Color(0xFFE3F2FD),
            onClick = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ErrorViewPreview() {
    MaterialTheme {
        ErrorView(
            error = "Something went wrong!",
            onRetry = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ProfileContentPreview() {
    MaterialTheme {
        ProfileContent(
            onLogoutSuccess = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun CategoryRowPreview() {
    MaterialTheme {
        CategoryRow(
            selectedCategory = "programming",
            onCategorySelected = {}
        )
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun CategoriesContentPreview() {
    MaterialTheme {
        CategoriesContent(
            onCategoryClick = {}
        )
    }
}