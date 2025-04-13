package com.example.neighbornet.repository

import com.example.neighbornet.api.ForgotPasswordApi
import com.example.neighbornet.network.ForgotPasswordRequest
import com.example.neighbornet.network.ResetPasswordRequest
import com.example.neighbornet.network.Resource
import com.example.neighbornet.network.VerifyOtpRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AuthRepository(private val forgotPasswordApi: ForgotPasswordApi) {


    suspend fun forgotPassword(request: ForgotPasswordRequest): Resource<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = forgotPasswordApi.forgotPassword(request.email)
            if (response.isSuccessful) {
                Resource.Success(Unit)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Resource.Error("Failed to send reset email: $errorBody")
            }
        } catch (e: Exception) {
            Resource.Error("An error occurred: ${e.message}")
        }
    }

    suspend fun verifyOtp(request: VerifyOtpRequest): Resource<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = forgotPasswordApi.verifyOtp(request.email, request.otp)
            if (response.isSuccessful) {
                Resource.Success(Unit)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Resource.Error("Failed to verify OTP: $errorBody")
            }
        } catch (e: Exception) {
            Resource.Error("An error occurred: ${e.message}")
        }
    }

    suspend fun resetPassword(request: ResetPasswordRequest): Resource<Unit> = withContext(Dispatchers.IO) {
        try {
            val response = forgotPasswordApi.resetPassword(request)
            if (response.isSuccessful) {
                Resource.Success(Unit)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Resource.Error("Failed to reset password: $errorBody")
            }
        } catch (e: Exception) {
            Resource.Error("An error occurred: ${e.message}")
        }
    }

    suspend fun checkAuthProvider(email: String): Resource<String> = withContext(Dispatchers.IO) {
        try {
            val response = forgotPasswordApi.checkAuthProvider(email)
            if (response.isSuccessful) {
                val provider = response.body()?.data ?: ""
                Resource.Success(provider)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Resource.Error("Failed to check auth provider: $errorBody")
            }
        } catch (e: Exception) {
            Resource.Error("An error occurred: ${e.message}")
        }
    }
}