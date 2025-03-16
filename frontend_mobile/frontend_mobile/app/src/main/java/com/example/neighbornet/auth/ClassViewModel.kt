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

    private val _startLearningSuccess = MutableStateFlow<Boolean?>(null)
    val startLearningSuccess = _startLearningSuccess.asStateFlow()

    private val _currentLesson = MutableStateFlow<LessonResponse?>(null)
    val currentLesson = _currentLesson.asStateFlow()

    private val _nextLesson = MutableStateFlow<LessonResponse?>(null)
    val nextLesson = _nextLesson.asStateFlow()

    private val _prevLesson = MutableStateFlow<LessonResponse?>(null)
    val prevLesson = _prevLesson.asStateFlow()

    private val _isLessonCompleted = MutableStateFlow(false)
    val isLessonCompleted = _isLessonCompleted.asStateFlow()

    private val _videoProgress = MutableStateFlow(0f)
    val videoProgress = _videoProgress.asStateFlow()

    private val _lessonRating = MutableStateFlow<Double?>(null)
    val lessonRating = _lessonRating.asStateFlow()

    private val _isRatingLoading = MutableStateFlow(false)
    val isRatingLoading = _isRatingLoading.asStateFlow()

    fun submitLessonRating(classId: Long, lessonId: Long, rating: Double) {
        viewModelScope.launch {
            try {
                _isRatingLoading.value = true
                classRepository.rateLessonProgress(classId, lessonId, rating)
                _lessonRating.value = rating
                loadLesson(classId, lessonId)
            } catch (e: Exception) {
                _error.value = "Failed to submit rating: ${e.message}"
            } finally {
                _isRatingLoading.value = false
            }
        }
    }

    fun loadLessonRating(classId: Long, lessonId: Long) {
        viewModelScope.launch {
            try {
                val rating = classRepository.getLessonRating(classId, lessonId)
                _lessonRating.value = rating
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }


    fun initializeWithClassId(classId: Long) {
        if (_classId.value != classId) {
            _classId.value = classId
            loadClassDetails()
        }
    }

    fun loadLesson(classId: Long, lessonId: Long) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                val lesson = classRepository.getLessonById(classId, lessonId)
                _currentLesson.value = lesson

                val rating = classRepository.getLessonRating(classId, lessonId)
                _lessonRating.value = rating


                // Load next and previous lessons
                lesson.nextLessonId?.let { nextId ->
                    _nextLesson.value = classRepository.getLessonById(classId, nextId)
                }
                lesson.prevLessonId?.let { prevId ->
                    _prevLesson.value = classRepository.getLessonById(classId, prevId)
                }

                // Check completion status
                val progress = classRepository.getLessonProgress(classId, lessonId)
                _isLessonCompleted.value = progress.completed
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun markLessonAsComplete(classId: Long, lessonId: Long) {
        viewModelScope.launch {
            try {
                classRepository.markLessonComplete(classId, lessonId)
                _isLessonCompleted.value = true
                loadClassDetails()
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    fun updateVideoProgress(progress: Float) {
        _videoProgress.value = progress
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
                    _startLearningSuccess.value = true
                    _error.value = null
                } catch (e: Exception) {
                    _error.value = e.message
                    _startLearningSuccess.value = false
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