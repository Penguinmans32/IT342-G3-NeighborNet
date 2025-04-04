import { motion } from "framer-motion"
import { ListChecks, CheckSquare, PenTool } from "lucide-react"

const QuestionTypeSelector = ({ value, onChange }) => {
  const types = [
    {
      id: "MULTIPLE_CHOICE",
      label: "Multiple Choice",
      icon: ListChecks,
      description: "Create a question with multiple options",
    },
    {
      id: "TRUE_FALSE",
      label: "True/False",
      icon: CheckSquare,
      description: "Simple true or false question",
    },
    {
      id: "ESSAY",
      label: "Essay",
      icon: PenTool,
      description: "Open-ended question with text response",
    },
  ]

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 font-medium">Question Type</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => {
          const Icon = type.icon
          return (
            <motion.button
              key={type.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(type.id)}
              className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                value === type.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon
                  className={`w-6 h-6 ${
                    value === type.id ? "text-blue-500" : "text-gray-500"
                  }`}
                />
                <span
                  className={`font-medium ${
                    value === type.id ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {type.label}
                </span>
                <span className="text-xs text-gray-500">{type.description}</span>
              </div>
              {value === type.id && (
                <motion.div
                  layoutId="selectedType"
                  className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default QuestionTypeSelector