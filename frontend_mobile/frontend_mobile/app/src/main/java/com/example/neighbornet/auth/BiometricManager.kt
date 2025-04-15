package com.example.neighbornet.auth

import android.app.Activity
import android.content.Context
import android.os.Build
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BiometricAuthManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val tokenManager: TokenManager
) {
    companion object {
        private const val BIOMETRIC_ENABLED_KEY = "biometric_login_enabled"
    }

    fun canAuthenticate(): Int {
        val biometricManager = BiometricManager.from(context)
        return biometricManager.canAuthenticate(BIOMETRIC_STRONG)
    }

    fun isBiometricEnabled(): Boolean {
        val preferences = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
        val enabled = preferences.getBoolean(BIOMETRIC_ENABLED_KEY, false)
        Log.d("BiometricAuthManager", "isBiometricEnabled called, returning: $enabled")
        return enabled
    }

    fun setBiometricEnabled(enabled: Boolean) {
        val preferences = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)
        preferences.edit().putBoolean(BIOMETRIC_ENABLED_KEY, enabled).apply()

        if (enabled) {
            val currentEmail = tokenManager.getCurrentUser() ?: return
            val currentToken = tokenManager.getToken() ?: return
            val refreshToken = tokenManager.getRefreshToken()

            storeCredentialsSecurely(currentEmail, currentToken, refreshToken)
        } else {
            clearSecureCredentials()
        }
    }

    private fun storeCredentialsSecurely(email: String, token: String, refreshToken: String?) {
        val preferences = context.getSharedPreferences("secure_auth_prefs", Context.MODE_PRIVATE)

        Log.d("BiometricAuthManager", "Storing credentials for user: $email")
        Log.d("BiometricAuthManager", "Access token: ${token.take(10)}...")
        Log.d("BiometricAuthManager", "Refresh token: ${refreshToken?.take(10) ?: "null"}...")

        preferences.edit()
            .putString("secure_email", email)
            .putString("secure_token", token)
            .putString("secure_refresh_token", refreshToken ?: "")
            .apply()
    }

    private fun clearSecureCredentials() {
        val preferences = context.getSharedPreferences("secure_auth_prefs", Context.MODE_PRIVATE)
        preferences.edit().clear().apply()
    }

    private fun getSecureCredentials(): Triple<String?, String?, String?> {
        val preferences = context.getSharedPreferences("secure_auth_prefs", Context.MODE_PRIVATE)
        val email = preferences.getString("secure_email", null)
        val token = preferences.getString("secure_token", null)
        val refreshToken = preferences.getString("secure_refresh_token", null)

        val finalRefreshToken = if (refreshToken.isNullOrEmpty()) null else refreshToken

        Log.d("BiometricAuthManager", "Retrieved credentials for user: $email")
        Log.d("BiometricAuthManager", "Access token present: ${token != null}")
        Log.d("BiometricAuthManager", "Refresh token present: ${finalRefreshToken != null}")

        return Triple(email, token, finalRefreshToken)
    }

    fun storeCredentials(email: String, token: String, refreshToken: String?) {
        storeCredentialsSecurely(email, token, refreshToken)
    }

    fun authenticate(activity: Activity): Flow<BiometricResult> {
        if (activity !is FragmentActivity) {
            return flow {
                emit(BiometricResult.Error(
                    -100,
                    "Biometric authentication requires FragmentActivity"
                ))
            }
        }

        return callbackFlow {
            val executor = ContextCompat.getMainExecutor(activity)

            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric Login")
                .setSubtitle("Log in using your biometric credential")
                .setNegativeButtonText("Cancel")
                .setAllowedAuthenticators(BIOMETRIC_STRONG)
                .build()

            val biometricPrompt = BiometricPrompt(activity as FragmentActivity, executor,
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        super.onAuthenticationError(errorCode, errString)
                        trySend(BiometricResult.Error(errorCode, errString.toString()))
                    }

                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        val credentials = getSecureCredentials()
                        if (credentials.first != null && credentials.second != null) {
                            trySend(BiometricResult.Success(
                                credentials.first!!,
                                credentials.second!!,
                                credentials.third
                            ))
                        } else {
                            trySend(BiometricResult.Error(-1, "No stored credentials found"))
                        }
                    }

                    override fun onAuthenticationFailed() {
                        super.onAuthenticationFailed()
                        trySend(BiometricResult.Failed)
                    }
                })

            biometricPrompt.authenticate(promptInfo)
            awaitClose { /* Nothing to close */ }
        }
    }
}

sealed class BiometricResult {
    data class Success(val email: String, val token: String, val refreshToken: String? = null) : BiometricResult()
    data class Error(val code: Int, val message: String) : BiometricResult()
    object Failed : BiometricResult()
}