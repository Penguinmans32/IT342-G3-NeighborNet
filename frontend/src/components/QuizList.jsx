import { motion } from "framer-motion"
import { MdCheckCircle, MdPlayArrow, MdLock } from "react-icons/md"
import { Award, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Trophy } from "lucide-react"
import axios from "axios"

const QuizList = ({ 
  classId, 
  quizzes = [],
  progressData = { 
    unlockedQuizzes: new Set([0]), 
    completedQuizzes: new Set(), 
    currentQuizIndex: 0 
  },
  hasStartedJourney,
  isOwner  
}) => {
  const navigate = useNavigate()
  const [quizAttempts, setQuizAttempts] = useState({})

  useEffect(() => {
    const fetchQuizAttempts = async () => {
      try {
        const token = localStorage.getItem('token')
        const attempts = {}
        const completedQuizzes = new Set(progressData.completedQuizzes)
        const unlockedQuizzes = new Set(progressData.unlockedQuizzes)
        
        for (const quiz of quizzes) {
          const response = await axios.get(
            `http://localhost:8080/api/classes/${classId}/quizzes/${quiz.id}/attempts`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          
          if (response.data && response.data.length > 0) {
            const completedAttempts = response.data.filter(attempt => 
              attempt.completedAt && attempt.score !== null && attempt.maxScore !== null
            )
  
            if (completedAttempts.length > 0) {
              const bestAttempt = completedAttempts.reduce((best, current) => {
                if (!best || (current.score || 0) > (best.score || 0)) {
                  return current
                }
                return best
              }, null)
  
              if (bestAttempt) {
                const quizIndex = quizzes.findIndex(q => q.id === quiz.id)
                attempts[quiz.id] = {
                  bestScore: bestAttempt.score || 0,
                  maxScore: bestAttempt.maxScore || 0,
                  passed: bestAttempt.passed || false,
                  totalAttempts: completedAttempts.length,
                  lastAttemptDate: bestAttempt.completedAt,
                  completed: true
                }
                
                if (bestAttempt.score > 0) {
                  completedQuizzes.add(quizIndex)
                  if (quizIndex + 1 < quizzes.length) {
                    unlockedQuizzes.add(quizIndex + 1)
                  }
                }
              }
            } else {
              attempts[quiz.id] = {
                bestScore: 0,
                maxScore: 0,
                passed: false,
                totalAttempts: response.data.length,
                inProgress: true,
                completed: false
              }
            }
          }
        }
        
        setQuizAttempts(attempts)
        progressData.completedQuizzes = completedQuizzes
        progressData.unlockedQuizzes = unlockedQuizzes
      } catch (error) {
        console.error('Error fetching quiz attempts:', error)
      }
    }
  
    if (quizzes.length > 0) {
      fetchQuizAttempts()
    }
  }, [classId, quizzes])

  const handleQuizClick = async (quiz, index) => {
    if (!hasStartedJourney && !isOwner) {
      toast.error("Please begin your journey first!")
      return
    }

    if (!progressData.unlockedQuizzes.has(index)) {
      toast.error("Please complete the previous quiz first!")
      return
    }

    navigate(`/class/${classId}/quiz/${quiz.id}`)
  }


  const quizArray = Array.isArray(quizzes) ? quizzes : []

  return (
    <div className="space-y-4">
      {quizArray.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No quizzes available yet</p>
        </div>
      ) : (
        quizArray.map((quiz, index) => {
          const isUnlocked = progressData.unlockedQuizzes.has(index)
          const isCompleted = quizAttempts[quiz.id]?.completed || progressData.completedQuizzes.has(index)
          const isCurrent = progressData.currentQuizIndex === index
          const quizAttempt = quizAttempts[quiz.id]

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-xl transition-all duration-300 bg-white
                        ${isUnlocked ? "hover:bg-purple-50/50" : "opacity-60"}
                        ${isCurrent ? "ring-2 ring-purple-500 bg-purple-50/30" : ""}`}
            >
              <button
                onClick={() => handleQuizClick(quiz, index)}
                className="w-full flex items-center gap-6 p-6"
                disabled={!isUnlocked && !isOwner}
              >
                {/* Status Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center
                             transition-colors duration-300
                             ${
                               isCompleted || quizAttempt?.completed
                                 ? "bg-green-100 text-green-600"
                                 : isUnlocked
                                   ? "bg-purple-100 text-purple-600"
                                   : "bg-gray-100 text-gray-400"
                             }`}
                >
                  {isCompleted || quizAttempt?.completed ? (
                    <Trophy className="text-2xl" />
                  ) : isUnlocked ? (
                    <MdPlayArrow className="text-2xl" />
                  ) : (
                    <MdLock className="text-2xl" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h3
                    className={`font-medium transition-colors duration-300
                              ${isUnlocked ? "text-gray-900 group-hover:text-purple-600" : "text-gray-400"}`}
                  >
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {quiz.description}
                  </p>
                  {quizAttempt && (
                    <div className="flex items-center gap-3 mt-2">
                      {quizAttempt.inProgress ? (
                        <span className="text-sm px-2 py-1 rounded-full bg-yellow-100 text-yellow-600">
                          In Progress
                        </span>
                      ) : (
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          quizAttempt.passed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          Score: {quizAttempt.bestScore}/{quizAttempt.maxScore} 
                          {quizAttempt.maxScore > 0 && ` (${Math.round((quizAttempt.bestScore/quizAttempt.maxScore) * 100)}%)`}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {quizAttempt.totalAttempts} attempt{quizAttempt.totalAttempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4">
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{quiz.timeLimit}m</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">{quiz.passingScore}%</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Progress Line */}
              {index < quizArray.length - 1 && (
                <div className="absolute left-[2.25rem] top-[4.5rem] bottom-0 w-0.5">
                  <div className="h-full bg-gray-100" />
                  {quizAttempt?.passed && (
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
        })
      )}
    </div>
  )
}

export default QuizList