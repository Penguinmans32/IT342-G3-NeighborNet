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
  MdCheck,
  MdChevronRight
} from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import LessonPlayer from './LessonPlayer';
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
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/your-classes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <MdArrowBack className="text-xl" />
              <span>Back to Classes</span>
            </motion.button>
            <h1 className="text-xl font-semibold text-gray-900">
              {lesson?.title}
            </h1>
            <div className="w-24"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Section */}
            <div className="lg:col-span-2">
            <LessonPlayer
              videoUrl={lesson?.videoUrl}
              classId={classId}
              onProgress={(progress) => {
                setVideoProgress(progress);
              }}
              onComplete={handleVideoComplete}
              isCompleted={isLessonCompleted}
              showTranscript={showTranscript}
              onTranscriptToggle={() => setShowTranscript(!showTranscript)}
            />

            <LessonCompletionTracker
                isCompleted={isLessonCompleted}
                canMarkComplete={canMarkComplete}
                onComplete={markLessonAsComplete}
              />


              {/* Lesson Navigation */}
                <div className="mt-6 flex justify-between items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrevLesson}
                    disabled={!prevLesson}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      prevLesson
                        ? 'bg-white text-gray-900 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <MdChevronLeft className="text-xl" />
                    {prevLesson ? (
                      <span>Previous: {prevLesson.title}</span>
                    ) : (
                      <span>No Previous Lesson</span>
                    )}
                  </motion.button>

                  {nextLesson ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNextLesson}
                      disabled={!isLessonCompleted}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        isLessonCompleted
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Next: {nextLesson.title}</span>
                      {!isLessonCompleted && <MdLock className="text-xl" />}
                      <MdChevronRight className="text-xl" />
                    </motion.button>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      Last Lesson
                    </div>
                  )}
                </div>
            </div>

            {/* Transcript Section */}
            {showTranscript && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Transcript
                  </h2>
                  <div className="prose prose-sm max-w-none">
                    {lesson?.description || 'No transcript available.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <MdCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Lesson Completed!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {nextLesson 
                  ? "Great job! You've completed this lesson. Ready to move on to the next one?"
                  : "Congratulations! You've completed the final lesson of this course!"}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {nextLesson ? 'Stay Here' : 'Close'}
                </button>
                {nextLesson && progressData.unlockedLessons.has(progressData.currentLessonIndex + 1) && (
                  <button
                    onClick={() => {
                      setShowCompletionModal(false);
                      navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`, { replace: true });
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Next Lesson
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LessonView;