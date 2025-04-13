package com.example.neighbornet.api

import com.example.neighbornet.network.ApiResponse
import com.example.neighbornet.network.ResetPasswordRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ForgotPasswordApi {

    @POST("api/auth/password/forgot")
    suspend fun forgotPassword(
        @Query("email") email: String
    ): Response<ApiResponse<Unit>>

    @POST("api/auth/password/verify-otp")
    suspend fun verifyOtp(
        @Query("email") email: String,
        @Query("otp") otp: String
    ): Response<ApiResponse<Unit>>

    @POST("api/auth/password/reset")
    suspend fun resetPassword(
        @Body request: ResetPasswordRequest
    ): Response<ApiResponse<Unit>>

    @GET("api/auth/check-provider")
    suspend fun checkAuthProvider(
        @Query("email") email: String
    ): Response<ApiResponse<String>>
}