import { motion, AnimatePresence } from "framer-motion"
import { Clock, Award, Brain, BookOpen, CheckCircle, Type, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const QuizPreview = ({ quizData }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 1
  const totalPages = Math.ceil(quizData.questions.length / questionsPerPage)
  
  const currentQuestion = quizData.questions[currentPage - 1]

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const renderPaginationDots = () => {
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, index) => (
          <motion.button
            key={index + 1}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToPage(index + 1)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              currentPage === index + 1
                ? "bg-purple-500 scale-110"
                : "bg-gray-300 hover:bg-purple-300"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl" />
      
      {/* Content */}
      <div className="relative space-y-8 p-6">
        {/* Quiz Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              {quizData.title || "Untitled Quiz"}
            </h1>
            {quizData.description && (
              <p className="text-gray-600 mt-2">{quizData.description}</p>
            )}
            
            {/* Quiz Info Cards */}
            <div className="flex flex-wrap gap-4 mt-6">
              {quizData.timeLimit && (
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Time Limit</p>
                    <p className="text-blue-700">{quizData.timeLimit} minutes</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Passing Score</p>
                  <p className="text-purple-700">{quizData.passingScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Preview with Pagination */}
        <div className="space-y-6">
          {quizData.questions.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-purple-600 hover:bg-purple-100"
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <span className="text-sm font-medium text-gray-600">
                  Question {currentPage} of {totalPages}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-purple-600 hover:bg-purple-100"
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100"
                >
                  <div className="flex items-start gap-4">
                    {/* Question Number with Type Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl flex items-center justify-center font-medium shadow-lg">
                        {currentPage}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {currentQuestion.type === "MULTIPLE_CHOICE" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {currentQuestion.type === "TRUE_FALSE" && (
                          <BookOpen className="w-4 h-4 text-purple-500" />
                        )}
                        {currentQuestion.type === "ESSAY" && (
                          <Type className="w-4 h-4 text-pink-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-800 font-medium">
                          {currentQuestion.content}
                        </p>
                      </div>

                      {/* Question type-specific content remains the same */}
                      {/* Multiple Choice Options */}
                      {currentQuestion.type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, optIndex) => (
                            <motion.label
                              key={optIndex}
                              whileHover={{ scale: 1.01 }}
                              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-blue-300 group-hover:border-blue-500 transition-colors flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 opacity-0 group-hover:opacity-25 transition-opacity" />
                              </div>
                              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </span>
                            </motion.label>
                          ))}
                        </div>
                      )}

                      {/* True/False Options */}
                      {currentQuestion.type === "TRUE_FALSE" && (
                        <div className="grid grid-cols-2 gap-4">
                          {["True", "False"].map((option, optIndex) => (
                            <motion.label
                              key={optIndex}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-center justify-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-purple-300 group-hover:border-purple-500 transition-colors" />
                              <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                                {option}
                              </span>
                            </motion.label>
                          ))}
                        </div>
                      )}

                      {/* Essay Question */}
                      {currentQuestion.type === "ESSAY" && (
                        <div className="space-y-2">
                          <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white/50"
                            rows={4}
                            placeholder="Type your answer here..."
                            disabled
                          />
                          {(currentQuestion.minWords || currentQuestion.maxWords) && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Type className="w-4 h-4" />
                              <span>
                                {currentQuestion.minWords && `Min: ${currentQuestion.minWords} words`}
                                {currentQuestion.minWords && currentQuestion.maxWords && " • "}
                                {currentQuestion.maxWords && `Max: ${currentQuestion.maxWords} words`}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Pagination Dots */}
              {renderPaginationDots()}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 px-8 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
              </motion.div>
              <p className="text-gray-500 text-lg">Start adding questions to see them appear here</p>
              <p className="text-gray-400 text-sm mt-2">Your quiz preview will update in real-time</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPreview