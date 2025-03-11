package com.example.neighbornet

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.auth.rememberAuthViewModel
import kotlinx.coroutines.launch

@Composable
fun HomePage() {
    var selectedTab by remember { mutableStateOf(0) }
    var selectedCategory by remember { mutableStateOf<String?>(null) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_home),
                            contentDescription = "Home"
                        )
                    },
                    label = { Text("Home") }
                )
                
                // Add Categories tab
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_category),
                            contentDescription = "Categories"
                        )
                    },
                    label = { Text("Categories") }
                )

                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chat),
                            contentDescription = "Chat"
                        )
                    },
                    label = { Text("Chat") }
                )

                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_profile),
                            contentDescription = "Profile"
                        )
                    },
                    label = { Text("Profile") }
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
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
                        0 -> HomeContent()
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

@Composable
fun HomeContent() {
    // TODO: Implement home content
}

@Composable
fun CategoriesContent(
    onCategoryClick: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // All Classes category
        CategoryItem(
            title = "All Classes",
            icon = R.drawable.ic_category,
            backgroundColor = Color(0xFFF3E5F5),  // Light purple background
            onClick = { onCategoryClick("All Classes") }
        )

        // Programming category
        CategoryItem(
            title = "Programming",
            icon = R.drawable.ic_code,
            backgroundColor = Color(0xFFE3F2FD),  // Light blue background
            onClick = { onCategoryClick("Programming") }
        )

        // Design category
        CategoryItem(
            title = "Design",
            icon = R.drawable.ic_design,
            backgroundColor = Color(0xFFE8F5E9),  // Light green background
            onClick = { onCategoryClick("Design") }
        )

        // Business category
        CategoryItem(
            title = "Business",
            icon = R.drawable.ic_business,
            backgroundColor = Color(0xFFFFF3E0),  // Light orange background
            onClick = { onCategoryClick("Business") }
        )

        // Marketing category
        CategoryItem(
            title = "Marketing",
            icon = R.drawable.ic_marketing,
            backgroundColor = Color(0xFFFFEBEE),  // Light red background
            onClick = { onCategoryClick("Marketing") }
        )

        // Photography category
        CategoryItem(
            title = "Photography",
            icon = R.drawable.ic_camera,
            backgroundColor = Color(0xFFE0F7FA),  // Light cyan background
            onClick = { onCategoryClick("Photography") }
        )

        // Music category
        CategoryItem(
            title = "Music",
            icon = R.drawable.ic_music,
            backgroundColor = Color(0xFFF3E5F5),  // Light purple background
            onClick = { onCategoryClick("Music") }
        )

        // Writing category
        CategoryItem(
            title = "Writing",
            icon = R.drawable.ic_edit,
            backgroundColor = Color(0xFFFCE4EC),  // Light pink background
            onClick = { onCategoryClick("Writing") }
        )
    }
}

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
    authViewModel: AuthViewModel = rememberAuthViewModel(),
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