package com.example.neighbornet.auth

import com.example.neighbornet.network.ClassResponse
import com.example.neighbornet.network.FeedbackResponse
import com.example.neighbornet.network.LessonProgress
import com.example.neighbornet.network.LessonResponse
import com.example.neighbornet.network.Class
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ClassStateManager @Inject constructor() {
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

    private val _currentLesson = MutableStateFlow<LessonResponse?>(null)
    val currentLesson = _currentLesson.asStateFlow()

    private val _nextLesson = MutableStateFlow<LessonResponse?>(null)
    val nextLesson = _nextLesson.asStateFlow()

    private val _prevLesson = MutableStateFlow<LessonResponse?>(null)
    val prevLesson = _prevLesson.asStateFlow()

    private val _isLessonCompleted = MutableStateFlow(false)
    val isLessonCompleted = _isLessonCompleted.asStateFlow()

    private val _lessonRating = MutableStateFlow<Double?>(null)
    val lessonRating = _lessonRating.asStateFlow()

    fun clearAll() {
        _classId.value = null
        _classDetails.value = null
        _lessons.value = emptyList()
        _feedbacks.value = emptyList()
        _relatedClasses.value = emptyList()
        _isLearning.value = false
        _userRating.value = null
        _progress.value = emptyList()
        _currentLesson.value = null
        _nextLesson.value = null
        _prevLesson.value = null
        _isLessonCompleted.value = false
        _lessonRating.value = null
    }

    fun updateClassState(
        classId: Long? = null,
        classDetails: ClassResponse? = null,
        lessons: List<LessonResponse>? = null,
        feedbacks: List<FeedbackResponse>? = null,
        relatedClasses: List<Class>? = null,
        isLearning: Boolean? = null,
        userRating: Double? = null,
        progress: List<LessonProgress>? = null
    ) {
        classId?.let { _classId.value = it }
        classDetails?.let { _classDetails.value = it }
        lessons?.let { _lessons.value = it }
        feedbacks?.let { _feedbacks.value = it }
        relatedClasses?.let { _relatedClasses.value = it }
        isLearning?.let { _isLearning.value = it }
        userRating?.let { _userRating.value = it }
        progress?.let { _progress.value = it }
    }

    fun updateLessonState(
        currentLesson: LessonResponse? = null,
        nextLesson: LessonResponse? = null,
        prevLesson: LessonResponse? = null,
        isCompleted: Boolean? = null,
        rating: Double? = null
    ) {
        currentLesson?.let { _currentLesson.value = it }
        nextLesson?.let { _nextLesson.value = it }
        prevLesson?.let { _prevLesson.value = it }
        isCompleted?.let { _isLessonCompleted.value = it }
        rating?.let { _lessonRating.value = it }
    }
}