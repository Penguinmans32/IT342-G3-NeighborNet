package com.example.neighbornet.api

import com.example.neighbornet.network.FCMTokenRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface FCMApi {
    @POST("api/fcm/token")
    suspend fun updateFCMToken(@Body tokenRequest: FCMTokenRequest): Response<Unit>
}