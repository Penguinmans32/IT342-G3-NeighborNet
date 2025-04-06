package com.example.neighbornet.auth

import android.net.Uri
import android.util.Log
import androidx.core.net.toFile
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.api.ProfileApiService
import com.example.neighbornet.network.Achievement
import com.example.neighbornet.network.ClassItem
import com.example.neighbornet.network.FollowData
import com.example.neighbornet.network.ProfileState
import com.example.neighbornet.network.UserActivity
import com.example.neighbornet.network.UserStats
import com.example.neighbornet.network.update
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val apiService: ProfileApiService,
    private val sessionManager: SessionManager,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _profileState = MutableStateFlow(ProfileState())
    val profileState = _profileState.asStateFlow()

    private val _userStats = MutableStateFlow(UserStats())
    val userStats = _userStats.asStateFlow()

    private val _activities = MutableStateFlow<List<UserActivity>>(emptyList())
    val activities = _activities.asStateFlow()

    private val _achievements = MutableStateFlow<List<Achievement>>(emptyList())
    val achievements = _achievements.asStateFlow()

    private val _savedClasses = MutableStateFlow<List<ClassItem>>(emptyList())
    val savedClasses = _savedClasses.asStateFlow()

    private val _followData = MutableStateFlow(FollowData())
    val followData = _followData.asStateFlow()

    init {
        fetchProfileData()
        fetchUserStats()
        fetchActivities()
        fetchAchievements()
        fetchSavedClasses()
        fetchFollowData()
    }


    private fun fetchUserStats() {
        viewModelScope.launch {
            try {
                val userId = sessionManager.getUserId()
                Log.d("ProfileViewModel", "Fetching stats for user ID: $userId")

                try {
                    val classStats = apiService.getUserStats(userId)
                    val itemStats = apiService.getUserItemStats(userId)

                    val combinedStats = UserStats(
                        classesCreated = (classStats["classesCreated"] as? Number)?.toInt() ?: 0,
                        itemsPosted = (itemStats["itemsPosted"] as? Number)?.toInt() ?: 0,
                        communityScore = calculateCommunityScore(
                            (classStats["classesCreated"] as? Number)?.toInt() ?: 0,
                            (itemStats["itemsPosted"] as? Number)?.toInt() ?: 0
                        )
                    )
                    Log.d("ProfileViewModel", "Combined stats: $combinedStats")
                    _userStats.value = combinedStats

                } catch (e: Exception) {
                    Log.e("ProfileViewModel", "Error getting full stats, trying class stats only", e)
                    try {
                        val classStats = apiService.getUserStats(userId)
                        val combinedStats = UserStats(
                            classesCreated = (classStats["classesCreated"] as? Number)?.toInt() ?: 0,
                            itemsPosted = 0,
                            communityScore = calculateCommunityScore(
                                (classStats["classesCreated"] as? Number)?.toInt() ?: 0,
                                0
                            )
                        )
                        _userStats.value = combinedStats
                    } catch (e: Exception) {
                        Log.e("ProfileViewModel", "Error getting any stats", e)
                        _userStats.value = UserStats()
                    }
                }

            } catch (e: Exception) {
                Log.e("ProfileViewModel", "Error in fetchUserStats", e)
                _userStats.value = UserStats()
            }
        }
    }

    private fun calculateCommunityScore(classesCreated: Int, itemsPosted: Int): Int {
        val score = (classesCreated * 10) + (itemsPosted * 5)
        return minOf(score, 100)
    }

    private fun fetchActivities() {
        viewModelScope.launch {
            try {
                val fetchedActivities = apiService.getUserActivities()
                Log.d("ProfileViewModel", "Fetched activities: $fetchedActivities")
                _activities.value = fetchedActivities
            } catch (e: Exception) {
                Log.e("ProfileViewModel", "Error fetching activities", e)
                _activities.value = emptyList()
            }
        }
    }


    private fun fetchAchievements() {
        viewModelScope.launch {
            try {
                val achievements = apiService.getUserAchievements()
                _achievements.value = achievements
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    private fun fetchSavedClasses() {
        viewModelScope.launch {
            try {
                val classes = apiService.getSavedClasses()
                _savedClasses.value = classes
            } catch (e: Exception) {
                // Handle error
            }
        }
    }


    private fun fetchFollowData() {
        viewModelScope.launch {
            try {
                val userId = sessionManager.getUserId().toString()
                val followData = apiService.getFollowData(userId)
                _followData.value = followData
            } catch (e: Exception) {
                // Handle error
            }
        }
    }


    fun fetchProfileData() {
        viewModelScope.launch {
            try {
                _profileState.update { it.copy(isLoading = true) }
                val response = apiService.getProfile()
                Log.d("ProfileViewModel", "Profile response: $response")

                _profileState.update {
                    it.copy(
                        data = response,
                        isLoading = false,
                        error = null
                    )
                }
                Log.d("ProfileViewModel", "Updated profile state: ${_profileState.value}")
            } catch (e: Exception) {
                Log.e("ProfileViewModel", "Error fetching profile", e)
                _profileState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            }
        }
    }

    fun updateProfilePicture(uri: Uri) {
        viewModelScope.launch {
            try {
                // Convert Uri to MultipartBody.Part
                val file = uri.toFile()
                val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                val body = MultipartBody.Part.createFormData("file", file.name, requestFile)

                val response = apiService.updateProfilePicture(body)
                _profileState.update {
                    it.copy(
                        data = it.data?.copy(imageUrl = response.imageUrl),
                        isLoading = false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _profileState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            }
        }
    }

    fun toggleFollow(userId: String) {
        viewModelScope.launch {
            try {
                val isCurrentlyFollowing = _followData.value.isFollowing
                val response = if (isCurrentlyFollowing) {
                    apiService.unfollowUser(userId)
                } else {
                    apiService.followUser(userId)
                }
                _followData.update {
                    it.copy(
                        followersCount = response.followersCount,
                        isFollowing = response.isFollowing
                    )
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}