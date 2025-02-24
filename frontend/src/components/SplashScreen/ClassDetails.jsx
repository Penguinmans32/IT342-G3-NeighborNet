import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdPlayArrow, MdLock, MdCheck, MdAccessTime, MdPeople, 
  MdLockOpen, MdStar, MdInfo, MdOutlinePlayCircleFilled,
  MdOutlineLightbulb, MdOutlineTimer, MdOutlinePeople,
  MdArrowForward, MdCheckCircle
} from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';
import Footer from './Footer';
import toast from 'react-hot-toast';

const FloatingShape = ({ className }) => (
  <motion.div
    className={`absolute opacity-30 blur-2xl ${className}`}
    animate={{
      y: [0, 15, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [classData, setClassData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasStartedJourney, setHasStartedJourney] = useState(false);

  const isOwner = user?.id === classData?.creator?.id;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  
    if (!hasStartedJourney && !isOwner) {
      toast.error('Please begin your journey first!');
      return;
    }
  
    if (!progressData.unlockedLessons.has(index)) {
      toast.error('Please complete the previous lesson first!');
      return;
    }
  
    navigate(`/your-classes/${classId}/lessons/${lesson.id}`);
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
    <div className="min-h-screen bg-white">
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
                  d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                />
              </svg>
            </motion.div>

            <span className="text-transparent bg-clip-text bg-gradient-to-r 
                            from-blue-600 to-purple-600 font-medium">
              Back Home
            </span>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity 
                          duration-300" />
          </motion.button>
        </motion.div>
     {/* Sticky Enrollment Bar */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: isScrolled ? 0 : -100 }}
          className="fixed top-0 left-0 right-0 bg-white shadow-md z-50"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-medium text-gray-900 line-clamp-1">
                {classData?.title}
              </h3>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <MdPeople className="text-blue-500" />
                {classData?.enrolledCount || 0} students
              </div>
            </div>
            {!isOwner && ( 
              <motion.button
                onClick={() => handleLessonClick(lessons[0], 0)}
                disabled={!hasStartedJourney} 
                className={`px-6 py-2 text-white rounded-full
                          transition-all duration-300 flex items-center gap-2 font-medium
                          ${hasStartedJourney 
                            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                            : 'bg-gray-400 cursor-not-allowed'}`}
                whileHover={hasStartedJourney ? { scale: 1.02 } : {}}
              >
                {!hasStartedJourney && <MdLock className="text-sm" />}
                Start Learning
                <MdArrowForward />
              </motion.button>
            )}
          </div>
        </motion.div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 to-blue-900 pt-20 overflow-hidden">
      <FloatingShape className="w-72 h-72 bg-blue-500/30 -top-20 -left-20" />
      <FloatingShape className="w-96 h-96 bg-purple-500/20 top-40 right-0" />
      <FloatingShape className="w-64 h-64 bg-indigo-500/20 bottom-0 left-1/3" />
        <div className="absolute inset-0 bg-[url('/path/to/pattern.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="grid lg:grid-cols-[1.5fr,1fr] gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {classData?.title}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {classData?.description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <MdOutlinePeople className="text-blue-400" />
                    {classData?.enrolledCount || 0} students enrolled
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineTimer className="text-blue-400" />
                    {classData?.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <MdOutlineLightbulb className="text-blue-400" />
                    {classData?.difficulty}
                  </div>
                </div>
              </motion.div>

              {/* Creator Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 
                              flex items-center justify-center text-white text-xl font-medium">
                  {classData?.creatorName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-medium">{classData?.creatorName}</p>
                  <p className="text-blue-300">{classData?.creatorEmail}</p>
                </div>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLessonClick(lessons[0], 0)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white
                         rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all duration-300
                         flex items-center gap-3 font-medium text-lg group"
              >
                <MdOutlinePlayCircleFilled className="text-2xl" />
                Start Learning Now
                <MdArrowForward className="transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* Right Column - Preview */}
            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;
                setMousePosition({ x, y });
              }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{
                  rotateY: mousePosition.x * 10,
                  rotateX: -mousePosition.y * 10,
                }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                {classData?.thumbnailUrl ? (
                  <div className="group relative h-full">
                    <img
                      src={`http://localhost:8080${classData.thumbnailUrl}`}
                      alt={classData.title}
                      className="w-full h-full object-cover transition-transform duration-300 
                                group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center 
                                bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                    <div className="text-2xl text-white/80">No thumbnail available</div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

     {/* Quick Stats */}
      <div className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { 
                icon: MdOutlinePeople, 
                label: "Students", 
                value: classData?.enrolledCount || 0 
              },
              { 
                icon: MdOutlinePlayCircleFilled, 
                label: "Lessons", 
                value: lessons.length 
              },
              { 
                icon: MdOutlineTimer, 
                label: "Duration", 
                value: classData?.duration 
              },
              { 
                icon: MdOutlineLightbulb, 
                label: "Level", 
                value: classData?.difficulty 
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  rotateX: 5,
                  rotateY: 5,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.1)"
                }}
                className="text-center p-6 bg-white rounded-2xl transform-gpu perspective-1000
                          hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50
                          transition-all duration-300 border border-gray-200"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 
                                opacity-0 group-hover:opacity-10 transition-opacity rounded-xl" />
                  <stat.icon className="mx-auto text-4xl text-blue-500 mb-3" />
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                                bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Column - Lessons */}
          <div className="space-y-8">
            {/* Class Content Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Class Content</h2>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {progressData.completedLessons.size} of {lessons.length} completed
                </div>
              </div>

              {/* Lessons List - Keep your existing lessons mapping but enhance the styling */}
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
                      className={`group relative rounded-xl transition-all duration-300
                                ${isUnlocked ? 'hover:bg-blue-50/50' : 'opacity-60'}
                                ${isCurrent ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''}`}
                    >
                      <button
                        onClick={() => handleLessonClick(lesson, index)}
                        className="w-full flex items-center gap-6 p-6"
                        disabled={!isUnlocked}
                      >
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                                     transition-colors duration-300
                                     ${isCompleted 
                                       ? 'bg-green-100 text-green-600' 
                                       : isUnlocked 
                                         ? 'bg-blue-100 text-blue-600'
                                         : 'bg-gray-100 text-gray-400'}`}>
                          {isCompleted ? (
                            <MdCheckCircle className="text-2xl" />
                          ) : isUnlocked ? (
                            <MdPlayArrow className="text-2xl" />
                          ) : (
                            <MdLock className="text-2xl" />
                          )}
                        </div>

                        <div className="flex-1 text-left">
                          <h3 className={`font-medium transition-colors duration-300
                                      ${isUnlocked 
                                        ? 'text-gray-900 group-hover:text-blue-600' 
                                        : 'text-gray-400'}`}>
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {lesson.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{lesson.duration}</span>
                          {isCompleted && (
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <MdStar key={i} className="text-yellow-400 text-sm" />
                              ))}
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Progress Line */}
                      {index < lessons.length - 1 && (
                        <div className="absolute left-[2.25rem] top-[4.5rem] bottom-0 w-0.5">
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

            {/* Requirements Section */}
            {classData?.requirements && classData.requirements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="grid gap-4">
                  {classData.requirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100
                               transition-colors duration-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <MdInfo className="text-blue-600" />
                      </div>
                      <p className="text-gray-700">{req}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:sticky lg:top-24 space-y-8 h-fit">
            {/* Class Creator Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600
                              flex items-center justify-center text-white text-xl font-medium">
                  {classData?.creatorName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{classData?.creatorName}</h3>
                  <p className="text-blue-600">{classData?.creatorEmail}</p>
                  
                  {/* Credentials */}
                  {classData?.creatorCredentials && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 text-sm">{classData.creatorCredentials}</p>
                    </div>
                  )}
                  
                  {/* Social Links */}
                  <div className="flex gap-4 mt-4">
                    {classData?.linkedinUrl && (
                      <a 
                        href={classData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {classData?.portfolioUrl && (
                      <a 
                        href={classData.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            {!isOwner && ( // Only show if not owner
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white"
              >
                <h3 className="text-xl font-semibold mb-4">Ready to Start Learning?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Self-paced learning</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Access to all materials</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <MdCheckCircle className="text-blue-200" />
                    <p className="text-blue-100">Certificate upon completion</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setHasStartedJourney(true);
                      toast.success('Journey unlocked! You can now start learning.');
                    }}
                    className={`w-full py-3 px-6 bg-white text-blue-600 rounded-xl font-medium
                              hover:bg-blue-50 transition-colors duration-300 mt-6
                              flex items-center justify-center gap-2
                              ${hasStartedJourney ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={hasStartedJourney}
                  >
                    {hasStartedJourney ? (
                      <>
                        <MdCheckCircle className="text-xl" />
                        Journey Started
                      </>
                    ) : (
                      <>
                        <MdPlayArrow className="text-xl" />
                        Begin Your Journey
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(progressData.completedLessons.size / lessons.length) * 100}%` 
                    }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {progressData.completedLessons.size} lessons completed
                  </span>
                  <span className="text-gray-600">
                    {lessons.length - progressData.completedLessons.size} remaining
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer - Keep your existing Footer component */}
      <Footer />
    </div>
  );
};

export default ClassDetails;