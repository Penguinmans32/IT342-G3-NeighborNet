package com.example.neighbornet.network

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.res.ResourcesCompat
import androidx.core.graphics.drawable.IconCompat
import com.example.neighbornet.MainActivity
import com.example.neighbornet.R
import com.example.neighbornet.api.FCMApi
import com.example.neighbornet.utils.NotificationChannels
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FCMService : FirebaseMessagingService() {

    @Inject
    lateinit var fcmApi: FCMApi

    private val TAG = "FCMService"

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        sendTokenToServer(token)
    }

    private fun sendTokenToServer(token: String) {
        Log.d(TAG, "Sending token to server: $token")
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = fcmApi.updateFCMToken(FCMTokenRequest(token))
                Log.d(TAG, "Token update response: ${response.isSuccessful}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to update token", e)
            }
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Message received from: ${remoteMessage.from}")

        val notification = remoteMessage.notification
        val data = remoteMessage.data
        Log.d(TAG, "Message data: $data")
        Log.d(TAG, "Message notification: ${notification?.title}, ${notification?.body}")

        if (notification != null) {
            val channelId = when (data["type"]) {
                "CHAT_MESSAGE" -> NotificationChannels.CHAT_CHANNEL_ID
                else -> NotificationChannels.GENERAL_CHANNEL_ID
            }

            showNotification(
                channelId,
                notification.title ?: "New Message",
                notification.body ?: "",
                data
            )
        }
    }

    private fun showNotification(
        channelId: String,
        title: String,
        message: String,
        data: Map<String, String>
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val largeIcon = ResourcesCompat.getDrawable(resources, R.drawable.ic_notification, null)?.let {
            val bitmap = Bitmap.createBitmap(
                it.intrinsicWidth,
                it.intrinsicHeight,
                Bitmap.Config.ARGB_8888
            )
            val canvas = Canvas(bitmap)
            it.setBounds(0, 0, canvas.width, canvas.height)
            it.draw(canvas)
            bitmap
        }

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification_status)
            .setLargeIcon(largeIcon)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        val notificationId = System.currentTimeMillis().toInt()
        Log.d(TAG, "Showing notification: $notificationId, $title, $message")
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
}