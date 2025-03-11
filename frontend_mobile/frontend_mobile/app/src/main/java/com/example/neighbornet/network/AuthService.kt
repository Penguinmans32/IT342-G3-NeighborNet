package com.example.neighbornet.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.POST
import retrofit2.http.Query

interface AuthService {

    @POST("api/auth/login")
    @Headers(
        "Accept: application/json",
        "Content-Type: application/json"
    )
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>

    @POST("api/auth/signup")
    @Headers(
        "Accept: application/json",
        "Content-Type: application/json"
    )
    suspend fun signup(@Body request: SignupRequest): Response<ApiResponse<Unit>>

    @POST("api/auth/refreshtoken")
    suspend fun refreshToken(@Body request: TokenRefreshRequest): Response<TokenRefreshResponse>

    @POST("api/auth/verify-mobile")
    @Headers(
        "Accept: application/json",
        "Content-Type: application/json"
    )
    suspend fun verifyEmail(@Body verificationRequest: VerificationRequest): Response<ApiResponse<Unit>>

    @POST("api/auth/firebase/login")
    @Headers(
        "Accept: application/json",
        "Content-Type: application/json"
    )
    suspend fun firebaseLogin(@Body request: FirebaseTokenRequest): Response<ApiResponse<AuthResponse>>

    @POST("api/auth/logout")
    @Headers(
        "Accept: application/json",
        "Content-Type: application/json"
    )
    suspend fun logout(@Body request: LogOutRequest): Response<MessageResponse>
}