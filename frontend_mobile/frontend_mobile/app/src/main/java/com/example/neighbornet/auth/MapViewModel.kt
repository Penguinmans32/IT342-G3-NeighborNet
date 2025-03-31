package com.example.neighbornet.auth

import android.util.Log
import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.BorrowingItem
import com.example.neighbornet.repository.BorrowingRepository
import kotlinx.coroutines.launch

@HiltViewModel
class MapViewModel @Inject constructor(
    private val borrowingRepository: BorrowingRepository
) : ViewModel() {
    private val _items = MutableStateFlow<List<BorrowingItem>>(emptyList())
    val items: StateFlow<List<BorrowingItem>> = _items.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        loadItems()
    }

    private fun loadItems() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val itemsList = borrowingRepository.getAllItems()
                _items.value = itemsList
            } catch (e: Exception) {
                Log.e("MapViewModel", "Error loading items", e)
            } finally {
                _isLoading.value = false
            }
        }
    }
}