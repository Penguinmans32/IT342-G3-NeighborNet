import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdKeyboardArrowDown, MdAdd, MdPlayCircle, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const LessonList = ({ classId, lessons = [], onAddLesson }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(lessons)) {
    console.warn('Lessons prop is not an array:', lessons);
    lessons = []; 
  }

  return (
    <motion.div className="mt-4 space-y-2">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white/95 transition-all"
      >
        <span className="text-gray-900 font-medium">
          Lessons ({lessons.length})
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdKeyboardArrowDown className="text-gray-900 text-xl" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 pl-4"
          >
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <LessonItem 
                  key={lesson.id || index} 
                  lesson={lesson} 
                  index={index + 1}
                  classId={classId} // Pass classId here
                />
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No lessons added yet
              </div>
            )}
            
            <motion.button
              onClick={onAddLesson}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white/95 transition-all text-gray-900"
            >
              <MdAdd className="text-xl text-gray-900" />
              <span className="font-medium">Add New Lesson</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LessonItem = ({ lesson, index, classId }) => { // Add classId to props
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLessonClick = () => {
    navigate(`/your-classes/${classId}/lessons/${lesson.id}`);
  };

  if (!lesson) {
    return null;
  }

  return (
    <div className="space-y-2">
      <motion.button
        onClick={handleLessonClick}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white/95 transition-all text-gray-900"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
            {index}
          </span>
          <span>{lesson.title}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <MdKeyboardArrowDown />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && lesson.subLessons && Array.isArray(lesson.subLessons) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-12 space-y-2"
          >
            {lesson.subLessons.map((subLesson, subIndex) => (
              <motion.button
                key={subLesson.id || subIndex}
                whileHover={{ x: 4 }}
                className="w-full flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white/95 transition-all text-gray-900"
              >
                <div className="flex items-center gap-3">
                  <MdPlayCircle className="text-xl" />
                  <span>{subLesson.title}</span>
                </div>
                <MdEdit className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LessonList;