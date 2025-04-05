import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { MdArrowBack, MdTimer, MdHelp, MdCheckCircle, MdClose, MdEmojiEvents } from 'react-icons/md'
import ReactConfetti from 'react-confetti'

const QuizPage = () => {
    const { classId, quizId } = useParams()
    const navigate = useNavigate()
    const [quiz, setQuiz] = useState(null)
    const [currentAttempt, setCurrentAttempt] = useState(null)
    const [answers, setAnswers] = useState({})
    const [loading, setLoading] = useState(true)
    const [timeLeft, setTimeLeft] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [quizResult, setQuizResult] = useState(null)
    const [showConfetti, setShowConfetti] = useState(false)
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    useEffect(() => {
        const handleResize = () => {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const fetchQuiz = async () => {
          try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
              `http://localhost:8080/api/classes/${classId}/quizzes/${quizId}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            )
            setQuiz(response.data)
            setTimeLeft(response.data.timeLimit * 60)
          } catch (error) {
            console.error('Error fetching quiz:', error)
            toast.error('Failed to load quiz')
            navigate(`/class/${classId}`)
          } finally {
            setLoading(false)
          }
        }
      
        fetchQuiz()
      }, [quizId, classId])

  const startQuiz = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `http://localhost:8080/api/classes/${classId}/quizzes/${quizId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setCurrentAttempt(response.data)
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error('Failed to start quiz')
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const submitQuiz = async () => {
    if (!currentAttempt) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `http://localhost:8080/api/classes/${classId}/quizzes/${quizId}/attempts/${currentAttempt.id}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      setQuizResult(response.data)
      setShowConfetti(true)
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const ResultScreen = ({ result }) => {
    const score = result.score
    const maxScore = result.maxScore
    const percentage = (score / maxScore) * 100
    const passed = percentage >= (quiz?.passingScore || 60)
  
    const formatAnswer = (question, answer) => {
      if (question.type === 'TRUE_FALSE') {
        return answer === "1" ? "True" : "False"
      }
      return answer
    }

    const getPerformanceMessage = () => {
      if (percentage === 100) return 'Perfect Score! Excellent job! 🎉'
      if (percentage >= 90) return 'Outstanding Performance! 🌟'
      if (percentage >= 80) return 'Great Work! 👏'
      if (percentage >= quiz?.passingScore) return 'Good Job! 👍'
      return 'Keep Practicing! You can do better! 💪'
    }
  
    const getGradeLevel = () => {
      if (percentage === 100) return 'Perfect'
      if (percentage >= 90) return 'A'
      if (percentage >= 80) return 'B'
      if (percentage >= 70) return 'C'
      if (percentage >= 60) return 'D'
      return 'F'
    }
  
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden"
      >
        {passed && showConfetti && (
          <ReactConfetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899']}
          />
        )}
        
        <div className="text-center space-y-6">
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {passed ? (
              <MdEmojiEvents className="text-5xl text-green-500" />
            ) : (
              <MdCheckCircle className="text-5xl text-yellow-500" />
            )}
          </div>
          
          <div>
            <h2 className={`text-3xl font-bold ${
              passed ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {getPerformanceMessage()}
            </h2>
            <p className="text-gray-600 mt-2">
              Grade: <span className="font-bold">{getGradeLevel()}</span>
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xl text-gray-700 font-medium">
              Your Score: {score}/{maxScore} ({Math.round(percentage)}%)
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Passing Score: {quiz?.passingScore}%
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={`h-full ${
                  passed 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
              />
            </div>
          </div>
  
          {/* Question review */}
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-gray-700">Question Review</h3>
            {result.correctAnswers && Object.entries(result.correctAnswers).map(([questionId, correctAnswer]) => {
              const question = quiz.questions.find(q => q.id.toString() === questionId)
              const userAnswer = answers[questionId]
              const isCorrect = userAnswer === correctAnswer
  
              return (
                <div key={questionId} className={`p-4 rounded-lg ${
                  isCorrect 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className="font-medium">{question.content}</p>
                  <div className="mt-2 text-sm">
                    <p>Your answer: <span className={
                      isCorrect ? 'text-green-600 font-medium' : 'text-yellow-600'
                    }>
                      {formatAnswer(question, userAnswer)}
                    </span></p>
                    {!isCorrect && <p className="text-green-600 font-medium">
                      Correct answer: {formatAnswer(question, correctAnswer)}
                    </p>}
                  </div>
                  {result.explanations?.[questionId] && (
                    <p className="mt-2 text-gray-600 text-sm italic">
                      {result.explanations[questionId]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
  
          <div className="flex gap-4 justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/class/${classId}`)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to Class
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setQuizResult(null)
                setCurrentAttempt(null)
                setAnswers({})
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              Try Again
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="mt-4 text-blue-600 font-medium">Loading quiz...</div>
        </div>
      </div>
    )
  }

  const totalQuestions = quiz?.questions?.length || 0
  const progress = (currentQuestionIndex / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/class/${classId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MdArrowBack className="text-xl" /> Back to Class
          </button>
          <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            {quiz?.title}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">{quiz?.description}</p>
          
          {quiz?.timeLimit && (
            <div className="flex items-center gap-2 text-gray-600 mt-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
              <MdTimer className="text-xl text-blue-500" />
              <span className="font-medium">{quiz.timeLimit} minutes</span>
            </div>
          )}
        </motion.div>
  
        {quizResult ? (
          <ResultScreen result={quizResult} />
        ) : !currentAttempt ? (
          // Quiz start screen
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <MdHelp className="text-2xl text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to start?</h2>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600">
                  <MdTimer className="text-xl text-blue-500" />
                  <span>Time Limit: {quiz?.timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MdCheckCircle className="text-xl text-green-500" />
                  <span>Passing Score: {quiz?.passingScore}%</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startQuiz}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                          font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300
                          flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Start Quiz
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Quiz questions
          <div className="space-y-8">
            {/* Progress bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
            </motion.div>
  
            {quiz?.questions?.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: currentQuestionIndex === index ? 1 : 0,
                  y: currentQuestionIndex === index ? 0 : 20,
                  display: currentQuestionIndex === index ? 'block' : 'none'
                }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <h3 className="text-xl font-medium mb-6 text-gray-900">
                  <span className="text-blue-600 font-bold mr-2">Q{index + 1}.</span>
                  {question.content}
                </h3>
                
                {/* Question types rendering */}
                {question.type === 'MULTIPLE_CHOICE' && question.options && (
                  <div className="space-y-4">
                    {question.options.map((option, optionIndex) => (
                      <motion.label
                        key={optionIndex}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer
                                  transition-all duration-300
                                  ${answers[question.id] === option 
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : 'border-gray-200 hover:border-blue-200'}`}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={() => handleAnswerChange(question.id, option)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </motion.label>
                    ))}
                  </div>
                )}
  
                    {question.type === 'TRUE_FALSE' && (
                    <div className="space-y-4">
                      {['True', 'False'].map((option, optionIndex) => (
                        <motion.label
                          key={optionIndex}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer
                                    transition-all duration-300
                                    ${answers[question.id] === String(optionIndex + 1)
                                      ? 'border-blue-500 bg-blue-50/50'
                                      : 'border-gray-200 hover:border-blue-200'}`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={String(optionIndex + 1)}  // Send "1" for True, "2" for False
                            checked={answers[question.id] === String(optionIndex + 1)}
                            onChange={() => handleAnswerChange(question.id, String(optionIndex + 1))}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-700">{option}</span>
                        </motion.label>
                      ))}
                    </div>
                  )}
  
                {question.type === 'ESSAY' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500
                             focus:ring-2 focus:ring-blue-200 transition-all duration-300
                             text-gray-700 resize-none"
                    rows={6}
                    placeholder="Type your answer here..."
                  />
                )}
  
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-2 text-blue-600 rounded-lg hover:bg-blue-50
                             disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === totalQuestions - 1 ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={submitQuiz}
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                                text-white rounded-xl shadow-lg hover:shadow-xl 
                                transition-all duration-300 disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                               hover:bg-blue-700 transition-all"
                    >
                      Next
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPage