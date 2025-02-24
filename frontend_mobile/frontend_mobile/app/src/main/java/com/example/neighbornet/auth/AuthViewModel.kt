package com.example.neighbornet.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val error: String? = null,
    val signUpSuccess: Boolean = false,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val verificationSuccess: Boolean = false,
    val verificationMessage: String? = null
)

class AuthViewModel : ViewModel() {
    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    fun login(username: String, password: String) {
        viewModelScope.launch {
            if (username.isBlank() || password.isBlank()) {
                _authState.value = _authState.value.copy(error = "Please fill in all fields")
                return@launch
            }

            _authState.value = _authState.value.copy(isLoading = true, error = null)

            try {
                val response = RetrofitClient.authService.login(LoginRequest(username, password))

                if (response.isSuccessful) {
                    response.body()?.let { apiResponse ->
                        if (apiResponse.success) {
                            apiResponse.data?.let { authResponse ->
                                _authState.value = _authState.value.copy(
                                    isLoading = false,
                                    isLoggedIn = true,
                                    error = null,
                                    accessToken = authResponse.accessToken,
                                    refreshToken = authResponse.refreshToken
                                )
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
                val response = RetrofitClient.authService.signup(
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
                val response = RetrofitClient.authService.verifyEmail(
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