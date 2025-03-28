package com.example.neighbornet.auth

import android.location.Location
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.api.LocationService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LocationViewModel @Inject constructor(
    private val locationService: LocationService
) : ViewModel() {
    private val _location = MutableStateFlow<Location?>(null)
    val location: StateFlow<Location?> = _location.asStateFlow()

    fun updateLocation() {
        viewModelScope.launch {
            try {
                _location.value = locationService.getCurrentLocation()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}