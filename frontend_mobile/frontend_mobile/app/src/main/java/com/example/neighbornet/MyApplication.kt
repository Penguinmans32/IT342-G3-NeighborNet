package com.example.neighbornet

import android.app.Application
import com.example.neighbornet.utils.NotificationChannels
import com.google.firebase.FirebaseApp
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
        NotificationChannels.createNotificationChannels(this)
    }
}