package com.example.neighbornet.auth

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.repository.ClassRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.example.neighbornet.network.Class

@HiltViewModel
class ClassListViewModel @Inject constructor(
    private val savedStateHandle: SavedStateHandle,
    private val classRepository: ClassRepository
) : ViewModel() {
    private val _classes = MutableStateFlow<List<Class>>(emptyList())
    val classes: StateFlow<List<Class>> = _classes.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String>("all")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    init {
        fetchClasses()
    }

    fun fetchClasses() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = classRepository.getAllClasses()
                _classes.value = response
                _error.value = null
            } catch (e: Exception) {
                _error.value = "Failed to load classes: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun setCategory(category: String) {
        _selectedCategory.value = category
    }
}