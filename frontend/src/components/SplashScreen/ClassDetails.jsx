import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  MdPlayArrow,
  MdLock,
  MdAccessTime,
  MdPeople,
  MdStar,
  MdStarBorder,
  MdStarHalf,
  MdInfo,
  MdOutlinePlayCircleFilled,
  MdOutlineLightbulb,
  MdOutlineTimer,
  MdOutlinePeople,
  MdOutlineFeedback,
  MdOutlineChatBubbleOutline,
  MdThumbUp,
  MdFlag,
  MdRateReview,
  MdSend,
  MdArrowForward,
  MdCheckCircle,
  MdPerson,
  MdEmail,
  MdPhone,
  MdOutlineSchool,
  MdOutlineLink,
  MdLanguage,
  MdCategory,
  MdSignalCellularAlt,
  MdAccessAlarm,
  MdMoreVert,
  MdEdit,
  MdAdd,
  MdDelete,
  MdKeyboardArrowLeft,
  MdLibraryBooks,
  MdKeyboardArrowRight,
} from "react-icons/md"
import axios from "axios"
import { useAuth } from "../../backendApi/AuthContext"
import Footer from "./Footer"
import toast from "react-hot-toast"
import QuizList from "../QuizList"

const formatDate = (dateString) => {
  if (!dateString) return ""

  let date
  if (Array.isArray(dateString)) {
    date = new Date(
      dateString[0],
      dateString[1] - 1,
      dateString[2],
      dateString[3],
      dateString[4],
      dateString[5],
      dateString[6] / 1000000,
    )
  } else {
    date = new Date(dateString)
  }

  if (isNaN(date.getTime())) {
    console.error("Invalid date string:", dateString)
    return "Invalid Date"
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInSeconds < 60) {
    return "Just now"
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
  }
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
  }
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

const FeedbackItemEnhanced = ({ feedback, currentUserId, onHelpful, onReport, onEdit, onDelete }) => {
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false)
  const [isReportLoading, setIsReportLoading] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  const handleHelpful = async () => {
    setIsHelpfulLoading(true)
    try {
      await onHelpful(feedback.id)
      toast.success("Marked as helpful!")
    } catch (error) {
      toast.error("Failed to mark as helpful")
    } finally {
      setIsHelpfulLoading(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {feedback.userImage ? (
              <img
                src={feedback.userImage || "/placeholder.svg"}
                alt={feedback.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center 
                           bg-gradient-to-br from-blue-400 to-blue-600 text-white font-medium"
              >
                {feedback.userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div>
              <h4 className="font-semibold text-gray-900">{feedback.userName || "Anonymous"}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MdStar
                      key={star}
                      className={`text-sm ${star <= feedback.rating ? "text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons for feedback owner */}
          {feedback.canEdit && (
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MdMoreVert className="text-xl text-gray-500" />
              </button>

              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      onEdit(feedback)
                      setShowActionsMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <MdEdit className="text-lg" /> Edit Feedback
                  </button>
                  <button
                    onClick={() => {
                      onDelete(feedback.id);
                      setShowActionsMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <MdDelete className="text-lg" /> Delete Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-blue-100 rounded-full"></div>
          <div className="pl-4">
            <p className="text-gray-700 leading-relaxed">{feedback.content}</p>

            {/* Feedback Actions */}
            <div className="mt-4 flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleHelpful}
                disabled={isHelpfulLoading}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                  ${
                    feedback.isHelpful ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-colors`}
              >
                {isHelpfulLoading ? (
                  <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MdThumbUp className={feedback.isHelpful ? "text-green-500" : ""} />
                    <span>{feedback.helpfulCount || 0} Helpful</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const FeedbackFormEnhanced = ({ onSubmit, value, onChange, isSubmitting, onCancel, rating, editingFeedback }) => {
  const [charCount, setCharCount] = useState(value?.length || 0)

  const handleChange = (e) => {
    onChange(e.target.value)
    setCharCount(e.target.value.length)
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <MdRateReview className="text-blue-600" />
            {editingFeedback ? "Edit Your Feedback" : "Share Your Experience"}
          </h3>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <MdStar key={star} className={`text-xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`} />
            ))}
          </div>
        </div>

        <div className="relative mb-2">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="Tell others what you thought about this class..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition-all resize-y min-h-[150px] bg-gray-50"
            disabled={isSubmitting}
          />

          <div className={`absolute bottom-3 right-3 text-xs ${charCount > 500 ? "text-red-500" : "text-gray-400"}`}>
            {charCount}/500
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          <div className="flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MdInfo />
              <span>Your feedback will be visible to all students</span>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-initial px-6 py-2 border border-gray-300 text-gray-700 
                        rounded-lg hover:bg-gray-50 transition-colors flex items-center 
                        justify-center gap-2"
              disabled={isSubmitting}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-initial px-6 py-2 bg-gradient-to-r from-blue-500 
                        to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white 
                        rounded-lg transition-all flex items-center justify-center gap-2 
                        shadow-md hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <MdSend />
                  <span>{editingFeedback ? "Update Feedback" : "Submit Feedback"}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  )
}

const RelatedClassCard = ({ classItem, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(classItem.id)}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 group"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {classItem.thumbnailUrl ? (
          <img
            src={`https://it342-g3-neighbornet.onrender.com${classItem.thumbnailUrl}`}
            alt={classItem.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
            {classItem.title?.[0]?.toUpperCase() || "C"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center text-white text-sm">
            <div className="flex items-center gap-1 mr-3">
              <MdStar className="text-yellow-400" />
              <span>{Number(classItem.averageRating || 0).toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MdPeople className="text-blue-300" />
              <span>{classItem.enrolledCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-medium text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {classItem.title}
        </h4>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{classItem.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span className="px-2 py-1 bg-gray-100 rounded-full">{classItem.difficulty}</span>
          <span className="flex items-center gap-1">
            <MdAccessTime className="text-gray-400" />
            {classItem.duration}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const FloatingShape = ({ className }) => (
  <motion.div
    className={`absolute opacity-30 blur-2xl ${className}`}
    animate={{
      y: [0, 15, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Number.POSITIVE_INFINITY,
      ease: "easeInOut",
    }}
  />
)

const StarRating = ({ initialRating = 0, classId, onRatingUpdate, readOnly = false }) => {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const { isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setRating(initialRating)
  }, [initialRating])

  const handleStarClick = async (value) => {
    if (readOnly || !isAuthenticated) {
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/rate`,
        { rating: value },
        { headers },
      )

      console.log("Rating submitted successfully:", response.data)
      setRating(value)

      const existingToken = localStorage.getItem("token")
      const headersForUpdate = { Authorization: `Bearer ${existingToken}` }
      const updatedClassResponse = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}`, {
        headers: headersForUpdate,
      })

      if (onRatingUpdate) {
        onRatingUpdate(value, updatedClassResponse.data)
      }

      toast.success("Rating submitted!", {
        icon: "⭐",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error submitting rating:", error)
      toast.error("Failed to submit rating")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="flex items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <motion.div
            key={value}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`
              px-3 py-2 inline-block cursor-pointer select-none
              ${readOnly || !isAuthenticated ? "pointer-events-none" : ""}
            `}
            style={{ touchAction: "manipulation" }}
            onClick={() => !isSubmitting && handleStarClick(value)}
            onMouseEnter={() => !readOnly && setHoverRating(value)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
          >
            <MdStar
              size={24}
              className={`
                ${hoverRating >= value || rating >= value ? "text-yellow-400" : "text-gray-300"} 
                transition-colors duration-150
              `}
            />
          </motion.div>
        ))}
      </div>

      {isSubmitting && (
        <div className="ml-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isSubmitting && rating > 0 && <div className="ml-3 text-sm font-medium text-gray-600">{rating.toFixed(1)}</div>}
    </div>
  )
}

const ClassRatingDisplay = ({ averageRating, ratingCount }) => {
  const rating = Number(averageRating) || 0

  return (
    <div className="flex items-center gap-4">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => {
          const fullStar = rating >= value
          const halfStar = rating > value - 0.5 && rating < value

          return (
            <div key={value} className="px-1">
              {fullStar ? (
                <MdStar size={24} className="text-yellow-400" />
              ) : halfStar ? (
                <MdStarHalf size={24} className="text-yellow-400" />
              ) : (
                <MdStarBorder size={24} className="text-gray-300" />
              )}
            </div>
          )
        })}
      </div>
      <div className="text-gray-300">
        <span className="font-medium">{rating.toFixed(1)}</span>
        <span className="mx-1">•</span>
        <span>
          {ratingCount || 0} {ratingCount === 1 ? "rating" : "ratings"}
        </span>
      </div>
    </div>
  )
}

const ClassDetails = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [classData, setClassData] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [error, setError] = useState(null)
  const [progressData, setProgressData] = useState({
    unlockedLessons: new Set([0]),
    completedLessons: new Set(),
    currentLessonIndex: 0,
  })

  const [refreshKey, setRefreshKey] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hasStartedJourney, setHasStartedJourney] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [isLearning, setIsLearning] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [classFeedbacks, setClassFeedbacks] = useState([])
  const [relatedClasses, setRelatedClasses] = useState([])
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [quizProgressData, setQuizProgressData] = useState({
    unlockedQuizzes: new Set([0]),
    completedQuizzes: new Set(),
    currentQuizIndex: 0
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    feedbackId: null
  });


  useEffect(() => {
    const fetchQuizProgress = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const attemptsPromises = quizzes.map(quiz =>
          axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/${quiz.id}/attempts`, { headers })
        );
        
        const attemptsResponses = await Promise.all(attemptsPromises);
        
        const unlockedQuizzes = new Set([0]);
        const completedQuizzes = new Set();
        let currentIndex = 0;
  
        attemptsResponses.forEach((response, index) => {
          const attempts = response.data;
          if (attempts && attempts.length > 0) {
            const completedAttempts = attempts.filter(attempt => 
              attempt.completedAt && attempt.score !== null && attempt.maxScore !== null
            );
  
            if (completedAttempts.length > 0) {
              const bestAttempt = completedAttempts.reduce((best, current) => {
                return (current.score > (best?.score || 0)) ? current : best;
              }, null);
  
              if (bestAttempt && bestAttempt.score > 0) {
                completedQuizzes.add(index);
                if (index + 1 < quizzes.length) {
                  unlockedQuizzes.add(index + 1);
                }
                currentIndex = Math.max(currentIndex, index + 1);
              }
            }
          }
        });
  
        setQuizProgressData({
          unlockedQuizzes,
          completedQuizzes,
          currentQuizIndex: currentIndex
        });
  
      } catch (error) {
        console.error('Error fetching quiz progress:', error);
      }
    };
  
    if (quizzes.length > 0) {
      fetchQuizProgress();
    }
  }, [classId, quizzes, isAuthenticated]);

  const fetchClassFeedbacks = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
  
      const cacheBuster = new Date().getTime()
      const response = await axios.get(
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/feedbacks?_=${cacheBuster}`,
        { headers }
      )
  
      const feedbacksWithUserId = response.data.map((feedback) => ({
        ...feedback,
        userId: feedback.user?.id || null,
      }))
  
      setClassFeedbacks(feedbacksWithUserId)
    } catch (error) {
      console.error("Error fetching class feedbacks:", error)
    }
  }

  const fetchRelatedClasses = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/related`, { headers })

      setRelatedClasses(response.data)
    } catch (error) {
      console.error("Error fetching related classes:", error)

      try {
        const categoryResponse = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/all`, { headers })

        const classes = categoryResponse.data
          .filter((c) => c.id !== Number.parseInt(classId) && c.category === classData?.category)
          .slice(0, 4)

        setRelatedClasses(classes)
      } catch (fallbackError) {
        console.error("Error fetching related classes by category:", fallbackError)
      }
    }
  }

  const handleHelpfulFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      await axios.post(`https://it342-g3-neighbornet.onrender.com/api/classes/${feedbackId}/react`, { helpful: true }, { headers })

      await fetchClassFeedbacks()
    } catch (error) {
      console.error("Failed to mark as helpful:", error)
      throw error
    }
  }

  const handleReportFeedback = async (feedbackId) => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      await axios.post(`https://it342-g3-neighbornet.onrender.com/api/classes/${feedbackId}/react`, { helpful: false }, { headers })

      await fetchClassFeedbacks()
    } catch (error) {
      console.error("Failed to report feedback:", error)
      throw error
    }
  }

  const handleEditFeedback = async (feedback) => {
    setFeedbackText(feedback.content)
    setEditingFeedback(feedback)
    setShowFeedbackForm(true)
  }

  const handleCancelFeedback = () => {
    setFeedbackText("")
    setShowFeedbackForm(false)
    setEditingFeedback(null)
  }

  const handleDeleteFeedback = async (feedbackId) => {
    setDeleteConfirmation({
      isOpen: true,
      feedbackId
    });
  };

  const confirmDelete = async () => {
    const feedbackId = deleteConfirmation.feedbackId;
    
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
  
      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/feedback/${feedbackId}`, { headers });
  
      setFeedbacks(current => current.filter(feedback => feedback.id !== feedbackId));
      
      await fetchClassFeedbacks();
      toast.success("Feedback deleted successfully");
    } catch (error) {
      console.error("Failed to delete feedback:", error);
      toast.error("Failed to delete feedback");
    } finally {
      setDeleteConfirmation({ isOpen: false, feedbackId: null });
    }
  };
  
  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, feedbackId: null });
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
  
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback")
      return
    }
  
    setIsSubmittingFeedback(true)
  
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }
  
      let response;
      if (editingFeedback) {
        response = await axios.put(
          `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/feedback/${editingFeedback.id}`,
          {
            content: feedbackText,
            rating: userRating,
          },
          { headers },
        )
        toast.success("Feedback updated successfully!")
      } else {
        // Create new feedback
        response = await axios.post(
          `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/feedback`,
          {
            content: feedbackText,
            rating: userRating,
          },
          { headers },
        )
        toast.success("Feedback submitted successfully!")
      }
  
      if (response.data) {
        if (editingFeedback) {
          setClassFeedbacks(prevFeedbacks => 
            prevFeedbacks.map(feedback => 
              feedback.id === editingFeedback.id 
                ? { ...response.data, userId: user?.data?.id } 
                : feedback
            )
          );
        } else {
          setClassFeedbacks(prevFeedbacks => [
            ...prevFeedbacks,
            { ...response.data, userId: user?.data?.id }
          ]);
        }
      }
  
      await fetchClassFeedbacks()
      
      setFeedbackText("")
      setShowFeedbackForm(false)
      setEditingFeedback(null)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast.error("Failed to submit feedback")
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  const checkLearningStatus = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/learning-status`, { headers })

      setIsLearning(response.data)
      setHasStartedJourney(response.data)
    } catch (error) {
      console.error("Error checking learning status:", error)
    }
  }

  const startLearning = async () => {
    if (!isAuthenticated) {
      // Navigate to sign in with return URL
      navigate("/", {
        state: {
          showSignUp: true,
          redirectAfterAuth: `/class/${classId}`,
          className: classData?.title,
        },
      })
      return
    }

    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      const response = await axios.post(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/start-learning`, {}, { headers })

      setIsLearning(true)
      setHasStartedJourney(true)

      const updatedClassData = response.data
      setClassData(updatedClassData)

      setDisplayRating({
        average: Number(updatedClassData.averageRating || 0),
        count: Number(updatedClassData.ratingCount || 0),
      })

      toast.success("Journey unlocked! You can now start learning.")
    } catch (error) {
      console.error("Error starting learning:", error)
      toast.error("Failed to start learning")
    }
  }

    useEffect(() => {
      const fetchQuizzes = async () => {
        try {
          const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
          setQuizzes(response.data)
        } catch (error) {
          console.error('Error fetching quizzes:', error)
          toast.error('Failed to load quizzes')
        }
      }

      fetchQuizzes()
    }, [classId])

  const [displayRating, setDisplayRating] = useState({
    average: 0,
    count: 0,
  })

  const isOwner = user?.data?.id && classData?.creatorId ? 
  Number(user.data.id) === Number(classData.creatorId) : false

  const fetchLatestClassData = async () => {
    try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }
        
        const timestamp = new Date().getTime()
        const classResponse = await axios.get(
            `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}?_=${timestamp}`, 
            { headers }
        )

        const classData = classResponse.data
        console.log("Class Response (freshly fetched):", classData)

        setClassData(classData)
        setDisplayRating({
            average: Number(classData.averageRating || 0),
            count: Number(classData.ratingCount || 0),
        })

        return classData
    } catch (error) {
        console.error("Error fetching updated class data:", error)
        return null
    }
}

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = isAuthenticated ? { Authorization: `Bearer ${token}` } : {}

        const [classResponse, lessonsResponse] = await Promise.all([
          axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}?_=${new Date().getTime()}`, { headers }),
          isAuthenticated
              ? axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/lessons`, { headers })
              : Promise.resolve({ data: [] }),
      ])

        const classResponseData = classResponse.data
        setClassData(classResponse.data)
        setLessons(lessonsResponse.data)

        setDisplayRating({
          average: Number(classResponseData.averageRating || 0),
          count: Number(classResponseData.ratingCount || 0),
        })

        if (isAuthenticated && user) {
          await checkLearningStatus()
          try {
            // Fetch latest progress
            const progressResponse = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/progress`, {
              headers,
            })

            const unlockedSet = new Set([0])
            const completedSet = new Set()
            let currentIndex = 0

            progressResponse.data.forEach((progress) => {
              const lessonIndex = lessonsResponse.data.findIndex((l) => l.id === progress.lessonId)
              if (progress.completed) {
                completedSet.add(lessonIndex)
                unlockedSet.add(lessonIndex + 1)
                currentIndex = Math.max(currentIndex, lessonIndex + 1)
              }
            })

            setProgressData({
              unlockedLessons: unlockedSet,
              completedLessons: completedSet,
              currentLessonIndex: currentIndex,
            })

            try {
              const ratingResponse = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/rating`, { headers })
              if (ratingResponse.data && ratingResponse.data.rating) {
                setUserRating(ratingResponse.data.rating)
              }
            } catch (err) {
              console.log("No previous rating found for this user")
            }
          } catch (error) {
            console.error("Failed to fetch progress:", error)
          }
        }

        fetchClassFeedbacks()
        fetchRelatedClasses()

        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch class details:", err)
        setError(err.response?.data?.message || "Failed to load class")
        setLoading(false)
      }
    }

    fetchClassDetails()
  }, [classId, isAuthenticated, user, refreshKey])

  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey((prev) => prev + 1)
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const handleLessonClick = async (lesson, index) => {
    if (!isAuthenticated) {
      navigate("/?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (!hasStartedJourney && !isOwner) {
      toast.error("Please begin your journey first!")
      return
    }

    if (!progressData.unlockedLessons.has(index)) {
      toast.error("Please complete the previous lesson first!")
      return
    }

    navigate(`/your-classes/${classId}/lessons/${lesson.id}`)
  }

  const handleRatingUpdate = async (newRating) => {
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      // Submit the new rating
      await axios.post(`https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/rate`, { rating: newRating }, { headers })

      // Fetch updated class data
      const updatedData = await fetchLatestClassData()

      if (updatedData) {
        setUserRating(newRating)
        toast.success("Rating submitted successfully!")

        setShowFeedbackForm(true)
      }
    } catch (error) {
      console.error("Error updating rating:", error)
      toast.error("Failed to submit rating")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-200 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-blue-600 font-medium">Loading class content...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 mb-6 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">{error}</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/your-classes")}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:shadow-lg transition-all duration-300"
        >
          Go Back to Classes
        </motion.button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6 z-50"
      >
        <motion.button
          onClick={() => navigate("/homepage")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2 px-6 py-3 bg-white/80 
                      hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl 
                      transition-all duration-300 backdrop-blur-sm border border-white/50"
        >
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }} className="relative">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 
                            rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 relative z-10"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </motion.div>

          <span
            className="text-transparent bg-clip-text bg-gradient-to-r 
                            from-blue-600 to-purple-600 font-medium"
          >
            Back Home
          </span>

          {/* Hover Effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity 
                          duration-300"
          />
        </motion.button>
      </motion.div>
      {/* Sticky Enrollment Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: isScrolled ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 bg-white shadow-md z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-gray-900 line-clamp-1">{classData?.title}</h3>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <MdPeople className="text-blue-500" />
              {classData?.enrolledCount || 0} students
            </div>
          </div>
          {!isOwner && (
            <motion.button
              onClick={() => handleLessonClick(lessons[0], 0)}
              disabled={!hasStartedJourney}
              className={`px-6 py-2 text-white rounded-full
                          transition-all duration-300 flex items-center gap-2 font-medium
                          ${
                            hasStartedJourney
                              ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
              whileHover={hasStartedJourney ? { scale: 1.02 } : {}}
            >
              {!hasStartedJourney && <MdLock className="text-sm" />}
              Start Learning
              <MdArrowForward />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 pt-20 overflow-hidden">
        <FloatingShape className="w-72 h-72 bg-blue-500/30 -top-20 -left-20" />
        <FloatingShape className="w-96 h-96 bg-purple-500/20 top-40 right-0" />
        <FloatingShape className="w-64 h-64 bg-indigo-500/20 bottom-0 left-1/3" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,rgba(59,130,246,0)_70%)] opacity-70"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "60px 60px",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-[1.5fr,1fr] gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">{classData?.title}</h1>
                <p className="text-xl text-gray-300 leading-relaxed">{classData?.description}</p>

                {/* Rating display */}
                <ClassRatingDisplay
                  averageRating={displayRating.average}
                  ratingCount={displayRating.count}
                  classId={classId}
                />

                <div className="flex flex-wrap gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <MdOutlinePeople className="text-blue-400" />
                    {classData?.enrolledCount || 0} students enrolled
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineTimer className="text-blue-400" />
                    {classData?.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineLightbulb className="text-blue-400" />
                    {classData?.difficulty}
                  </div>
                </div>
              </motion.div>

              {/* Creator Info */}
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
                              flex items-center justify-center text-white text-xl font-medium"
                >
                  {classData?.creatorName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{classData?.creatorName}</p>
                  <p className="text-blue-300">{classData?.creatorEmail}</p>
                </div>
              </div>

              {/* CTA Button - Only show if not owner */}
              {!isOwner && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLessonClick(lessons[0], 0)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white
                           rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300
                           flex items-center gap-3 font-medium text-lg group"
                >
                  <MdOutlinePlayCircleFilled className="text-2xl" />
                  Start Learning Now
                  <MdArrowForward className="transition-transform group-hover:translate-x-1" />
                </motion.button>
              )}
            </div>

            {/* Right Column - Preview */}
            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - left) / width - 0.5
                const y = (e.clientY - top) / height - 0.5
                setMousePosition({ x, y })
              }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{
                  rotateY: mousePosition.x * 10,
                  rotateX: -mousePosition.y * 10,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                {classData?.thumbnailUrl ? (
                  <div className="group relative h-full">
                    <img
                      src={`https://it342-g3-neighbornet.onrender.com${classData.thumbnailUrl}`}
                      alt={classData.title}
                      className="w-full h-full object-cover transition-transform duration-300 
                                group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center 
                                bg-gradient-to-br from-blue-900/50 to-purple-900/50"
                  >
                    <div className="text-2xl text-white/80">No thumbnail available</div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: MdOutlinePeople,
                label: "Students",
                value: classData?.enrolledCount || 0,
              },
              {
                icon: MdOutlinePlayCircleFilled,
                label: "Lessons",
                value: lessons.length,
              },
              {
                icon: MdOutlineTimer,
                label: "Duration",
                value: classData?.duration,
              },
              {
                icon: MdOutlineLightbulb,
                label: "Level",
                value: classData?.difficulty,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.1)",
                }}
                className="text-center p-6 bg-white rounded-2xl transform-gpu perspective-1000
                          hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50
                          transition-all duration-300 border border-gray-200"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 
                                opacity-0 group-hover:opacity-10 transition-opacity rounded-xl"
                  />
                  <stat.icon className="mx-auto text-4xl text-blue-500 mb-3" />
                  <p
                    className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                                bg-clip-text text-transparent"
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Column - Lessons */}
          <div className="space-y-8">
            {/* Class Content Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Class Content</h2>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {progressData.completedLessons.size} of {lessons.length} completed
                </div>
              </div>

              {/* Lessons List - Keep your existing lessons mapping but enhance the styling */}
              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const isUnlocked = progressData.unlockedLessons.has(index)
                  const isCompleted = progressData.completedLessons.has(index)
                  const isCurrent = progressData.currentLessonIndex === index

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative rounded-xl transition-all duration-300
                                ${isUnlocked ? "hover:bg-blue-50/50" : "opacity-60"}
                                ${isCurrent ? "ring-2 ring-blue-500 bg-blue-50/30" : ""}`}
                    >
                      <button
                        onClick={() => handleLessonClick(lesson, index)}
                        className="w-full flex items-center gap-6 p-6"
                        disabled={!isUnlocked}
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center
                                     transition-colors duration-300
                                     ${
                                       isCompleted
                                         ? "bg-green-100 text-green-600"
                                         : isUnlocked
                                           ? "bg-blue-100 text-blue-600"
                                           : "bg-gray-100 text-gray-400"
                                     }`}
                        >
                          {isCompleted ? (
                            <MdCheckCircle className="text-2xl" />
                          ) : isUnlocked ? (
                            <MdPlayArrow className="text-2xl" />
                          ) : (
                            <MdLock className="text-2xl" />
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <h3
                            className={`font-medium transition-colors duration-300
                                      ${isUnlocked ? "text-gray-900 group-hover:text-blue-600" : "text-gray-400"}`}
                          >
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{lesson.description}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                          {isCompleted && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <MdStar key={i} className="text-yellow-400 text-sm" />
                              ))}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Progress Line */}
                      {index < lessons.length - 1 && (
                        <div className="absolute left-[2.25rem] top-[4.5rem] bottom-0 w-0.5">
                          <div className="h-full bg-gray-100" />
                          {isCompleted && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "100%" }}
                              className="absolute inset-0 bg-green-500"
                            />
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              
            {/* Quizzes Section */}
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Quizzes & Exercises</h2>
                </div>
                
                <QuizList 
                  classId={classId} 
                  quizzes={quizzes}
                  progressData={quizProgressData}
                  hasStartedJourney={hasStartedJourney}
                  isOwner={isOwner}
                />
              </div>
            </div>

            {/* Requirements Section */}
            {classData?.requirements && classData.requirements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="grid gap-4">
                  {classData.requirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100
                               transition-colors duration-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MdInfo className="text-blue-600" />
                      </div>
                      <p className="text-gray-700">{req}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Class Sections */}
                {classData?.sections && classData.sections.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Sections</h2>
                    <div className="grid gap-4">
                      {classData.sections.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex flex-col gap-3 p-6 rounded-xl bg-gray-50 hover:bg-gray-100
                                    transition-colors duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <MdLibraryBooks className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {section.title}
                              </h3>
                              <p className="text-gray-700 mb-3">
                                {section.content}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <MdAccessTime className="text-blue-500" />
                                <span>{section.duration}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-8 h-fit">
            {/* Class Creator Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Creator Header - with gradient background */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                  <MdPerson className="text-blue-200" /> About the Instructor
                </h3>
                <p className="text-blue-100 text-sm">Learn from an experienced professional</p>
              </div>

              <div className="p-6">
                {/* Creator Profile */}
                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600
                                  flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  >
                    {classData?.creatorName?.[0]?.toUpperCase() || "I"}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{classData?.creatorName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MdEmail className="text-blue-500" />
                      <a href={`mailto:${classData?.creatorEmail}`} className="text-blue-600 hover:underline">
                        {classData?.creatorEmail}
                      </a>
                    </div>

                    {classData?.phone_number && (
                      <div className="flex items-center gap-2 mt-1">
                        <MdPhone className="text-blue-500" />
                        <p className="text-gray-700">{classData.phone_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credentials with styled callout */}
                {classData?.creator_credentials && (
                  <div className="mt-6">
                    <h5 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2 flex items-center gap-2">
                      <MdOutlineSchool className="text-blue-500" />
                      Credentials & Experience
                    </h5>
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-gray-700 leading-relaxed">{classData.creator_credentials}</p>
                    </div>
                  </div>
                )}

                {/* Social Links with proper icons */}
                {(classData?.linkedinUrl || classData?.portfolioUrl) && (
                  <div className="mt-6">
                    <h5 className="text-sm uppercase tracking-wider text-gray-500 font-medium mb-2 flex items-center gap-2">
                      <MdOutlineLink className="text-blue-500" />
                      Connect & Learn More
                    </h5>
                    <div className="flex flex-wrap gap-3">
                      {classData?.linkedinUrl && (
                        <a
                          href={classData.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:bg-[#00669c] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                          </svg>
                          LinkedIn Profile
                        </a>
                      )}

                      {classData?.portfolioUrl && (
                        <a
                          href={classData.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                          <MdLanguage className="text-lg" />
                          Portfolio Website
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Teaching Stats */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 p-4 bg-gray-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">{classData?.enrolledCount || 0}</div>
                    <p className="text-gray-600 text-sm">Students</p>
                  </div>

                  <div className="flex-1 p-4 bg-gray-50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-blue-600">1</div>
                    <p className="text-gray-600 text-sm">Courses</p>
                  </div>

                  <div className="flex-1 p-4 bg-gray-50 rounded-xl text-center">
                    <div className="flex justify-center items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MdStar
                          key={star}
                          className={`text-lg ${star <= (classData?.averageRating || 0) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{classData?.ratingCount || 0} Reviews</p>
                  </div>
                </div>

                {/* Category and Difficulty */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {classData?.category && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <MdCategory className="text-blue-600" />
                      {classData.category}
                    </div>
                  )}

                  {classData?.difficulty && (
                    <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <MdSignalCellularAlt className="text-purple-600" />
                      {classData.difficulty}
                    </div>
                  )}

                  {classData?.duration && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                      <MdAccessAlarm className="text-green-600" />
                      {classData.duration} duration
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* User Rating Card */}
            {!isOwner && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate This Class</h3>
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">Your feedback helps other students and improves our content.</p>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-gray-700 font-medium">Your Rating</p>
                      <StarRating
                        initialRating={userRating}
                        classId={classId}
                        onRatingUpdate={handleRatingUpdate}
                        readOnly={false}
                      />
                      {userRating > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-green-600">
                          <MdCheckCircle />
                          <span className="text-sm font-medium">Rating submitted</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions Card */}
            {!isOwner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
              >
                <h3 className="text-xl font-semibold mb-4">Ready to Start Learning?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Self-paced learning</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Access to all materials</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Certificate upon completion</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startLearning}
                    className="w-full py-3 px-6 bg-white text-blue-600 rounded-xl font-medium
                                hover:bg-blue-50 transition-colors duration-300 mt-6
                                flex items-center justify-center gap-2"
                  >
                    {!isAuthenticated ? (
                      <>
                        <MdLock className="text-xl" />
                        Sign Up to Begin
                      </>
                    ) : isLearning ? (
                      <>
                        <MdCheckCircle className="text-xl" />
                        Journey Started
                      </>
                    ) : (
                      <>
                        <MdPlayArrow className="text-xl" />
                        Begin Your Journey
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Progress Card - Only show for non-owners */}
            {Number(user?.data?.id) !== Number(classData?.creatorId) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(progressData.completedLessons.size / lessons.length) * 100}%`,
                      }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{progressData.completedLessons.size} lessons completed</span>
                    <span className="text-gray-600">{lessons.length - progressData.completedLessons.size} remaining</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          {/* Feedback Header with decorative elements */}
          <div className="relative mb-12">
            <div className="absolute -top-6 left-0 w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MdOutlineFeedback className="text-2xl text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Student Feedback</h2>
              </div>

              {!isOwner && isAuthenticated && userRating > 0 && !showFeedbackForm && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFeedbackForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                            shadow-md transition-all duration-300 flex items-center gap-2 font-medium"
                >
                  <MdRateReview className="text-xl" />
                  Share Your Experience
                </motion.button>
              )}
            </div>

            {/* Rating summary - New addition */}
            <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{displayRating.average.toFixed(1)}</div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const fullStar = displayRating.average >= star
                      const halfStar = displayRating.average > star - 0.5 && displayRating.average < star

                      return (
                        <div key={star} className="px-1">
                          {fullStar ? (
                            <MdStar size={20} className="text-yellow-400" />
                          ) : halfStar ? (
                            <MdStarHalf size={20} className="text-yellow-400" />
                          ) : (
                            <MdStarBorder size={20} className="text-gray-300" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="text-sm mt-1 text-gray-600">{displayRating.count} ratings</div>
                </div>

                <div className="flex-1">
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const percentage =
                        displayRating.count > 0
                          ? Math.round((displayRating.average >= rating ? (6 - rating) * 20 : 0) * 100) / 100
                          : 0

                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="flex items-center w-16">
                            <span className="text-sm text-gray-600">{rating}</span>
                            <MdStar className="ml-1 text-yellow-400 text-sm" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.3 + (5 - rating) * 0.1 }}
                              className="h-full bg-yellow-400 rounded-full"
                            />
                          </div>
                          <div className="w-10 text-right">
                            <span className="text-sm text-gray-600">{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form - Enhanced */}
          <AnimatePresence>
            {showFeedbackForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <FeedbackFormEnhanced
                  onSubmit={handleSubmitFeedback}
                  value={feedbackText}
                  onChange={setFeedbackText}
                  isSubmitting={isSubmittingFeedback}
                  onCancel={handleCancelFeedback}
                  rating={userRating}
                  editingFeedback={editingFeedback}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback List - Enhanced */}
          {classFeedbacks.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 gap-6"
            >
              {classFeedbacks.map((feedback, index) => (
                <motion.div
                  key={feedback.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FeedbackItemEnhanced
                    feedback={feedback}
                    currentUserId={user?.id}
                    onHelpful={handleHelpfulFeedback}
                    onReport={handleReportFeedback}
                    onEdit={handleEditFeedback}
                    onDelete={handleDeleteFeedback}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="py-16 text-center"
            >
              <div className="inline-block p-5 mb-4 bg-blue-50 rounded-full">
                <MdOutlineChatBubbleOutline className="text-4xl text-blue-500" />
              </div>
              <p className="text-xl text-gray-600">Be the first to leave feedback for this class!</p>
              <p className="mt-2 text-gray-500 max-w-lg mx-auto">
                Share your experience and help others decide if this class is right for them.
              </p>
            </motion.div>
          )}

          {/* Pagination - if you have many feedbacks */}
          {classFeedbacks.length > 5 && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <button className="px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <MdKeyboardArrowLeft />
                </button>
                <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-blue-600">
                  1
                </button>
                <button className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <MdKeyboardArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Classes */}

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Classes You May Like</h2>
          {relatedClasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedClasses.map((relatedClass) => (
                <RelatedClassCard
                  key={relatedClass.id}
                  classItem={relatedClass}
                  onClick={(id) => navigate(`/class/${id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No related classes found in this category.</p>
            </div>
          )}
        </div>
      </div>


      {/* Confirmation Dialog */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 relative">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Delete Feedback</h3>
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this feedback? This action cannot be undone.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      <Footer />
    </div>
  )
}

export default ClassDetails

