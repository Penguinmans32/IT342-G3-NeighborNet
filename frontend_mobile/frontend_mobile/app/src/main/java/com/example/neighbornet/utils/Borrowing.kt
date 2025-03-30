package com.example.neighbornet.utils

import android.annotation.SuppressLint
import android.util.Log
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.ExperimentalAnimationApi
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.with
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyGridState
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.outlined.Collections
import androidx.compose.material.icons.outlined.Inventory2
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.neighbornet.AuthenticatedThumbnailImage
import com.example.neighbornet.auth.BorrowingViewModel
import com.example.neighbornet.auth.ChatViewModel
import com.example.neighbornet.network.BorrowingCategory
import com.example.neighbornet.network.BorrowingItem

@Composable
fun BorrowingScreen(
    viewModel: BorrowingViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
    onNavigateToAddItem: () -> Unit,
    onNavigateToItemDetails: (Long) -> Unit,
    onNavigateToChat: (Long, String) -> Unit
) {
    val items by viewModel.items.collectAsState()
    val borrowedItems by viewModel.borrowedItems.collectAsState()
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val categories = viewModel.getCategories()

    var showGalleryDialog by remember { mutableStateOf(false) }
    var selectedImages by remember { mutableStateOf<List<String>>(emptyList()) }
    var showMessageDialog by remember { mutableStateOf<BorrowingItem?>(null) }
    var filteredItems by remember { mutableStateOf(items) }

    LaunchedEffect(searchQuery, selectedCategory, items) {
        filteredItems = items.filter { item ->
            val matchesSearch = searchQuery.isEmpty() ||
                    item.name.contains(searchQuery, ignoreCase = true) ||
                    item.description.contains(searchQuery, ignoreCase = true)

            // Get category name for the selected category ID
            val selectedCategoryName = categories.find { it.id == selectedCategory }?.name

            // Check if it's "All Items" (id = 0) or matches the category name
            val matchesCategory = selectedCategory == 0L ||
                    (selectedCategoryName != null && item.category.equals(selectedCategoryName, ignoreCase = true))

            matchesSearch && matchesCategory
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            BorrowingHeroSection(
                onNavigateBack = onNavigateBack,
                onAddItem = onNavigateToAddItem
            )

            SearchAndFilterSection(
                searchQuery = searchQuery,
                onSearchQueryChange = viewModel::setSearchQuery,
                selectedCategory = selectedCategory,
                onCategorySelect = viewModel::setCategory,
                categories = categories,
                onSearch = { query ->
                    viewModel.setSearchQuery(query)
                }
            )

            if (isLoading) {
                LoadingGrid()
            } else if (filteredItems.isEmpty()) {
                EmptyStateMessage(
                    searchQuery = searchQuery,
                    selectedCategory = categories.find { it.id == selectedCategory }?.name
                )
            } else {
                ItemsGrid(
                    items = filteredItems,
                    borrowedItems = borrowedItems,
                    onItemClick = onNavigateToItemDetails,
                    onGalleryClick = { images ->
                        selectedImages = images
                        showGalleryDialog = true
                    },
                    onMessageClick = { item ->
                        showMessageDialog = item
                    }
                )
            }
        }

        // Dialogs
        if (showGalleryDialog) {
            ImageGalleryDialog(
                images = selectedImages,
                onDismiss = { showGalleryDialog = false }
            )
        }

        showMessageDialog?.let { item ->
            MessageDialog(
                item = item,
                onDismiss = { showMessageDialog = null },
                onSendMessage = { message ->
                    viewModel.sendMessage(item.id, message)
                },
                onNavigateToChat = onNavigateToChat
            )
        }
    }
}

@Composable
fun MessageDialog(
    item: BorrowingItem,
    onDismiss: () -> Unit,
    onSendMessage: (String) -> Unit,
    onNavigateToChat: (userId: Long, userName: String) -> Unit
) {


    val chatViewModel: ChatViewModel = hiltViewModel()
    var messageText by remember { mutableStateOf("") }
    val currentUser by chatViewModel.currentUser.collectAsState()
    val currentUserId by chatViewModel.currentUserId.collectAsState()
    val isConnected by chatViewModel.isConnected.collectAsState()



    LaunchedEffect(currentUserId, item.owner?.id) {
        Log.d("MessageDialog", "CurrentUserId: $currentUserId")
        Log.d("MessageDialog", "Owner ID: ${item.owner?.id}")

        currentUserId?.let { sender ->
            item.owner?.id?.let { receiver ->
                Log.d("MessageDialog", "Attempting to connect WebSocket")
                chatViewModel.connectWebSocket(sender, receiver)
            }
        }
    }

    LaunchedEffect(isConnected) {
        Log.d("MessageDialog", "WebSocket connected: $isConnected")
    }

    val predefinedMessages = remember {
        listOf(
            "Hi! I'm interested in borrowing your ${item.name}.",
            "Is ${item.name} still available?",
            "Could you provide more details about ${item.name}?"
        )
    }
    var selectedMessage by remember { mutableStateOf<String?>(null) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .widthIn(min = 400.dp, max = 600.dp)
                .padding(16.dp)
                .animateContentSize(),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)
            ),
            tonalElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .padding(horizontal = 32.dp, vertical = 24.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Item image
                    Surface(
                        modifier = Modifier.size(56.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        AuthenticatedThumbnailImage(
                            url = item.imageUrls.firstOrNull(),
                            contentDescription = item.name,
                            contentScale = ContentScale.Crop
                        )
                    }

                    Spacer(modifier = Modifier.width(16.dp))

                    Column {
                        Text(
                            text = "Message to ${item.owner?.username}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "About: ${item.name}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Quick templates section
                Text(
                    text = "Quick Templates",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Predefined messages with enhanced styling
                Column(
                    modifier = Modifier
                        .selectableGroup()
                        .clip(RoundedCornerShape(16.dp))
                        .border(
                            width = 1.dp,
                            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
                            shape = RoundedCornerShape(16.dp)
                        ),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    predefinedMessages.forEachIndexed { index, message ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .selectable(
                                    selected = selectedMessage == message,
                                    onClick = {
                                        selectedMessage = message
                                        messageText = message
                                    }
                                )
                                .background(
                                    color = if (selectedMessage == message)
                                        MaterialTheme.colorScheme.primaryContainer
                                    else
                                        Color.Transparent
                                )
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedMessage == message,
                                onClick = {
                                    selectedMessage = message
                                    messageText = message
                                },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = MaterialTheme.colorScheme.primary
                                )
                            )
                            Text(
                                text = message,
                                modifier = Modifier
                                    .padding(start = 8.dp)
                                    .weight(1f),
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                        if (index < predefinedMessages.size - 1) {
                            Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Custom message section
                Text(
                    text = "Or Write Custom Message",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Enhanced TextField
                OutlinedTextField(
                    value = messageText,
                    onValueChange = {
                        messageText = it
                        selectedMessage = null
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 120.dp),
                    label = { Text("Type your message") },
                    placeholder = { Text("Enter your message here...") },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        focusedLabelColor = MaterialTheme.colorScheme.primary
                    ),
                    shape = RoundedCornerShape(12.dp),
                    minLines = 4
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(
                            width = 1.dp,
                            color = MaterialTheme.colorScheme.outline
                        )
                    ) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            if (messageText.isNotBlank()) {
                                currentUserId?.let { sender ->
                                    item.owner?.id?.let { receiver ->
                                        chatViewModel.sendMessageAndCreateConversation(
                                            senderId = sender,
                                            receiverId = receiver,
                                            message = messageText,
                                            ownerUsername = item.owner.username
                                        ) { receiverId, username ->
                                            onDismiss()
                                            onNavigateToChat(receiverId, username)
                                        }
                                    }
                                }
                            }
                        },
                        enabled = messageText.isNotBlank() && currentUserId != null && isConnected,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Send Message",
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ImageGalleryDialog(
    images: List<String>,
    onDismiss: () -> Unit
) {
    var currentPage by remember { mutableStateOf(0) }
    val pagerState = rememberPagerState(pageCount = { images.size })

    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.currentPage }.collect { page ->
            currentPage = page
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f))
        ) {
            // Close button
            IconButton(
                onClick = onDismiss,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close",
                    tint = Color.White
                )
            }

            // Image pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { page ->
                AuthenticatedThumbnailImage(
                    url = images[page],
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            // Page indicator
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                images.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .padding(4.dp)
                            .size(8.dp)
                            .background(
                                color = if (currentPage == index) Color.White
                                else Color.White.copy(alpha = 0.5f),
                                shape = CircleShape
                            )
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalAnimationApi::class)
@Composable
fun SearchAndFilterSection(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    selectedCategory: Long,
    onCategorySelect: (Long) -> Unit,
    categories: List<BorrowingCategory>,
    onSearch: (String) -> Unit
) {
    var isSearchFocused by remember { mutableStateOf(false) }
    var lastSubmittedQuery by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        // Enhanced Search Bar
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .animateContentSize()
                .shadow(
                    elevation = if (isSearchFocused) 8.dp else 4.dp,
                    shape = RoundedCornerShape(28.dp)
                ),
            shape = RoundedCornerShape(28.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(
                width = 1.dp,
                color = if (isSearchFocused)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = if (isSearchFocused)
                        MaterialTheme.colorScheme.primary
                    else
                        MaterialTheme.colorScheme.onSurfaceVariant
                )

                BasicTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChange,
                    modifier = Modifier
                        .weight(1f)
                        .padding(horizontal = 16.dp)
                        .onFocusChanged { isSearchFocused = it.isFocused },
                    singleLine = true,
                    cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                    textStyle = MaterialTheme.typography.bodyLarge.copy(
                        color = MaterialTheme.colorScheme.onSurface
                    ),
                    keyboardOptions = KeyboardOptions(
                        imeAction = ImeAction.Search
                    ),
                    keyboardActions = KeyboardActions(
                        onSearch = {
                            if (searchQuery.isNotBlank() && searchQuery != lastSubmittedQuery) {
                                onSearch(searchQuery)
                                lastSubmittedQuery = searchQuery
                            }
                        }
                    ),
                    decorationBox = { innerTextField ->
                        Box(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            if (searchQuery.isEmpty()) {
                                Text(
                                    "Search items...",
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            innerTextField()
                        }
                    }
                )

                // Clear button
                AnimatedVisibility(
                    visible = searchQuery.isNotEmpty(),
                    enter = fadeIn() + scaleIn(),
                    exit = fadeOut() + scaleOut()
                ) {
                    IconButton(
                        onClick = {
                            onSearchQueryChange("")
                            lastSubmittedQuery = ""
                            onSearch("")
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Clear search",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Enhanced Categories
        AnimatedContent(
            targetState = selectedCategory,
            transitionSpec = {
                fadeIn() + slideInVertically() with fadeOut() + slideOutVertically()
            },
            label = "CategoryAnimation"
        ) { currentCategory ->
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 4.dp)
            ) {
                itemsIndexed(categories) { _, category ->
                    FilterChip(
                        selected = currentCategory == category.id,
                        onClick = { onCategorySelect(category.id) },
                        label = {
                            Text(
                                text = category.name,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = if (currentCategory == category.id)
                                    FontWeight.Bold
                                else
                                    FontWeight.Normal
                            )
                        },
                        modifier = Modifier.animateContentSize(),
                        leadingIcon = if (currentCategory == category.id) {
                            {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        } else null,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                            selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = currentCategory == category.id,
                            borderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.12f),
                            selectedBorderColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                            borderWidth = 1.dp
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun LoadingGrid() {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 300.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(6) {
            LoadingItemCard()
        }
    }
}

@Composable
private fun LoadingItemCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(350.dp)
    ) {
        Column {
            // Image placeholder
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .shimmerBackground()
            )

            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Title placeholder
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .height(24.dp)
                        .shimmerBackground()
                )

                // Description placeholder
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(16.dp)
                        .shimmerBackground()
                )
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .height(16.dp)
                        .shimmerBackground()
                )
            }
        }
    }
}

@SuppressLint("ModifierFactoryUnreferencedReceiver")
@Composable
private fun Modifier.shimmerBackground() = composed {
    val transition = rememberInfiniteTransition(label = "")
    val alpha by transition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000),
            repeatMode = RepeatMode.Reverse
        ),
        label = ""
    )

    background(
        MaterialTheme.colorScheme.onSurface.copy(alpha = alpha),
        shape = RoundedCornerShape(4.dp)
    )
}

@Composable
private fun EmptyStateMessage(
    searchQuery: String,
    selectedCategory: String?
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Outlined.Inventory2,
            contentDescription = null,
            modifier = Modifier
                .size(120.dp)
                .padding(bottom = 16.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
        )

        Text(
            text = when {
                searchQuery.isNotEmpty() -> "No items found for \"$searchQuery\""
                selectedCategory != null && selectedCategory != "All Items" ->
                    "No items in category \"$selectedCategory\""
                else -> "No items available"
            },
            style = MaterialTheme.typography.titleLarge,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = when {
                searchQuery.isNotEmpty() || selectedCategory != null ->
                    "Try adjusting your search or filters"
                else -> "Be the first to list an item in your community!"
            },
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}


@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ItemsGrid(
    items: List<BorrowingItem>,
    borrowedItems: List<BorrowingItem>,
    onItemClick: (Long) -> Unit,
    onGalleryClick: (List<String>) -> Unit,
    onMessageClick: (BorrowingItem) -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize()
    ) {
        if (items.isEmpty()) {
            EmptyStateMessage(
                searchQuery = "", // Default empty search query
                selectedCategory = null // No category selected
            )
        } else {
            val gridState = rememberLazyGridState()

            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 320.dp),
                contentPadding = PaddingValues(
                    top = 16.dp,
                    bottom = 88.dp,
                    start = 16.dp,
                    end = 24.dp
                ),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
                state = gridState
            ) {
                items(
                    items = items,
                    key = { it.id }
                ) { item ->
                    ItemCard(
                        item = item,
                        isBorrowed = borrowedItems.any { it.id == item.id },
                        onItemClick = { onItemClick(item.id) },
                        onGalleryClick = { onGalleryClick(item.imageUrls) },
                        onMessageClick = { onMessageClick(item) },
                        modifier = Modifier
                            .animateItemPlacement()
                            .graphicsLayer {
                                val scrollSpeed = 0.02f
                                val scale = 0.95f + (scrollSpeed * 1f)
                                scaleX = scale
                                scaleY = scale
                            }
                    )
                }
            }

            VerticalScrollbar(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 4.dp),
                scrollState = gridState,
                itemCount = items.size
            )
        }
    }
}

@Composable
private fun VerticalScrollbar(
    modifier: Modifier = Modifier,
    scrollState: LazyGridState,
    itemCount: Int
) {
    if (itemCount > 6) {
        val firstVisibleItem = scrollState.firstVisibleItemIndex
        val visibleItems = scrollState.layoutInfo.visibleItemsInfo.size
        val totalItems = itemCount

        Box(
            modifier = modifier
                .width(4.dp)
                .height(200.dp)
                .background(
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                    shape = RoundedCornerShape(2.dp)
                )
        ) {
            val scrollbarHeight = 40.dp
            val scrollbarPosition = remember(firstVisibleItem, visibleItems, totalItems) {
                val scrollableArea = 200.dp - scrollbarHeight
                val scrollPosition = firstVisibleItem.toFloat() / (totalItems - visibleItems).coerceAtLeast(1)
                (scrollableArea * scrollPosition).coerceIn(0.dp, scrollableArea)
            }

            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(scrollbarHeight)
                    .offset(y = scrollbarPosition)
                    .background(
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f),
                        shape = RoundedCornerShape(2.dp)
                    )
            )
        }
    }
}


@Composable
private fun ItemCard(
    item: BorrowingItem,
    isBorrowed: Boolean,
    onItemClick: () -> Unit,
    onGalleryClick: () -> Unit,
    onMessageClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
            .clickable(onClick = onItemClick)
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(24.dp),
                spotColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ),
        shape = RoundedCornerShape(24.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 0.dp,
            pressedElevation = 4.dp,
            hoveredElevation = 8.dp
        ),
        border = BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f)
        )
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(250.dp) // Increased height for better visual impact
            ) {
                // Background image with gradient overlay
                AuthenticatedThumbnailImage(
                    url = item.imageUrls.firstOrNull(),
                    modifier = Modifier.fillMaxSize(),
                    contentDescription = item.name,
                    contentScale = ContentScale.Crop
                )

                // Gradient overlay for better text visibility
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.3f),
                                    Color.Transparent,
                                    Color.Black.copy(alpha = 0.3f)
                                )
                            )
                        )
                )

                // Borrowed overlay with improved styling
                if (isBorrowed) {
                    Surface(
                        modifier = Modifier.fillMaxSize(),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                    ) {
                        Column(
                            modifier = Modifier.fillMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "Currently Borrowed",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.error,
                                fontWeight = FontWeight.Bold
                            )
                            item.borrower?.let { borrower ->
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    // Add borrower avatar if available
                                    borrower.imageUrl?.let { avatarUrl ->
                                        Surface(
                                            modifier = Modifier.size(24.dp),
                                            shape = CircleShape,
                                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary)
                                        ) {
                                            AuthenticatedThumbnailImage(
                                                url = avatarUrl,
                                                contentDescription = "Borrower avatar"
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(8.dp))
                                    }
                                    Text(
                                        text = "by ${borrower.username}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }

                // Enhanced category chip
                Surface(
                    modifier = Modifier
                        .padding(12.dp)
                        .align(Alignment.TopStart),
                    shape = RoundedCornerShape(20.dp),
                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.95f),
                    border = BorderStroke(
                        width = 1.dp,
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Category,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = item.category,
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Enhanced gallery button
                if (item.imageUrls.size > 1) {
                    IconButton(
                        onClick = onGalleryClick,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(12.dp)
                            .size(44.dp)
                            .background(
                                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.95f),
                                shape = CircleShape
                            )
                            .border(
                                width = 1.dp,
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.2f),
                                shape = CircleShape
                            ),
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Collections,
                                contentDescription = "View gallery",
                                modifier = Modifier.size(24.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "${item.imageUrls.size}",
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }

            // Enhanced content section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.name,
                        style = MaterialTheme.typography.titleLarge,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                        fontWeight = FontWeight.Bold
                    )

                    // Add availability status indicator
                    Surface(
                        shape = CircleShape,
                        color = if (!isBorrowed)
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                        else
                            MaterialTheme.colorScheme.error.copy(alpha = 0.1f),
                        modifier = Modifier.padding(start = 8.dp)
                    ) {
                        Text(
                            text = if (!isBorrowed) "Available" else "Borrowed",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (!isBorrowed)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.error
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Location and action buttons
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Location with enhanced styling
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = item.location,
                                style = MaterialTheme.typography.bodyMedium,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Message button with enhanced styling
                    if (!isBorrowed) {
                        Button(
                            onClick = onMessageClick,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            ),
                            contentPadding = PaddingValues(16.dp),
                            elevation = ButtonDefaults.buttonElevation(
                                defaultElevation = 4.dp,
                                pressedElevation = 8.dp
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Message,
                                contentDescription = "Message",
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Contact Owner",
                                style = MaterialTheme.typography.titleMedium,
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
private fun BorrowingHeroSection(
    onNavigateBack: () -> Unit,
    onAddItem: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp),
        color = MaterialTheme.colorScheme.primary
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.primary,
                            MaterialTheme.colorScheme.tertiary
                        )
                    )
                )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.1f),
                                Color.Transparent,
                                Color.Black.copy(alpha = 0.1f)
                            )
                        )
                    )
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                IconButton(
                    onClick = onNavigateBack,
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                            shape = CircleShape
                        )
                        .border(
                            width = 1.dp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.12f),
                            shape = CircleShape
                        )
                ) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        modifier = Modifier.size(20.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Community\nBorrowing Hub",
                            style = MaterialTheme.typography.headlineLarge.copy(
                                fontSize = 28.sp,
                                lineHeight = 34.sp
                            ),
                            color = MaterialTheme.colorScheme.onPrimary,
                            fontWeight = FontWeight.Bold
                        )

                        Column(
                            verticalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            Text(
                                text = "Share resources and build trust",
                                style = MaterialTheme.typography.bodyLarge.copy(
                                    fontSize = 14.sp,
                                    lineHeight = 20.sp
                                ),
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                            )
                            Text(
                                text = "strengthen community",
                                style = MaterialTheme.typography.bodyLarge.copy(
                                    fontSize = 14.sp,
                                    lineHeight = 20.sp
                                ),
                                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.9f)
                            )
                        }
                    }

                    Column(
                        modifier = Modifier.padding(start = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalAlignment = Alignment.End
                    ) {
                        StatItem(
                            count = "200+",
                            label = "Items Shared",
                            alignment = Alignment.End
                        )
                        StatItem(
                            count = "50+",
                            label = "Active Members",
                            alignment = Alignment.End
                        )
                        StatItem(
                            count = "100%",
                            label = "Trust Rate",
                            alignment = Alignment.End
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StatItem(
    count: String,
    label: String,
    alignment: Alignment.Horizontal = Alignment.Start
) {
    Column(
        horizontalAlignment = alignment
    ) {
        Text(
            text = count,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = 16.sp
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f),
            fontSize = 12.sp
        )
    }
}
