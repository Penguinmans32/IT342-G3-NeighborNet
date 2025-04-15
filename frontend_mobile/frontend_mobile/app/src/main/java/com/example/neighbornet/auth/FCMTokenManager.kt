package com.example.neighbornet.auth

import android.util.Log
import com.example.neighbornet.api.FCMApi
import com.example.neighbornet.network.FCMTokenRequest
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FCMTokenManager @Inject constructor(
    private val fcmApi: FCMApi
) {
    private val TAG = "FCMTokenManager"

    fun registerFCMToken() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            val token = task.result
            Log.d(TAG, "FCM Token obtained: $token")
            sendTokenToServer(token)
        }
    }

    fun sendTokenToServer(token: String) {
        Log.d(TAG, "Sending token to server: $token")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = fcmApi.updateFCMToken(FCMTokenRequest(token))
                if (response.isSuccessful) {
                    Log.d(TAG, "FCM token successfully sent to server")
                } else {
                    Log.e(TAG, "Failed to send FCM token to server: ${response.code()}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception sending FCM token to server", e)
            }
        }
    }
}