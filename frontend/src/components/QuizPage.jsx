import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { MdArrowBack, MdTimer, MdHelp, MdCheckCircle, MdClose, MdEmojiEvents, MdFlag, MdLightbulb, MdOutlineQuiz, MdSchool } from 'react-icons/md'
import { Clock, Award, Medal, BookOpen, CheckCircle, Zap, Brain, Target, ChevronLeft, ChevronRight, AlertCircle, Star, Sparkles, TrendingUp } from 'lucide-react'
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
    const [animateScore, setAnimateScore] = useState(false)
    const [selectedOption, setSelectedOption] = useState(null)
    const [showTimeExpiredModal, setShowTimeExpiredModal] = useState(false);
    const [windowSize, setWindowSize] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const TimerDisplay = () => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timerClass = timeLeft < 60 
        ? 'text-red-600 animate-pulse' 
        : timeLeft < 180 
          ? 'text-amber-600' 
          : 'text-blue-600';
      
      return (
        <div className={`flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200`}>
          <Clock className={`w-5 h-5 ${timerClass}`} />
          <div>
            <div className="text-xs text-gray-500">Time Remaining</div>
            <div className={`font-mono font-bold ${timerClass}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      );
    };

    const TimeExpiredModal = () => {
      const handleTimeUp = async () => {
        // Auto-submit with current answers
        await submitQuiz();
        setShowTimeExpiredModal(false);
      };
      
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Time's Up!</h3>
              <p className="text-gray-600 mt-2">
                Your allocated time for this quiz has expired.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                <p className="text-amber-800 text-sm">
                  Your quiz will be automatically submitted with your current answers. Questions you haven't answered will be marked as unanswered.
                </p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleTimeUp}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                       font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit My Answers</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      );
    };

    useEffect(() => {
      let timer;
      
      if (currentAttempt && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prevTime) => {
            const newTime = prevTime - 1;
            
            if (newTime <= 0) {
              clearInterval(timer);
              setShowTimeExpiredModal(true);
              return 0;
            }
            
            return newTime;
          });
        }, 1000);
      }
      
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [currentAttempt, timeLeft]);

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
              `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/${quizId}`,
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
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/${quizId}/start`,
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
    // Visual-only feedback
    setSelectedOption(answer)
    setTimeout(() => setSelectedOption(null), 300)
  }

  const submitQuiz = async () => {
    if (!currentAttempt) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/${quizId}/attempts/${currentAttempt.id}/submit`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      setQuizResult(response.data)
      setShowConfetti(true)
      setTimeout(() => {
        setAnimateScore(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }, 1000)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const ResultScreen = ({ result }) => {
    const score = result.score || 0;
    const maxScore = result.maxScore || 1;
    const percentage = Math.min(100, Math.round((score / maxScore) * 100));
    const passed = percentage >= (quiz?.passingScore || 60);
  
    // Simple function to format true/false answers
    const formatAnswer = (question, answer) => {
      if (question.type === 'TRUE_FALSE') {
        return answer === "1" ? "True" : "False";
      }
      return answer;
    };
  
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {/* Simple header with result */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            passed ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {passed ? (
              <CheckCircle className="w-10 h-10" />
            ) : (
              <AlertCircle className="w-10 h-10" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
          </h2>
          
          <p className="text-lg text-gray-600">
            Your Score: <span className="font-bold">{score}/{maxScore} ({percentage}%)</span>
          </p>
          
          <p className="text-sm text-gray-500 mt-1">
            Passing Score: {quiz?.passingScore || 60}%
          </p>
        </div>
  
        {/* Simple progress bar */}
        <div className="h-3 bg-gray-200 rounded-full mb-8">
          <div 
            className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
  
        {/* Question review - simplified */}
        <div className="space-y-4 mb-8">
          <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Question Review</h3>
          
          {result.correctAnswers && Object.entries(result.correctAnswers).map(([questionId, correctAnswer], index) => {
            const question = quiz.questions.find(q => q.id.toString() === questionId);
            const userAnswer = answers[questionId];
            const isCorrect = userAnswer === correctAnswer;
            
            if (!question) return null;
            
            return (
              <div 
                key={questionId}
                className={`p-3 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}
              >
                <div className="flex gap-2">
                  <div className={`rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isCorrect ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800">Q{index + 1}: {question.content}</p>
                    
                    <div className="mt-2 text-sm">
                      <p>Your answer: <span className={isCorrect ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                        {formatAnswer(question, userAnswer)}
                      </span></p>
                      
                      {!isCorrect && (
                        <p>Correct answer: <span className="text-green-600 font-medium">
                          {formatAnswer(question, correctAnswer)}
                        </span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  
        {/* Simple action buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate(`/class/${classId}`)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Class
          </button>
          
          <button
            onClick={() => {
              setQuizResult(null);
              setCurrentAttempt(null);
              setAnswers({});
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdOutlineQuiz className="text-blue-500 text-xl animate-pulse" />
            </div>
          </div>
          <div className="mt-4 text-blue-600 font-medium">Loading quiz...</div>
          <div className="mt-1 text-gray-500 text-sm">Please wait a moment</div>
          <div className="mt-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  const totalQuestions = quiz?.questions?.length || 0
  const progress = (currentQuestionIndex / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 py-8 relative">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-5 pattern-dots z-0 pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl opacity-20 z-0 animate-blob pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl opacity-20 z-0 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl opacity-20 z-0 animate-blob animation-delay-4000 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <motion.button
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/class/${classId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Class
          </motion.button>
          
          <div className="mt-6 flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-md inline-flex self-start"
            >
              <MdOutlineQuiz className="text-3xl text-white" />
            </motion.div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-transparent bg-clip-text">
                {quiz?.title}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">{quiz?.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-3">
                {quiz?.timeLimit && (
                  <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block border border-blue-100 shadow-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{quiz.timeLimit} minutes</span>
                  </div>
                )}

                {currentAttempt && !quizResult && (
                  <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block border border-blue-100 shadow-sm">
                    <TimerDisplay />
                  </div>
                )}
                                
                <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block border border-blue-100 shadow-sm">
                  <MdSchool className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">Passing: {quiz?.passingScore}%</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg inline-block border border-blue-100 shadow-sm">
                  <MdOutlineQuiz className="w-4 h-4 text-violet-500" />
                  <span className="font-medium">{totalQuestions} Questions</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
  
        {quizResult ? (
          <ResultScreen result={quizResult} />
        ) : !currentAttempt ? (
          // Quiz start screen
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 z-0"></div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 to-transparent z-0"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl z-0"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Brain className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ready to test your knowledge?</h2>
                  <p className="text-gray-600 mt-1">Complete the quiz to evaluate your understanding of the topic.</p>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-md border border-blue-100"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MdOutlineQuiz className="text-xl text-blue-500" />
                  Quiz Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white/70 p-4 rounded-lg shadow-sm border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Time Limit</div>
                      <div className="font-semibold text-gray-800">{quiz?.timeLimit} minutes</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 p-4 rounded-lg shadow-sm border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Passing Score</div>
                      <div className="font-semibold text-gray-800">{quiz?.passingScore}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 p-4 rounded-lg shadow-sm border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Questions</div>
                      <div className="font-semibold text-gray-800">{totalQuestions} questions</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                            font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300
                            flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[200px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex-box w-0 bg-white/20 skew-x-15 animate-shine"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Start Quiz
                  </span>
                </motion.button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center text-sm text-gray-500"
              >
                <p>Good luck! Take your time to read each question carefully.</p>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // Quiz questions
          <div className="space-y-8">
            {/* Progress bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-blue-100"
            >
              <div className="flex justify-between text-sm font-medium mb-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <MdOutlineQuiz className="text-lg text-blue-600" />
                  <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-700">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>{Math.round(progress)}% Complete</span>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-shine animate-shine"></div>
                </motion.div>
              </div>
              
              {/* Question pagination */}
              <div className="flex justify-center mt-3">
                {quiz?.questions?.map((q, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 rounded-full mx-1 flex items-center justify-center text-xs font-medium transition-all ${
                      currentQuestionIndex === idx
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                        : answers[q.id] 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </motion.button>
                ))}
              </div>
            </motion.div>
  
            <AnimatePresence mode="sync">
              {quiz?.questions?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentQuestionIndex === index ? 1 : 0,
                    y: currentQuestionIndex === index ? 0 : 20,
                    display: currentQuestionIndex === index ? 'block' : 'none'
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-blue-100"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">
                      {question.content}
                    </h3>
                  </div>

                  <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        Choose the correct option
                      </>
                    )}
                    {question.type === 'TRUE_FALSE' && (
                      <>
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        Select True or False
                      </>
                    )}
                    {question.type === 'ESSAY' && (
                      <>
                        <AlignLeft className="w-4 h-4 text-blue-500" />
                        Write your response in the text area
                      </>
                    )}
                  </div>
                  
                  {/* Question types rendering */}
                  {question.type === 'MULTIPLE_CHOICE' && question.options && (
                    <div className="space-y-4 mt-6">
                      {question.options.map((option, optionIndex) => (
                        <motion.div
                          key={optionIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + optionIndex * 0.1 }}
                        >
                          <motion.label
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            animate={selectedOption === option ? { scale: [1, 1.02, 1] } : {}}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer
                                      transition-all duration-300
                                      ${answers[question.id] === option 
                                        ? 'border-blue-500 bg-blue-50/60 shadow-md'
                                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              answers[question.id] === option
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-2 border-gray-300'
                            } transition-colors`}>
                              {answers[question.id] === option && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`inline-block w-6 h-6 text-center rounded-lg mr-3 ${
                                  answers[question.id] === option
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-gray-100 text-gray-700'
                                } flex items-center justify-center transition-colors text-sm font-medium`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span className={`text-gray-800 ${answers[question.id] === option ? 'font-medium' : ''}`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                            
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={answers[question.id] === option}
                              onChange={() => handleAnswerChange(question.id, option)}
                              className="sr-only"
                            />
                          </motion.label>
                        </motion.div>
                      ))}
                    </div>
                  )}
  
                  {question.type === 'TRUE_FALSE' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {['True', 'False'].map((option, optionIndex) => (
                        <motion.div
                          key={optionIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 + optionIndex * 0.1 }}
                        >
                          <motion.label
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            animate={selectedOption === String(optionIndex + 1) ? { scale: [1, 1.03, 1] } : {}}
                            className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 cursor-pointer
                                      transition-all duration-300 h-full
                                      ${answers[question.id] === String(optionIndex + 1)
                                        ? `border-blue-500 bg-gradient-to-br ${
                                            optionIndex === 0 
                                              ? 'from-green-50 to-emerald-50/60' 
                                              : 'from-orange-50 to-amber-50/60'
                                          } shadow-md`
                                        : 'border-gray-200 hover:border-blue-300 bg-white'}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              answers[question.id] === String(optionIndex + 1)
                                ? optionIndex === 0 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                                  : 'bg-gradient-to-br from-orange-500 to-amber-500'
                                : 'border-2 border-gray-300'
                            } transition-colors`}>
                              {answers[question.id] === String(optionIndex + 1) ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-gray-500">{optionIndex === 0 ? 'T' : 'F'}</span>
                              )}
                            </div>
                            
                            <span className={`text-lg ${
                              answers[question.id] === String(optionIndex + 1)
                                ? optionIndex === 0 
                                  ? 'text-green-700'
                                  : 'text-amber-700'
                                : 'text-gray-700'
                            } font-medium`}>
                              {option}
                            </span>
                            
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={String(optionIndex + 1)}
                              checked={answers[question.id] === String(optionIndex + 1)}
                              onChange={() => handleAnswerChange(question.id, String(optionIndex + 1))}
                              className="sr-only"
                            />
                          </motion.label>
                        </motion.div>
                      ))}
                    </div>
                  )}
  
                  {question.type === 'ESSAY' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500
                               focus:ring-2 focus:ring-blue-200 transition-all duration-300
                               text-gray-700 resize-none"
                        rows={6}
                        placeholder="Type your answer here..."
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
                        <span>Use the space above to write your answer</span>
                        <span>{(answers[question.id]?.length || 0)} characters</span>
                      </div>
                    </motion.div>
                  )}
  
                  <div className="flex flex-wrap justify-between mt-10 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03, x: -3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={`px-6 py-3 rounded-xl hover:shadow-md transition-all flex items-center gap-2
                                ${currentQuestionIndex === 0 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                  : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm border border-blue-100'}`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </motion.button>
                    
                    {currentQuestionIndex === totalQuestions - 1 ? (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={submitQuiz}
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                                  text-white rounded-xl shadow-md hover:shadow-xl 
                                  transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-medium"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <MdFlag className="text-xl" />
                            Submit Quiz
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03, x: 3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl 
                                 hover:shadow-lg transition-all flex items-center gap-2 font-medium shadow-sm"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {showTimeExpiredModal && <TimeExpiredModal />}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .text-gradient-green {
          background: linear-gradient(to right, #10b981, #059669);
          -webkit-background-clip: text;
          color: transparent;
        }
        
        .text-gradient-amber {
          background: linear-gradient(to right, #f59e0b, #d97706);
          -webkit-background-clip: text;
          color: transparent;
        }
        
        .pattern-dots {
          background-image: radial-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px);
          background-size: 25px 25px;
        }
        
        .bg-shine {
          background: linear-gradient(
            90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.4) 50%, 
            rgba(255,255,255,0) 100%
          );
        }
        
        @keyframes shine {
          from {transform: translateX(-100%);}
          to {transform: translateX(100%);}
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .skew-x-15 {
          transform: skewX(15deg);
        }
      `}</style>
    </div>
  )
}

const Trophy = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2v2h2a1 1 0 0 1 1 1a1 1 0 0 1-1 1h-4v7h-4v-7H7a1 1 0 0 1-1-1a1 1 0 0 1 1-1h2v-2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v3h3v2a2 2 0 0 1-2 2H5m14 0h-1a2 2 0 0 1-2-2V8h3z" />
    </svg>
  );
}

const AlignLeft = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" x2="3" y1="6" y2="6"></line>
      <line x1="15" x2="3" y1="12" y2="12"></line>
      <line x1="17" x2="3" y1="18" y2="18"></line>
    </svg>
  );
}

export default QuizPage