package com.example.neighbornet

import android.app.Activity
import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.neighbornet.auth.AuthViewModel
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.SportsBasketball
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Person
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.composed
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import com.example.neighbornet.utils.shimmerEffect
import kotlinx.coroutines.delay


@Composable
fun SignUpScreen(
    onLoginSuccess: () -> Unit,
    onSignUpSuccess: () -> Unit,
    onGoogleSignUp: () -> Unit,
    onGithubSignUp: () -> Unit,
    onMicrosoftSignUp: () -> Unit,
    onNavigateToLogin: () -> Unit,
    authViewModel: AuthViewModel = viewModel()
) {
    var email by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val authState by authViewModel.authState.collectAsState()
    val context = LocalContext.current
    val activity = remember { context as Activity }

    LaunchedEffect(authState.isLoggedIn) {
        if (authState.isLoggedIn) {
            onLoginSuccess()
        }
    }

    LaunchedEffect(authState.error) {
        authState.error?.let { error ->
            snackbarHostState.showSnackbar(
                message = error,
                duration = SnackbarDuration.Short
            )
            authViewModel.clearError()
        }
    }


    val scale = remember { Animatable(0.95f) }
    LaunchedEffect(Unit) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFFE3F2FD),  // Light blue
                        Color(0xFFBBDEFB),  // Lighter blue
                        Color(0xFFF8F9FA)   // Almost white
                    )
                )
            )
    ) {

        WaveBackground()

        FloatingLearningObjects()

        Scaffold(
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        modifier = Modifier.padding(16.dp),
                        shape = RoundedCornerShape(8.dp),
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
                        snackbarData = data
                    )
                }
            },
            containerColor = Color.Transparent
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(horizontal = 24.dp)
                    .scale(scale.value)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(40.dp))

                // Animated Logo/Avatar with shadow
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .shadow(
                            elevation = 8.dp,
                            shape = CircleShape,
                            spotColor = Color(0xFF2196F3)
                        )
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.avatar),
                        contentDescription = "Avatar",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                            .border(
                                width = 3.dp,
                                color = Color(0xFF2196F3),
                                shape = CircleShape
                            ),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Animated Welcome Text
                Text(
                    text = "Create Account",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1A1A1A),
                    style = MaterialTheme.typography.headlineMedium.copy(
                        shadow = Shadow(
                            color = Color(0x40000000),
                            offset = Offset(0f, 2f),
                            blurRadius = 4f
                        )
                    )
                )

                Text(
                    text = "Join our community today!",
                    fontSize = 16.sp,
                    color = Color(0xFF666666),
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Stylized Input Fields
                CustomTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "Email",
                    leadingIcon = {
                        Icon(
                            Icons.Outlined.Email,
                            contentDescription = null,
                            tint = Color(0xFF2196F3)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                CustomTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = "Username",
                    leadingIcon = {
                        Icon(
                            Icons.Outlined.Person,
                            contentDescription = null,
                            tint = Color(0xFF2196F3)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = "Password",
                    isPassword = true,
                    leadingIcon = {
                        Icon(
                            Icons.Outlined.Lock,
                            contentDescription = null,
                            tint = Color(0xFF2196F3)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                CustomTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = "Confirm Password",
                    isPassword = true,
                    leadingIcon = {
                        Icon(
                            Icons.Outlined.Lock,
                            contentDescription = null,
                            tint = Color(0xFF2196F3)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Animated Sign Up Button
                Button(
                    onClick = {
                        scope.launch {
                            authViewModel.signup(email, username, password, confirmPassword)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp))
                        .shimmerEffect(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2196F3)
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    if (authState.isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Text(
                            "Create Account",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Stylized Divider
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Divider(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFFE0E0E0)
                    )
                    Text(
                        text = "Or continue with",
                        modifier = Modifier.padding(horizontal = 16.dp),
                        color = Color(0xFF666666),
                        fontSize = 14.sp
                    )
                    Divider(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFFE0E0E0)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Enhanced Social Login Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    SocialButton(
                        onClick = { authViewModel.signInWithGoogle(activity) },
                        icon = R.drawable.google_icon,
                        contentDescription = "Google",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )

                    SocialButton(
                        onClick = { authViewModel.signInWithGitHub(activity) },
                        icon = R.drawable.github_icon,
                        contentDescription = "GitHub",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )

                    SocialButton(
                        onClick = { authViewModel.signInWithMicrosoft(activity) },
                        icon = R.drawable.microsoft_icon,
                        contentDescription = "Microsoft",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Enhanced Login Link
                TextButton(
                    onClick = onNavigateToLogin,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Text(
                        buildAnnotatedString {
                            append("Already have an account? ")
                            withStyle(
                                style = SpanStyle(
                                    color = Color(0xFF2196F3),
                                    fontWeight = FontWeight.Bold
                                )
                            ) {
                                append("Log in")
                            }
                        },
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

// Custom TextField Component
@Composable
private fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    isPassword: Boolean = false,
    leadingIcon: @Composable (() -> Unit)? = null
) {
    var passwordVisible by remember { mutableStateOf(false) }

    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(12.dp))
            .background(Color.White, RoundedCornerShape(12.dp)),
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedBorderColor = Color(0xFFE0E0E0),
            focusedBorderColor = Color(0xFF2196F3)
        ),
        singleLine = true,
        leadingIcon = leadingIcon,
        trailingIcon = if (isPassword) {
            {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        if (passwordVisible) Icons.Filled.Visibility
                        else Icons.Filled.VisibilityOff,
                        contentDescription = null,
                        tint = Color(0xFF666666)
                    )
                }
            }
        } else null,
        visualTransformation = if (isPassword && !passwordVisible)
            PasswordVisualTransformation() else VisualTransformation.None
    )
}

// Social Button Component
@Composable
fun RowScope.SocialButton(
    onClick: () -> Unit,
    @DrawableRes icon: Int,
    contentDescription: String,
    backgroundColor: Color,
    borderColor: Color
) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .weight(1f)
            .height(48.dp)
            .shadow(4.dp, RoundedCornerShape(12.dp)),
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor
        ),
        border = BorderStroke(1.dp, borderColor),
        shape = RoundedCornerShape(12.dp)
    ) {
        Image(
            painter = painterResource(id = icon),
            contentDescription = contentDescription,
            modifier = Modifier
                .size(24.dp)
                .scale(
                    animateFloatAsState(
                        if (remember { mutableStateOf(false) }.value) 0.95f else 1f,
                        label = "social button scale"
                    ).value
                )
        )
    }
}

@Composable
fun FloatingLearningObjects() {
    Box(modifier = Modifier.fillMaxSize()) {
        // Define learning-themed icons to use
        val learningIcons = listOf(
            Icons.Default.Book,
            Icons.Default.School,
            Icons.Default.MusicNote,
            Icons.Default.SportsBasketball,
            Icons.Default.Palette,
            Icons.Default.Science,
            Icons.Default.Calculate
        )

        repeat(7) { index ->
            FloatingLearningObject(
                delay = index * 800L,
                icon = learningIcons[index % learningIcons.size],
                size = (32 + (index % 3) * 8).dp,
                offsetX = index * 70f,
                offsetY = 100f + index * 120f,
                rotation = index * 30f
            )
        }
    }
}

@Composable
fun FloatingLearningObject(
    delay: Long,
    icon: ImageVector,
    size: Dp,
    offsetX: Float,
    offsetY: Float,
    rotation: Float
) {
    var yPosition by remember { mutableStateOf(offsetY) }
    var xPosition by remember { mutableStateOf(offsetX) }
    var currentRotation by remember { mutableStateOf(rotation) }

    // Define colors for different learning objects
    val iconColors = listOf(
        Color(0xFF2196F3),  // Blue
        Color(0xFF4CAF50),  // Green
        Color(0xFFFFC107),  // Amber
        Color(0xFFE91E63),  // Pink
        Color(0xFF9C27B0)   // Purple
    )

    val iconColor = iconColors[(delay % iconColors.size).toInt()]

    LaunchedEffect(Unit) {
        delay(delay)

        // Vertical floating animation
        launch {
            animate(
                initialValue = yPosition,
                targetValue = yPosition - 50f,
                animationSpec = infiniteRepeatable(
                    animation = tween(2000 + (delay % 1000).toInt()),
                    repeatMode = RepeatMode.Reverse
                )
            ) { value, _ -> yPosition = value }
        }

        // Horizontal floating animation
        launch {
            animate(
                initialValue = xPosition,
                targetValue = xPosition + 30f,
                animationSpec = infiniteRepeatable(
                    animation = tween(3000 + (delay % 1500).toInt()),
                    repeatMode = RepeatMode.Reverse
                )
            ) { value, _ -> xPosition = value }
        }

        // Rotation animation
        launch {
            animate(
                initialValue = currentRotation,
                targetValue = currentRotation + 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(10000 + (delay % 5000).toInt()),
                    repeatMode = RepeatMode.Restart
                )
            ) { value, _ -> currentRotation = value }
        }
    }

    Box(
        modifier = Modifier
            .offset(x = xPosition.dp, y = yPosition.dp)
            .size(size)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = "Learning Object",
            tint = iconColor.copy(alpha = 0.65f),
            modifier = Modifier
                .size(size)
                .graphicsLayer {
                    rotationZ = currentRotation
                    alpha = 0.65f
                }
        )
    }
}