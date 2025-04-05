import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Award,
  Brain,
  BookOpen,
  CheckCircle,
  Type,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react"
import { useState } from "react"

const QuizPreview = ({ quizData }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const questionsPerPage = 1
  const totalPages = Math.ceil(quizData.questions.length / questionsPerPage)

  const currentQuestion = quizData.questions[currentPage - 1]

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
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
              currentPage === index + 1 ? "bg-amber-500 scale-110" : "bg-slate-200 hover:bg-amber-300"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-3xl" />

      {/* Content */}
      <div className="relative space-y-8 p-6">
        {/* Quiz Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-transparent bg-clip-text">
                {quizData.title || "Untitled Quiz"}
              </h1>
            </div>

            {quizData.description && <p className="text-slate-600 mt-2 ml-1">{quizData.description}</p>}

            {/* Quiz Info Cards */}
            <div className="flex flex-wrap gap-4 mt-6">
              {quizData.timeLimit && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-600 font-medium uppercase tracking-wide">Time Limit</p>
                    <p className="text-teal-700 font-semibold">{quizData.timeLimit} minutes</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Passing Score</p>
                  <p className="text-amber-700 font-semibold">{quizData.passingScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Preview with Pagination */}
        <div className="space-y-6">
          {quizData.questions.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4 px-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full ${
                    currentPage === 1 ? "text-slate-300 cursor-not-allowed" : "text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-emerald-100">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Question {currentPage} of {totalPages}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-emerald-600 hover:bg-emerald-100"
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
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-emerald-100"
                >
                  <div className="flex items-start gap-4">
                    {/* Question Number with Type Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        {currentPage}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                        {currentQuestion.type === "MULTIPLE_CHOICE" && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        {currentQuestion.type === "TRUE_FALSE" && <BookOpen className="w-4 h-4 text-teal-500" />}
                        {currentQuestion.type === "ESSAY" && <Type className="w-4 h-4 text-amber-500" />}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-slate-100">
                        <p className="text-slate-800 font-medium">{currentQuestion.content}</p>
                      </div>

                      {/* Multiple Choice Options */}
                      {currentQuestion.type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, optIndex) => (
                            <motion.label
                              key={optIndex}
                              whileHover={{ scale: 1.01, y: -2 }}
                              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-emerald-300 group-hover:border-emerald-500 transition-colors flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-25 transition-opacity" />
                              </div>
                              <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                                <span className="inline-block w-6 h-6 text-center rounded-full bg-emerald-100 text-emerald-700 font-medium mr-2">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                {option}
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
                              whileHover={{ scale: 1.03, y: -2 }}
                              className="flex items-center justify-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
                            >
                              <div className="w-6 h-6 rounded-full border-2 border-teal-300 group-hover:border-teal-500 transition-colors flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-teal-500 opacity-0 group-hover:opacity-25 transition-opacity" />
                              </div>
                              <span className="text-slate-700 font-medium group-hover:text-teal-700 transition-colors">
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
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200 bg-white shadow-sm"
                            rows={4}
                            placeholder="Type your answer here..."
                            disabled
                          />
                          {(currentQuestion.minWords || currentQuestion.maxWords) && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                              <Type className="w-4 h-4 text-amber-500" />
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
              className="text-center py-16 px-8 rounded-2xl border-2 border-dashed border-emerald-200 bg-white/50 backdrop-blur-sm"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-xl opacity-20 animate-pulse" />
                <div className="relative">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-emerald-500 opacity-70" />
                </div>
              </motion.div>
              <p className="text-slate-700 text-lg font-medium">Start adding questions to see them appear here</p>
              <p className="text-slate-500 text-sm mt-2">Your quiz preview will update in real-time</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizPreview

