package com.example.neighbornet

import android.app.Activity
import android.net.Uri
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Close
import kotlin.math.*
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.NavHostController
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.auth.ChatViewModel
import com.example.neighbornet.auth.ClassListViewModel
import com.example.neighbornet.auth.ProfileViewModel
import com.example.neighbornet.auth.TokenManager
import com.example.neighbornet.network.Achievement
import kotlinx.coroutines.launch
import com.example.neighbornet.network.Class
import com.example.neighbornet.network.CategoryData
import com.example.neighbornet.network.CategoryInfo
import com.example.neighbornet.network.ClassItem
import com.example.neighbornet.network.FollowData
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.MessageType
import com.example.neighbornet.network.ProfileData
import com.example.neighbornet.network.ProfileTab
import com.example.neighbornet.network.Skill
import com.example.neighbornet.network.UserActivity
import com.example.neighbornet.network.UserStats
import com.example.neighbornet.ui.screens.MapScreen
import com.example.neighbornet.utils.AgreementMessage
import com.example.neighbornet.utils.Avatar
import com.example.neighbornet.utils.BorrowingAgreementDialog
import com.example.neighbornet.utils.BorrowingScreen
import com.example.neighbornet.utils.ChatInputArea
import com.example.neighbornet.utils.ChatListScreen
import com.example.neighbornet.utils.DateTimeUtils
import com.example.neighbornet.utils.ImageMessage
import com.example.neighbornet.utils.TextMessage
import com.example.neighbornet.utils.ReturnRequestMessage
import com.example.neighbornet.utils.UrlUtils
import com.example.neighbornet.utils.formatToTime
import com.example.neighbornet.utils.toLocalDate
import kotlinx.coroutines.delay
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID


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
                            Triple(R.drawable.ic_borrowing, "Borrowing", 2),
                            Triple(R.drawable.ic_chat, "Chat", 3),
                            Triple(R.drawable.ic_profile, "Profile", 4)
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
                                },
                                onNavigateToChat = { userId, userName ->
                                    navController.navigate("chat/$userId/$userName")
                                }
                            )
                            2 -> {
                                BorrowingScreen(
                                    onNavigateBack = { selectedTab = 0 },
                                    onNavigateToAddItem = {
                                        navController.navigate(Screen.AddItem.route)
                                    },
                                    onNavigateToItemDetails = { itemId ->
                                        navController.navigate(Screen.ItemDetails.createRoute(itemId))
                                    },
                                    onNavigateToChat = { userId, username ->
                                        navController.navigate(Screen.ChatDetail.createRoute(userId, username))
                                    }
                                )
                            }
                            3 -> {
                                val chatViewModel = hiltViewModel<ChatViewModel>()
                                val currentUser by chatViewModel.currentUser.collectAsState()
                                val currentUserId by chatViewModel.currentUserId.collectAsState()
                                val messages by chatViewModel.messages.collectAsState()
                                val isConnected by chatViewModel.isConnected.collectAsState()

                                var selectedChat by remember { mutableStateOf<Pair<Long, String>?>(null) }

                                when {
                                    currentUser == null -> {
                                        Box(
                                            modifier = Modifier.fillMaxSize(),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Column(
                                                horizontalAlignment = Alignment.CenterHorizontally,
                                                verticalArrangement = Arrangement.spacedBy(16.dp)
                                            ) {
                                                Text(
                                                    text = "Please log in to use chat",
                                                    style = MaterialTheme.typography.titleMedium
                                                )
                                                Button(
                                                    onClick = { navController.navigate("login") }
                                                ) {
                                                    Text("Login")
                                                }
                                            }
                                        }
                                    }
                                    selectedChat == null -> {
                                        ChatListScreen(
                                            onChatSelected = { userId, userName ->
                                                selectedChat = Pair(userId, userName)
                                                currentUserId?.let { senderId ->
                                                    chatViewModel.connectWebSocket(senderId, userId)
                                                }
                                            }
                                        )
                                    }
                                    else -> {
                                        val (receiverId, receiverName) = selectedChat!!
                                        currentUserId?.let { senderId ->
                                            ChatContent(
                                                senderId = senderId,
                                                receiverId = receiverId,
                                                receiverName = receiverName,
                                                messages = messages,
                                                isConnected = isConnected,
                                                onMessageSent = { message ->
                                                    chatViewModel.sendMessage(
                                                        senderId = senderId,
                                                        receiverId = receiverId,
                                                        content = message.content
                                                    )
                                                },
                                                onImageSelected = { uri ->
                                                    chatViewModel.sendImage(
                                                        senderId = senderId,
                                                        receiverId = receiverId,
                                                        imageUri = uri
                                                    )
                                                },
                                                onAgreementSubmit = { agreementData ->
                                                    chatViewModel.sendAgreement(agreementData)
                                                },
                                                viewModel = chatViewModel
                                            )
                                        }
                                    }
                                }

                                LaunchedEffect(selectedChat) {
                                    val chat = selectedChat
                                    currentUserId?.let { senderId ->
                                        if (chat != null) {
                                            chatViewModel.connectWebSocket(senderId, chat.first)
                                        }
                                    }
                                }
                            }
                            4 -> ProfileContent(onLogoutSuccess = {
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
fun SearchField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier,
        placeholder = { Text("Search classes...") },
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search"
            )
        },
        trailingIcon = {
            if (value.isNotEmpty()) {
                IconButton(onClick = { onValueChange("") }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear search"
                    )
                }
            }
        },
        singleLine = true,
        shape = RoundedCornerShape(24.dp),
        colors = TextFieldDefaults.outlinedTextFieldColors(
            focusedBorderColor = MaterialTheme.colorScheme.primary,
            unfocusedBorderColor = MaterialTheme.colorScheme.outline
        )
    )
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
    val searchQuery by viewModel.searchQuery.collectAsStateWithLifecycle()

    val filteredClasses = classes.filter {
        (selectedCategory == "all" || it.category.lowercase() == selectedCategory) &&
                (searchQuery.isEmpty() || it.title.contains(searchQuery, ignoreCase = true))
    }

    val popularClasses = classes.shuffled().take(minOf(classes.size, 5))

    // Sort classes by number of sections in descending order
    val classesByMostSections = classes.sortedByDescending { it.sectionsCount }.take(minOf(classes.size, 5))

    val allCategories = listOf(
        CategoryData("all", R.drawable.ic_category),
        CategoryData("programming", R.drawable.ic_code),
        CategoryData("design", R.drawable.ic_design),
        CategoryData("business", R.drawable.ic_business),
        CategoryData("marketing", R.drawable.ic_marketing),
        CategoryData("photography", R.drawable.ic_camera),
        CategoryData("music", R.drawable.ic_music),
        CategoryData("writing", R.drawable.ic_edit)
    )

    Box(modifier = Modifier.fillMaxSize()) {
        if (isLoading) {
            LoadingView()
        } else if (error != null) {
            ErrorView(error = error!!, onRetry = { viewModel.fetchClasses() })
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                // Top App Bar
                item {
                    SmallTopAppBar(
                        title = { Text("Classes") },
                        colors = TopAppBarDefaults.smallTopAppBarColors(
                            containerColor = MaterialTheme.colorScheme.primary,
                            titleContentColor = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }

                // Search field
                item {
                    SearchField(
                        value = searchQuery,
                        onValueChange = { viewModel.setSearchQuery(it) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                }

                // Categories
                item {
                    CategoryRow(
                        selectedCategory = selectedCategory,
                        onCategorySelected = { viewModel.setCategory(it) }
                    )
                }

                // Recent Classes Section
                item {
                    SectionTitle("Recent Classes")
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(
                            items = filteredClasses,
                            key = { it.id }
                        ) { classItem ->
                            ClassCard(
                                classItem = classItem,
                                onClick = { onClassClick(classItem.id) },
                                isHorizontal = true
                            )
                        }
                    }
                }

                // Popular Classes Section
                item {
                    SectionTitle("Popular Classes")
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(
                            items = popularClasses,
                            key = { it.id }
                        ) { classItem ->
                            ClassCard(
                                classItem = classItem,
                                onClick = { onClassClick(classItem.id) },
                                isHorizontal = true
                            )
                        }
                    }
                }

                // Most Sections Section (replaced Popular Categories)
                item {
                    SectionTitle("Most Sections")
                }
                item {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(
                            items = classesByMostSections,
                            key = { it.id }
                        ) { classItem ->
                            ClassCard(
                                classItem = classItem,
                                onClick = { onClassClick(classItem.id) },
                                isHorizontal = true,
                                highlightSections = true
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun SectionTitle(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    )
}

@Composable
fun CategoryRow(
    selectedCategory: String,
    onCategorySelected: (String) -> Unit,
    categories: List<CategoryData> = listOf(
        CategoryData("all", R.drawable.ic_category),
        CategoryData("programming", R.drawable.ic_code),
        CategoryData("design", R.drawable.ic_design),
        CategoryData("business", R.drawable.ic_business),
        CategoryData("marketing", R.drawable.ic_marketing),
        CategoryData("photography", R.drawable.ic_camera),
        CategoryData("music", R.drawable.ic_music),
        CategoryData("writing", R.drawable.ic_edit)
    )
) {
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
fun ClassCard(
    classItem: Class,
    onClick: () -> Unit,
    isHorizontal: Boolean = false,
    highlightSections: Boolean = false // New parameter to highlight sections
) {
    Card(
        modifier = Modifier
            .then(
                if (isHorizontal) {
                    Modifier.width(280.dp)
                } else {
                    Modifier.fillMaxWidth()
                }
            )
            .clickable(onClick = onClick)
            .padding(
                if (isHorizontal) {
                    PaddingValues(vertical = 8.dp)
                } else {
                    PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                }
            ),
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
                AuthenticatedThumbnailImage(
                    url = classItem.thumbnailUrl,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(if (isHorizontal) 140.dp else 180.dp),
                    contentScale = ContentScale.Crop
                )
                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(if (isHorizontal) 140.dp else 180.dp)
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
                        .padding(if (isHorizontal) 8.dp else 12.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.9f)
                ) {
                    Text(
                        text = classItem.category,
                        modifier = Modifier.padding(
                            horizontal = if (isHorizontal) 8.dp else 12.dp,
                            vertical = if (isHorizontal) 4.dp else 6.dp
                        ),
                        style = if (isHorizontal)
                            MaterialTheme.typography.labelSmall
                        else
                            MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                }

                // Duration chip
                Surface(
                    modifier = Modifier
                        .padding(if (isHorizontal) 8.dp else 12.dp)
                        .align(Alignment.TopEnd),
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.9f)
                ) {
                    Row(
                        modifier = Modifier.padding(
                            horizontal = if (isHorizontal) 8.dp else 12.dp,
                            vertical = if (isHorizontal) 4.dp else 6.dp
                        ),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_time),
                            contentDescription = null,
                            modifier = Modifier.size(if (isHorizontal) 12.dp else 14.dp),
                            tint = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        Text(
                            text = classItem.duration,
                            style = if (isHorizontal)
                                MaterialTheme.typography.labelSmall
                            else
                                MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(if (isHorizontal) 12.dp else 16.dp)
            ) {
                // Title with animation
                Text(
                    text = classItem.title,
                    style = if (isHorizontal)
                        MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    else
                        MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = if (isHorizontal) 1 else 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(if (isHorizontal) 4.dp else 8.dp))

                // Description with custom styling
                Text(
                    text = classItem.description,
                    style = if (isHorizontal)
                        MaterialTheme.typography.bodySmall
                    else
                        MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = if (isHorizontal) 1 else 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(if (isHorizontal) 8.dp else 16.dp))

                // Divider with gradient (only for vertical cards)
                if (!isHorizontal) {
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
                }

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
                                .size(if (isHorizontal) 24.dp else 40.dp)
                                .clip(CircleShape)
                                .border(
                                    width = if (isHorizontal) 1.dp else 2.dp,
                                    brush = Brush.sweepGradient(
                                        listOf(
                                            MaterialTheme.colorScheme.primary,
                                            MaterialTheme.colorScheme.tertiary
                                        )
                                    ),
                                    shape = CircleShape
                                )
                        ) {
                            AuthenticatedProfileImage(
                                url = classItem.creatorImageUrl,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                        Spacer(modifier = Modifier.width(if (isHorizontal) 8.dp else 12.dp))
                        if (isHorizontal) {
                            Text(
                                text = classItem.creatorName,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        } else {
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
                    }

                    // Sections indicator with highlight option
                    Surface(
                        shape = RoundedCornerShape(if (isHorizontal) 8.dp else 12.dp),
                        color = if (highlightSections)
                            MaterialTheme.colorScheme.tertiary
                        else
                            MaterialTheme.colorScheme.secondaryContainer
                    ) {
                        Row(
                            modifier = Modifier.padding(
                                horizontal = if (isHorizontal) 8.dp else 12.dp,
                                vertical = if (isHorizontal) 4.dp else 6.dp
                            ),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(if (isHorizontal) 2.dp else 4.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_sections),
                                contentDescription = null,
                                modifier = Modifier.size(if (isHorizontal) 12.dp else 16.dp),
                                tint = if (highlightSections)
                                    MaterialTheme.colorScheme.onTertiary
                                else
                                    MaterialTheme.colorScheme.onSecondaryContainer
                            )
                            Text(
                                text = if (isHorizontal) "${classItem.sectionsCount}" else "${classItem.sectionsCount} sections",
                                style = if (isHorizontal)
                                    MaterialTheme.typography.labelSmall
                                else
                                    MaterialTheme.typography.labelMedium,
                                color = if (highlightSections)
                                    MaterialTheme.colorScheme.onTertiary
                                else
                                    MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AuthenticatedProfileImage(
    url: String?,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    contentScale: ContentScale = ContentScale.Crop
) {
    val authenticatedUrl = remember(url) {
        UrlUtils.getFullImageUrl(url)
    }

    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(authenticatedUrl)
            .crossfade(true)
            .build(),
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale,
        error = painterResource(id = R.drawable.default_profile)
    )
}

@Composable
fun AuthenticatedThumbnailImage(
    url: String?,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    contentScale: ContentScale = ContentScale.Crop
) {
    val authenticatedUrl = remember(url) {
        UrlUtils.getFullThumbnailUrl(url)
    }

    AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
            .data(authenticatedUrl)
            .crossfade(true)
            .build(),
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale,
        error = painterResource(id = R.drawable.default_profile)
    )
}

@Composable
fun CategoriesContent(
    onCategoryClick: (String) -> Unit,
    onNavigateToChat: (userId: Long, userName: String) -> Unit
) {
    MapScreen(onNavigateToChat = onNavigateToChat)
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

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ChatContent(
    modifier: Modifier = Modifier,
    senderId: Long,
    receiverId: Long,
    receiverName: String,
    messages: List<Message>,
    isConnected: Boolean,
    onMessageSent: (Message) -> Unit,
    onImageSelected: (Uri) -> Unit,
    onAgreementSubmit: (Map<String, Any>) -> Unit,
    viewModel: ChatViewModel
) {
    var messageInput by remember { mutableStateOf("") }
    var showAgreementForm by remember { mutableStateOf(false) }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()
    var hasError by remember { mutableStateOf(false) }

    // Add subtle animation for background
    val infiniteTransition = rememberInfiniteTransition()
    val gradientAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(20000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    // Keep existing effects
    DisposableEffect(Unit) {
        onDispose {
            viewModel.clearChatState()
        }
    }

    // Keep existing LaunchedEffects
    LaunchedEffect(senderId, receiverId) {
        try {
            viewModel.clearChatState()
            delay(100)
            viewModel.connectWebSocket(senderId, receiverId)
            viewModel.fetchExistingMessages(senderId, receiverId)
            hasError = false
        } catch (e: Exception) {
            hasError = true
            Log.e("ChatContent", "Error initializing chat", e)
        }
    }

    LaunchedEffect(listState.firstVisibleItemIndex) {
        listState.scrollToItem(listState.firstVisibleItemIndex)
    }

    LaunchedEffect(isConnected) {
        if (!isConnected) {
            delay(5000)
            viewModel.connectWebSocket(senderId, receiverId)
        }
    }

    // Keep existing error handling
    if (hasError || messages.isEmpty()) {
        LaunchedEffect(Unit) {
            delay(1000)
            try {
                viewModel.fetchExistingMessages(senderId, receiverId)
                hasError = false
            } catch (e: Exception) {
                hasError = true
            }
        }
    }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            selectedImageUri = it
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                        MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.15f),
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                    ),
                    start = Offset(
                        x = cos(gradientAngle * PI.toFloat() / 180f),
                        y = sin(gradientAngle * PI.toFloat() / 180f)
                    ),
                    end = Offset(
                        x = cos((gradientAngle + 180f) * PI.toFloat() / 180f),
                        y = sin((gradientAngle + 180f) * PI.toFloat() / 180f)
                    )
                )
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Enhanced Chat Header
            ChatHeader(
                receiverName = receiverName,
                onInfoClick = { /* Handle info click */ },
                isOnline = isConnected
            )

            // Messages List with enhanced styling
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    state = listState,
                    contentPadding = PaddingValues(vertical = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    val groupedMessages = messages.groupBy { message ->
                        message.timestamp.toLocalDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
                    }

                    groupedMessages.forEach { (date, messagesForDate) ->
                        item {
                            DateDivider(date = date)
                        }

                        items(messagesForDate) { message ->
                            key(message.id) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .animateItemPlacement()
                                ) {
                                    MessageBubble(
                                        message = message,
                                        isFromCurrentUser = message.senderId == senderId,
                                        receiverName = receiverName,
                                        currentUserId = senderId,
                                        onAcceptAgreement = { agreementId ->
                                            viewModel.respondToAgreement(agreementId, "ACCEPTED")
                                        },
                                        onRejectAgreement = { agreementId ->
                                            viewModel.respondToAgreement(agreementId, "REJECTED")
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Enhanced Chat Input Area
            ChatInputArea(
                messageInput = messageInput,
                onMessageInputChange = { messageInput = it },
                onSendClick = {
                    if (isConnected) {
                        if (selectedImageUri != null) {
                            onImageSelected(selectedImageUri!!)
                            selectedImageUri = null
                        } else if (messageInput.isNotBlank()) {
                            val message = Message(
                                id = null,
                                senderId = senderId,
                                receiverId = receiverId,
                                content = messageInput,
                                messageType = MessageType.TEXT,
                                timestamp = LocalDateTime.now().toString()
                            )
                            onMessageSent(message)
                            messageInput = ""
                        }
                    }
                },
                isConnected = isConnected,
                onImageClick = { imagePickerLauncher.launch("image/*") },
                onAgreementClick = { showAgreementForm = true },
                selectedImageUri = selectedImageUri,
                onClearImage = { selectedImageUri = null }
            )
        }

        // Connection status indicator with animation
        AnimatedVisibility(
            visible = !isConnected,
            enter = slideInVertically { -it } + fadeIn(),
            exit = slideOutVertically { -it } + fadeOut(),
            modifier = Modifier.align(Alignment.TopCenter)
        ) {
            Surface(
                color = MaterialTheme.colorScheme.errorContainer,
                contentColor = MaterialTheme.colorScheme.onErrorContainer,
                modifier = Modifier.fillMaxWidth(),
                shadowElevation = 4.dp
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Reconnecting...",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }
        }
    }

    // Agreement Form Dialog
    if (showAgreementForm) {
        BorrowingAgreementDialog(
            receiverId = receiverId,
            senderId = senderId,
            onDismiss = { showAgreementForm = false },
            onSubmit = { agreementData ->
                onAgreementSubmit(agreementData)
                showAgreementForm = false
            },
            viewModel = viewModel
        )
    }
}

@Composable
private fun ChatHeader(
    receiverName: String,
    onInfoClick: () -> Unit,
    isOnline: Boolean
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(70.dp),
        shadowElevation = 8.dp,
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Enhanced Avatar
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .border(
                            width = 2.dp,
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary,
                                    MaterialTheme.colorScheme.secondary
                                )
                            ),
                            shape = CircleShape
                        )
                        .padding(2.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primaryContainer,
                                    MaterialTheme.colorScheme.secondaryContainer
                                )
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = receiverName.first().toString(),
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Enhanced Name and Status
                Column {
                    Text(
                        text = receiverName,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(
                                    color = if (isOnline)
                                        MaterialTheme.colorScheme.primary
                                    else
                                        MaterialTheme.colorScheme.outline,
                                    shape = CircleShape
                                )
                        )
                        Text(
                            text = if (isOnline) "Online" else "Offline",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (isOnline)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.outline
                        )
                    }
                }
            }

            // Enhanced Info Button
            IconButton(
                onClick = onInfoClick,
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f),
                        shape = CircleShape
                    )
            ) {
                Icon(
                    imageVector = Icons.Outlined.Info,
                    contentDescription = "Information",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
fun MessageBubble(
    message: Message,
    isFromCurrentUser: Boolean,
    receiverName: String,
    currentUserId: Long? = null,
    onAcceptAgreement: (Long) -> Unit = {},
    onRejectAgreement: (Long) -> Unit = {}
) {

    val animatedOffset by animateFloatAsState(
        targetValue = 0f,
        animationSpec = tween(300, easing = FastOutSlowInEasing),
        label = "message_offset"
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .offset(x = animatedOffset.dp),
        horizontalAlignment = if (isFromCurrentUser) Alignment.End else Alignment.Start
    ){
        Row(
            modifier = Modifier.padding(vertical = 2.dp),
            horizontalArrangement = if (isFromCurrentUser) Arrangement.End else Arrangement.Start
        ) {
            if (!isFromCurrentUser) {
                Avatar(name = receiverName)
                Spacer(modifier = Modifier.width(8.dp))
            }

            Column {
                Surface(
                    color = if (isFromCurrentUser)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.surface,
                    shape = RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isFromCurrentUser) 16.dp else 4.dp,
                        bottomEnd = if (isFromCurrentUser) 4.dp else 16.dp
                    ),
                    shadowElevation = 2.dp
                ) {
                    when (message.messageType) {
                        MessageType.TEXT -> TextMessage(message.content)
                        MessageType.IMAGE -> ImageMessage(message.imageUrl)
                        MessageType.FORM -> AgreementMessage(
                            formData = message.formData,
                            currentUserId = currentUserId,
                            onAccept = onAcceptAgreement,
                            onReject = onRejectAgreement
                        )
                        MessageType.RETURN_REQUEST -> ReturnRequestMessage(message.formData)
                        MessageType.BORROWING_UPDATE,
                        MessageType.AGREEMENT_UPDATE -> AgreementMessage(message.formData)
                        MessageType.RATING_UPDATE -> TextMessage("Rating updated")
                        MessageType.CHAT_MESSAGE -> TextMessage(message.content)
                        null -> TextMessage(message.content)
                    }
                }

                Text(
                    text = DateTimeUtils.formatToTime(message.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            if (isFromCurrentUser) {
                Spacer(modifier = Modifier.width(8.dp))
                Avatar(name = "You")
            }
        }
    }
}

@Composable
private fun DateDivider(date: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.Center
    ) {
        Surface(
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
            shape = RoundedCornerShape(16.dp)
        ) {
            Text(
                text = date,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
    }
}

@Composable
fun ProfileContent(
    viewModel: ProfileViewModel = hiltViewModel(),
    authViewModel: AuthViewModel = hiltViewModel(),
    onLogoutSuccess: () -> Unit,
    onNavigateToEdit: () -> Unit = {},
    onNavigateToHome: () -> Unit = {}
) {
    var selectedTab by remember { mutableStateOf(ProfileTab.PROFILE) }
    var showLogoutConfirmation by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    // Collect all states
    val authState by authViewModel.authState.collectAsState()
    val profileState by viewModel.profileState.collectAsState()
    val userStats by viewModel.userStats.collectAsState()
    val activities by viewModel.activities.collectAsState()
    val achievements by viewModel.achievements.collectAsState()
    val savedClasses by viewModel.savedClasses.collectAsState()
    val followData by viewModel.followData.collectAsState()

    // Handle logout success
    LaunchedEffect(authState.isLoggedIn) {
        if (!authState.isLoggedIn) {
            onLogoutSuccess()
        }
    }

    LaunchedEffect(Unit) {
        viewModel.refreshAllProfileData()
    }

    LaunchedEffect(profileState) {
        Log.d("ProfileContent", "Profile state updated: $profileState")
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Profile Header
        ProfileTopBar(
            onBackClick = onNavigateToHome,
            onLogoutClick = { showLogoutConfirmation = true }
        )

        // Profile Content
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp)
        ) {
            item {
                ProfileHeader(
                    profileData = profileState.data,
                    userStats = userStats,
                    followData = followData,
                    isOwnProfile = true,
                    onEditClick = onNavigateToEdit
                )
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
                ProfileTabs(
                    selectedTab = selectedTab,
                    onTabSelected = { selectedTab = it }
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            when (selectedTab) {
                ProfileTab.PROFILE -> {
                    item {
                        ProfileTabContent(
                            profileData = profileState.data,
                            userStats = userStats,
                            savedClasses = savedClasses
                        )
                    }
                }
                ProfileTab.ACHIEVEMENTS -> {
                    items(
                        items = achievements,
                        key = { it.id }
                    ) { achievement ->
                        AchievementCard(achievement = achievement)
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                }
                ProfileTab.ACTIVITY -> {
                    if (activities.isEmpty()) {
                        item {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "No activities yet",
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            }
                        }
                    } else {
                        itemsIndexed(
                            items = activities,
                            key = { index, activity ->
                                buildString {
                                    append(activity.type)
                                    append("_")
                                    append(activity.id ?: "")
                                    append("_")
                                    append(index)
                                }.hashCode()
                            }
                        ) { index, activity ->
                            ActivityItem(activity = activity)
                            Spacer(modifier = Modifier.height(8.dp))
                        }
                    }
                }
            }
        }
    }

    if (showLogoutConfirmation) {
        val activity = LocalContext.current as? Activity

        LogoutDialog(
            onConfirm = {
                activity?.let { currentActivity ->
                    scope.launch {
                        authViewModel.logoutAndExitApp(currentActivity)
                    }
                }
                showLogoutConfirmation = false
            },
            onDismiss = { showLogoutConfirmation = false }
        )
    }
}

@Composable
private fun AchievementCard(achievement: Achievement) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Achievement Icon
            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = achievement.name,
                tint = if (achievement.unlocked) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                }
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = achievement.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = achievement.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )

                LinearProgressIndicator(
                    progress = achievement.progress.toFloat() / 100,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun ActivityItem(activity: UserActivity) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User Avatar
            AsyncImage(
                model = activity.user?.imageUrl,
                contentDescription = "User avatar",
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = R.drawable.default_profile)
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = activity.user?.username ?: "",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "${activity.action} ${activity.title}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = activity.createdAt?.toString() ?: "",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            if (activity.engagement != null) {
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "${activity.engagement.likes} likes",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "${activity.engagement.comments} comments",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

@Composable
fun ProfileTopBar(
    onBackClick: () -> Unit,
    onLogoutClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBackClick,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }

            Text(
                text = "Profile",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSurface
            )

            IconButton(
                onClick = onLogoutClick,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Icon(
                    imageVector = Icons.Default.ExitToApp,
                    contentDescription = "Logout",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun ProfileHeader(
    profileData: ProfileData?,
    onEditClick: () -> Unit,
    userStats: UserStats,
    followData: FollowData,
    isOwnProfile: Boolean
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Profile Picture
        Box(
            modifier = Modifier
                .size(120.dp)
                .clip(CircleShape)
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.secondary
                        )
                    )
                )
                .border(
                    width = 2.dp,
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                    shape = CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (profileData?.imageUrl != null) {
                AsyncImage(
                    model = profileData.imageUrl,
                    contentDescription = "Profile Picture",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            } else {
                Text(
                    text = profileData?.username?.firstOrNull()?.uppercase() ?: "",
                    style = MaterialTheme.typography.headlineLarge.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 48.sp
                    ),
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }

            // Online indicator
            Box(
                modifier = Modifier
                    .size(16.dp)
                    .clip(CircleShape)
                    .background(Color.Green)
                    .border(2.dp, MaterialTheme.colorScheme.surface, CircleShape)
                    .align(Alignment.BottomEnd)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // User Info
        Text(
            text = profileData?.username ?: "Username",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )

        Text(
            text = profileData?.email ?: "Email",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Stats Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatItem(
                value = followData.followersCount.toString(),
                label = "Followers"
            )
            StatItem(
                value = followData.followingCount.toString(),
                label = "Following"
            )
            StatItem(
                value = "${userStats.communityScore}%",
                label = "Score"
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (isOwnProfile) {
            Card(
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                )
            ) {
                Row(
                    modifier = Modifier
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Visit our website for full profile customization",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
private fun StatItem(
    value: String,
    label: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.padding(horizontal = 8.dp)
    ) {
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
fun ProfileTabs(
    selectedTab: ProfileTab,
    onTabSelected: (ProfileTab) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 1.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly // This will distribute tabs evenly
        ) {
            ProfileTab.values().forEach { tab ->
                TabItem(
                    tab = tab,
                    isSelected = selectedTab == tab,
                    onClick = { onTabSelected(tab) }
                )
            }
        }
    }
}

@Composable
private fun TabItem(
    tab: ProfileTab,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val color = if (isSelected) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
    }

    Column(
        modifier = Modifier
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
            .padding(vertical = 12.dp, horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = tab.name.lowercase().replaceFirstChar { it.uppercase() },
            style = MaterialTheme.typography.bodyMedium,
            color = color
        )

        if (isSelected) {
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .width(24.dp)
                    .height(2.dp)
                    .background(color)
            )
        }
    }
}

@Composable
fun LogoutDialog(
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    val activity = context as? Activity

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Confirm Logout",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(top = 8.dp)
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .align(Alignment.CenterHorizontally)
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f)
                                )
                            ),
                            shape = CircleShape
                        )
                        .border(
                            width = 2.dp,
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
                    Icon(
                        imageVector = Icons.Rounded.Logout,
                        contentDescription = null,
                        modifier = Modifier
                            .size(40.dp)
                            .padding(4.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Are you sure you want to logout?",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    activity?.let {
                        onConfirm()
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary
                ),
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .shadow(
                        elevation = 8.dp,
                        shape = RoundedCornerShape(12.dp)
                    ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Check,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Yes, Logout",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        },
        dismissButton = {
            OutlinedButton(
                onClick = onDismiss,
                modifier = Modifier
                    .padding(horizontal = 8.dp)
                    .border(
                        width = 1.dp,
                        brush = Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                                MaterialTheme.colorScheme.secondary.copy(alpha = 0.5f)
                            )
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.primary
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Cancel",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        },
        shape = RoundedCornerShape(24.dp),
        containerColor = MaterialTheme.colorScheme.surface,
        modifier = Modifier
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                        MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface,
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.95f)
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            ),
        properties = DialogProperties(
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProfileTabContent(
    profileData: ProfileData?,
    userStats: UserStats,
    savedClasses: List<ClassItem>
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        // About Me Section
        Section(
            title = "About Me",
            icon = Icons.Default.Person
        ) {
            Text(
                text = profileData?.bio ?: "No bio added yet",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Skills Section
        if (!profileData?.skills.isNullOrEmpty()) {
            Section(
                title = "Skills",
                icon = Icons.Default.Star
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    profileData?.skills?.forEach { skill ->
                        SkillProgressItem(skill = skill)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Interests Section
        Section(
            title = "Interests",
            icon = Icons.Default.Favorite
        ) {
            if (profileData?.interests?.isNotEmpty() == true) {
                InterestsSection(interests = profileData.interests)
            } else {
                Text(
                    text = "No interests added yet",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Saved Classes Section
        Section(
            title = "Favorite Classes",
            icon = Icons.Default.Book
        ) {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(vertical = 8.dp)
            ) {
                items(savedClasses) { classItem ->
                    SavedClassCard(classItem = classItem)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                label = "Classes Created",
                value = userStats.classesCreated.toString(),
                icon = Icons.Default.School
            )
            StatCard(
                label = "Items Posted",
                value = userStats.itemsPosted.toString(),
                icon = Icons.Default.ShoppingCart
            )
            StatCard(
                label = "Community Score",
                value = "${userStats.communityScore}%",
                icon = Icons.Default.Star
            )
        }
    }
}

@Composable
private fun InterestsSection(interests: List<String>) {
    LazyRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(vertical = 8.dp)
    ) {
        items(interests) { interest ->
            InterestChip(interest = interest)
        }
    }
}

@Composable
fun AchievementsTabContent(
    achievements: List<Achievement>
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(achievements) { achievement ->
            AchievementCard(achievement = achievement)
        }
    }
}

@Composable
fun ActivityTabContent(
    activities: List<UserActivity>
) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(activities) { activity ->
            ActivityItem(activity = activity)
        }
    }
}

@Composable
private fun Section(
    title: String,
    icon: ImageVector,
    content: @Composable () -> Unit
) {
    Column {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 16.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        content()
    }
}

@Composable
private fun SkillProgressItem(skill: Skill) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = skill.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = "${skill.level}%",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        LinearProgressIndicator(
            progress = skill.level.toFloat() / 100,
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp)),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}

@Composable
private fun InterestChip(interest: String) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f))
    ) {
        Text(
            text = interest,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun SavedClassCard(classItem: ClassItem) {
    Card(
        modifier = Modifier
            .width(280.dp)
            .clickable { /* Navigate to class */ },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Class thumbnail
            AuthenticatedThumbnailImage(
                url = classItem.thumbnailUrl,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp),
                contentDescription = classItem.title,
                contentScale = ContentScale.Crop
            )
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = classItem.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = classItem.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun StatCard(
    label: String,
    value: String,
    icon: ImageVector
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 100.dp)
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp,
            pressedElevation = 8.dp
        ),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Label and Value Column
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = label,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )

                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 28.sp
                    ),
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            // Icon with background
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(16.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(32.dp),
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}