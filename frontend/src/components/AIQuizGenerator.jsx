import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { Brain, Sparkles, RefreshCw, Zap, Cpu, List, CheckCircle, AlertTriangle } from "lucide-react";

const difficultyOptions = [
  { value: "easy", label: "Easy", color: "emerald" },
  { value: "medium", label: "Medium", color: "amber" },
  { value: "hard", label: "Hard", color: "rose" },
];

const questionTypeOptions = [
  { value: "multiple-choice", label: "Multiple Choice", icon: <List className="w-4 h-4" /> },
  { value: "true-false", label: "True/False", icon: <CheckCircle className="w-4 h-4" /> },
  { value: "essay", label: "Essay", icon: <Cpu className="w-4 h-4" /> },
  { value: "mixed", label: "Mixed Types", icon: <Zap className="w-4 h-4" /> },
];

const AIQuizGenerator = ({ onAddGeneratedQuiz, classId }) => {
  const [generationData, setGenerationData] = useState({
    topic: "",
    difficulty: "medium",
    numberOfQuestions: 5,
    quizType: "mixed"
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGenerationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setGenerationData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };
  
  const handleGenerate = async () => {
    if (!generationData.topic) {
      toast.error("Please enter a topic for your quiz!");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/generate/preview`,
        generationData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      setGeneratedQuiz(response.data);
      toast.success("Quiz generated successfully! 🎉", {
        style: {
          border: '1px solid #8b5cf6',
          padding: '16px',
          color: '#6d28d9',
        },
      });
    } catch (err) {
      console.error("Error generating quiz:", err);
      setError(err.response?.data?.message || "Failed to generate quiz. Please try again.");
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseQuiz = () => {
    if (generatedQuiz) {
      onAddGeneratedQuiz(generatedQuiz);
      toast.success("Quiz added to editor! You can make changes as needed.", {
        icon: '🧠',
        style: {
          border: '1px solid #8b5cf6',
          padding: '16px',
          color: '#6d28d9',
        },
      });
      setGeneratedQuiz(null);
    }
  };
  
  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-violet-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-violet-50 to-fuchsia-50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg shadow-sm">
            <Brain className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">AI Quiz Generator</h3>
            <p className="text-sm text-slate-500">Let AI create a fully-formed quiz in seconds</p>
          </div>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-slate-700 font-medium mb-2">Quiz Topic <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="topic"
              value={generationData.topic}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 shadow-sm"
              placeholder="E.g., World War II, Quantum Physics, Web Development"
            />
          </div>
          
          <div>
            <label className="block text-slate-700 font-medium mb-2">Question Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {questionTypeOptions.map((option) => (
                <div 
                  key={option.value}
                  onClick={() => setGenerationData(prev => ({ ...prev, quizType: option.value }))}
                  className={`cursor-pointer p-3 rounded-xl border ${
                    generationData.quizType === option.value
                      ? 'border-violet-300 bg-violet-50 shadow-sm'
                      : 'border-slate-200 hover:border-violet-200'
                  } transition-all flex flex-col items-center justify-center gap-1`}
                >
                  <div className={`text-${generationData.quizType === option.value ? 'violet' : 'slate'}-600`}>
                    {option.icon}
                  </div>
                  <span className={`text-xs font-medium ${
                    generationData.quizType === option.value ? 'text-violet-700' : 'text-slate-600'
                  }`}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-2">Difficulty</label>
              <div className="flex gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGenerationData(prev => ({ ...prev, difficulty: option.value }))}
                    className={`flex-1 py-2.5 rounded-lg border ${
                      generationData.difficulty === option.value
                        ? `border-${option.color}-400 bg-${option.color}-50 text-${option.color}-700`
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    } text-sm font-medium transition-all`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-slate-700 font-medium mb-2">Number of Questions</label>
              <input
                type="number"
                name="numberOfQuestions"
                value={generationData.numberOfQuestions}
                onChange={handleNumberChange}
                min="1"
                max="15"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all duration-200 shadow-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Maximum 15 questions recommended</p>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerate}
          disabled={isLoading || !generationData.topic}
          className={`mt-6 w-full py-3.5 ${
            !generationData.topic
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:shadow-md'
          } rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all font-medium`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating your quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Quiz</span>
            </>
          )}
        </motion.button>
      </div>
      
      {error && (
        <div className="p-4 mx-6 mt-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-medium text-rose-700 mb-1">Error Generating Quiz</h4>
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Preview of Generated Quiz */}
      {generatedQuiz && !isLoading && (
        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-800">Generated Quiz Preview</h4>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRegenerate}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUseQuiz}
                className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-violet-200 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Use This Quiz</span>
              </motion.button>
            </div>
          </div>
          
          <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
            <h3 className="font-medium text-violet-800">{generatedQuiz.title}</h3>
            <p className="text-sm text-violet-600 mt-1 mb-4">{generatedQuiz.description}</p>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-violet-50">
              {generatedQuiz.questions.map((question, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-violet-100 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700 flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">{question.content}</p>
                      <div className="mt-2 text-xs font-medium text-slate-500">
                        {question.type === 'MULTIPLE_CHOICE' && 'Multiple Choice'}
                        {question.type === 'TRUE_FALSE' && 'True/False'}
                        {question.type === 'ESSAY' && 'Essay Question'}
                        {question.points && ` · ${question.points} points`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-xs text-violet-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generated {generatedQuiz.questions.length} questions on "{generationData.topic}"</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizGenerator;