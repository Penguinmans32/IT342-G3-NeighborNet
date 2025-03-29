package com.example.neighbornet.auth

import android.location.Location
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.R
import com.example.neighbornet.api.LocationService
import com.example.neighbornet.network.BorrowingCategory
import com.example.neighbornet.network.BorrowingItem
import com.example.neighbornet.network.BorrowingWebSocketManager
import com.example.neighbornet.repository.BorrowingRepository
import com.example.neighbornet.repository.RatingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BorrowingViewModel @Inject constructor(
    private val repository: BorrowingRepository,
    private val ratingRepository: RatingRepository,
    private val locationService: LocationService,
    private val webSocketManager: BorrowingWebSocketManager
) : ViewModel() {

    val connectionState = webSocketManager.connectionState
    val messages = webSocketManager.messages
    val borrowingUpdates = webSocketManager.borrowingUpdates
    val ratingUpdates = webSocketManager.ratingUpdates


    private val _items = MutableStateFlow<List<BorrowingItem>>(emptyList())
    val items: StateFlow<List<BorrowingItem>> = _items.asStateFlow()

    private val _borrowedItems = MutableStateFlow<List<BorrowingItem>>(emptyList())
    val borrowedItems: StateFlow<List<BorrowingItem>> = _borrowedItems.asStateFlow()

    private val _selectedCategory = MutableStateFlow<Long>(0L)
    val selectedCategory: StateFlow<Long> = _selectedCategory.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _itemRatings = MutableStateFlow<Map<String, Float>>(emptyMap())
    val itemRatings: StateFlow<Map<String, Float>> = _itemRatings.asStateFlow()

    private val _location = MutableStateFlow<Location?>(null)
    val location: StateFlow<Location?> = _location.asStateFlow()


    init {
        viewModelScope.launch {
            try {
                val location = locationService.getCurrentLocation()
                _location.value = location
            } catch (e: Exception) {
            }
        }
    }

    init {
        fetchItems()
        fetchBorrowedItems()
    }

    suspend fun connectWebSocket(userId: String) {
        webSocketManager.connect(userId)
    }

    fun setCategory(categoryId: Long) {
        _selectedCategory.value = categoryId
    }

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun getCategories(): List<BorrowingCategory> {
        val defaultIcon = R.drawable.ic_all

        val categoriesList = listOf(
            BorrowingCategory(0L, "All Items", R.drawable.ic_all, 0),
            BorrowingCategory(1L, "Tools", R.drawable.ic_tools, 0),
            BorrowingCategory(2L, "Electronics", R.drawable.ic_electronics, 0),
            BorrowingCategory(3L, "Sports", R.drawable.ic_sports, 0),
            BorrowingCategory(4L, "Books", R.drawable.ic_books, 0)
        )

        return categoriesList.map { category ->
            category.copy(
                count = if (category.id == 0L) {
                    items.value.size
                } else {
                    items.value.count { it.category.equals(category.name, ignoreCase = true) }
                }
            )
        }
    }

    fun sendMessage(itemId: Long, message: String) {
        viewModelScope.launch {
            try {
                repository.sendMessage(itemId, message)

                webSocketManager.sendMessage(itemId.toString(), message)
            } catch (e: Exception) {
                _error.value = "Failed to send message: ${e.message}"
            }
        }
    }

    private fun fetchItems() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _items.value = repository.getAllItems()
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun fetchBorrowedItems() {
        viewModelScope.launch {
            try {
                _borrowedItems.value = repository.getBorrowedItems()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun rateItem(itemId: String, rating: Float) {
        viewModelScope.launch {
            try {
                val response = ratingRepository.rateItem(itemId, rating)
                if (response.isSuccessful) {
                    // Optionally refresh items after rating
                    fetchItems()
                } else {
                    // Handle error
                    _error.value = "Failed to rate item: ${response.message()}"
                }
            } catch (e: Exception) {
                _error.value = "Error rating item: ${e.message}"
            }
        }
    }

    fun getItemRating(itemId: String) {
        viewModelScope.launch {
            try {
                val response = ratingRepository.getItemRating(itemId)
                if (response.isSuccessful) {
                    val rating = response.body()
                    // Update the rating in your UI state
                    _itemRatings.value = _itemRatings.value.toMutableMap().apply {
                        put(itemId, rating ?: 0f)
                    }
                }
            } catch (e: Exception) {
                _error.value = "Error fetching rating: ${e.message}"
            }
        }
    }

    private fun updateItemRating(itemId: String, rating: Float) {
        _itemRatings.value = _itemRatings.value + (itemId to rating)
    }

    fun clearError() {
        _error.value = null
    }

    override fun onCleared() {
        super.onCleared()
        webSocketManager.disconnect()
    }
}