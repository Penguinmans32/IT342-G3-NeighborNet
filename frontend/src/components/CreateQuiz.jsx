import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useParams } from "react-router-dom"
import { MdAdd, MdDelete, MdDragIndicator } from "react-icons/md"
import { ClipboardList, Clock, Award, Brain, GraduationCap } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import QuestionForm from "./QuestionForm"
import QuizPreview from './QuizPreview'

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
      const response = await axios.post(
        `http://localhost:8080/api/classes/${classId}/quizzes`,
        quizData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-4 py-8">
      {/* Header - Full Width */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
            <div className="relative bg-white p-3 rounded-full shadow-lg">
              <ClipboardList className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </motion.div>
  
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-4">
          Create New Quiz
        </h1>
        <p className="text-gray-600 text-lg">
          Design an engaging quiz to test your students' knowledge
        </p>
      </motion.div>
  
      {/* Split Layout Container */}
      <div className="flex gap-8 max-w-[90rem] mx-auto">
        {/* Left Side - Quiz Creation */}
        <div className="flex-1 min-w-0">
          {/* Quiz Basic Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) =>
                  setQuizData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Enter quiz title..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) =>
                  setQuizData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Describe your quiz..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Time Limit (minutes)
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={quizData.timeLimit || ""}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        timeLimit: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Passing Score (%)
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={quizData.passingScore}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        passingScore: parseInt(e.target.value),
                      }))
                    }
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>
          </motion.div>
  
          <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="questions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4 mb-8"
              >
                <AnimatePresence>
                  {quizData.questions.map((question, index) => (
                    <Draggable
                      key={index}
                      draggableId={`question-${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white rounded-xl shadow p-6 relative group"
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                          >
                            <MdDragIndicator className="text-gray-400 text-xl" />
                          </div>

                          <div className="ml-8">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-medium">
                                Question {index + 1}
                              </h3>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  setQuizData((prev) => ({
                                    ...prev,
                                    questions: prev.questions.filter(
                                      (_, i) => i !== index
                                    ),
                                  }))
                                }
                                className="text-red-500 hover:text-red-600"
                              >
                                <MdDelete className="text-xl" />
                              </motion.button>
                            </div>

                            <p className="text-gray-700 mb-2">{question.content}</p>
                            {question.type === QuestionTypes.MULTIPLE_CHOICE && (
                              <div className="ml-4 space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`flex items-center ${
                                      option === question.correctAnswer
                                        ? "text-green-600 font-medium"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    <span className="mr-2">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    {option}
                                  </div>
                                ))}
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
  
          {/* Add Question Form */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                Add New Question
              </h3>
              <p className="text-gray-600">
                Create your question and set up the answer options
              </p>
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
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Quiz..." : "Create Quiz"}
            </motion.button>
          </motion.div>
        </div>
  
        {/* Right Side - Quiz Preview */}
        <div className="w-[40%] min-w-[500px]">
          <div className="sticky top-8">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                  Quiz Preview
                </h3>
                <p className="text-gray-600">
                  Real-time preview of how your quiz will appear to students
                </p>
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