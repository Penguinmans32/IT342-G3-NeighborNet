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
    private val savedStateHandle: SavedStateHandle,
    private val classStateManager: ClassStateManager
) : ViewModel() {

    val classId = classStateManager.classId
    val classDetails = classStateManager.classDetails
    val lessons = classStateManager.lessons
    val feedbacks = classStateManager.feedbacks
    val relatedClasses = classStateManager.relatedClasses
    val isLearning = classStateManager.isLearning
    val userRating = classStateManager.userRating
    val progress = classStateManager.progress
    val currentLesson = classStateManager.currentLesson
    val nextLesson = classStateManager.nextLesson
    val prevLesson = classStateManager.prevLesson
    val isLessonCompleted = classStateManager.isLessonCompleted
    val lessonRating = classStateManager.lessonRating

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _startLearningSuccess = MutableStateFlow<Boolean?>(null)
    val startLearningSuccess = _startLearningSuccess.asStateFlow()

    private val _videoProgress = MutableStateFlow(0f)
    val videoProgress = _videoProgress.asStateFlow()

    private val _isRatingLoading = MutableStateFlow(false)
    val isRatingLoading = _isRatingLoading.asStateFlow()



    fun submitLessonRating(classId: Long, lessonId: Long, rating: Double) {
        viewModelScope.launch {
            try {
                _isRatingLoading.value = true
                classRepository.rateLessonProgress(classId, lessonId, rating)
                classStateManager.updateLessonState(rating = rating)
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
                classStateManager.updateLessonState(rating = rating)
            } catch (e: Exception) {
                // Handle error if needed
            }
        }
    }


    fun initializeWithClassId(classId: Long) {
        if (this.classId.value != classId) {
            classStateManager.updateClassState(classId = classId)
            loadClassDetails()
        }
    }

    fun loadLesson(classId: Long, lessonId: Long) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                val lesson = classRepository.getLessonById(classId, lessonId)
                val rating = classRepository.getLessonRating(classId, lessonId)

                val nextLesson = lesson.nextLessonId?.let { nextId ->
                    classRepository.getLessonById(classId, nextId)
                }
                val prevLesson = lesson.prevLessonId?.let { prevId ->
                    classRepository.getLessonById(classId, prevId)
                }

                val progress = classRepository.getLessonProgress(classId, lessonId)

                classStateManager.updateLessonState(
                    currentLesson = lesson,
                    nextLesson = nextLesson,
                    prevLesson = prevLesson,
                    isCompleted = progress.completed,
                    rating = rating
                )
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
                classStateManager.updateLessonState(isCompleted = true)
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
            classId.value?.let { id ->
                _isLoading.value = true
                try {
                    val details = async { classRepository.getClassDetails(id) }
                    val lessonsList = async { classRepository.getClassLessons(id) }
                    val feedbacksList = async { classRepository.getClassFeedbacks(id) }
                    val relatedList = async { classRepository.getRelatedClasses(id) }
                    val learningStatus = async { classRepository.getLearningStatus(id) }
                    val progressList = async { classRepository.getProgress(id) }

                    classStateManager.updateClassState(
                        classDetails = details.await(),
                        lessons = lessonsList.await(),
                        feedbacks = feedbacksList.await(),
                        relatedClasses = relatedList.await(),
                        isLearning = learningStatus.await(),
                        progress = progressList.await()
                    )

                    try {
                        val rating = classRepository.getUserRating(id)
                        classStateManager.updateClassState(userRating = rating.rating)
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
            classId.value?.let { id ->
                try {
                    val updatedClass = classRepository.startLearning(id)
                    classStateManager.updateClassState(
                        classDetails = updatedClass,
                        isLearning = true
                    )
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
            classId.value?.let { id ->
                try {
                    classRepository.rateClass(id, rating)
                    classStateManager.updateClassState(userRating = rating)
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
            classId.value?.let { id ->
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