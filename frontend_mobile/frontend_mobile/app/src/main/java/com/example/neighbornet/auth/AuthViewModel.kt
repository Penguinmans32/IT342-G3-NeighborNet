package com.example.neighbornet.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val error: String? = null,
    val signUpSuccess: Boolean = false
)

class AuthViewModel : ViewModel() {
    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState

    // Simulated user storage - in a real app, this would be a database or API
    private val users = mutableMapOf<String, UserData>()

    fun login(username: String, password: String) {
        viewModelScope.launch {
            if (username.isBlank() || password.isBlank()) {
                _authState.value = _authState.value.copy(error = "Please fill in all fields")
                return@launch
            }

            _authState.value = _authState.value.copy(isLoading = true, error = null)

            // Simulate network delay
            delay(1000)

            val userData = users[username]
            if (userData == null) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = "User not found"
                )
                return@launch
            }

            if (userData.password != password) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = "Invalid password"
                )
                return@launch
            }

            _authState.value = _authState.value.copy(
                isLoading = false,
                isLoggedIn = true,
                error = null
            )
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
            delay(1000)

            if (users.containsKey(username)) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = "Username already exists"
                )
                return@launch
            }

            // Store the new user
            users[username] = UserData(email, username, password)
            
            _authState.value = _authState.value.copy(
                isLoading = false,
                signUpSuccess = true,
                error = null
            )
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

    private data class UserData(
        val email: String,
        val username: String,
        val password: String
    )
} 