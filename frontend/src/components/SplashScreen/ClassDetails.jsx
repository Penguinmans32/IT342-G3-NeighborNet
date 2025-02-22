import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow, MdLock, MdCheck, MdAccessTime, MdPeople, MdLockOpen, MdStar, MdInfo } from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';
import Footer from './Footer';

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [classData, setClassData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState({
    unlockedLessons: new Set([0]),
    completedLessons: new Set(),
    currentLessonIndex: 0
  });

  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [unlockedLessonId, setUnlockedLessonId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(0);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [classResponse, lessonsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/classes/${classId}`, { headers }),
          axios.get(`http://localhost:8080/api/classes/${classId}/lessons`, { headers })
        ]);

        setClassData(classResponse.data);
        setLessons(lessonsResponse.data);

        if (isAuthenticated && user) {
          try {
            // Fetch latest progress
            const progressResponse = await axios.get(
              `http://localhost:8080/api/classes/${classId}/progress`,
              { headers }
            );

            const unlockedSet = new Set([0]); 
            const completedSet = new Set();
            let currentIndex = 0;

            // Process the progress data
            progressResponse.data.forEach(progress => {
              // Find the correct lesson index
              const lessonIndex = lessonsResponse.data.findIndex(l => l.id === progress.lessonId);
              if (progress.completed) {
                completedSet.add(lessonIndex);
                unlockedSet.add(lessonIndex + 1); 
                currentIndex = Math.max(currentIndex, lessonIndex + 1);
              }
            });

            console.log('Updated progress:', {
              completed: Array.from(completedSet),
              unlocked: Array.from(unlockedSet),
              current: currentIndex
            });

            setProgressData({
              unlockedLessons: unlockedSet,
              completedLessons: completedSet,
              currentLessonIndex: currentIndex
            });
          } catch (error) {
            console.error('Failed to fetch progress:', error);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch class details:', err);
        setError(err.response?.data?.message || 'Failed to load class');
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId, isAuthenticated, user, refreshKey]);

  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1); 
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleLessonClick = async (lesson, index) => {
    if (!isAuthenticated) {
      navigate('/?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!progressData.unlockedLessons.has(index)) {
      toast.error('Please complete the previous lesson first!');
      return;
    }

    navigate(`/your-classes/${classId}/lessons/${lesson.id}`);
  };

  const unlockNextLesson = async (currentLessonIndex) => {
    const nextIndex = currentLessonIndex + 1;
    if (nextIndex < lessons.length && !progressData.unlockedLessons.has(nextIndex)) {
      setUnlockedLessonId(lessons[nextIndex].id);
      setShowUnlockAnimation(true);

      setProgressData(prev => ({
        ...prev,
        unlockedLessons: new Set([...prev.unlockedLessons, nextIndex]),
        currentLessonIndex: nextIndex
      }));

      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowUnlockAnimation(false);
      setUnlockedLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <button
          onClick={() => navigate('/your-classes')}
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Go Back to Classes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50">
      {/* Back Home Button */}
      <motion.div
        initial={{ x: -100, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6 z-50" 
      >
        <motion.button
          onClick={() => navigate("/homepage")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2 px-6 py-3 bg-white/80 
                    hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl 
                    transition-all duration-300 backdrop-blur-sm border border-white/50"
        >
          <motion.div
            whileHover={{ x: -4 }} 
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 
                          rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 relative z-10"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}  
            transition={{ duration: 0.2 }}
            className="text-transparent bg-clip-text bg-gradient-to-r 
                      from-blue-600 to-purple-600 font-medium"
          >
            Back Home
          </motion.span>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                        rounded-full opacity-0 group-hover:opacity-100 transition-opacity 
                        duration-300" />
        </motion.button>
      </motion.div>

      {/* Section 1: Preview Image and Title */}
      <div className="relative bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95">
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
            {/* Image Section */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 shadow-2xl ring-1 ring-white/10">
              {classData?.thumbnailUrl ? (
                <img
                  src={`http://localhost:8080${classData.thumbnailUrl}`}
                  alt={classData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                  <MdPlayArrow className="text-6xl text-white/80" />
                </div>
              )}
            </div>

            {/* Class Info Section */}
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                {classData?.title}
              </h1>
              <p className="text-white text-lg leading-relaxed">
                {classData?.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Class Content</h2>
            <div className="text-sm text-gray-500">
              {progressData.completedLessons.size} of {lessons.length} completed
            </div>
          </div>
          
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const isUnlocked = progressData.unlockedLessons.has(index);
              const isCompleted = progressData.completedLessons.has(index);
              const isCurrent = progressData.currentLessonIndex === index;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Unlock Animation */}
                  <AnimatePresence>
                    {showUnlockAnimation && unlockedLessonId === lesson.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 bg-blue-500/20 rounded-xl z-10 flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <MdLockOpen className="text-6xl text-blue-500" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => handleLessonClick(lesson, index)}
                    className={`w-full flex items-center gap-6 p-4 rounded-xl transition-all duration-300
                      ${isUnlocked 
                        ? 'hover:bg-gray-50 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed bg-gray-50'
                      }
                      ${isCurrent ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    `}
                  >
                    {/* Status Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-green-50 text-green-500' 
                        : isUnlocked 
                          ? 'bg-blue-50 text-blue-500'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <MdCheck className="text-2xl" />
                      ) : isUnlocked ? (
                        <MdPlayArrow className="text-2xl" />
                      ) : (
                        <MdLock className="text-2xl" />
                      )}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <h3 className={`font-medium transition-colors
                        ${isUnlocked 
                          ? 'text-gray-900 group-hover:text-blue-500' 
                          : 'text-gray-400'
                        }`}
                      >
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {lesson.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="text-sm">{lesson.duration}</span>
                      {isCompleted && (
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <MdStar key={i} className="text-yellow-400 text-sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Progress Line */}
                  {index < lessons.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5">
                      <div className="h-full bg-gray-100" />
                      {isCompleted && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: '100%' }}
                          className="absolute inset-0 bg-green-500"
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Class Statistics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6 mt-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95 bg-clip-text text-transparent mb-6">
            Class Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Enrolled Students", value: classData?.enrolledCount || 0, icon: MdPeople },
              { label: "Total Lessons", value: lessons.length, icon: MdPlayArrow },
              { label: "Duration", value: classData?.duration, icon: MdAccessTime },
              { label: "Difficulty", value: classData?.difficulty, icon: MdStar },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="font-medium text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: About the Class */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6 mt-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95 bg-clip-text text-transparent mb-6">
            About the Class
          </h2>
          <div className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {classData?.description ||
                  "A comprehensive course designed to help you master the fundamentals and advanced techniques of the subject matter."}
              </p>
            </div>
            {classData?.requirements && classData.requirements.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Requirements</h3>
                <ul className="space-y-2">
                  {classData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <MdInfo className="mt-1 text-blue-500 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Class Creator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6 mt-8">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95 bg-clip-text text-transparent mb-6">
            Class Creator
          </h2>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl font-medium text-white">{classData?.creatorName?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-medium text-gray-900">{classData?.creatorName}</h3>
              <p className="text-blue-600">{classData?.creatorEmail}</p>
              <p className="text-gray-600 mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
                {classData?.creatorBio ||
                  "Expert instructor with years of experience in the field, dedicated to providing high-quality education and helping students achieve their learning goals."}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClassDetails;