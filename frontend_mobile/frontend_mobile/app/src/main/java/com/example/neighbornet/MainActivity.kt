package com.example.neighbornet

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.neighbornet.ui.theme.NeighbornetTheme
import kotlinx.coroutines.delay
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.lifecycle.lifecycleScope
import com.example.neighbornet.auth.AuthViewModel
import com.example.neighbornet.network.RetrofitClient
import com.example.neighbornet.network.VerificationRequest
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private var verificationState by mutableStateOf<VerificationState>(VerificationState.Idle)
    private val authViewModel: AuthViewModel by viewModels()

    sealed class VerificationState {
        object Idle : VerificationState()
        object Loading : VerificationState()
        data class Success(val message: String) : VerificationState()
        data class Error(val message: String) : VerificationState()
    }


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            NeighbornetTheme {
                var currentScreen by remember { mutableStateOf("landing") }
                val authState by authViewModel.authState.collectAsState()
                val snackbarHostState = remember { SnackbarHostState() }

                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { padding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(padding)
                    ) {
                        LaunchedEffect(authState.signUpSuccess) {
                            if (authState.signUpSuccess) {
                                currentScreen = "verification"
                                authViewModel.clearSignUpSuccess()
                            }
                        }

                        LaunchedEffect(authState.verificationSuccess) {
                            if (authState.verificationSuccess) {
                                snackbarHostState.showSnackbar("Email verified successfully!")
                                delay(1000)
                                currentScreen = "login"
                            }
                        }

                        when (currentScreen) {
                            "landing" -> LandingPage(
                                onGetStartedClick = { currentScreen = "login" }
                            )
                            "login" -> LoginScreen(
                                onLoginSuccess = { currentScreen = "home" },
                                onSignUpClick = { currentScreen = "signup" }
                            )
                            "signup" -> SignUpScreen(
                                onSignUpSuccess = { }, // Let LaunchedEffect handle navigation
                                onGoogleSignUp = { /* TODO */ },
                                onGithubSignUp = { /* TODO */ },
                                onNavigateToLogin = { currentScreen = "login" }
                            )
                            "verification" -> VerificationScreen(
                                viewModel = authViewModel,
                                onVerificationComplete = { currentScreen = "login" }
                            )
                            "home" -> HomePage()
                        }

                        // Show any errors
                        LaunchedEffect(authState.error) {
                            authState.error?.let { error ->
                                snackbarHostState.showSnackbar(error)
                                authViewModel.clearError()
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent) {
        val uri = intent.data
        if (uri != null && uri.scheme == "neighbornet" && uri.host == "verify") {
            val token = uri.getQueryParameter("token")
            if (token != null) {
                // Use verifyMobileOTP for mobile verification
                authViewModel.verifyMobileOTP(token)
            }
        }
    }

    private fun verifyEmail(token: String) {
        verificationState = VerificationState.Loading

        lifecycleScope.launch {
            try {
                val verificationRequest = VerificationRequest(otp = token)
                val response = RetrofitClient.authService.verifyEmail(verificationRequest)

                if (response.isSuccessful) {
                    verificationState = VerificationState.Success(
                        (response.body() ?: "Email verified successfully!").toString()
                    )
                    // Maybe navigate to login screen after short delay
                    delay(1500)
                    // Update currentScreen or navigate as needed
                } else {
                    verificationState = VerificationState.Error(
                        response.errorBody()?.string() ?: "Verification failed"
                    )
                }
            } catch (e: Exception) {
                verificationState = VerificationState.Error(
                    e.message ?: "An error occurred during verification"
                )
            }
        }
    }
}

@Composable
fun LandingPage(
    isPreview: Boolean = false,
    onGetStartedClick: () -> Unit = {}
) {
    // For preview, we'll show everything immediately
    var isVisible by remember { mutableStateOf(isPreview) }
    var isDescriptionVisible by remember { mutableStateOf(isPreview) }

    // Only trigger animations if not in preview
    if (!isPreview) {
        LaunchedEffect(Unit) {
            delay(300)
            isVisible = true
            delay(300)
            isDescriptionVisible = true
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFFFFFFFF) // Explicit white background
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // Logo
            if (isPreview || isVisible) {
                LogoContainer()
            }

            // Title
            if (isPreview || isVisible) {
                BrandTitle()
            }

            // Description
            if (isPreview || isDescriptionVisible) {
                Description()
            }

            Spacer(modifier = Modifier.weight(1f))

            // Button
            if (isPreview || isDescriptionVisible) {
                ContinueButton(onClick = onGetStartedClick)
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun LogoContainer() {
    Surface(
        modifier = Modifier.size(200.dp),
        shape = RoundedCornerShape(28.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 8.dp
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFF6200EE),
                            Color(0xFF3700B3)
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            // Placeholder text for preview
            Text(
                text = "LOGO",
                color = Color.White,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
fun BrandTitle() {
    Text(
        text = "NeighborNet",
        fontSize = 40.sp,
        fontWeight = FontWeight.ExtraBold,
        color = Color.Black,
        style = MaterialTheme.typography.headlineLarge.copy(
            letterSpacing = (-1).sp
        )
    )
}

@Composable
fun Description() {
    Text(
        text = "Connect with your neighbors, share resources, and build a stronger community together",
        fontSize = 18.sp,
        textAlign = TextAlign.Center,
        color = Color.Black.copy(alpha = 0.8f),
        modifier = Modifier.padding(horizontal = 16.dp),
        style = MaterialTheme.typography.bodyLarge,
        lineHeight = 28.sp,
        fontWeight = FontWeight.Medium
    )
}

@Composable
fun ContinueButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp)
            .clip(RoundedCornerShape(16.dp)),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF6200EE),
            contentColor = Color.White
        ),
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 4.dp,
            pressedElevation = 8.dp,
            hoveredElevation = 6.dp
        )
    ) {
        Text(
            text = "Get Started",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Preview(
    name = "Landing Page",
    device = Devices.PIXEL_4,
    showBackground = true,
    showSystemUi = true
)
@Composable
fun LandingPagePreview() {
    NeighbornetTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            LandingPage(isPreview = true)
        }
    }
}