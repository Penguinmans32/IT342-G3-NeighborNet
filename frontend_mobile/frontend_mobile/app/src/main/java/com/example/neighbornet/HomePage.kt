package com.example.neighbornet

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Info
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
import androidx.compose.ui.platform.LocalContext
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
import coil.request.ImageRequest
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.auth.ChatViewModel
import com.example.neighbornet.auth.ClassListViewModel
import com.example.neighbornet.auth.TokenManager
import kotlinx.coroutines.launch
import com.example.neighbornet.network.Class
import com.example.neighbornet.network.CategoryData
import com.example.neighbornet.network.CategoryInfo
import com.example.neighbornet.network.Message
import com.example.neighbornet.network.MessageType
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
                                                }
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
    onCategoryClick: (String) -> Unit
) {
    MapScreen()
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

@OptIn(ExperimentalMaterial3Api::class)
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
    onAgreementSubmit: (Map<String, Any>) -> Unit
) {
    var messageInput by remember { mutableStateOf("") }
    var showAgreementForm by remember { mutableStateOf(false) }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    val scope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            selectedImageUri = it
            onImageSelected(it)
        }
    }


    Column(
        modifier = modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                        MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
                    )
                )
            )
    ) {
        // Chat Header
        ChatHeader(
            receiverName = receiverName,
            onInfoClick = { /* Handle info click */ }
        )

        // Messages List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            state = listState,
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val groupedMessages = messages.groupBy { message ->
                message.timestamp.toLocalDate().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"))
            }

            groupedMessages.forEach { (date, messagesForDate) ->
                item {
                    DateDivider(date = date)
                }

                items(messagesForDate) { message ->
                    MessageBubble(
                        message = message,
                        isFromCurrentUser = message.senderId == senderId,
                        receiverName = receiverName
                    )
                }
            }
        }

        ChatInputArea(
            messageInput = messageInput,
            onMessageInputChange = { messageInput = it },
            onSendClick = {
                if (messageInput.isNotBlank() && isConnected) { // Check connection
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
            },
            isConnected = isConnected,
            onImageClick = { imagePickerLauncher.launch("image/*") },
            onAgreementClick = { showAgreementForm = true },
            selectedImageUri = selectedImageUri,
            onClearImage = { selectedImageUri = null }
        )
    }

    // Show agreement form dialog if needed
    if (showAgreementForm) {
        BorrowingAgreementDialog(
            onDismiss = { showAgreementForm = false },
            onSubmit = { agreementData ->
                onAgreementSubmit(agreementData)
                showAgreementForm = false
            }
        )
    }
}

@Composable
private fun ChatHeader(
    receiverName: String,
    onInfoClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp),
        shadowElevation = 4.dp
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
                // Avatar
                Box(
                    modifier = Modifier
                        .size(40.dp)
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
                        text = receiverName.first().toString(),
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium
                    )
                }

                // Name and status
                Column {
                    Text(
                        text = receiverName,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Text(
                        text = "Online",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // Info button
            IconButton(onClick = onInfoClick) {
                Icon(
                    imageVector = Icons.Outlined.Info,
                    contentDescription = "Information"
                )
            }
        }
    }
}

@Composable
fun MessageBubble(
    message: Message,
    isFromCurrentUser: Boolean,
    receiverName: String
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isFromCurrentUser) Alignment.End else Alignment.Start
    ) {
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
                        MessageType.FORM -> AgreementMessage(message.formData)
                        MessageType.RETURN_REQUEST -> ReturnRequestMessage(message.formData)
                        MessageType.BORROWING_UPDATE -> TODO()
                        MessageType.RATING_UPDATE -> TODO()
                        MessageType.CHAT_MESSAGE -> TODO()
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