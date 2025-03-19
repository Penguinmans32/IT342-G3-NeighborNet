package com.example.neighbornet

import android.app.Activity
import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.outlined.Person
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.neighbornet.auth.AuthViewModel
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.ImeAction
import kotlinx.coroutines.launch
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.filled.Login
import androidx.compose.material.icons.filled.Warning
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.media3.common.BuildConfig
import androidx.compose.animation.core.*
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.graphicsLayer
import com.example.neighbornet.utils.shimmerEffect
import kotlinx.coroutines.delay

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onSignUpClick: () -> Unit,
    onGoogleLogin: () -> Unit = {},
    onGithubLogin: () -> Unit = {},
    onMicrosoftLogin: () -> Unit = {},
    authViewModel: AuthViewModel = viewModel()
) {
    var username by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var isUsernameFocused by remember { mutableStateOf(false) }
    var isPasswordFocused by remember { mutableStateOf(false) }

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

    // Animated scale for the avatar
    val avatarScale by animateFloatAsState(
        targetValue = if (isUsernameFocused || isPasswordFocused) 0.95f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy)
    )

    // Background animation
    val gradient = remember {
        Brush.verticalGradient(
            colors = listOf(
                Color(0xFFF8F9FA),
                Color(0xFFE9ECEF)
            )
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(gradient)
    ) {
        // Floating elements animation
        FloatingElements()

        Scaffold(
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        modifier = Modifier
                            .padding(16.dp)
                            .shimmerEffect(),
                        shape = RoundedCornerShape(12.dp),
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
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(60.dp))

                // Animated Logo Container
                Box(
                    modifier = Modifier
                        .size(140.dp)
                        .scale(avatarScale)
                        .shadow(
                            elevation = 12.dp,
                            shape = CircleShape,
                            spotColor = MaterialTheme.colorScheme.primary
                        )
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.avatar),
                        contentDescription = "Avatar",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                            .border(
                                width = 4.dp,
                                brush = Brush.linearGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primary,
                                        MaterialTheme.colorScheme.tertiary
                                    )
                                ),
                                shape = CircleShape
                            ),
                        contentScale = ContentScale.Crop
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Welcome Text with Animation
                AnimatedVisibility(
                    visible = true,
                    enter = fadeIn() + scaleIn(),
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Welcome Back!",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground,
                            style = MaterialTheme.typography.headlineMedium.copy(
                                shadow = Shadow(
                                    color = Color(0x40000000),
                                    offset = Offset(0f, 2f),
                                    blurRadius = 4f
                                )
                            )
                        )

                        Text(
                            text = "Sign in to continue",
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Enhanced Username Field
                CustomTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = "Username",
                    isFocused = isUsernameFocused,
                    onFocusChange = { isUsernameFocused = it },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Outlined.Person,
                            contentDescription = null,
                            tint = if (isUsernameFocused)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Enhanced Password Field
                CustomTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = "Password",
                    isFocused = isPasswordFocused,
                    onFocusChange = { isPasswordFocused = it },
                    isPassword = true,
                    passwordVisible = isPasswordVisible,
                    onPasswordVisibilityChange = { isPasswordVisible = it },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Outlined.Lock,
                            contentDescription = null,
                            tint = if (isPasswordFocused)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                        )
                    }
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Animated Login Button with Loading State
                Button(
                    onClick = {
                        scope.launch {
                            authViewModel.login(username, password)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp))
                        .shimmerEffect(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    ),
                    shape = RoundedCornerShape(16.dp),
                    enabled = !authState.isLoading
                ) {
                    AnimatedContent(
                        targetState = authState.isLoading,
                        label = "login button content"
                    ) { isLoading ->
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White
                            )
                        } else {
                            Row(
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Login,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    "Log In",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Development Mode Button with Warning Style
                if (BuildConfig.DEBUG) {
                    Button(
                        onClick = onLoginSuccess,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .border(
                                width = 2.dp,
                                color = Color(0xFFFFC107),
                                shape = RoundedCornerShape(8.dp)
                            ),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0x33FFC107)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Color(0xFFFFC107)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "Skip to Home (Dev Only)",
                                fontSize = 16.sp,
                                color = Color(0xFFFFC107)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Enhanced Divider with Social Login Text
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Divider(
                        modifier = Modifier
                            .weight(1f)
                            .height(1.dp)
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        Color.Transparent,
                                        MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f)
                                    )
                                )
                            )
                    )
                    Text(
                        text = "Or continue with",
                        modifier = Modifier.padding(horizontal = 16.dp),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                    Divider(
                        modifier = Modifier
                            .weight(1f)
                            .height(1.dp)
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.onBackground.copy(alpha = 0.2f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Enhanced Social Login Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    EnhancedSocialButton(
                        onClick = { authViewModel.signInWithGoogle(activity) },
                        icon = R.drawable.google_icon,
                        contentDescription = "Google",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )

                    EnhancedSocialButton(
                        onClick = { authViewModel.signInWithGitHub(activity) },
                        icon = R.drawable.github_icon,
                        contentDescription = "GitHub",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )

                    EnhancedSocialButton(
                        onClick = { authViewModel.signInWithMicrosoft(activity) },
                        icon = R.drawable.microsoft_icon,
                        contentDescription = "Microsoft",
                        backgroundColor = Color.White,
                        borderColor = Color(0xFFE0E0E0)
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Enhanced Forgot Password Button
                TextButton(
                    onClick = { /* TODO: Implement forgot password */ },
                    modifier = Modifier
                        .scale(
                            animateFloatAsState(
                                if (isPasswordFocused) 1.05f else 1f,
                                label = "forgot password scale"
                            ).value
                        )
                ) {
                    Text(
                        "Forgot Password?",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }

                // Enhanced Sign Up Button
                TextButton(
                    onClick = onSignUpClick,
                    modifier = Modifier.padding(bottom = 16.dp)
                ) {
                    Text(
                        buildAnnotatedString {
                            append("Don't have an account? ")
                            withStyle(
                                style = SpanStyle(
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            ) {
                                append("Sign up")
                            }
                        },
                        fontSize = 16.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun RowScope.EnhancedSocialButton(
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
private fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    isFocused: Boolean,
    onFocusChange: (Boolean) -> Unit,
    isPassword: Boolean = false,
    passwordVisible: Boolean = false,
    onPasswordVisibilityChange: ((Boolean) -> Unit)? = null,
    leadingIcon: @Composable (() -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = {
            Text(
                text = label,
                color = if (isFocused)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            )
        },
        modifier = Modifier
            .fillMaxWidth()
            .shadow(4.dp, RoundedCornerShape(12.dp))
            .background(Color.White, RoundedCornerShape(12.dp))
            .onFocusChanged { onFocusChange(it.isFocused) },
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedBorderColor = Color(0xFFE0E0E0),
            focusedBorderColor = MaterialTheme.colorScheme.primary
        ),
        singleLine = true,
        leadingIcon = leadingIcon,
        trailingIcon = if (isPassword) {
            {
                IconButton(onClick = { onPasswordVisibilityChange?.invoke(!passwordVisible) }) {
                    Icon(
                        imageVector = if (passwordVisible)
                            Icons.Default.Visibility
                        else
                            Icons.Default.VisibilityOff,
                        contentDescription = if (passwordVisible)
                            "Hide password"
                        else
                            "Show password",
                        tint = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                }
            }
        } else null,
        visualTransformation = if (isPassword && !passwordVisible)
            PasswordVisualTransformation()
        else
            VisualTransformation.None,
        keyboardOptions = KeyboardOptions(
            keyboardType = if (isPassword)
                KeyboardType.Password
            else
                KeyboardType.Text,
            imeAction = ImeAction.Done
        )
    )
}

@Composable
fun FloatingElements() {
    Box(modifier = Modifier.fillMaxSize()) {
        repeat(3) { index ->
            FloatingElement(
                delay = index * 1000L,
                initialOffset = 100f * index
            )
        }
    }
}

@Composable
private fun FloatingElement(delay: Long, initialOffset: Float) {
    var position by remember { mutableStateOf(initialOffset) }

    LaunchedEffect(Unit) {
        delay(delay)
        animate(
            initialValue = -100f,
            targetValue = 100f,
            animationSpec = infiniteRepeatable(
                animation = tween(3000),
                repeatMode = RepeatMode.Reverse
            )
        ) { value, _ -> position = value }
    }

    Box(
        modifier = Modifier
            .offset(y = position.dp)
            .size(40.dp)
            .background(
                MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                CircleShape
            )
    )
}