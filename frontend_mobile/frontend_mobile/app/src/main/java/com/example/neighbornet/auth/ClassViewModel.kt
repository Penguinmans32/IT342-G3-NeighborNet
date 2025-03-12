package com.example.neighbornet.auth

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.neighbornet.repository.ClassRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.example.neighbornet.network.Class
import com.example.neighbornet.network.ClassResponse
import com.example.neighbornet.network.FeedbackResponse
import com.example.neighbornet.network.LessonProgress
import com.example.neighbornet.network.LessonResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async

@HiltViewModel
class ClassViewModel @Inject constructor(
    private val classRepository: ClassRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _classId = MutableStateFlow<Long?>(null)
    val classId = _classId.asStateFlow()

    private val _classDetails = MutableStateFlow<ClassResponse?>(null)
    val classDetails = _classDetails.asStateFlow()

    private val _lessons = MutableStateFlow<List<LessonResponse>>(emptyList())
    val lessons = _lessons.asStateFlow()

    private val _feedbacks = MutableStateFlow<List<FeedbackResponse>>(emptyList())
    val feedbacks = _feedbacks.asStateFlow()

    private val _relatedClasses = MutableStateFlow<List<Class>>(emptyList())
    val relatedClasses = _relatedClasses.asStateFlow()

    private val _isLearning = MutableStateFlow(false)
    val isLearning = _isLearning.asStateFlow()

    private val _userRating = MutableStateFlow<Double?>(null)
    val userRating = _userRating.asStateFlow()

    private val _progress = MutableStateFlow<List<LessonProgress>>(emptyList())
    val progress = _progress.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun initializeWithClassId(classId: Long) {
        if (_classId.value != classId) {
            _classId.value = classId
            loadClassDetails()
        }
    }

    private fun loadClassDetails() {
        viewModelScope.launch {
            _classId.value?.let { id ->
                _isLoading.value = true
                try {
                    // Fetch all data in parallel
                    val details = async { classRepository.getClassDetails(id) }
                    val lessonsList = async { classRepository.getClassLessons(id) }
                    val feedbacksList = async { classRepository.getClassFeedbacks(id) }
                    val relatedList = async { classRepository.getRelatedClasses(id) }
                    val learningStatus = async { classRepository.getLearningStatus(id) }
                    val progressList = async { classRepository.getProgress(id) }

                    _classDetails.value = details.await()
                    _lessons.value = lessonsList.await()
                    _feedbacks.value = feedbacksList.await()
                    _relatedClasses.value = relatedList.await()
                    _isLearning.value = learningStatus.await()
                    _progress.value = progressList.await()

                    try {
                        val rating = classRepository.getUserRating(id)
                        _userRating.value = rating.rating
                    } catch (e: Exception) {
                        // User might not have rated yet
                    }

                    _error.value = null
                } catch (e: Exception) {
                    _error.value = e.message
                } finally {
                    _isLoading.value = false
                }
            }
        }
    }

    fun startLearning() {
        viewModelScope.launch {
            _classId.value?.let { id ->
                try {
                    val updatedClass = classRepository.startLearning(id)
                    _classDetails.value = updatedClass
                    _isLearning.value = true
                    _error.value = null
                } catch (e: Exception) {
                    _error.value = e.message
                }
            }
        }
    }

    fun submitRating(rating: Double) {
        viewModelScope.launch {
            _classId.value?.let { id ->
                try {
                    classRepository.rateClass(id, rating)
                    _userRating.value = rating
                    loadClassDetails()
                    _error.value = null
                } catch (e: Exception) {
                    _error.value = e.message
                }
            }
        }
    }

    fun submitFeedback(content: String, rating: Int) {
        viewModelScope.launch {
            _classId.value?.let { id ->
                try {
                    classRepository.submitFeedback(id, content, rating)
                    loadClassDetails()
                    _error.value = null
                } catch (e: Exception) {
                    _error.value = e.message
                }
            }
        }
    }
}