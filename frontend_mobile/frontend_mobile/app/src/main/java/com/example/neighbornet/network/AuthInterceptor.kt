package com.example.neighbornet.network

import android.util.Log
import com.example.neighbornet.auth.TokenManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getToken()

        Log.d("AuthInterceptor", "URL: ${request.url}")
        Log.d("AuthInterceptor", "Token present: ${token != null}")

        return if (token != null) {
            val authenticatedRequest = request.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
            Log.d("AuthInterceptor", "Added auth header: Bearer ${token.take(10)}...")
            chain.proceed(authenticatedRequest)
        } else {
            Log.w("AuthInterceptor", "No token available for request: ${request.url}")
            chain.proceed(request)
        }
    }
}