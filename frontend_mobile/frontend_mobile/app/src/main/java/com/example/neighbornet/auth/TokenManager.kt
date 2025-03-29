package com.example.neighbornet.auth

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(@ApplicationContext context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        Log.d("TokenManager", "Saving token: ${token.take(10)}...")
        prefs.edit().putString("auth_token", token).apply()
        val saved = getToken()
        Log.d("TokenManager", "Token saved successfully: ${saved != null}")
    }

    fun getToken(): String? {
        val token = prefs.getString("auth_token", null)
        Log.d("TokenManager", "Retrieved token: ${token?.take(10)}...")
        return token
    }

    fun saveCurrentUser(username: String) {
        Log.d("TokenManager", "Saving current user: $username")
        prefs.edit().putString("current_user", username).apply()
    }

    fun saveCurrentUserId(userId: Long) {
        Log.d("TokenManager", "Saving current user ID: $userId")
        prefs.edit().putLong("current_user_id", userId).apply()
    }

    fun getCurrentUserId(): Long? {
        val userId = prefs.getLong("current_user_id", -1L)
        return if (userId == -1L) null else userId
    }

    fun getCurrentUser(): String? {
        return prefs.getString("current_user", null)
    }

    fun clearToken() {
        Log.d("TokenManager", "Clearing token and user data")
        prefs.edit()
            .remove("auth_token")
            .remove("current_user")
            .apply()
    }
}