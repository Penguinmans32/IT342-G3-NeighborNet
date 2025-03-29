package com.example.neighbornet.auth

import android.app.Activity
import android.app.Application
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.auth0.jwt.JWT
import com.auth0.jwt.interfaces.DecodedJWT
import com.example.neighbornet.network.*
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import com.example.neighbornet.R
import com.google.firebase.auth.FirebaseUser
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import android.webkit.CookieManager
import android.webkit.WebStorage
import android.webkit.WebView
import com.google.firebase.auth.FirebaseAuth
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

data class AuthState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val error: String? = null,
    val signUpSuccess: Boolean = false,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val verificationSuccess: Boolean = false,
    val verificationMessage: String? = null,
    val userId: Long? = null,
    val username: String? = null
)
@HiltViewModel
class AuthViewModel @Inject constructor(
    application: Application,
    private val tokenManager: TokenManager,
    private val firebaseAuthService: FirebaseAuthService,
    private val authService: AuthService
): AndroidViewModel(application) {
    private val sessionManager = SessionManager(application)
    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState
    private lateinit var googleSignInClient: GoogleSignInClient

    companion object {
        const val RC_SIGN_IN = 9001
    }

    init {
        if (sessionManager.isLoggedIn()) {
            _authState.value = _authState.value.copy(
                isLoggedIn = true,
                accessToken = sessionManager.getAccessToken(),
                refreshToken = sessionManager.getRefreshToken(),
                userId = sessionManager.getUserId(),
                username = sessionManager.getUsername()
            )
        }
    }

    private fun clearAuthData() {
        sessionManager.clearAuthData()
        _authState.value = AuthState() // Reset to initial state
    }

    private fun getCurrentUserId(): Long {
        return sessionManager.getUserId()
    }

    private fun handleLoginSuccess(authResponse: AuthResponse) {
        try {
            Log.d("AuthViewModel", "Handling login success: $authResponse")

            if (authResponse.accessToken.isNullOrBlank()) {
                throw IllegalStateException("Access token is null or empty")
            }

            tokenManager.saveToken(authResponse.accessToken)
            authResponse.username?.let { username ->
                tokenManager.saveCurrentUser(username)
            }

            val savedToken = tokenManager.getToken()
            Log.d("AuthViewModel", "Token saved and retrieved: ${savedToken != null}")

            // Log the token for debugging
            Log.d("AuthViewModel", "Access token: ${authResponse.accessToken}")

            val userId = try {
                extractUserIdFromToken(authResponse.accessToken)
            } catch (e: Exception) {
                Log.e("AuthViewModel", "Failed to extract user ID, using username hash", e)
                authResponse.username?.hashCode()?.toLong() ?: throw e
            }
            tokenManager.saveCurrentUserId(userId)
            Log.d("AuthViewModel", "Using user ID: $userId")

            sessionManager.saveAuthData(
                userId = userId,
                accessToken = authResponse.accessToken,
                refreshToken = authResponse.refreshToken,
                username = authResponse.username
            )

            _authState.value = _authState.value.copy(
                isLoading = false,
                isLoggedIn = true,
                error = null,
                accessToken = authResponse.accessToken,
                refreshToken = authResponse.refreshToken,
                userId = userId,
                username = authResponse.username
            )
        } catch (e: Exception) {
            Log.e("AuthViewModel", "Error in handleLoginSuccess", e)
            _authState.value = _authState.value.copy(
                isLoading = false,
                error = "Login processing failed: ${e.message}"
            )
        }
    }

    private fun extractUserIdFromToken(token: String): Long {
        return try {
            val decodedJWT: DecodedJWT = JWT.decode(token)

            Log.d("AuthViewModel", "Token claims: ${decodedJWT.claims.map { "${it.key}: ${it.value.asString()}" }}")

            val userId = decodedJWT.getClaim("user_id").asLong()
                ?: decodedJWT.getClaim("sub").asString()?.toLongOrNull()
                ?: decodedJWT.getClaim("id").asLong()

            if (userId == null || userId <= 0) {
                val stringUserId = decodedJWT.getClaim("user_id").asString()
                    ?: decodedJWT.getClaim("sub").asString()
                    ?: decodedJWT.getClaim("id").asString()

                stringUserId?.toLongOrNull() ?: throw Exception("No valid user ID found in token")
            } else {
                userId
            }
        } catch (e: Exception) {
            Log.e("AuthViewModel", "Error extracting user ID from token: ${e.message}")
            Log.e("AuthViewModel", "Token: $token")
            throw IllegalStateException("Invalid user ID in token")
        }
    }

    fun logout() {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)

                val userId = getCurrentUserId()
                Log.d("AuthViewModel", "Logging out user with ID: $userId")

                tokenManager.clearToken()

                try {
                    sessionManager.clearAuthData()
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error clearing session data", e)
                }

                try {
                    if (::googleSignInClient.isInitialized) {
                        googleSignInClient.signOut().await()
                        googleSignInClient.revokeAccess().await()
                    }
                    Log.d("AuthViewModel", "Google Sign-out successful")
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error signing out from Google", e)
                }

                try {
                    FirebaseAuth.getInstance().signOut()
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error signing out from Firebase", e)
                }

                try {
                    getApplication<Application>().applicationContext?.let { context ->
                        clearWebViewData(context)
                    }
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error clearing WebView data", e)
                }

                try {
                    val response = authService.logout(LogOutRequest(userId))
                    if (response.isSuccessful) {
                        Log.d("AuthViewModel", "Server-side logout successful")
                    }
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error during server-side logout", e)
                }

                _authState.value = AuthState()

                try {
                    initGoogleSignIn(getApplication())
                } catch (e: Exception) {
                    Log.e("AuthViewModel", "Error reinitializing Google Sign-In", e)
                }

            } catch (e: Exception) {
                Log.e("AuthViewModel", "Error during logout", e)
                try {
                    tokenManager.clearToken()
                    sessionManager.clearAuthData()
                    _authState.value = AuthState()
                } catch (e2: Exception) {
                    Log.e("AuthViewModel", "Error in final cleanup", e2)
                }
            }
        }
    }

    fun initGoogleSignIn(activity: Activity) {
        try {
            // Log for debugging
            val webClientId = activity.getString(R.string.default_web_client_id)
            Log.d("AuthViewModel", "Using web client ID: $webClientId")

            val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(webClientId)
                .requestEmail()
                .requestProfile()
                .build()

            googleSignInClient = GoogleSignIn.getClient(activity, gso)
            Log.d("AuthViewModel", "Google Sign-In initialized successfully")
        } catch (e: Exception) {
            Log.e("AuthViewModel", "Error initializing Google Sign-In", e)
            val errorMessage = "Failed to initialize Google Sign-In: ${e.message}\n" +
                    "Cause: ${e.cause?.message}"
            _authState.value = _authState.value.copy(
                error = errorMessage
            )
        }
    }

    private fun clearWebViewData(context: Context) {
        try {
            CookieManager.getInstance().removeAllCookies(null)
            CookieManager.getInstance().flush()

            WebStorage.getInstance().deleteAllData()

            context.deleteDatabase("webview.db")
            context.deleteDatabase("webviewCache.db")

            context.deleteDatabase("webviewCookiesChromium.db")

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                WebView(context).clearCache(true)
            }
        } catch (e: Exception) {
            Log.e("AuthViewModel", "Error clearing WebView data", e)
        }
    }


    fun signInWithGoogle(activity: Activity) {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)

                if (!::googleSignInClient.isInitialized) {
                    initGoogleSignIn(activity)
                }

                try {
                    googleSignInClient.signOut().await()
                } catch (e: Exception) {
                    Log.w("AuthViewModel", "Error clearing previous session", e)
                }

                val signInIntent = googleSignInClient.signInIntent
                activity.startActivityForResult(signInIntent, RC_SIGN_IN)

            } catch (e: Exception) {
                Log.e("AuthViewModel", "Error in Google Sign-In", e)
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = "Google Sign-In failed: ${e.message}"
                )
            }
        }
    }

    fun handleSocialLogin(firebaseUser: FirebaseUser) {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)
                val idToken = firebaseUser.getIdToken(false).await().token

                // Add debug logging
                Log.d("AuthViewModel", "Firebase ID Token: $idToken")

                val response = authService.firebaseLogin(
                    FirebaseTokenRequest(token = idToken!!)
                )

                // Add debug logging for response
                Log.d("AuthViewModel", "Response successful: ${response.isSuccessful}")
                Log.d("AuthViewModel", "Response body: ${response.body()}")

                response.handleResponse(
                    onSuccess = { authResponse ->
                        // Add null checks
                        if (authResponse.accessToken.isNullOrBlank()) {
                            throw IllegalStateException("Server returned null or empty access token")
                        }

                        Log.d("AuthViewModel", "Auth Response received: $authResponse")
                        handleLoginSuccess(authResponse)
                    },
                    onError = { errorMessage ->
                        Log.e("AuthViewModel", "Login error: $errorMessage")
                        _authState.value = _authState.value.copy(
                            isLoading = false,
                            error = errorMessage
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e("AuthViewModel", "Login failed", e)
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Authentication failed"
                )
            }
        }
    }

    fun signInWithGitHub(activity: Activity) {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)
                val firebaseUser = firebaseAuthService.signInWithGitHub(activity)
                firebaseUser?.let { user ->
                    handleSocialLogin(user)
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun signInWithMicrosoft(activity: Activity) {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)
                val firebaseUser = firebaseAuthService.signInWithMicrosoft(activity)
                firebaseUser?.let { user ->
                    handleSocialLogin(user)
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun handleGoogleSignInResult(account: GoogleSignInAccount?) {
        viewModelScope.launch {
            try {
                _authState.value = _authState.value.copy(isLoading = true)
                account?.let {
                    val firebaseUser = firebaseAuthService.signInWithGoogle(it)
                    firebaseUser?.let { user ->
                        handleSocialLogin(user)
                    }
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Google sign in failed"
                )
            }
        }
    }


    fun login(username: String, password: String) {
        viewModelScope.launch {
            if (username.isBlank() || password.isBlank()) {
                _authState.value = _authState.value.copy(error = "Please fill in all fields")
                return@launch
            }

            _authState.value = _authState.value.copy(isLoading = true, error = null)

            try {
                val response = authService.login(LoginRequest(username, password))

                if (response.isSuccessful) {
                    response.body()?.let { apiResponse ->
                        if (apiResponse.success) {
                            apiResponse.data?.let { authResponse ->
                                handleLoginSuccess(authResponse)
                            }
                        } else {
                            _authState.value = _authState.value.copy(
                                isLoading = false,
                                error = apiResponse.message
                            )
                        }
                    }
                } else {
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = response.errorBody()?.string() ?: "Login failed"
                    )
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Network error occurred"
                )
            }
        }
    }

    fun signup(email: String, username: String, password: String, confirmPassword: String) {
        viewModelScope.launch {
            if (email.isBlank() || username.isBlank() || password.isBlank() || confirmPassword.isBlank()) {
                _authState.value = AuthState(error = "Please fill in all fields")
                return@launch
            }

            if (!isValidEmail(email)) {
                _authState.value = AuthState(error = "Invalid email format")
                return@launch
            }

            if (password != confirmPassword) {
                _authState.value = AuthState(error = "Passwords do not match")
                return@launch
            }

            if (password.length < 6) {
                _authState.value = AuthState(error = "Password must be at least 6 characters")
                return@launch
            }

            _authState.value = _authState.value.copy(isLoading = true, error = null)

            try {
                val response = authService.signup(
                    SignupRequest(username, email, password)
                )

                if (response.isSuccessful) {
                    response.body()?.let { apiResponse ->
                        if (apiResponse.success) {
                            _authState.value = _authState.value.copy(
                                isLoading = false,
                                signUpSuccess = true,
                                error = null
                            )
                        } else {
                            _authState.value = _authState.value.copy(
                                isLoading = false,
                                error = apiResponse.message
                            )
                        }
                    }
                } else {
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = response.errorBody()?.string() ?: "Sign up failed"
                    )
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Network error occurred"
                )
            }
        }
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
    }

    fun clearSignUpSuccess() {
        _authState.value = _authState.value.copy(signUpSuccess = false)
    }

    fun verifyMobileOTP(otp: String) {
        viewModelScope.launch {
            if (otp.length != 6) {
                _authState.value = _authState.value.copy(
                    error = "Please enter a valid 6-digit code"
                )
                return@launch
            }

            _authState.value = _authState.value.copy(isLoading = true, error = null)

            try {
                val response = authService.verifyEmail(
                    VerificationRequest(otp = otp)
                )

                if (response.isSuccessful) {
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        verificationSuccess = true,
                        error = null
                    )
                } else {
                    _authState.value = _authState.value.copy(
                        isLoading = false,
                        error = response.errorBody()?.string() ?: "Invalid verification code"
                    )
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Network error occurred"
                )
            }
        }
    }
}