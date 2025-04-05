import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { MdAdd, MdDelete, MdDragIndicator } from "react-icons/md"
import { ClipboardList, Clock, Award, Brain, GraduationCap, Sparkles } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import QuestionForm from "./QuestionForm"
import QuizPreview from "./QuizPreview"

const QuestionTypes = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  ESSAY: "ESSAY",
}

const CreateQuiz = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    timeLimit: null,
    passingScore: 60,
    questions: [],
  })

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

      toast.success("Quiz created successfully!")
      navigate(`/class/${classId}`)
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast.error("Failed to create quiz. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const questions = Array.from(quizData.questions)
    const [reorderedItem] = questions.splice(result.source.index, 1)
    questions.splice(result.destination.index, 0, reorderedItem)

    setQuizData((prev) => ({ ...prev, questions }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative bg-white p-3 rounded-full shadow-lg">
              <ClipboardList className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 text-transparent bg-clip-text mb-4">
          Create New Quiz
        </h1>
        <p className="text-slate-600 text-lg">Design an engaging quiz to test your students' knowledge</p>
      </motion.div>

      {/* Split Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-[90rem] mx-auto">
        {/* Left Side - Quiz Creation */}
        <div className="flex-1 min-w-0">
          {/* Quiz Basic Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Quiz Details</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-slate-700 font-medium mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={quizData.title}
                  onChange={(e) => setQuizData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                  placeholder="Enter quiz title..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-2">Description</label>
                <textarea
                  value={quizData.description}
                  onChange={(e) => setQuizData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
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
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                      placeholder="Optional"
                    />
                  </div>
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
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
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
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Brain className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Questions ({quizData.questions.length})</h2>
              </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
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
                              className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative group hover:shadow-md transition-shadow"
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity cursor-move"
                              >
                                <MdDragIndicator className="text-slate-400 text-xl" />
                              </div>

                              <div className="ml-8">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-sm font-medium">
                                      {index + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-slate-800">Question {index + 1}</h3>
                                  </div>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      setQuizData((prev) => ({
                                        ...prev,
                                        questions: prev.questions.filter((_, i) => i !== index),
                                      }))
                                    }
                                    className="text-rose-500 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                                  >
                                    <MdDelete className="text-xl" />
                                  </motion.button>
                                </div>

                                <p className="text-slate-700 mb-3 font-medium">{question.content}</p>
                                {question.type === QuestionTypes.MULTIPLE_CHOICE && (
                                  <div className="ml-4 space-y-2 mt-4">
                                    {question.options.map((option, optIndex) => (
                                      <div
                                        key={optIndex}
                                        className={`flex items-center p-2 rounded-lg ${
                                          option === question.correctAnswer
                                            ? "bg-emerald-50 text-emerald-700 font-medium"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        <span
                                          className={`mr-2 flex items-center justify-center w-6 h-6 rounded-full ${
                                            option === question.correctAnswer
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        {option}
                                        {option === question.correctAnswer && (
                                          <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                            Correct
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {question.type === QuestionTypes.TRUE_FALSE && (
                                  <div className="ml-4 space-y-2 mt-4">
                                    <div
                                      className={`flex items-center p-2 rounded-lg ${
                                        question.correctAnswer === "True"
                                          ? "bg-emerald-50 text-emerald-700 font-medium"
                                          : "text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span
                                        className={`mr-2 flex items-center justify-center w-6 h-6 rounded-full ${
                                          question.correctAnswer === "True"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        T
                                      </span>
                                      True
                                      {question.correctAnswer === "True" && (
                                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`flex items-center p-2 rounded-lg ${
                                        question.correctAnswer === "False"
                                          ? "bg-emerald-50 text-emerald-700 font-medium"
                                          : "text-slate-600 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span
                                        className={`mr-2 flex items-center justify-center w-6 h-6 rounded-full ${
                                          question.correctAnswer === "False"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                      >
                                        F
                                      </span>
                                      False
                                      {question.correctAnswer === "False" && (
                                        <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {question.type === QuestionTypes.ESSAY && (
                                  <div className="ml-4 mt-2">
                                    <span className="text-sm text-slate-500 italic">
                                      Essay question - Students will provide a written response
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
          </motion.div>

          {/* Add Question Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-100 rounded-lg">
                <MdAdd className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Add New Question</h3>
                <p className="text-slate-600 text-sm">Create your question and set up the answer options</p>
              </div>
            </div>

            <QuestionForm
              onAddQuestion={(question) => {
                setQuizData((prev) => ({
                  ...prev,
                  questions: [...prev.questions, question],
                }))
                toast.success("Question added successfully!")
              }}
            />
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
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
            </motion.button>
          </motion.div>
        </div>

        {/* Right Side - Quiz Preview */}
        <div className="w-full lg:w-[40%] lg:min-w-[400px]">
          <div className="sticky top-8">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md border border-slate-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Quiz Preview</h3>
                  <p className="text-slate-600 text-sm">Real-time preview of how your quiz will appear to students</p>
                </div>
              </div>

              <QuizPreview quizData={quizData} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz
