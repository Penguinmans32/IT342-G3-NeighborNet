package com.example.neighbornet.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.network.BorrowingItem
import com.example.neighbornet.repository.BorrowingRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ItemDetailsViewModel @Inject constructor(
    private val repository: BorrowingRepository
) : ViewModel() {

    private val _item = MutableStateFlow<BorrowingItem?>(null)
    val item: StateFlow<BorrowingItem?> = _item

    fun loadItem(itemId: Long) {
        viewModelScope.launch {
            try {
                _item.value = repository.getItemById(itemId)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}