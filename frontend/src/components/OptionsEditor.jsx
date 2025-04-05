import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const OptionsEditor = ({
  type,
  options,
  correctAnswer,
  onOptionsChange,
  onCorrectAnswerChange,
}) => {
  const addOption = () => {
    if (options.length < 6) {
      onOptionsChange([...options, ""])
    }
  }

  const isTrueFalse = type === "TRUE_FALSE"

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index)
    onOptionsChange(newOptions)
    if (correctAnswer === options[index]) {
      onCorrectAnswerChange("")
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...options]
    newOptions[index] = value
    onOptionsChange(newOptions)
  }

  // Render TRUE/FALSE options differently
  if (isTrueFalse) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-4"
      >
        <label className="block text-gray-700 font-medium">Correct Answer</label>
        <div className="grid grid-cols-2 gap-4">
          {["True", "False"].map((value, index) => (
            <motion.div
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-xl border-2 transition-all duration-200 
                ${correctAnswer === String(index + 1) 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-300"}`}
            >
              <input
                type="radio"
                name="trueFalseAnswer"
                value={String(index + 1)}
                checked={correctAnswer === String(index + 1)}
                onChange={() => onCorrectAnswerChange(String(index + 1))}
                className="absolute opacity-0 w-full h-full cursor-pointer"
                required
              />
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-gray-700 font-medium">{value}</span>
                {correctAnswer === String(index + 1) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-4 h-4 rounded-full bg-blue-500"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  // Original Multiple Choice Editor
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="block text-gray-700 font-medium">Options</label>
        {type === "MULTIPLE_CHOICE" && options.length < 6 && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addOption}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </motion.button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center gap-3"
            >
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  {String.fromCharCode(65 + index)}.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === option}
                  onChange={() => onCorrectAnswerChange(option)}
                  className="w-5 h-5 text-blue-500 focus:ring-blue-400"
                  required
                />
                {type === "MULTIPLE_CHOICE" && options.length > 2 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Minus className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default OptionsEditor