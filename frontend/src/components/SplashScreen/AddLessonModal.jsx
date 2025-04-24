import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCloudUpload, MdVideoLibrary, MdCheck } from 'react-icons/md';

const AddLessonModal = ({ isOpen, onClose, onSubmit, classId }) => {
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    videoFile: null,
    parentLessonId: null
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 
    
    const formData = new FormData();
    formData.append('title', lessonData.title);
    formData.append('description', lessonData.description);
    formData.append('videoFile', lessonData.videoFile);
    formData.append('classId', classId);
    if (lessonData.parentLessonId) {
      formData.append('parentLessonId', lessonData.parentLessonId);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting lesson:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setLessonData({ ...lessonData, videoFile: file });
      }
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLessonData({ ...lessonData, videoFile: e.target.files[0] });
    }
  };
  
  const activateBrowse = () => {
    inputRef.current?.click();
  };
  
  const getVideoDuration = (file) => {
    if (!file) return '';
    
    const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
    return `${sizeMB} MB`;
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, delay: 0.1 } 
    }
  };

  const modalVariants = {
    hidden: { 
      y: 20,
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: { 
      y: 20,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 } 
    }
  };

  const spinTransition = {
    repeat: Infinity,
    ease: "linear",
    duration: 1
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create New Lesson</h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <MdClose className="text-xl" />
                </motion.button>
              </div>
              
              {/* Cool decorative elements */}
              <div className="absolute -bottom-5 left-0 w-full flex justify-center">
                <div className="h-10 w-10 bg-white dark:bg-gray-800 rotate-45 transform origin-center"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Enter an engaging lesson title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Describe what students will learn in this lesson"
                  rows={4}
                  required
                />
              </div>

              {/* Improved video upload area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video Content
                </label>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={activateBrowse}
                  className={`relative cursor-pointer border-2 ${
                    dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 
                    lessonData.videoFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                    'border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
                  } rounded-xl transition-all duration-300 overflow-hidden`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                    required
                  />
                  
                  <div className="p-8 flex flex-col items-center justify-center">
                    {lessonData.videoFile ? (
                      <motion.div 
                        className="w-full" 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                            <MdCheck className="text-2xl text-green-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">Video Ready</h4>
                            <div className="mt-1 flex items-center justify-between">
                              <div className="flex items-center">
                                <MdVideoLibrary className="text-gray-500 mr-1" />
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {getVideoDuration(lessonData.videoFile)}
                                </span>
                              </div>
                              <span className="text-sm text-blue-500 hover:underline">Change</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex flex-col items-center text-center"
                        animate={{ 
                          y: dragActive ? -5 : 0,
                          scale: dragActive ? 1.03 : 1
                        }}
                      >
                        <div className="w-16 h-16 mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <MdCloudUpload className="text-3xl text-blue-500" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Upload Video</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {dragActive ? "Drop your video here" : "Drag and drop or click to browse"}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                    text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-md 
                    hover:shadow-lg transition-all duration-200 disabled:opacity-90 relative overflow-hidden"
                >
                  <span className={`flex items-center justify-center ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                    Create Lesson
                  </span>
                  
                  {isSubmitting && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <motion.span 
                          animate={{ rotate: 360 }}
                          transition={spinTransition}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="text-sm">Uploading...</span>
                      </div>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddLessonModal;