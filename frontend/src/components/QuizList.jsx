import { motion } from "framer-motion"
import { MdCheckCircle, MdPlayArrow, MdLock } from "react-icons/md"
import { Award, Clock } from "lucide-react"
import { useNavigate } from "react-router-dom" // Add this import

const QuizList = ({ 
  classId, 
  quizzes = [], // Add default empty array here
  progressData = { 
    unlockedQuizzes: new Set(), 
    completedQuizzes: new Set(), 
    currentQuizIndex: 0 
  },
  hasStartedJourney,
  isOwner  
}) => {
  const navigate = useNavigate() // Add this hook

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


  // Add a check to ensure quizzes is an array
  const quizArray = Array.isArray(quizzes) ? quizzes : []

  return (
    <div className="space-y-4">
      {quizArray.length === 0 ? (
        // Show a message when there are no quizzes
        <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No quizzes available yet</p>
        </div>
      ) : (
        // Map through quizzes if they exist
        quizArray.map((quiz, index) => {
          const isUnlocked = progressData.unlockedQuizzes.has(index)
          const isCompleted = progressData.completedQuizzes.has(index)
          const isCurrent = progressData.currentQuizIndex === index

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-xl transition-all duration-300
                        ${isUnlocked ? "hover:bg-purple-50/50" : "opacity-60"}
                        ${isCurrent ? "ring-2 ring-purple-500 bg-purple-50/30" : ""}`}
            >
              {/* Rest of your component remains the same */}
              <button
                onClick={() => handleQuizClick(quiz, index)}
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
                                   ? "bg-purple-100 text-purple-600"
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
                              ${isUnlocked ? "text-gray-900 group-hover:text-purple-600" : "text-gray-400"}`}
                  >
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {quiz.description}
                  </p>
                </div>

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
              </button>

              {/* Progress Line */}
              {index < quizArray.length - 1 && (
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
        })
      )}
    </div>
  )
}

export default QuizList