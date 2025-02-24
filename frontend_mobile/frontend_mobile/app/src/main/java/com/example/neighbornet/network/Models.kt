package com.example.neighbornet.network

data class LoginRequest(
    val username: String,
    val password: String
)

data class SignupRequest(
    val username: String,
    val email: String,
    val password: String
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val tokenType: String,
    val username: String
)

data class ApiResponse<T>(
    val data: T?,
    val message: String,
    val success: Boolean
)


data class TokenRefreshRequest(
    val refreshToken: String
)

data class TokenRefreshResponse(
    val accessToken: String,
    val refreshToken: String
)

data class MessageResponse(
    val message: String
)

data class VerificationRequest(
    val otp: String
)

data class SignupResponse(
    val message: String,
    val success: Boolean = true
)

