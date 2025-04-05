import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, HelpCircle, Plus, Minus } from "lucide-react"
import QuestionTypeSelector from "./QuestionTypeSelector"
import OptionsEditor from "./OptionsEditor"

const QuestionForm = ({ onAddQuestion }) => {
  const [question, setQuestion] = useState({
    content: "",
    type: "MULTIPLE_CHOICE",
    points: 1,
    options: ["", ""],
    correctAnswer: "",
    explanation: "",
    minWords: null,
    maxWords: null,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    let finalQuestion = { ...question }

    if (question.type === "TRUE_FALSE") {
      finalQuestion = {
        ...question,
        options: ["True", "False"], 
        correctAnswer: question.correctAnswer === "True" ? "1" : "2" 
      }
    }

    onAddQuestion(finalQuestion)
    
    // Reset form
    setQuestion({
      content: "",
      type: "MULTIPLE_CHOICE",
      points: 1,
      options: ["", ""],
      correctAnswer: "",
      explanation: "",
      minWords: null,
      maxWords: null,
    })
  }

  const handleTypeChange = (type) => {
    if (type === "TRUE_FALSE") {
      setQuestion(prev => ({
        ...prev,
        type,
        options: ["True", "False"], 
        correctAnswer: "" 
      }))
    } else {
      setQuestion(prev => ({
        ...prev,
        type,
        options: ["", ""],
        correctAnswer: "" 
      }))
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Question Content
        </label>
        <div className="relative">
          <Brain className="absolute left-4 top-4 text-gray-400" />
          <textarea
            value={question.content}
            onChange={(e) =>
              setQuestion((prev) => ({ ...prev, content: e.target.value }))
            }
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Enter your question here..."
            rows={3}
            required
          />
        </div>
      </div>

      <QuestionTypeSelector
        value={question.type}
        onChange={handleTypeChange}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Points</label>
          <input
            type="number"
            value={question.points}
            onChange={(e) =>
              setQuestion((prev) => ({
                ...prev,
                points: Math.max(1, parseInt(e.target.value) || 1),
              }))
            }
            min="1"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {question.type === "ESSAY" ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Minimum Words
              </label>
              <input
                type="number"
                value={question.minWords || ""}
                onChange={(e) =>
                  setQuestion((prev) => ({
                    ...prev,
                    minWords: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Maximum Words
              </label>
              <input
                type="number"
                value={question.maxWords || ""}
                onChange={(e) =>
                  setQuestion((prev) => ({
                    ...prev,
                    maxWords: e.target.value ? parseInt(e.target.value) : null,
                  }))
                }
                min="0"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                placeholder="Optional"
              />
            </div>
          </motion.div>
        ) : (
          <OptionsEditor
            type={question.type}
            options={question.options}
            correctAnswer={question.correctAnswer}
            onOptionsChange={(options) =>
              setQuestion((prev) => ({ ...prev, options }))
            }
            onCorrectAnswerChange={(answer) =>
              setQuestion((prev) => ({ ...prev, correctAnswer: answer }))
            }
          />
        )}
      </AnimatePresence>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Explanation (Optional)
        </label>
        <div className="relative">
          <HelpCircle className="absolute left-4 top-4 text-gray-400" />
          <textarea
            value={question.explanation}
            onChange={(e) =>
              setQuestion((prev) => ({ ...prev, explanation: e.target.value }))
            }
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="Explain the correct answer..."
            rows={2}
          />
        </div>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Question
      </motion.button>
    </motion.form>
  )
}

export default QuestionForm