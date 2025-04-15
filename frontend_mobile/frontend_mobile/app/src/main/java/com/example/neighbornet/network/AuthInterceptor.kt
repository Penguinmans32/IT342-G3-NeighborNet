package com.example.neighbornet.network

import android.util.Log
import com.example.neighbornet.auth.TokenManager
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import dagger.Lazy

class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager,
    private val authServiceLazy: Lazy<AuthService> // Change to Lazy<AuthService>
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val token = tokenManager.getToken()

        Log.d("AuthInterceptor", "URL: ${request.url}")
        Log.d("AuthInterceptor", "Token present: ${token != null}")

        if (token != null) {
            val authenticatedRequest = request.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()

            val response = chain.proceed(authenticatedRequest)

            if (response.code == 401) {
                Log.w("AuthInterceptor", "Received 401 Unauthorized - token might be expired")

                response.close()

                val newToken = runBlocking {
                    tokenManager.refreshAndGetValidToken(authServiceLazy.get())
                }

                return if (newToken != null) {
                    // Retry the request with the new token
                    val newAuthenticatedRequest = request.newBuilder()
                        .header("Authorization", "Bearer $newToken")
                        .build()
                    Log.d("AuthInterceptor", "Retrying with new token: ${newToken.take(10)}...")
                    chain.proceed(newAuthenticatedRequest)
                } else {
                    Log.e("AuthInterceptor", "Token refresh failed, proceeding with original request")
                    chain.proceed(request)
                }
            }

            return response
        } else {
            Log.w("AuthInterceptor", "No token available for request: ${request.url}")
            return chain.proceed(request)
        }
    }
}