import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { MdAdd, MdDelete, MdDragIndicator, MdHome, MdOutlineAutoAwesome } from "react-icons/md"
import { ClipboardList, Clock, Award, Brain, GraduationCap, Sparkles, ChevronLeft, CheckCircle, PlusCircle, HelpCircle, RefreshCw, Camera, PenTool } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import QuestionForm from "./QuestionForm"
import QuizPreview from "./QuizPreview"
import Confetti from 'react-confetti'
import AIQuizGenerator from "./AIQuizGenerator"
import ContentImportQuizGenerator from "./ContentImportQuizGenerator"

const QuestionTypes = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  ESSAY: "ESSAY",
}

const ProgressBar = ({ value = 0 }) => (
  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
    />
  </div>
);

const CreateQuiz = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [activeTab, setActiveTab] = useState("create")
  const [isShowingTips, setIsShowingTips] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: null,
    passingScore: 60,
    questions: [],
  })

  // Calculate completion percentage
  const calculateProgress = () => {
    let score = 0;
    if (quizData.title) score += 20;
    if (quizData.description) score += 10;
    if (quizData.questions.length > 0) score += 20;
    if (quizData.questions.length >= 3) score += 20;
    if (quizData.questions.length >= 5) score += 30;
    return Math.min(score, 100);
  }

  const handleAddGeneratedQuiz = (generatedQuiz) => {
    setQuizData({
      title: generatedQuiz.title,
      description: generatedQuiz.description,
      timeLimit: 60, 
      passingScore: 60,
      questions: generatedQuiz.questions.map(question => {
        return {
          content: question.content,
          type: question.type,
          points: question.points || 1,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          explanation: question.explanation
        };
      }),
    });
  };

  const handleSubmit = async () => {
    if (!quizData.title.trim()) {
      toast.error("Quiz title is required!")
      return
    }

    if (quizData.questions.length === 0) {
      toast.error("Add at least one question!")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await axios.post(`http://localhost:8080/api/classes/${classId}/quizzes`, quizData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setShowConfetti(true)
      toast.success("Quiz created successfully!", {
        icon: '🎉',
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#059669',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#FFFAEE',
        }
      })
      
      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false)
        navigate(`/class/${classId}`)
      }, 3000)
      
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("Failed to create quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDragEnd = (result) => {
    setIsDragging(false);
    if (!result.destination) return

    const questions = Array.from(quizData.questions)
    const [reorderedItem] = questions.splice(result.source.index, 1)
    questions.splice(result.destination.index, 0, reorderedItem)

    setQuizData((prev) => ({ ...prev, questions }))
  }

  const onDragStart = () => {
    setIsDragging(true);
  }

  const handleAddQuestion = (question) => {
    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }))
    toast.success("Question added! 🎯", {
      style: {
        border: '1px solid #8b5cf6',
        padding: '16px',
        color: '#6d28d9',
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-emerald-50/20 px-4 py-8 relative overflow-hidden">
      {/* Confetti effect on submission */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-violet-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-56 h-56 bg-teal-300/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Homepage Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/homepage")}
        className="fixed top-6 left-6 z-50 px-4 py-2.5 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-all duration-300 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        <MdHome className="text-lg" />
        <span>Homepage</span>
      </motion.button>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="text-center mb-8 max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-white p-4 rounded-full shadow-md border border-emerald-100">
            <ClipboardList className="w-10 h-10 text-emerald-600" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 relative inline-block"
        >
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 text-transparent bg-clip-text">
            Create Your Quiz
          </span>
          <motion.span 
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="absolute -top-2 -right-8 text-amber-500"
          >
          </motion.span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 text-lg"
        >
          Design an engaging quiz to test your students' knowledge and track their progress
        </motion.p>
        
        {/* Progress tracker */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 max-w-md mx-auto bg-white rounded-xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-slate-600 font-medium">Quiz completion</span>
            <span className="text-emerald-600 font-semibold">{calculateProgress()}%</span>
          </div>
          <ProgressBar value={calculateProgress()} />
          
          <div className="flex gap-2 mt-4 items-center justify-center">
            <motion.div 
              animate={quizData.title ? { scale: [1, 1.2, 1], backgroundColor: ['#f1f5f9', '#d1fae5', '#f1f5f9'] } : {}}
              transition={{ duration: 0.6 }}
              className={`w-3 h-3 rounded-full ${quizData.title ? 'bg-emerald-300' : 'bg-slate-200'}`}
            />
            <motion.div 
              animate={quizData.description ? { scale: [1, 1.2, 1], backgroundColor: ['#f1f5f9', '#d1fae5', '#f1f5f9'] } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`w-3 h-3 rounded-full ${quizData.description ? 'bg-emerald-300' : 'bg-slate-200'}`}
            />
            <motion.div 
              animate={quizData.questions.length > 0 ? { scale: [1, 1.2, 1], backgroundColor: ['#f1f5f9', '#d1fae5', '#f1f5f9'] } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`w-3 h-3 rounded-full ${quizData.questions.length > 0 ? 'bg-emerald-300' : 'bg-slate-200'}`}
            />
            <motion.div 
              animate={quizData.questions.length >= 3 ? { scale: [1, 1.2, 1], backgroundColor: ['#f1f5f9', '#d1fae5', '#f1f5f9'] } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`w-3 h-3 rounded-full ${quizData.questions.length >= 3 ? 'bg-emerald-300' : 'bg-slate-200'}`}
            />
            <motion.div 
              animate={quizData.questions.length >= 5 ? { scale: [1, 1.2, 1], backgroundColor: ['#f1f5f9', '#d1fae5', '#f1f5f9'] } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`w-3 h-3 rounded-full ${quizData.questions.length >= 5 ? 'bg-emerald-300' : 'bg-slate-200'}`}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Main/Preview Tabs (Mobile only) */}
      <div className="md:hidden flex items-center justify-center mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-100 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeTab === "create" ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create</span>
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            activeTab === "preview" ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-600"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>

      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-[90rem] mx-auto">
        {/* Left Side - Quiz Creation */}
        {(activeTab === "create" || window.innerWidth >= 768) && (
          <div className="flex-1 min-w-0">
            {/* Quiz Basic Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 mb-8 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Decorative corner accent */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full opacity-70 z-0"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-sm">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">Quiz Details</h2>
                  <p className="text-sm text-slate-500">Set the basic information for your quiz</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-slate-700 font-medium mb-2">Quiz Title <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => setQuizData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                    placeholder="Enter quiz title..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Description</label>
                  <textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                    placeholder="Describe your quiz..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Time Limit (minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={quizData.timeLimit || ""}
                        onChange={(e) =>
                          setQuizData((prev) => ({
                            ...prev,
                            timeLimit: e.target.value ? Number.parseInt(e.target.value) : null,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-1">Leave blank for no time limit</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-2">Passing Score (%)</label>
                    <div className="relative">
                      <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        value={quizData.passingScore}
                        onChange={(e) =>
                          setQuizData((prev) => ({
                            ...prev,
                            passingScore: Number.parseInt(e.target.value),
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 shadow-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Questions List */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-8"
            >
              {quizData.questions.length > 0 && (
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg shadow-sm">
                      <Brain className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">Questions ({quizData.questions.length})</h2>
                      <p className="text-xs text-slate-500">Drag to reorder questions</p>
                    </div>
                  </div>
                  
                  {/* Tips button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsShowingTips(!isShowingTips)}
                    className="text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors p-2 rounded-lg flex items-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Tips</span>
                  </motion.button>
                </div>
              )}

              {/* Tips panel */}
              <AnimatePresence>
                {isShowingTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-violet-50 rounded-xl p-6 mb-6 border border-violet-100 overflow-hidden"
                  >
                    <h3 className="text-lg font-semibold text-violet-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Quiz Creation Tips
                    </h3>
                    <ul className="space-y-2 text-violet-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                        <span>Include a variety of question types to keep students engaged</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                        <span>Start with easier questions and gradually increase difficulty</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                        <span>For multiple choice questions, ensure all options are plausible</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-violet-500" />
                        <span>Use clear, concise language in your questions</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
                <Droppable droppableId="questions">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      <AnimatePresence>
                        {quizData.questions.map((question, index) => (
                          <Draggable key={index} draggableId={`question-${index}`} index={index}>
                            {(provided) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`bg-white rounded-xl shadow-sm border ${
                                  isDragging && index === provided.draggableProps['data-rbd-draggable-id'].split('-')[1] 
                                    ? 'border-violet-300 shadow-md' 
                                    : 'border-slate-100'
                                } p-6 relative group hover:shadow-md transition-all duration-300`}
                              >
                                {/* Decorative accent */}
                                <div 
                                  className={`absolute top-0 left-0 w-2 h-full ${
                                    question.type === QuestionTypes.MULTIPLE_CHOICE 
                                      ? 'bg-emerald-400' 
                                      : question.type === QuestionTypes.TRUE_FALSE 
                                        ? 'bg-amber-400' 
                                        : 'bg-violet-400'
                                  } rounded-l-xl`}
                                />

                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute left-6 top-1/2 transform -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity cursor-move"
                                >
                                  <MdDragIndicator className="text-slate-400 text-2xl" />
                                </div>

                                <div className="ml-10">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                      <motion.span 
                                        whileHover={{ scale: 1.1 }}
                                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700 text-sm font-medium shadow-sm"
                                      >
                                        {index + 1}
                                      </motion.span>
                                      <div>
                                        <h3 className="text-lg font-medium text-slate-800">Question {index + 1}</h3>
                                        <div className="flex items-center gap-1">
                                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                            question.type === QuestionTypes.MULTIPLE_CHOICE 
                                              ? 'bg-emerald-100 text-emerald-700' 
                                              : question.type === QuestionTypes.TRUE_FALSE 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : 'bg-violet-100 text-violet-700'
                                          }`}>
                                            {question.type === QuestionTypes.MULTIPLE_CHOICE 
                                              ? 'Multiple Choice' 
                                              : question.type === QuestionTypes.TRUE_FALSE 
                                                ? 'True/False' 
                                                : 'Essay'
                                            }
                                          </span>
                                          {question.points && (
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                                              {question.points} pts
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <motion.button
                                      whileHover={{ scale: 1.05, rotate: 5 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        setQuizData((prev) => ({
                                          ...prev,
                                          questions: prev.questions.filter((_, i) => i !== index),
                                        }))
                                      }
                                      className="text-rose-500 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 transition-colors"
                                    >
                                      <MdDelete className="text-xl" />
                                    </motion.button>
                                  </div>

                                  <p className="text-slate-700 mb-3 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {question.content}
                                  </p>
                                  
                                  {question.type === QuestionTypes.MULTIPLE_CHOICE && (
                                    <div className="space-y-2 mt-4">
                                      {question.options.map((option, optIndex) => (
                                        <motion.div
                                          key={optIndex}
                                          whileHover={{ x: 5 }}
                                          className={`flex items-center p-3 rounded-lg ${
                                            option === question.correctAnswer
                                              ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-medium border border-emerald-200"
                                              : "text-slate-600 hover:bg-slate-50 border border-slate-100"
                                          }`}
                                        >
                                          <motion.span
                                            whileHover={
                                              option === question.correctAnswer 
                                                ? { scale: 1.1 } 
                                                : { scale: 1 }
                                            }
                                            className={`mr-3 flex items-center justify-center w-7 h-7 rounded-full ${
                                              option === question.correctAnswer
                                                ? "bg-emerald-200 text-emerald-800"
                                                : "bg-slate-100 text-slate-600"
                                            }`}
                                          >
                                            {String.fromCharCode(65 + optIndex)}
                                          </motion.span>
                                          {option}
                                          {option === question.correctAnswer && (
                                            <span className="ml-3 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                              <CheckCircle className="w-3 h-3" />
                                              Correct
                                            </span>
                                          )}
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}

                                  {question.type === QuestionTypes.TRUE_FALSE && (
                                    <div className="space-y-2 mt-4">
                                      <motion.div
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center p-3 rounded-lg ${
                                          question.correctAnswer === "True"
                                            ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-medium border border-emerald-200"
                                            : "text-slate-600 hover:bg-slate-50 border border-slate-100"
                                        }`}
                                      >
                                        <motion.span
                                          whileHover={
                                            question.correctAnswer === "True" 
                                              ? { scale: 1.1 } 
                                              : { scale: 1 }
                                          }
                                          className={`mr-3 flex items-center justify-center w-7 h-7 rounded-full ${
                                            question.correctAnswer === "True"
                                              ? "bg-emerald-200 text-emerald-800"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          T
                                        </motion.span>
                                        True
                                        {question.correctAnswer === "True" && (
                                          <span className="ml-3 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Correct
                                          </span>
                                        )}
                                      </motion.div>
                                      
                                      <motion.div
                                        whileHover={{ x: 5 }}
                                        className={`flex items-center p-3 rounded-lg ${
                                          question.correctAnswer === "False"
                                            ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 font-medium border border-emerald-200"
                                            : "text-slate-600 hover:bg-slate-50 border border-slate-100"
                                        }`}
                                      >
                                        <motion.span
                                          whileHover={
                                            question.correctAnswer === "False" 
                                              ? { scale: 1.1 } 
                                              : { scale: 1 }
                                          }
                                          className={`mr-3 flex items-center justify-center w-7 h-7 rounded-full ${
                                            question.correctAnswer === "False"
                                              ? "bg-emerald-200 text-emerald-800"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          F
                                        </motion.span>
                                        False
                                        {question.correctAnswer === "False" && (
                                          <span className="ml-3 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Correct
                                          </span>
                                        )}
                                      </motion.div>
                                    </div>
                                  )}

                                  {question.type === QuestionTypes.ESSAY && (
                                    <div className="mt-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-4">
                                      <span className="text-sm text-slate-500 flex items-center gap-2">
                                        <PenTool className="w-4 h-4 text-violet-500" />
                                        <span>Essay question - Students will provide a written response</span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </AnimatePresence>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {/* Empty state message when no questions */}
              {quizData.questions.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-violet-50 rounded-xl p-8 border border-dashed border-violet-200 flex flex-col items-center justify-center text-center"
                >
                  <Brain className="w-12 h-12 text-violet-300 mb-4" />
                  <h3 className="text-xl font-semibold text-violet-800 mb-2">No questions yet</h3>
                  <p className="text-violet-600 max-w-md">
                    Start adding questions to your quiz using the form below. A great quiz typically has at least 5 questions.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Add Question Form */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 mb-8 relative overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Decorative corner accent */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-violet-100 to-violet-50 rounded-full opacity-70 z-0"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg shadow-sm">
                  <MdOutlineAutoAwesome className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Add New Question</h3>
                  <p className="text-sm text-slate-500">Create your question and set up the answer options</p>
                </div>
              </div>

              <QuestionForm onAddQuestion={handleAddQuestion} />
              
              <div className="mt-6 border-t border-slate-100 pt-6">
                <AIQuizGenerator 
                  onAddGeneratedQuiz={handleAddGeneratedQuiz} 
                  classId={classId}
                />
              </div>

              <div className="mt-6">
                  <ContentImportQuizGenerator 
                    onAddGeneratedQuiz={handleAddGeneratedQuiz} 
                    classId={classId}
                  />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end mb-12 lg:mb-0"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="absolute inset-0 w-0 bg-white/20 skew-x-15 group-hover:animate-shine"></span>
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating Quiz...
                    </span>
                  ) : (
                    "Create Quiz"
                  )}
                </span>
              </motion.button>
            </motion.div>
          </div>
        )}

        {/* Right Side - Quiz Preview */}
        {(activeTab === "preview" || window.innerWidth >= 768) && (
          <div className="w-full lg:w-[40%] lg:min-w-[400px]">
            <div className="sticky top-8">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Decorative corner accent */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full opacity-70 z-0"></div>
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-2 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg shadow-sm">
                    <Camera className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">Quiz Preview</h3>
                    <p className="text-sm text-slate-500">Real-time preview of how your quiz will appear to students</p>
                  </div>
                </div>

                {/* Conditional rendering for empty state */}
                {!quizData.title && quizData.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Camera className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Nothing to preview yet</h3>
                    <p className="text-slate-500 max-w-xs">
                      Add a title and at least one question to see a preview of your quiz
                    </p>
                  </div>
                ) : (
                  <QuizPreview quizData={quizData} />
                )}
                
                {/* Student experience indicators */}
                {quizData.questions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Student Experience</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
                        <Clock className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Time to Complete</p>
                          <p className="text-xs text-slate-500">
                            Approx. {quizData.questions.length * 2} minutes
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
                        <Award className="w-5 h-5 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Passing Score</p>
                          <p className="text-xs text-slate-500">{quizData.passingScore}% required</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        
        .animate-shine {
          animation: shine 1.5s infinite;
        }
        
        .skew-x-15 {
          transform: skewX(15deg);
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
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
        
        .bg-grid-pattern {
          background-size: 20px 20px;
          background-image: linear-gradient(to right, rgb(241, 245, 249, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(241, 245, 249, 0.1) 1px, transparent 1px);
        }
      `}</style>
    </div>
  )
}

export default CreateQuiz