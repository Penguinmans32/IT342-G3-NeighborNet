package com.example.neighbornet.api

import android.app.Activity
import com.example.neighbornet.network.Achievement
import com.example.neighbornet.network.ClassItem
import com.example.neighbornet.network.FollowData
import com.example.neighbornet.network.FollowResponse
import com.example.neighbornet.network.ImageResponse
import com.example.neighbornet.network.ProfileData
import com.example.neighbornet.network.UserActivity
import com.example.neighbornet.network.UserStats
import okhttp3.MultipartBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path

interface ProfileApiService {
    @GET("api/users/profile")
    suspend fun getProfile(): ProfileData

    @GET("api/users/{userId}/profile")
    suspend fun getUserProfile(@Path("userId") userId: String): ProfileData

    @Multipart
    @PUT("api/users/profile/picture")
    suspend fun updateProfilePicture(@Part file: MultipartBody.Part): ImageResponse

    @GET("api/users/{userId}/followers-data")
    suspend fun getFollowData(@Path("userId") userId: String): FollowData

    @POST("api/users/{userId}/follow")
    suspend fun followUser(@Path("userId") userId: String): FollowResponse

    @POST("api/users/{userId}/unfollow")
    suspend fun unfollowUser(@Path("userId") userId: String): FollowResponse

    @GET("api/activities/recent")
    suspend fun getUserActivities(): List<UserActivity>

    @GET("api/achievements/user")
    suspend fun getUserAchievements(): List<Achievement>

    @GET("api/classes/saved")
    suspend fun getSavedClasses(): List<ClassItem>

    @GET("api/classes/user-stats/{userId}")
    suspend fun getUserStats(@Path("userId") userId: Long): Map<String, Any>

    @GET("api/users/{userId}/activities")
    suspend fun getUserActivitiesById(@Path("userId") userId: Long): List<UserActivity>

    @GET("api/achievements/user/{userId}")
    suspend fun getUserAchievementsById(@Path("userId") userId: Long): List<Achievement>

    @GET("api/users/{userId}/user-stats")
    suspend fun getUserItemStats(@Path("userId") userId: Long): Map<String, Any>

    @GET("api/users/{userId}/saved-classes")
    suspend fun getSavedClassesById(@Path("userId") userId: Long): List<ClassItem>
}