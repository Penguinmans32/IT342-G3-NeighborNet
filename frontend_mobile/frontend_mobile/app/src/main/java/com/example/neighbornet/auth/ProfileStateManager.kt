package com.example.neighbornet.auth

import com.example.neighbornet.network.Achievement
import com.example.neighbornet.network.ClassItem
import com.example.neighbornet.network.FollowData
import com.example.neighbornet.network.ProfileState
import com.example.neighbornet.network.UserActivity
import com.example.neighbornet.network.UserStats
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileStateManager @Inject constructor() {
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

    fun clearAll() {
        _profileState.value = ProfileState()
        _userStats.value = UserStats()
        _activities.value = emptyList()
        _achievements.value = emptyList()
        _savedClasses.value = emptyList()
        _followData.value = FollowData()
    }
}