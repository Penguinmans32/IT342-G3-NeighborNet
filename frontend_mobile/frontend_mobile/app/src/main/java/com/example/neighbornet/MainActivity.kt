package com.example.neighbornet

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
import kotlinx.coroutines.launch
import androidx.compose.ui.res.painterResource
import android.util.Log
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import dagger.hilt.android.AndroidEntryPoint
import androidx.navigation.compose.composable
import androidx.navigation.NavType
import androidx.navigation.navArgument

@AndroidEntryPoint
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
        authViewModel.initGoogleSignIn(this)

        FirebaseAuth.getInstance().addAuthStateListener { firebaseAuth ->
            firebaseAuth.currentUser?.let { user ->
                lifecycleScope.launch {
                    authViewModel.handleSocialLogin(user)
                }
            }
        }

        setContent {
            NeighbornetTheme {
                val snackbarHostState = remember { SnackbarHostState() }
                var currentScreen by remember { mutableStateOf("landing") }
                val authState by authViewModel.authState.collectAsState()
                val navController = rememberNavController()

                LaunchedEffect(authState.isLoggedIn) {
                    if (!authState.isLoggedIn && currentScreen == "home") {
                        currentScreen = "login"
                        snackbarHostState.showSnackbar("Logged out successfully")
                    }
                }

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
                                onSignUpClick = { currentScreen = "signup" },
                                onGoogleLogin = { /* TODO */ },
                                onGithubLogin = { /* TODO */ },
                                onMicrosoftLogin = { /* TODO */ }
                            )
                            "signup" -> SignUpScreen(
                                onSignUpSuccess = { }, // Let LaunchedEffect handle navigation
                                onGoogleSignUp = { /* TODO */ },
                                onGithubSignUp = { /* TODO */ },
                                onMicrosoftSignUp = { /* TODO */ },
                                onNavigateToLogin = { currentScreen = "login" }
                            )
                            "verification" -> VerificationScreen(
                                viewModel = authViewModel,
                                onVerificationComplete = { currentScreen = "login" }
                            )
                            "home" -> {
                                NavHost(
                                    navController = navController,
                                    startDestination = Screen.Home.route
                                ) {
                                    composable(Screen.Home.route) {
                                        CompositionLocalProvider(
                                            LocalViewModelStoreOwner provides this@MainActivity
                                        ) {
                                            HomePage(navController = navController)
                                        }
                                    }
                                    composable(
                                        route = Screen.ClassDetails.route,
                                        arguments = listOf(
                                            navArgument("classId") {
                                                type = NavType.LongType
                                                nullable = false
                                                defaultValue = -1L
                                            }
                                        )
                                    ) { backStackEntry ->
                                        val classId = backStackEntry.arguments?.getLong("classId") ?: return@composable
                                        CompositionLocalProvider(
                                            LocalViewModelStoreOwner provides this@MainActivity
                                        ) {
                                            ClassDetailsScreen(
                                                classId = classId,
                                                onBackClick = { navController.navigateUp() }
                                            )
                                        }
                                    }
                                    composable(Screen.Categories.route) {
                                        CategoriesContent(
                                            onCategoryClick = { category ->
                                                // Handle category navigation
                                            }
                                        )
                                    }
                                    composable(Screen.Chat.route) {
                                        ChatContent()
                                    }
                                    composable(Screen.Profile.route) {
                                        ProfileContent(
                                            onLogoutSuccess = {
                                                currentScreen = "login"
                                            }
                                        )
                                    }
                                }
                            }
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
                authViewModel.verifyMobileOTP(token)
            }
        }
    }


    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == AuthViewModel.RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                authViewModel.handleGoogleSignInResult(account)
            } catch (e: ApiException) {
                Log.w("MainActivity", "Google sign in failed", e)
            }
        }
    }
}

@Composable
fun LandingPage(
    isPreview: Boolean = false,
    onGetStartedClick: () -> Unit = {}
) {
    var isVisible by remember { mutableStateOf(isPreview) }
    var isDescriptionVisible by remember { mutableStateOf(isPreview) }

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
        color = Color(0xFFFFFFFF)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (isPreview || isVisible) {
                Image(
                    painter = painterResource(id = R.drawable.logo),
                    contentDescription = "App Logo",
                    modifier = Modifier
                        .size(180.dp)
                        .padding(bottom = 24.dp)
                )

                Text(
                    text = "NeighborNet",
                    fontSize = 36.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF1976D2),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            if (isPreview || isDescriptionVisible) {
                Text(
                    text = "Connect with your neighbors, share resources, and build a stronger community together",
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                    color = Color(0xFF757575),
                    modifier = Modifier.padding(horizontal = 16.dp),
                    lineHeight = 24.sp,
                    fontWeight = FontWeight.Medium
                )

                Spacer(modifier = Modifier.height(32.dp))

                Button(
                    onClick = onGetStartedClick,
                    modifier = Modifier
                        .fillMaxWidth(0.85f)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF2196F3)
                    ),
                    shape = RoundedCornerShape(28.dp),
                    elevation = ButtonDefaults.buttonElevation(
                        defaultElevation = 4.dp,
                        pressedElevation = 8.dp
                    )
                ) {
                    Text(
                        text = "Get Started",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
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