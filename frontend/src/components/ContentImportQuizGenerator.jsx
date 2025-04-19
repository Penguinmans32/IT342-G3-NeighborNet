import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Book, Link as LinkIcon, RefreshCw, Upload, FileUp } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const ContentImportQuizGenerator = ({ onAddGeneratedQuiz, classId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [generationParams, setGenerationParams] = useState({
    numberOfQuestions: 5,
    difficulty: "medium",
    quizType: "mixed"
  });

  const handleGenerate = async () => {
    if ((!content && contentType === "text") || (!url && contentType === "url")) {
      toast.error("Please provide content for quiz generation");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const requestData = {
        ...generationParams,
        contentType: contentType,
        content: contentType === "text" ? content : url
      };
      
      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/quizzes/generate/from-content`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      onAddGeneratedQuiz(response.data);
      toast.success("Quiz successfully generated from your content!");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz from content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/plain' && 
        file.type !== 'application/pdf' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        file.type !== 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      toast.error("Please upload a TXT, PDF, DOCX or PPTX file");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should not exceed 10MB");
      return;
    }
    
    const loadingToast = toast.loading(`Processing ${file.name}...`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'https://it342-g3-neighbornet.onrender.com/api/upload/extract-text',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.status === 'success') {
        setContent(response.data.content);
        toast.success(`Successfully extracted content from ${file.name}`, {
          id: loadingToast
        });
      } else {
        throw new Error(response.data.message || 'Failed to process file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(`Error: ${error.message || 'Failed to process file'}`, {
        id: loadingToast
      });
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Book className="w-5 h-5 text-violet-600" />
        Generate Quiz from Content
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Content Source
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setContentType("text")}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              contentType === "text"
                ? "bg-violet-100 text-violet-700 border border-violet-300"
                : "bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
          <button
            onClick={() => setContentType("url")}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              contentType === "url"
                ? "bg-violet-100 text-violet-700 border border-violet-300"
                : "bg-slate-50 text-slate-600 border border-slate-200"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Website URL</span>
          </button>
        </div>
      </div>
      
      {contentType === "text" ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paste Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste lesson text, notes, or other educational content here..."
              className="w-full h-40 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition-all"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Or Upload a File
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50">
              <label className="cursor-pointer flex flex-col items-center justify-center">
                <FileUp className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">Click to upload TXT, PDF, DOCX, or PPTX</span>
                <span className="text-xs text-slate-500 mt-1">Max file size: 5MB</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.pdf,.docx,.pptx" 
                  onChange={handleFileUpload} 
                />
              </label>
            </div>
          </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article-or-lesson"
            className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-200 focus:border-violet-500 transition-all"
          />
          <p className="text-xs text-slate-500 mt-1">
            We'll extract content from this page to create your quiz
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of Questions
          </label>
          <select
            value={generationParams.numberOfQuestions}
            onChange={(e) => setGenerationParams({...generationParams, numberOfQuestions: parseInt(e.target.value)})}
            className="w-full p-3 border border-slate-200 rounded-lg"
          >
            <option value={3}>3 Questions</option>
            <option value={5}>5 Questions</option>
            <option value={10}>10 Questions</option>
            <option value={15}>15 Questions</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Difficulty
          </label>
          <select
            value={generationParams.difficulty}
            onChange={(e) => setGenerationParams({...generationParams, difficulty: e.target.value})}
            className="w-full p-3 border border-slate-200 rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleGenerate}
        disabled={isLoading || (!content && contentType === "text") || (!url && contentType === "url")}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Generating Quiz...</span>
          </>
        ) : (
          <>
            <Book className="w-4 h-4" />
            <span>Generate Quiz from Content</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ContentImportQuizGenerator;