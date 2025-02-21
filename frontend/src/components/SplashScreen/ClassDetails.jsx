import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdPlayArrow, MdLock, MdCheck, MdAccessTime, MdPeople, MdLockOpen, MdStar } from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';

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
    <div className="min-h-screen bg-gray-50">
      {/* Class Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thumbnail Section */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              {classData?.thumbnailUrl ? (
                <img
                  src={`http://localhost:8080${classData.thumbnailUrl}`}
                  alt={classData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdPlayArrow className="text-6xl text-gray-400" />
                </div>
              )}
              
              {/* Overlay with class info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                    {classData?.category}
                  </span>
                  <h1 className="mt-2 text-2xl font-bold text-white">
                    {classData?.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Class Info Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-2">
                  <MdAccessTime className="text-xl" />
                  <span>{classData?.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdPeople className="text-xl" />
                  <span>{classData?.enrolledCount || 0} enrolled</span>
                </div>
                {classData?.difficulty && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                    {classData.difficulty}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {classData?.description}
              </p>

              {/* Requirements Section */}
              {classData?.requirements && classData.requirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {classData.requirements.map((req, index) => (
                      <li key={index} className="text-gray-600">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Creator Info */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">
                    {classData?.creatorName?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{classData?.creatorName}</h3>
                  <p className="text-gray-500">{classData?.creatorEmail}</p>
                </div>
              </div>
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
      </div>
    </div>
  );
};

export default ClassDetails;