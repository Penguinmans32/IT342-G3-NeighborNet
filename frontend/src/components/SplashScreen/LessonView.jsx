import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MdArrowBack, 
  MdArrowForward, 
  MdMenu,
  MdPlayCircle,
  MdPause,
  MdVolumeUp,
  MdClosedCaption,
  MdFullscreen,
  MdChevronLeft,
  MdLock,
  MdClose,
  MdCheck,
  MdAccessTime,
  MdChevronRight
} from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import LessonPlayer from './LessonPlayer';
import Footer from './Footer';
import LessonCompletionTracker from './LessonCompletionTracker';

const LessonView = () => {
  const { classId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  const [progressData, setProgressData] = useState({
    unlockedLessons: new Set([0]),
    completedLessons: new Set(),
    currentLessonIndex: 0
  });
  const [isLessonAccessible, setIsLessonAccessible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasWatchedEnough, setHasWatchedEnough] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [canMarkComplete, setCanMarkComplete] = useState(false);

  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const resetLessonStates = () => {
    setCanMarkComplete(false);
    setHasWatchedEnough(false);
    setIsLessonCompleted(false);
    setVideoProgress(0);
    setCurrentTime(0);
    setShowCompletionModal(false);
  };

  useEffect(() => {
    if (videoRef.current) {
      const handleVideoProgress = () => {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const progress = (currentTime / duration) * 100;
        
        setCurrentTime(currentTime);
        setVideoProgress(progress);
        
        // If progress is close to 100% (accounting for potential floating point issues)
        if (progress >= 99.5) {
          setCanMarkComplete(true);
          if (!hasWatchedEnough) {
            setHasWatchedEnough(true);
            toast.success('You can now mark this lesson as completed!');
          }
        }
      };
  
      const handleVideoEnd = () => {
        setIsPlaying(false);
        setCanMarkComplete(true);
        setHasWatchedEnough(true);
        toast.success('Video complete! Click "Mark as Completed" to proceed.');
      };
  
      videoRef.current.addEventListener('timeupdate', handleVideoProgress);
      videoRef.current.addEventListener('ended', handleVideoEnd);
  
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('timeupdate', handleVideoProgress);
          videoRef.current.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, [hasWatchedEnough]);

  const handleVideoComplete = () => {
    setCanMarkComplete(true);
    setHasWatchedEnough(true);
    if (!isLessonCompleted) {
      toast.success('Lesson complete! Click "Complete and Continue" to proceed.', {
        duration: 5000,
        icon: '🎉'
      });
    }
  };

  useEffect(() => {
    if (progressData.completedLessons.has(progressData.currentLessonIndex)) {
      setIsLessonCompleted(true);
      setHasWatchedEnough(true);
    }
  }, [progressData]);

  const markLessonAsComplete = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/classes/${classId}/progress/lessons/${lessonId}`,
        {
          completed: true,
          lastWatchedPosition: Math.floor(videoRef.current?.currentTime || 0),
          progress: 100 // Always send 100 when marking as complete
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
  
      if (response.status === 200) {
        setIsLessonCompleted(true);
        setProgressData(prev => {
          const newCompletedLessons = new Set([...prev.completedLessons]);
          newCompletedLessons.add(progressData.currentLessonIndex);
          
          const newUnlockedLessons = new Set([...prev.unlockedLessons]);
          newUnlockedLessons.add(progressData.currentLessonIndex + 1);
  
          return {
            ...prev,
            completedLessons: newCompletedLessons,
            unlockedLessons: newUnlockedLessons
          };
        });
  
        toast.success('Lesson marked as completed! You can now proceed to the next lesson.');
        setShowCompletionModal(true);
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      toast.error('Failed to mark lesson as complete. Please try again.');
    }
  };

  
  useEffect(() => {
    const fetchLessonAndProgress = async () => {

      resetLessonStates();
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [lessonResponse, allLessonsResponse, progressResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/classes/${classId}/lessons/${lessonId}`, { headers }),
          axios.get(`http://localhost:8080/api/classes/${classId}/lessons`, { headers }),
          axios.get(`http://localhost:8080/api/classes/${classId}/progress`, { headers })
        ]);

        setLesson(lessonResponse.data);

        const allLessons = allLessonsResponse.data;
        const currentIndex = allLessons.findIndex(l => l.id.toString() === lessonId);

        const unlockedSet = new Set([0]);
        const completedSet = new Set();
        
        progressResponse.data.forEach(progress => {
          const lessonIndex = allLessons.findIndex(l => l.id === progress.lessonId);
          if (progress.completed) {
            completedSet.add(lessonIndex);
            unlockedSet.add(lessonIndex + 1);
          }
        });

        setProgressData({
          unlockedLessons: unlockedSet,
          completedLessons: completedSet,
          currentLessonIndex: currentIndex
        });

        const isCurrentLessonCompleted = progressResponse.data.some(
          progress => progress.lessonId === parseInt(lessonId) && progress.completed
        );
        setIsLessonCompleted(isCurrentLessonCompleted);

        const isAccessible = unlockedSet.has(currentIndex);
        setIsLessonAccessible(isAccessible);

        if (!isAccessible) {
          navigate(`/class/${classId}`, { 
            state: { error: "This lesson is locked. Complete previous lessons to unlock it." }
          });
          return;
        }

        if (lessonResponse.data.nextLessonId) {
          const nextIndex = allLessons.findIndex(l => l.id === lessonResponse.data.nextLessonId);
          if (nextIndex !== -1 && unlockedSet.has(nextIndex)) {
            const nextResponse = await axios.get(
              `http://localhost:8080/api/classes/${classId}/lessons/${lessonResponse.data.nextLessonId}`,
              { headers }
            );
            setNextLesson(nextResponse.data);
          } else {
            setNextLesson(null); 
          }
        } else {
          setNextLesson(null); 
        }

        if (lessonResponse.data.prevLessonId) {
          const prevIndex = allLessons.findIndex(l => l.id === lessonResponse.data.prevLessonId);
          if (prevIndex !== -1 && currentIndex > 0) {
            const prevResponse = await axios.get(
              `http://localhost:8080/api/classes/${classId}/lessons/${lessonResponse.data.prevLessonId}`,
              { headers }
            );
            setPrevLesson(prevResponse.data);
          } else {
            setPrevLesson(null); 
          }
        } else {
          setPrevLesson(null);
        }

        if (isCurrentLessonCompleted) {
          setCanMarkComplete(true);
          setHasWatchedEnough(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson:", error);
        navigate(`/class/${classId}`);
        setLoading(false);
      }
    };

    fetchLessonAndProgress(); 
  }, [classId, lessonId, navigate]);


  const handleNextLesson = async () => {
    if (!nextLesson) {
      toast.error('This is the last lesson!');
      return;
    }
  
    if (!isLessonCompleted && !progressData.completedLessons.has(progressData.currentLessonIndex)) {
      toast.error('Please complete the current lesson first!');
      return;
    }
  
    try {
      navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`, { replace: true });
      toast.success('Moving to next lesson...');
    } catch (error) {
      console.error("Error navigating to next lesson:", error);
      toast.error('Failed to load next lesson. Please try again.');
    }
  };

  const handlePrevLesson = () => {
    if (!prevLesson || progressData.currentLessonIndex === 0) {
      toast.error('This is the first lesson!');
      return;
    }
  
    if (prevLesson) {
      navigate(`/your-classes/${classId}/lessons/${prevLesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-blue-100">
      {/* Enhanced Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-blue-900 shadow-lg z-50">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${videoProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            />
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/homepage')}
                  className="flex items-center gap-2 text-white/90 hover:text-white
                            bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm
                            border border-white/10 transition-all duration-300"
                >
                  <MdArrowBack className="text-xl" />
                  <span>Back to Course</span>
                </motion.button>
                
                {/* Lesson Progress */}
                <div className="hidden md:flex items-center gap-2 text-white/80">
                  <span className="text-sm">Lesson {progressData.currentLessonIndex + 1} of {lesson.length}</span>
                  <div className="w-px h-4 bg-white/20" />
                </div>
              </div>
  
              <h1 className="text-xl font-medium text-white truncate max-w-xl">
                {lesson?.title}
              </h1>
  
              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {isLessonCompleted ? (
                  <div className="flex items-center gap-2 text-green-400 bg-green-400/10 
                                px-3 py-1.5 rounded-full">
                    <MdCheck className="text-lg" />
                    <span className="text-sm">Completed</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markLessonAsComplete}
                    disabled={!canMarkComplete}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full
                              transition-all duration-300 ${
                                canMarkComplete
                                  ? 'bg-green-500 text-white hover:bg-green-600'
                                  : 'bg-gray-700 text-gray-300 cursor-not-allowed'
                              }`}
                  >
                    {canMarkComplete ? 'Mark Complete' : 'Watch to Complete'}
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
  
      {/* Main Content */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Video and Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
                <LessonPlayer
                  videoUrl={lesson?.videoUrl}
                  classId={classId}
                  onProgress={(progress) => setVideoProgress(progress)}
                  onComplete={handleVideoComplete}
                  isCompleted={isLessonCompleted}
                  showTranscript={showTranscript}
                  onTranscriptToggle={() => setShowTranscript(!showTranscript)}
                />
              </div>
  
              {/* Lesson Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About this Lesson</h3>
                <div className="prose prose-blue max-w-none">
                  {lesson?.description}
                </div>
                
                {/* Learning Objectives */}
                {lesson?.learningObjectives && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Learning Objectives</h4>
                    <ul className="space-y-2">
                      {lesson.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 
                                        flex items-center justify-center">
                            <span className="text-xs text-blue-600">{index + 1}</span>
                          </div>
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Resources */}
                {lesson?.resources && lesson.resources.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Additional Resources</h4>
                    <div className="grid gap-3">
                      {lesson.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 
                                   hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center 
                                        justify-center text-blue-600">
                            <MdInfo className="text-xl" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{resource.title}</h5>
                            <p className="text-sm text-gray-500">{resource.description}</p>
                          </div>
                          <MdArrowForward className="text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
  
              {/* Lesson Navigation */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrevLesson}
                  disabled={!prevLesson}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    prevLesson
                      ? 'bg-white hover:bg-gray-50 shadow-lg'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <MdChevronLeft className={`text-2xl ${prevLesson ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Previous Lesson</div>
                    <div className={`font-medium ${prevLesson ? 'text-gray-900' : 'text-gray-400'}`}>
                      {prevLesson ? prevLesson.title : 'No Previous Lesson'}
                    </div>
                  </div>
                </motion.button>
  
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextLesson}
                  disabled={!nextLesson || !isLessonCompleted}
                  className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                    nextLesson && isLessonCompleted
                      ? 'bg-white hover:bg-gray-50 shadow-lg'
                      : 'bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <div className="text-right flex-1">
                    <div className="text-sm text-gray-500">Next Lesson</div>
                    <div className={`font-medium ${
                      nextLesson && isLessonCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {nextLesson ? nextLesson.title : 'Last Lesson'}
                    </div>
                  </div>
                  {nextLesson && !isLessonCompleted && <MdLock className="text-gray-400 text-xl" />}
                  <MdChevronRight className={`text-2xl ${
                    nextLesson && isLessonCompleted ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </motion.button>
              </div>
            </div>
  
            {/* Right Column - Transcript */}
            {showTranscript && (
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Lesson Transcript
                      </h2>
                      <button
                        onClick={() => setShowTranscript(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <MdClose className="text-xl" />
                      </button>
                    </div>
                    
                    <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        {lesson?.transcript ? (
                          <div className="space-y-4">
                            {lesson.transcript.split('\n\n').map((paragraph, index) => (
                              <p key={index} className="text-gray-700">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            No transcript available for this lesson.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
  
      {/* Enhanced Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative"
          >
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full bg-green-500 border-4 border-white
                          flex items-center justify-center shadow-xl"
              >
                <MdCheck className="text-white text-4xl" />
              </motion.div>
            </div>
            
            <div className="text-center mt-8">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                Lesson Completed!
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-8"
              >
                {nextLesson 
                  ? "Great progress! Ready to tackle the next lesson?"
                  : "Congratulations! You've completed the final lesson of this course! 🎉"}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 justify-center"
              >
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl
                           hover:bg-gray-200 transition-colors"
                >
                  {nextLesson ? 'Stay Here' : 'Close'}
                </button>
                
                {nextLesson && (
                  <button
                    onClick={() => {
                      setShowCompletionModal(false);
                      navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600
                             text-white rounded-xl hover:from-blue-700 hover:to-purple-700
                             transition-colors flex items-center gap-2"
                  >
                    Continue Learning
                    <MdArrowForward />
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default LessonView;