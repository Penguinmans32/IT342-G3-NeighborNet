package com.example.neighbornet.auth

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SessionManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val KEY_USER_ID = "user_id"
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USERNAME = "username"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
    }

    fun saveAuthData(
        userId: Long,
        accessToken: String?,
        refreshToken: String?,
        username: String?
    ) {
        if (accessToken.isNullOrBlank()) {
            Log.e("SessionManager", "Attempted to save null or blank access token")
            throw IllegalArgumentException("Access token cannot be null or empty")
        }

        Log.d("SessionManager", """
        Saving auth data:
        User ID: $userId
        Access Token: ${accessToken.take(10)}...
        Refresh Token: ${refreshToken?.take(10) ?: "null"}...
        Username: $username
    """.trimIndent())

        with(sharedPreferences.edit()) {
            putLong(KEY_USER_ID, userId)
            putString(KEY_ACCESS_TOKEN, accessToken)
            putString(KEY_REFRESH_TOKEN, refreshToken ?: "")
            putString(KEY_USERNAME, username ?: "")
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    fun clearAuthData() {
        Log.d("SessionManager", "Clearing auth data for user: ${getUserId()}")
        try {
            with(sharedPreferences.edit()) {
                remove(KEY_USER_ID)
                remove(KEY_ACCESS_TOKEN)
                remove(KEY_REFRESH_TOKEN)
                remove(KEY_USERNAME)
                remove(KEY_IS_LOGGED_IN)
                apply()
            }
            Log.d("SessionManager", "Auth data cleared successfully")
        } catch (e: Exception) {
            Log.e("SessionManager", "Error clearing auth data", e)
            // Fallback method if the above fails
            try {
                val editor = sharedPreferences.edit()
                editor.putLong(KEY_USER_ID, -1L)
                editor.putString(KEY_ACCESS_TOKEN, null)
                editor.putString(KEY_REFRESH_TOKEN, null)
                editor.putString(KEY_USERNAME, null)
                editor.putBoolean(KEY_IS_LOGGED_IN, false)
                editor.apply()
            } catch (e: Exception) {
                Log.e("SessionManager", "Error in fallback clear method", e)
            }
        }
    }

    fun getUserId(): Long {
        val userId = sharedPreferences.getLong(KEY_USER_ID, -1L)
        Log.d("SessionManager", "Retrieved user ID: $userId")
        return userId
    }
    fun getAccessToken(): String? = sharedPreferences.getString(KEY_ACCESS_TOKEN, null)
    fun getRefreshToken(): String? = sharedPreferences.getString(KEY_REFRESH_TOKEN, null)
    fun getUsername(): String? = sharedPreferences.getString(KEY_USERNAME, null)
    fun isLoggedIn(): Boolean = sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
}