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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch lesson details, all lessons, and progress in parallel
        const [lessonResponse, allLessonsResponse, progressResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/classes/${classId}/lessons/${lessonId}`, { headers }),
          axios.get(`http://localhost:8080/api/classes/${classId}/lessons`, { headers }),
          axios.get(`http://localhost:8080/api/classes/${classId}/progress`, { headers })
        ]);

        setLesson(lessonResponse.data);

        // Find current lesson index
        const allLessons = allLessonsResponse.data;
        const currentIndex = allLessons.findIndex(l => l.id.toString() === lessonId);

        // Process progress data
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

        // Check if current lesson is accessible
        const isAccessible = unlockedSet.has(currentIndex);
        setIsLessonAccessible(isAccessible);

        if (!isAccessible) {
          // Redirect to class details with a message
          navigate(`/class/${classId}`, { 
            state: { error: "This lesson is locked. Complete previous lessons to unlock it." }
          });
          return;
        }

        // Set next and prev lessons only if they're unlocked
        if (lessonResponse.data.nextLessonId) {
          const nextIndex = allLessons.findIndex(l => l.id === lessonResponse.data.nextLessonId);
          if (unlockedSet.has(nextIndex)) {
            const nextResponse = await axios.get(
              `http://localhost:8080/api/classes/${classId}/lessons/${lessonResponse.data.nextLessonId}`,
              { headers }
            );
            setNextLesson(nextResponse.data);
          }
        }

        if (lessonResponse.data.prevLessonId) {
          const prevResponse = await axios.get(
            `http://localhost:8080/api/classes/${classId}/lessons/${lessonResponse.data.prevLessonId}`,
            { headers }
          );
          setPrevLesson(prevResponse.data);
        }

      } catch (error) {
        console.error("Error fetching lesson:", error);
        navigate(`/class/${classId}`);
      }
    };

    fetchLessonAndProgress();
  }, [classId, lessonId, navigate]);

  

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/classes/${classId}/lessons/${lessonId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log('Lesson data:', response.data);
        setLesson(response.data);
        // Fetch next and previous lessons if available
        if (response.data.nextLessonId) {
          const nextResponse = await axios.get(
            `http://localhost:8080/api/classes/${classId}/lessons/${response.data.nextLessonId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setNextLesson(nextResponse.data);
        }
        if (response.data.prevLessonId) {
          const prevResponse = await axios.get(
            `http://localhost:8080/api/classes/${classId}/lessons/${response.data.prevLessonId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          setPrevLesson(prevResponse.data);
        }
      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [classId, lessonId]);

  const handleNextLesson = async () => {
    console.log('Current lesson status:', {
      isLessonCompleted,
      hasWatchedEnough,
      videoProgress,
      completedLessons: Array.from(progressData.completedLessons),
      currentIndex: progressData.currentLessonIndex
    });
  
    if (!isLessonCompleted && !progressData.completedLessons.has(progressData.currentLessonIndex)) {
      toast.error('Please complete the current lesson first!');
      return;
    }
  
    if (nextLesson) {
      try {
        navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`);
        toast.success('Moving to next lesson...');
      } catch (error) {
        console.error("Error navigating to next lesson:", error);
        toast.error('Failed to load next lesson. Please try again.');
      }
    }
  };

  const handlePrevLesson = () => {
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
                <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                {/* Video Player */}
                <div className="aspect-video relative">
                <video
                  ref={videoRef}
                  src={lesson?.videoUrl ? `http://localhost:8080/api/classes/${classId}/lessons/video/${lesson.videoUrl.split('/').pop()}` : ''}
                  className="w-full h-full object-cover"
                  onTimeUpdate={handleVideoTimeUpdate}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false);
                    if (hasWatchedEnough) {
                      setShowCompletionModal(true);
                    }
                  }}
                  controls={false}
                />
                </div>
                {/* Custom Video Controls */}
                <div className="bg-gray-900/95 p-4 backdrop-blur-sm">
                <div className="flex flex-col gap-2">
                    {/* Progress Bar */}
                    <div 
                    className="w-full h-2 bg-gray-700/50 rounded-full cursor-pointer relative group hover:h-3 transition-all"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = x / rect.width;
                        if (videoRef.current) {
                        videoRef.current.currentTime = percentage * duration;
                        }
                    }}
                    >
                    <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                        style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                    />
                    </div>


                    {/* Controls */}
                    <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                        <button 
                        onClick={handlePlayPause}
                        className="hover:text-blue-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                        >
                        {isPlaying ? (
                            <MdPause className="text-2xl" />
                        ) : (
                            <MdPlayCircle className="text-2xl" />
                        )}
                        </button>
                        <div className="group relative">
                        <button className="p-2 hover:bg-white/10 rounded-full hover:text-blue-400 transition-colors">
                            <MdVolumeUp className="text-2xl" />
                        </button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900/95 p-2 rounded-lg shadow-lg">
                            <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="1"
                            className="w-24 h-1 -rotate-90 mb-24 accent-blue-500"
                            onChange={(e) => {
                                if (videoRef.current) {
                                videoRef.current.volume = e.target.value;
                                }
                            }}
                            />
                        </div>
                        </div>
                        <span className="text-sm font-medium">
                        {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                        onClick={() => setShowTranscript(!showTranscript)}
                        className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                            showTranscript ? 'text-blue-400' : 'text-white hover:text-blue-400'
                        }`}
                        >
                        <MdClosedCaption className="text-2xl" />
                        </button>
                        <button
                        onClick={() => {
                            if (videoRef.current) {
                            if (document.fullscreenElement) {
                                document.exitFullscreen();
                            } else {
                                videoRef.current.requestFullscreen();
                            }
                            }
                        }}
                        className="p-2 hover:bg-white/10 rounded-full hover:text-blue-400 transition-colors"
                        >
                        <MdFullscreen className="text-2xl" />
                        </button>
                    </div>
                    </div>
                </div>
                </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((currentTime / duration) * 100)}% Complete
                      </span>
                    </div>
                    
                    {!isLessonCompleted ? (
                      <button
                        onClick={markLessonAsComplete}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                          ${canMarkComplete || videoProgress >= 99.5
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-100 text-gray-400'
                          }`}
                      >
                        <MdCheck className="text-xl" />
                        Mark as Completed
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500">
                        <MdCheck className="text-xl" />
                        <span>Lesson Completed!</span>
                      </div>
                    )}
                  </div>

                  {/* Add a manual completion option */}
                  {!isLessonCompleted && !canMarkComplete && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setCanMarkComplete(true);
                          setHasWatchedEnough(true);
                          toast.success('You can now mark the lesson as completed!');
                        }}
                        className="text-sm text-blue-500 hover:text-blue-600 underline"
                      >
                        Already familiar with this content? Click here to mark as completed
                      </button>
                    </div>
                  )}
                </div>
              </div>

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

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextLesson}
                  disabled={!nextLesson || !isLessonCompleted}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    (nextLesson && isLessonCompleted)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {nextLesson ? (
                    <>
                      <span>Next: {nextLesson.title}</span>
                      {!isLessonCompleted && <MdLock className="text-xl" />}
                    </>
                  ) : (
                    <span>No Next Lesson</span>
                  )}
                  <MdChevronRight className="text-xl" />
                </motion.button>
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
                Great job! You've completed this lesson. Ready to move on to the next one?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Stay Here
                </button>
                {nextLesson && progressData.unlockedLessons.has(progressData.currentLessonIndex + 1) && (
                  <button
                    onClick={handleNextLesson}
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