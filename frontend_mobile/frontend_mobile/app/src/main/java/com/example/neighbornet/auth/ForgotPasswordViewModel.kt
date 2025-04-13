package com.example.neighbornet.auth

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.ForgotPasswordRequest
import com.example.neighbornet.network.ResetPasswordRequest
import com.example.neighbornet.network.Resource
import com.example.neighbornet.network.VerifyOtpRequest
import com.example.neighbornet.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.regex.Pattern
import javax.inject.Inject


@HiltViewModel
class ForgotPasswordViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    // UI State for forgot password flow
    private val _uiState = MutableStateFlow<ForgotPasswordUiState>(ForgotPasswordUiState.Initial)
    val uiState: StateFlow<ForgotPasswordUiState> = _uiState.asStateFlow()

    // Email validation state
    private val _emailError = MutableStateFlow<String?>(null)
    val emailError: StateFlow<String?> = _emailError.asStateFlow()

    // OTP validation state
    private val _otpError = MutableStateFlow<String?>(null)
    val otpError: StateFlow<String?> = _otpError.asStateFlow()

    // Password validation state
    private val _passwordError = MutableStateFlow<String?>(null)
    val passwordError: StateFlow<String?> = _passwordError.asStateFlow()

    // OTP resend timer
    private val _resendTimer = MutableStateFlow(30)
    val resendTimer: StateFlow<Int> = _resendTimer.asStateFlow()

    // Can resend OTP
    private val _canResend = MutableStateFlow(true)
    val canResend: StateFlow<Boolean> = _canResend.asStateFlow()

    // OAuth provider
    private val _oauthProvider = MutableStateFlow<String?>(null)
    val oauthProvider: StateFlow<String?> = _oauthProvider.asStateFlow()

    // Current stage
    private val _currentStage = MutableStateFlow(1)
    val currentStage: StateFlow<Int> = _currentStage.asStateFlow()

    // OTP digits
    private val _otpDigits = MutableStateFlow(listOf("", "", "", "", "", ""))
    val otpDigits: StateFlow<List<String>> = _otpDigits.asStateFlow()

    // Email
    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    fun updateEmail(email: String) {
        _email.value = email
        _emailError.value = null
    }

    fun updateOtpDigit(index: Int, value: String) {
        val currentOtp = _otpDigits.value?.toMutableList() ?: mutableListOf()
        if (index in currentOtp.indices) {
            currentOtp[index] = value
            _otpDigits.value = currentOtp
        }
        _otpError.value = null
    }

    fun isValidEmail(email: String): Boolean {
        val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        val pattern = Pattern.compile(emailRegex)
        return pattern.matcher(email).matches()
    }

    fun sendResetEmail() {
        val userEmail = email.value ?: ""

        if (!isValidEmail(userEmail)) {
            _emailError.value = "Please enter a valid email address"
            return
        }

        _uiState.value = ForgotPasswordUiState.Loading

        viewModelScope.launch {
            try {
                // First check if the email is associated with OAuth
                val providerResponse = authRepository.checkAuthProvider(userEmail)

                when (providerResponse) {
                    is Resource.Success -> {
                        val provider = providerResponse.data
                        if (provider == "google" || provider == "github" || provider == "microsoft") {
                            _oauthProvider.value = provider
                            _uiState.value = ForgotPasswordUiState.OAuthAccount(provider)
                            return@launch
                        }

                        // If not OAuth, proceed with password reset
                        val response = authRepository.forgotPassword(ForgotPasswordRequest(userEmail))
                        when (response) {
                            is Resource.Success -> {
                                _currentStage.value = 2
                                _uiState.value = ForgotPasswordUiState.OtpSent
                            }
                            is Resource.Error -> {
                                _emailError.value = response.message ?: "Failed to send OTP. Please try again."
                                _uiState.value = ForgotPasswordUiState.Error(response.message ?: "Unknown error")
                            }
                        }
                    }
                    is Resource.Error -> {
                        _emailError.value = "Failed to check account type. Please try again."
                        _uiState.value = ForgotPasswordUiState.Error("Failed to check account type")
                    }
                }
            } catch (e: Exception) {
                Log.e("ForgotPasswordVM", "Error sending reset email", e)
                _emailError.value = "An unexpected error occurred. Please try again."
                _uiState.value = ForgotPasswordUiState.Error("An unexpected error occurred")
            }
        }
    }

    fun verifyOtp() {
        val otpDigits = _otpDigits.value ?: return
        val otpValue = otpDigits.joinToString("")
        val userEmail = _email.value ?: return

        if (otpValue.length != 6) {
            _otpError.value = "Please enter the complete OTP"
            return
        }

        _uiState.value = ForgotPasswordUiState.Loading

        viewModelScope.launch {
            try {
                val response = authRepository.verifyOtp(
                    VerifyOtpRequest(
                    email = userEmail,
                    otp = otpValue
                )
                )

                when (response) {
                    is Resource.Success -> {
                        _currentStage.value = 3
                        _uiState.value = ForgotPasswordUiState.OtpVerified
                    }
                    is Resource.Error -> {
                        _otpError.value = "Invalid OTP. Please try again."
                        _uiState.value = ForgotPasswordUiState.Error("Invalid OTP")
                    }
                }
            } catch (e: Exception) {
                Log.e("ForgotPasswordVM", "Error verifying OTP", e)
                _otpError.value = "An unexpected error occurred. Please try again."
                _uiState.value = ForgotPasswordUiState.Error("An unexpected error occurred")
            }
        }
    }

    fun resetPassword(currentPassword: String, newPassword: String, confirmPassword: String) {
        if (newPassword != confirmPassword) {
            _passwordError.value = "Passwords do not match"
            return
        }

        if (newPassword.length < 8) {
            _passwordError.value = "Password must be at least 8 characters long"
            return
        }

        val otpValue = _otpDigits.value?.joinToString("") ?: return
        val userEmail = _email.value ?: return

        _uiState.value = ForgotPasswordUiState.Loading

        viewModelScope.launch {
            try {
                val response = authRepository.resetPassword(
                    ResetPasswordRequest(
                    email = userEmail,
                    otp = otpValue,
                    currentPassword = currentPassword,
                    newPassword = newPassword
                )
                )

                when (response) {
                    is Resource.Success -> {
                        _uiState.value = ForgotPasswordUiState.PasswordReset
                    }
                    is Resource.Error -> {
                        _passwordError.value = response.message ?: "Failed to reset password"
                        _uiState.value = ForgotPasswordUiState.Error(response.message ?: "Failed to reset password")
                    }
                }
            } catch (e: Exception) {
                Log.e("ForgotPasswordVM", "Error resetting password", e)
                _passwordError.value = "An unexpected error occurred. Please try again."
                _uiState.value = ForgotPasswordUiState.Error("An unexpected error occurred")
            }
        }
    }

    fun resendOtp() {
        if (_canResend.value != true) return

        _canResend.value = false
        _uiState.value = ForgotPasswordUiState.Loading

        viewModelScope.launch {
            try {
                val userEmail = _email.value ?: return@launch

                val response = authRepository.forgotPassword(ForgotPasswordRequest(userEmail))

                when (response) {
                    is Resource.Success -> {
                        _uiState.value = ForgotPasswordUiState.OtpSent

                        // Clear OTP fields
                        _otpDigits.value = listOf("", "", "", "", "", "")

                        // Start countdown timer
                        startResendTimer()
                    }
                    is Resource.Error -> {
                        _otpError.value = "Failed to resend OTP. Please try again."
                        _uiState.value = ForgotPasswordUiState.Error("Failed to resend OTP")
                        _canResend.value = true
                    }
                }
            } catch (e: Exception) {
                Log.e("ForgotPasswordVM", "Error resending OTP", e)
                _otpError.value = "An unexpected error occurred. Please try again."
                _uiState.value = ForgotPasswordUiState.Error("An unexpected error occurred")
                _canResend.value = true
            }
        }
    }

    private fun startResendTimer() {
        viewModelScope.launch {
            _resendTimer.value = 30

            while (_resendTimer.value!! > 0) {
                kotlinx.coroutines.delay(1000)
                _resendTimer.value = _resendTimer.value!! - 1
            }

            _canResend.value = true
        }
    }

    fun resetForm() {
        _currentStage.value = 1
        _email.value = ""
        _otpDigits.value = listOf("", "", "", "", "", "")
        _emailError.value = null
        _otpError.value = null
        _passwordError.value = null
        _oauthProvider.value = null
        _uiState.value = ForgotPasswordUiState.Initial
        _canResend.value = true
    }
}

sealed class ForgotPasswordUiState {
    object Initial : ForgotPasswordUiState()
    object Loading : ForgotPasswordUiState()
    object OtpSent : ForgotPasswordUiState()
    object OtpVerified : ForgotPasswordUiState()
    object PasswordReset : ForgotPasswordUiState()
    class OAuthAccount(val provider: String) : ForgotPasswordUiState()
    class Error(val message: String) : ForgotPasswordUiState()
}