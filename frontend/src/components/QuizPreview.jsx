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
  AlignLeft,
  CheckSquare,
  BarChart3,
  Star,
  BrainCircuit
} from "lucide-react"
import { useState } from "react"

const QuizPreview = ({ quizData }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hoveredOption, setHoveredOption] = useState(null)
  const questionsPerPage = 1
  const totalPages = Math.ceil(quizData.questions.length / questionsPerPage)

  const currentQuestion = quizData.questions[currentPage - 1]

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
      setSelectedOption(null)
      setHoveredOption(null)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
      setSelectedOption(null)
      setHoveredOption(null)
    }
  }

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    setSelectedOption(null)
    setHoveredOption(null)
  }

  // This function is purely visual - doesn't change functionality
  const handleVisualSelect = (option) => {
    setSelectedOption(option)
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
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
              currentPage === index + 1 
                ? "bg-gradient-to-r from-amber-500 to-orange-500 scale-125 shadow-md" 
                : "bg-slate-200 hover:bg-amber-300"
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    )
  }

  const getQuestionIcon = (type) => {
    switch(type) {
      case "MULTIPLE_CHOICE":
        return <CheckSquare className="w-5 h-5 text-emerald-500" />;
      case "TRUE_FALSE":
        return <BookOpen className="w-5 h-5 text-teal-500" />;
      case "ESSAY":
        return <AlignLeft className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-violet-500" />;
    }
  };
  
  const getQuestionTypeLabel = (type) => {
    switch(type) {
      case "MULTIPLE_CHOICE":
        return "Multiple Choice";
      case "TRUE_FALSE":
        return "True/False";
      case "ESSAY":
        return "Essay Response";
      default:
        return "Question";
    }
  };

  return (
    <div className="space-y-8 relative overflow-hidden">
      {/* Interactive Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-2xl">
        <div className="absolute inset-0 opacity-20 pattern-dots"></div>
        
        {/* Animated circles */}
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-emerald-300/10 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          style={{
            top: '10%',
            right: '20%',
          }}
        />
        <motion.div 
          className="absolute w-72 h-72 rounded-full bg-amber-300/10 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          style={{
            bottom: '20%',
            left: '10%',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative space-y-8 p-6">
        {/* Quiz Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-transparent bg-clip-text"
                >
                  {quizData.title || "Untitled Quiz"}
                </motion.h1>
                {quizData.description && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-slate-600 mt-2"
                  >
                    {quizData.description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2 mb-6">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Quiz Info Cards */}
            <div className="flex flex-wrap gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Questions</p>
                  <p className="text-indigo-700 font-bold">{quizData.questions.length}</p>
                </div>
              </motion.div>

              {quizData.timeLimit && (
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl shadow-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-teal-600 font-medium uppercase tracking-wider">Time Limit</p>
                    <p className="text-teal-700 font-bold">{quizData.timeLimit} min</p>
                  </div>
                </motion.div>
              )}
              
              <motion.div 
                whileHover={{ scale: 1.05, y: -3 }}
                className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Passing Score</p>
                  <p className="text-amber-700 font-bold">{quizData.passingScore}%</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Questions Preview with Pagination */}
        <div className="space-y-6">
          {quizData.questions.length > 0 ? (
            <>
              {/* Navigation Controls */}
              <div className="flex justify-between items-center mb-4 px-2">
                <motion.button
                  whileHover={{ scale: 1.1, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl ${
                    currentPage === 1 
                      ? "text-slate-300 cursor-not-allowed bg-slate-50" 
                      : "text-emerald-600 hover:bg-emerald-100 bg-white shadow-sm border border-emerald-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-md border border-emerald-100"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Question {currentPage} of {totalPages}
                  </span>
                </motion.div>
                
                <motion.button
                  whileHover={{ scale: 1.1, x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl ${
                    currentPage === totalPages
                      ? "text-slate-300 cursor-not-allowed bg-slate-50"
                      : "text-emerald-600 hover:bg-emerald-100 bg-white shadow-sm border border-emerald-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-start gap-5">
                    {/* Question Number with Type Icon */}
                    <div className="flex flex-col items-center gap-2.5">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
                        {currentPage}
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="px-3 py-1.5 rounded-full bg-white flex items-center gap-1.5 shadow-md border border-slate-100"
                      >
                        {getQuestionIcon(currentQuestion?.type)}
                        <span className="text-xs font-medium text-slate-700">{getQuestionTypeLabel(currentQuestion?.type)}</span>
                      </motion.div>
                    </div>

                    <div className="flex-1 space-y-5">
                      {/* Question content */}
                      <motion.div 
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-xl p-5 shadow-md border border-emerald-100"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="w-5 h-5 text-emerald-600" />
                          <p className="text-sm font-medium text-emerald-700">Question Prompt</p>
                        </div>
                        <p className="text-slate-800 font-medium">{currentQuestion?.content}</p>
                      </motion.div>

                      {/* Multiple Choice Options */}
                      {currentQuestion?.type === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                          {currentQuestion.options.map((option, optIndex) => (
                            <motion.div
                              key={optIndex}
                              whileHover={{ scale: 1.01, y: -2 }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: optIndex * 0.1 + 0.2 }}
                            >
                              <motion.label
                                onMouseEnter={() => setHoveredOption(optIndex)}
                                onMouseLeave={() => setHoveredOption(null)}
                                onClick={() => handleVisualSelect(optIndex)}
                                className={`flex items-center gap-3 p-4 rounded-xl border ${
                                  selectedOption === optIndex
                                    ? "border-emerald-400 bg-emerald-50/80 shadow-md"
                                    : hoveredOption === optIndex
                                    ? "border-emerald-300 bg-emerald-50/40 shadow-sm"
                                    : "border-slate-200 bg-white/80 shadow-sm"
                                } transition-all duration-200 cursor-pointer`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  selectedOption === optIndex
                                    ? "bg-emerald-500 border-2 border-emerald-200"
                                    : "border-2 border-slate-300"
                                } transition-colors`}>
                                  {selectedOption === optIndex && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                                <span className={`text-slate-700 ${selectedOption === optIndex && "font-medium"} transition-colors`}>
                                  <motion.span 
                                    animate={selectedOption === optIndex ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.4 }}
                                    className={`inline-block w-6 h-6 text-center rounded-lg ${
                                      selectedOption === optIndex
                                        ? "bg-emerald-500 text-white"
                                        : "bg-emerald-100 text-emerald-700"
                                    } font-medium mr-2.5 transition-colors`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}
                                  </motion.span>
                                  {option}
                                </span>
                              </motion.label>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* True/False Options */}
                      {currentQuestion?.type === "TRUE_FALSE" && (
                        <div className="grid grid-cols-2 gap-4">
                          {["True", "False"].map((option, optIndex) => (
                            <motion.div
                              key={optIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.4, delay: optIndex * 0.15 }}
                            >
                              <motion.label
                                whileHover={{ scale: 1.03, y: -2 }}
                                onClick={() => handleVisualSelect(option)}
                                className={`flex items-center justify-center gap-3 p-5 rounded-xl ${
                                  selectedOption === option 
                                    ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg border-none"
                                    : "bg-white hover:bg-teal-50/50 border border-slate-200 shadow-md"
                                } transition-all duration-300 cursor-pointer relative overflow-hidden`}
                              >
                                {selectedOption === option && (
                                  <motion.div 
                                    className="absolute inset-0 bg-white opacity-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 0.1, 0] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                )}
                                
                                <div className={`w-6 h-6 rounded-full ${
                                  selectedOption === option
                                    ? "border-2 border-white bg-transparent"
                                    : "border-2 border-teal-300 bg-transparent"
                                } transition-colors flex items-center justify-center`}>
                                  {selectedOption === option && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring" }}
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                                <span className={`${
                                  selectedOption === option
                                    ? "text-white font-semibold"
                                    : "text-slate-700"
                                } transition-colors text-lg`}>
                                  {option}
                                </span>
                              </motion.label>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Essay Question */}
                      {currentQuestion?.type === "ESSAY" && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-3"
                        >
                          <div className="relative">
                            <textarea
                              className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all duration-200 bg-white/90 shadow-md min-h-[120px]"
                              rows={4}
                              placeholder="Type your answer here..."
                              disabled
                            />
                            <div className="absolute bottom-3 right-3 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                              Essay response
                            </div>
                          </div>
                          
                          {(currentQuestion.minWords || currentQuestion.maxWords) && (
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="flex items-center gap-2 text-sm bg-amber-50 px-4 py-3 rounded-lg border border-amber-100 shadow-sm"
                            >
                              <Type className="w-4 h-4 text-amber-500" />
                              <span className="text-amber-700">
                                {currentQuestion.minWords && `Min: ${currentQuestion.minWords} words`}
                                {currentQuestion.minWords && currentQuestion.maxWords && " • "}
                                {currentQuestion.maxWords && `Max: ${currentQuestion.maxWords} words`}
                              </span>
                            </motion.div>
                          )}
                          
                          <motion.div 
                            whileHover={{ y: -2 }}
                            className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 shadow-sm"
                          >
                            <Star className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-700">
                              Instructor will review and grade your answer manually
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Enhanced Pagination Dots */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {renderPaginationDots()}
                {totalPages > 5 && (
                  <p className="text-center mt-3 text-xs text-slate-500">
                    Navigate between {totalPages} questions using the dots or arrow buttons
                  </p>
                )}
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 px-8 rounded-2xl border-2 border-dashed border-emerald-200 bg-white/80 backdrop-blur-md shadow-md"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotateZ: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="relative inline-block"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-xl opacity-20"></div>
                <div className="relative">
                  <Brain className="w-20 h-20 mx-auto mb-6 text-emerald-500 opacity-80" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-3">Your quiz preview will appear here</h2>
              <p className="text-slate-600 text-lg">Start adding questions to see them in this preview</p>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-slate-500 text-sm mt-4 max-w-md mx-auto"
              >
                As you build your quiz, you'll see exactly how it will appear to your students in real-time
              </motion.p>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Visual enhancements CSS */}
      <style jsx>{`
        .pattern-dots {
          background-image: radial-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.7);
            opacity: 0.3;
          }
          50% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.7);
            opacity: 0.3;
          }
        }
        
        .pulse-animation {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
      `}</style>
    </div>
  )
}

export default QuizPreview