import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  MdChevronRight,
  MdOutlineMenuBook,
  MdStar,
  MdArticle,
  MdBookmark,
  MdBookmarkBorder,
  MdOutlineLightbulb,
  MdSchool,
  MdSettings,
  MdInfo,
  MdPerson,
  MdQuiz,
  MdOutlineVerifiedUser,
  MdPlayCircleFilled
} from 'react-icons/md';
import { BookOpen, Award, Clock, ChevronRight, FileText, CheckCircle as LucideCheckCircle, BarChart3, MessageCircle, Sparkles, Download, Link, Brain, Target, Zap, Gift } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../backendApi/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import LessonPlayer from './LessonPlayer';
import Footer from './Footer';
import StarRating from './StarRating';
import confetti from 'canvas-confetti';

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
  const [loading, setLoading] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasWatchedEnough, setHasWatchedEnough] = useState(false);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [canMarkComplete, setCanMarkComplete] = useState(false);
  const [lessonRating, setLessonRating] = useState(0);
  const [displayRating, setDisplayRating] = useState({
    average: 0,
    count: 0
  });
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`);
    return savedNotes || "";
  });
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentSection, setCurrentSection] = useState('content');
  const [revealingObjectives, setRevealingObjectives] = useState(false);
  const [remainingVideoTime, setRemainingVideoTime] = useState('');
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isOwner, setIsOwner] = useState(false);
  const notesRef = useRef(null);
  const completionRef = useRef(null);

  useEffect(() => {
    if (lessonId) {
      const savedNotes = localStorage.getItem(`lesson-notes-${lessonId}`);
      if (savedNotes) {
        setNotes(savedNotes);
      } else {
        setNotes("");
      }
    }
  }, [lessonId]);

  useEffect(() => {
    if (lesson && user?.data) {
      setIsOwner(Number(user.data.id) === Number(lesson.creator?.id));
      console.log('User ID:', user.data.id, 'Creator ID:', lesson.creator?.id); // For debugging
    }
  }, [lesson, user]);

  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Run confetti when lesson is completed
  const triggerConfetti = () => {
    if (completionRef.current) {
      const rect = completionRef.current.getBoundingClientRect();
      const x = rect.x + rect.width / 2;
      const y = rect.y + rect.height / 2;
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { 
          x: x / window.innerWidth, 
          y: y / window.innerHeight 
        },
        colors: ['#4F46E5', '#10B981', '#8B5CF6', '#3B82F6'],
        disableForReducedMotion: true
      });
    }
  };

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
        
        // Calculate remaining time
        const remainingSeconds = Math.max(0, duration - currentTime);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = Math.floor(remainingSeconds % 60);
        setRemainingVideoTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        
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
        toast.success('Video complete! Click "Mark as Completed" to proceed.', {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#4C1D95',
            color: '#fff',
          },
        });
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
        `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/progress/lessons/${lessonId}`,
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
        
        triggerConfetti();
        toast.success('Lesson marked as completed! You can now proceed to the next lesson.', {
          icon: '🎓',
          style: {
            borderRadius: '10px',
            background: '#047857',
            color: '#fff',
          },
        });
        setShowCompletionModal(true);
      }
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      toast.error('Failed to mark lesson as complete. Please try again.');
    }
  };

  const fetchLessonRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Get user's rating if they're authenticated
      if (isAuthenticated) {
        const userRatingResponse = await axios.get(
          `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonId}/rating`,
          { headers }
        );
        if (userRatingResponse.data && userRatingResponse.data.rating) {
          setLessonRating(userRatingResponse.data.rating);
        }
      }
      
      // Set display rating from lesson data
      setDisplayRating({
        average: lesson.averageRating || 0,
        count: lesson.ratingCount || 0
      });
    } catch (error) {
      console.error("Error fetching lesson rating:", error);
    }
  };

  const handleRatingUpdate = async (newRating) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.post(
        `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonId}/rate`,
        { rating: newRating },
        { headers }
      );
      
      const lessonResponse = await axios.get(
        `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonId}`,
        { headers }
      );
      
      setLessonRating(newRating);
      setLesson(lessonResponse.data);
      setDisplayRating({
        average: lessonResponse.data.averageRating || 0,
        count: lessonResponse.data.ratingCount || 0
      });
      
      toast.success('Rating submitted successfully!', {
        icon: '⭐',
        style: {
          borderRadius: '10px',
          background: '#4338CA',
          color: '#fff',
        },
      });
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error('Failed to submit rating');
    }
  };

  const toggleBookmark = () => {
    // This is just visual, as the functionality isn't implemented in the backend
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed' : 'Lesson bookmarked!', {
      icon: isBookmarked ? '🗑️' : '🔖',
      style: {
        borderRadius: '10px',
        background: '#1E40AF',
        color: '#fff',
      },
    });
  };
  
  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    
    // Save to localStorage
    try {
      localStorage.setItem(`lesson-notes-${lessonId}`, notes);
      
      // Show success message after a brief delay to simulate saving
      setTimeout(() => {
        setIsSavingNotes(false);
        toast.success('Notes saved successfully!', {
          icon: '📝',
          style: {
            borderRadius: '10px',
            background: '#0F766E',
            color: '#fff',
          },
        });
      }, 800);
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
      setIsSavingNotes(false);
      toast.error('Failed to save notes. Please try again.');
    }
  };

  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      resetLessonStates();
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [lessonResponse, allLessonsResponse, progressResponse] = await Promise.all([
          axios.get(`https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonId}`, { headers }),
          axios.get(`https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons`, { headers }),
          axios.get(`https://neighbornet-back-production.up.railway.app/api/classes/${classId}/progress`, { headers })
        ]);

        setLesson(lessonResponse.data);

        setDisplayRating({
          average: lessonResponse.data.averageRating || 0,
          count: lessonResponse.data.ratingCount || 0
        });

        if (isAuthenticated) {
          try {
            const userRatingResponse = await axios.get(
              `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonId}/rating`,
              { headers }
            );
            if (userRatingResponse.data && userRatingResponse.data.rating) {
              setLessonRating(userRatingResponse.data.rating);
            }
          } catch (err) {
            console.log('No previous rating found for this user');
          }
        }

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
              `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonResponse.data.nextLessonId}`,
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
              `https://neighbornet-back-production.up.railway.app/api/classes/${classId}/lessons/${lessonResponse.data.prevLessonId}`,
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
        
        // After a slight delay, reveal learning objectives one by one
        if (lessonResponse.data.learningObjectives) {
          setTimeout(() => {
            setRevealingObjectives(true);
          }, 1000);
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
      toast.success('Moving to next lesson...', {
        icon: '🚀',
        style: {
          borderRadius: '10px',
          background: '#1E3A8A',
          color: '#fff',
        },
      });
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

  const getLessonDuration = () => {
    const minutes = Math.floor((lesson?.duration || 0) / 60);
    const seconds = (lesson?.duration || 0) % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatReadingTime = (textLength) => {
    // Estimate reading time based on 200 words per minute
    const words = textLength / 5; // Approx 5 chars per word
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };
  
  const keyPoints = [
    'Understanding core concepts',
    'Practical application techniques',
    'Real-world examples and use cases',
    'Common pitfalls to avoid'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdPlayCircleFilled className="text-indigo-500 text-2xl animate-pulse" />
            </div>
          </div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-indigo-700 font-medium text-xl"
          >
            Preparing your lesson
          </motion.div>
          <div className="mt-2 text-gray-500">Loading content and progress...</div>
          <div className="mt-6 flex gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50 relative">
      <Toaster position="top-right" />
      
      {/* Background decoration */}
      <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-transparent pattern-size-6 pattern-opacity-5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-200 to-indigo-200 rounded-full filter blur-3xl opacity-20 -z-10"></div>
      
      {/* Enhanced Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${videoProgress}%` }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 relative"
            >
              <div className="absolute inset-0 bg-shine animate-shine"></div>
            </motion.div>
          </div>
          
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03, x: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/class/${classId}`)}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600
                            bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-full
                            border border-gray-200 hover:border-indigo-200 transition-all duration-300 shadow-sm"
                >
                  <MdChevronLeft className="text-xl" />
                  <span className="font-medium">Course Home</span>
                </motion.button>
                
                {/* Lesson Progress */}
                <div className="hidden md:flex items-center gap-3 text-gray-600 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                      {progressData.currentLessonIndex + 1}
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <span className="font-medium">
                    Lesson {progressData.currentLessonIndex + 1}
                    {" "}
                    <span className="text-gray-400">
                      of {lesson.length || "?"}
                    </span>
                  </span>
                  {remainingVideoTime && (
                    <div className="px-2 py-0.5 bg-indigo-50 rounded-md text-xs flex items-center gap-1 text-indigo-600">
                      <Clock className="w-3 h-3" />
                      <span>{remainingVideoTime} remaining</span>
                    </div>
                  )}
                </div>
              </div>
  
              <h1 className="text-lg font-semibold text-gray-800 truncate max-w-xl hidden md:block">
                {lesson?.title}
              </h1>
  
              {/* Right Actions */}
              <div className="flex items-center gap-3">
                {isLessonCompleted ? (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500
                                px-3.5 py-1.5 rounded-full text-white shadow-sm">
                    <LucideCheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                ) : (
                  <motion.button
                    ref={completionRef}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={markLessonAsComplete}
                    disabled={!canMarkComplete}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300 shadow-sm ${
                      canMarkComplete
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canMarkComplete ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Mark Complete</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Keep Watching</span>
                      </>
                    )}
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleBookmark}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    isBookmarked ? 'text-indigo-600' : 'text-gray-500'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                >
                  {isBookmarked ? (
                    <MdBookmark className="text-xl" />
                  ) : (
                    <MdBookmarkBorder className="text-xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </nav>
  
      {/* Main Content */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-8 mt-4">
            {/* Left Column - Video and Content (Main) */}
            <div className="lg:w-2/3 space-y-6">
              {/* Video Player Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800">
                <div className="aspect-video">
                  <LessonPlayer
                    videoUrl={lesson?.videoUrl}
                    classId={classId}
                    onProgress={(progress) => setVideoProgress(progress)}
                    onComplete={handleVideoComplete}
                    isCompleted={isLessonCompleted}
                    showTranscript={false}
                    onTranscriptToggle={() => {}}
                  />
                </div>
                
                {/* Enhanced Video Controls Overlay (Visual Only) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-24 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
  
              {/* Mobile-only lesson title */}
              <div className="block md:hidden">
                <h1 className="text-xl font-bold text-gray-900">{lesson?.title}</h1>
                <div className="flex items-center gap-2 mt-1 text-gray-600 text-sm">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{getLessonDuration()} lesson</span>
                  
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  
                  <div className="flex items-center gap-1">
                    <MdPerson className="text-indigo-500" />
                    <span>{lesson?.author || "Instructor"}</span>
                  </div>
                </div>
              </div>
              
              {/* Content Navigation */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      onClick={() => setActiveTab('description')}
                      className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                        activeTab === 'description'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab('resources')}
                      className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                        activeTab === 'resources'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Link className="w-4 h-4" />
                      Resources
                    </button>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                        activeTab === 'notes'
                          ? 'border-b-2 border-indigo-500 text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <MdArticle className="w-4 h-4" />
                      Notes
                    </button>
                  </nav>
                </div>
  
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'description' && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="description"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-indigo-600" /> 
                          About this Lesson
                        </h3>
                        <div className="prose prose-indigo max-w-none text-gray-700">
                          {lesson?.description || "No description available for this lesson."}
                        </div>
                        
                        {/* Learning Objectives */}
                        {lesson?.learningObjectives && lesson.learningObjectives.length > 0 && (
                          <div className="mt-8 bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                            <h4 className="font-medium text-indigo-900 mb-4 flex items-center gap-2">
                              <Target className="w-4 h-4 text-indigo-600" />
                              Learning Objectives
                            </h4>
                            <ul className="space-y-3">
                              {lesson.learningObjectives.map((objective, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ 
                                    opacity: revealingObjectives ? 1 : 0, 
                                    x: revealingObjectives ? 0 : -10 
                                  }}
                                  transition={{ delay: index * 0.3 }}
                                  className="flex items-start gap-3"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-200 
                                                flex items-center justify-center mt-0.5">
                                    <span className="text-xs font-medium text-indigo-700">{index + 1}</span>
                                  </div>
                                  <span className="text-indigo-900">{objective}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Show key points toggle */}
                        <div className="mt-6">
                          <button
                            onClick={() => setShowKeyPoints(!showKeyPoints)}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                          >
                            {showKeyPoints ? 'Hide key points' : 'Show key points'}
                            <ChevronRight className={`w-4 h-4 transition-transform ${showKeyPoints ? 'transform rotate-90' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {showKeyPoints && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-3 bg-emerald-50 rounded-xl p-5 border border-emerald-100"
                              >
                                <h4 className="font-medium text-emerald-900 mb-3 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-emerald-600" />
                                  Key Points to Remember
                                </h4>
                                <ul className="space-y-2">
                                  {keyPoints.map((point, idx) => (
                                    <motion.li
                                      key={idx}
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.15 }}
                                      className="flex items-center gap-2 text-emerald-800"
                                    >
                                      <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-3 h-3 text-emerald-700" />
                                      </div>
                                      {point}
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Rating section */}
                        {lesson && (
                          !isOwner ? (
                            <div className="mt-8 border-t border-gray-100 pt-6">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                <MdStar className="text-yellow-500" />
                                Rate This Lesson
                              </h4>
                              <div className="flex items-center gap-4">
                                <StarRating
                                  initialRating={lessonRating}
                                  onRatingUpdate={handleRatingUpdate}
                                  readOnly={!isAuthenticated}
                                  size="lg"
                                />
                                <div className="text-sm text-gray-500">
                                  {displayRating.average.toFixed(1)} ({displayRating.count} ratings)
                                </div>
                              </div>
                              {!isAuthenticated && (
                                <p className="mt-2 text-sm text-gray-500 italic">
                                  You need to be logged in to rate this lesson.
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-8 border-t border-gray-100 pt-6">
                              <div className="flex items-center gap-2 text-gray-500 italic">
                                <MdInfo className="text-gray-400" />
                                As the creator of this lesson, you cannot rate your own content.
                              </div>
                            </div>
                          )
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                  
                  {activeTab === 'resources' && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="resources"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <Brain className="w-5 h-5 text-indigo-600" />
                          How to Learn This Topic
                        </h3>
                        
                        <div className="mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-indigo-900">Learning Strategy</h4>
                              <p className="text-sm text-indigo-700 mt-1">
                                This topic is best learned through a combination of conceptual understanding, practical application, and spaced repetition. Follow the step-by-step guide below to master this material effectively.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Step by Step Learning Guide */}
                        <div className="mb-8">
                          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <MdOutlineLightbulb className="text-amber-500" />
                            Step-by-Step Learning Path
                          </h4>
                          
                          <div className="relative ml-3">
                            {/* Vertical timeline line */}
                            <div className="absolute top-0 left-4 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 ml-px"></div>
                            
                            <div className="space-y-8 relative">
                              {/* Step 1 */}
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="relative pl-12"
                              >
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-blue-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold z-10">1</div>
                                <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                  <h5 className="font-medium text-blue-900 mb-2">Understand the Fundamentals</h5>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Start by grasping the core concepts. Watch the main lesson video from beginning to end without taking notes to get a broad overview.
                                  </p>
                                  <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="https://www.youtube.com/watch?v=Q6goNzXrmFs"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-1"
                                  >
                                    <MdPlayCircle className="text-lg" />
                                    <span>Watch introductory video</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </motion.a>
                                </div>
                              </motion.div>
                              
                              {/* Step 2 */}
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="relative pl-12"
                              >
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-indigo-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold z-10">2</div>
                                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                                  <h5 className="font-medium text-indigo-900 mb-2">Active Practice</h5>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Apply what you've learned through hands-on exercises. Try implementing the concepts in real code examples to solidify your understanding.
                                  </p>
                                  <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="https://codepen.io/pen/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mt-1"
                                  >
                                    <Link className="w-4 h-4" />
                                    <span>Interactive practice exercises</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </motion.a>
                                </div>
                              </motion.div>
                              
                              {/* Step 3 */}
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="relative pl-12"
                              >
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-violet-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold z-10">3</div>
                                <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                                  <h5 className="font-medium text-violet-900 mb-2">Reinforce with Details</h5>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Dive deeper into the topic by reading supplementary materials that cover more advanced aspects and edge cases.
                                  </p>
                                  <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="https://medium.com/topic/programming"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 mt-1"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>Read in-depth article</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </motion.a>
                                </div>
                              </motion.div>
                              
                              {/* Step 4 */}
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative pl-12"
                              >
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-purple-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold z-10">4</div>
                                <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                                  <h5 className="font-medium text-purple-900 mb-2">Test Your Understanding</h5>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Verify your knowledge by taking a short quiz to identify any gaps in your understanding that need further review.
                                  </p>
                                  <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="https://www.w3schools.com/quiztest/default.asp"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 mt-1"
                                  >
                                    <MdQuiz className="text-lg" />
                                    <span>Take practice quiz</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </motion.a>
                                </div>
                              </motion.div>
                              
                              {/* Step 5 */}
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative pl-12"
                              >
                                <div className="absolute left-0 top-0 w-9 h-9 rounded-full bg-teal-500 border-4 border-white shadow-md flex items-center justify-center text-white font-bold z-10">5</div>
                                <div className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm">
                                  <h5 className="font-medium text-teal-900 mb-2">Apply to Real Projects</h5>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Cement your knowledge by applying the concepts to your own projects or by completing the recommended challenge.
                                  </p>
                                  <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    href="https://github.com/topics/learning-projects"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 mt-1"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download project starter files</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </motion.a>
                                </div>
                              </motion.div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Learning Methods */}
                        <div className="mb-8 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-4">Effective Learning Methods</h4>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <MdPlayCircle className="text-lg" />
                                </div>
                                <h5 className="font-medium text-gray-800">Learn by Watching</h5>
                              </div>
                              <p className="text-xs text-gray-600 ml-11">Visual demonstrations help you grasp concepts quickly</p>
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                  <MdPerson className="text-lg" />
                                </div>
                                <h5 className="font-medium text-gray-800">Learn by Doing</h5>
                              </div>
                              <p className="text-xs text-gray-600 ml-11">Practice actively to reinforce neural pathways</p>
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                  <MdOutlineMenuBook className="text-lg" />
                                </div>
                                <h5 className="font-medium text-gray-800">Learn by Reading</h5>
                              </div>
                              <p className="text-xs text-gray-600 ml-11">Deepen your understanding with detailed explanations</p>
                            </div>
                            
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                  <MdSchool className="text-lg" />
                                </div>
                                <h5 className="font-medium text-gray-800">Learn by Teaching</h5>
                              </div>
                              <p className="text-xs text-gray-600 ml-11">Explain concepts to others to solidify your knowledge</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Suggested resources - kept as requested */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Suggested for You
                          </h4>
                          <div className="grid gap-3">
                            <motion.a
                              href="https://developer.mozilla.org/en-US/docs/Web"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white">
                                  <BookOpen className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">MDN Web Documentation</h5>
                                  <p className="text-xs text-gray-500 mt-0.5">A complete reference guide for your web development journey</p>
                                </div>
                              </div>
                            </motion.a>
                            
                            <motion.a
                              href="https://www.w3schools.com/quiztest/default.asp"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                                  <MdQuiz className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">Practice quiz</h5>
                                  <p className="text-xs text-gray-500 mt-0.5">Test your knowledge of this lesson's material</p>
                                </div>
                              </div>
                            </motion.a>
                            
                            <motion.a
                              href="https://github.com/topics/learning-resources"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.02, y: -2 }}
                              className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                                  <Brain className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">GitHub Learning Resources</h5>
                                  <p className="text-xs text-gray-500 mt-0.5">Community-created learning materials and open source projects</p>
                                </div>
                              </div>
                            </motion.a>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  
                  {activeTab === 'notes' && (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                          <MdArticle className="w-5 h-5 text-indigo-600" />
                          My Lesson Notes
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Take notes while watching the lesson to help remember key points.
                        </p>
                        <div className="relative">
                          <textarea
                            ref={notesRef}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            placeholder="Type your notes here..."
                          ></textarea>
                          <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
                            <div className="text-sm text-gray-500">
                              {notes.split(' ').filter(Boolean).length} words
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleSaveNotes}
                              disabled={isSavingNotes}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                              {isSavingNotes ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <MdCheck className="text-lg" />
                                  Save Notes
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                        
                        <div className="mt-8 bg-amber-50 rounded-xl p-5 border border-amber-100">
                          <div className="flex items-start gap-3">
                            <div className="text-amber-500 mt-1">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-medium text-amber-900 mb-1">Pro Tip</h5>
                              <p className="text-sm text-amber-800">
                                Try using the Cornell note-taking system: write key terms on the left, details on the right, and a summary at the bottom. This helps with organization and improves knowledge retention!
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>
  
              {/* Lesson Navigation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.button
                  whileHover={{ scale: 1.02, x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrevLesson}
                  disabled={!prevLesson}
                  className={`flex items-center gap-4 p-5 rounded-xl transition-all ${
                    prevLesson
                      ? 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-100'
                      : 'bg-gray-100 cursor-not-allowed opacity-70'
                  }`}
                >
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <MdChevronLeft className="text-2xl" />
                  </div>
                  <div className="text-left flex-1 truncate">
                    <div className="text-sm text-indigo-600 mb-1">Previous Lesson</div>
                    <div className={`font-medium truncate ${prevLesson ? 'text-gray-900' : 'text-gray-400'}`}>
                      {prevLesson ? prevLesson.title : 'No Previous Lesson'}
                    </div>
                  </div>
                </motion.button>
  
                <motion.button
                  whileHover={{ scale: 1.02, x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextLesson}
                  disabled={!nextLesson || !isLessonCompleted}
                  className={`flex items-center gap-4 p-5 rounded-xl transition-all ${
                    nextLesson && isLessonCompleted
                      ? 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-100'
                      : 'bg-gray-100 cursor-not-allowed opacity-70'
                  }`}
                >
                  <div className="text-right flex-1 truncate">
                    <div className="text-sm text-indigo-600 mb-1">Next Lesson</div>
                    <div className={`font-medium truncate ${
                      nextLesson && isLessonCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {nextLesson ? nextLesson.title : 'Last Lesson'}
                    </div>
                  </div>
                  {nextLesson && !isLessonCompleted && (
                    <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                      <MdLock className="text-2xl" />
                    </div>
                  )}
                  {nextLesson && isLessonCompleted && (
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                      <MdChevronRight className="text-2xl" />
                    </div>
                  )}
                  {!nextLesson && (
                    <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                      <MdChevronRight className="text-2xl" />
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
            
            {/* Right sidebar */}
            <div className="lg:w-1/3 space-y-6">  
              {/* Course navigation */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md"
              >
                <div className="p-5 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MdOutlineMenuBook className="text-indigo-600" />
                      Course Navigation
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {progressData.completedLessons.size}/{lesson.length || "?"} Completed
                    </span>
                  </h3>
                </div>
                <div className="px-3 py-4">
                  {/* Course progress bar */}
                  <div className="px-2 mb-4">
                    <div className="flex justify-between items-center mb-1.5 text-xs">
                      <div className="text-indigo-600 font-medium">Course Progress</div>
                      <div className="text-gray-600">
                        {Math.round((progressData.completedLessons.size / (lesson.length || 1)) * 100)}%
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progressData.completedLessons.size / (lesson.length || 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>
                  
                  {/* Lesson navigation list */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {Array.from({ length: Math.max(lesson.length || 5, 5) }).map((_, index) => {
                      const isCurrentLesson = index === progressData.currentLessonIndex;
                      const isCompleted = progressData.completedLessons.has(index);
                      const isLocked = !progressData.unlockedLessons.has(index);
                      
                      return (
                        <div
                          key={index}
                          className={`p-2.5 rounded-lg ${
                            isCurrentLesson 
                              ? 'bg-indigo-50 border border-indigo-200' 
                              : isLocked 
                                ? 'bg-gray-50 opacity-60'
                                : 'hover:bg-blue-50 cursor-pointer'
                          } transition-colors`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                              isCurrentLesson 
                                ? 'bg-indigo-500 text-white' 
                                : isCompleted 
                                  ? 'bg-green-500 text-white'
                                  : isLocked 
                                    ? 'bg-gray-200 text-gray-400' 
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : isLocked ? (
                                <MdLock className="w-4 h-4" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm truncate ${
                                isCurrentLesson 
                                  ? 'font-medium text-indigo-700' 
                                  : isLocked 
                                    ? 'text-gray-400'
                                    : 'text-gray-700'
                              }`}>
                                {index === progressData.currentLessonIndex 
                                  ? lesson?.title
                                  : index === progressData.currentLessonIndex - 1 
                                    ? prevLesson?.title
                                    : index === progressData.currentLessonIndex + 1
                                      ? nextLesson?.title
                                      : `Lesson ${index + 1}`}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className={`text-xs ${
                                  isCurrentLesson 
                                    ? 'text-indigo-500' 
                                    : isLocked 
                                      ? 'text-gray-400'
                                      : 'text-gray-500'
                                }`}>
                                  {isCompleted ? 'Completed' : isCurrentLesson ? 'Current' : '5 min'}
                                </div>
                              </div>
                            </div>
                            
                            {index === progressData.currentLessonIndex && (
                              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/class/${classId}`)}
                    className="w-full py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center"
                  >
                    <MdOutlineMenuBook className="text-lg" />
                    Back to Course Homepage
                  </motion.button>
                </div>
              </motion.div>
              
              {/* Certificate progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden shadow-md"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                      <MdOutlineVerifiedUser className="text-indigo-600" />
                      Certificate Progress
                    </h3>
                    <span className="text-xs px-2 py-1 bg-white/50 rounded-full text-indigo-700 font-medium">
                      {Math.round((progressData.completedLessons.size / (lesson.length || 1)) * 100)}% Complete
                    </span>
                  </div>
                  
                  <div className="mb-5">
                    <div className="relative h-3 bg-white/50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(progressData.completedLessons.size / (lesson.length || 1)) * 100}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        transition={{ duration: 1.2 }}
                      >
                        <div className="absolute inset-0 bg-shine animate-shine"></div>
                      </motion.div>
                    </div>
                    
                    {/* Trophy badges */}
                    <div className="flex justify-between mt-3">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          progressData.completedLessons.size >= (lesson.length || 5) * 0.25
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-sm'
                            : 'bg-white/50 text-gray-400'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          progressData.completedLessons.size >= (lesson.length || 5) * 0.5
                            ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-sm'
                            : 'bg-white/50 text-gray-400'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          progressData.completedLessons.size >= (lesson.length || 5) * 0.75
                            ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-sm'
                            : 'bg-white/50 text-gray-400'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          progressData.completedLessons.size >= (lesson.length || 5)
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-sm'
                            : 'bg-white/50 text-gray-400'
                        }`}
                      >
                        <Gift className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-indigo-900">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-between mb-2"
                    >
                      <span>Lessons completed:</span>
                      <span className="font-medium">{progressData.completedLessons.size}/{lesson.length || "?"}</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex items-center justify-between"
                    >
                      <span>Est. completion:</span>
                      <span className="font-medium">
                        {progressData.completedLessons.size === (lesson.length || 5)
                          ? 'Completed!'
                          : `${Math.ceil(((lesson.length || 5) - progressData.completedLessons.size) * 5)} mins`}
                      </span>
                    </motion.div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1 }}
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-xl z-0"
                ></motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1.1 }}
                  className="absolute -top-10 -left-10 w-24 h-24 bg-gradient-to-br from-blue-300/30 to-indigo-300/30 rounded-full blur-xl z-0"
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
  
      {/* Enhanced Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl border border-indigo-100"
            >
              {/* Success decoration */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 1],
                  scale: [0.5, 1.2, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 0.7,
                  times: [0, 0.5, 1],
                  ease: "easeOut"
                }}
                className="absolute -top-16 left-1/2 transform -translate-x-1/2"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 border-4 border-white
                              flex items-center justify-center shadow-lg relative z-10">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    >
                      <MdCheck className="text-white text-5xl" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              <div className="text-center mt-14">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  Great Job! Lesson Completed
                </motion.h3>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-gray-600 mb-2">
                    {nextLesson 
                      ? "You've completed this lesson successfully!"
                      : "🎉 Amazing! You've completed the final lesson of this course!"}
                  </p>
                  
                  {/* Course progress bar */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden my-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(progressData.completedLessons.size / (lesson.length || 1)) * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      transition={{ duration: 1 }}
                    >
                      <div className="h-full w-full bg-shine animate-shine"></div>
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-6">
                    <span>Course progress: {Math.round((progressData.completedLessons.size / (lesson.length || 1)) * 100)}%</span>
                    <span>{progressData.completedLessons.size}/{lesson.length || "?"} lessons</span>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCompletionModal(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl
                           transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                  >
                    {nextLesson ? "Stay Here" : "Close"}
                  </motion.button>
                  
                  {nextLesson && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setShowCompletionModal(false);
                        navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600
                               text-white rounded-xl hover:shadow-lg transition-all 
                               flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      Continue to Next Lesson
                      <MdArrowForward className="text-lg" />
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
      
      {/* Styling for animations */}
      <style jsx>{`
        .pattern-dots {
          background-image: radial-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .bg-shine {
          background: linear-gradient(
            90deg, 
            rgba(255,255,255,0) 0%, 
            rgba(255,255,255,0.4) 50%, 
            rgba(255,255,255,0) 100%
          );
        }
        
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        
        .animate-shine {
          animation: shine 2s infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(0.7);
            opacity: 0.3;
          }
          50% {
            transform: scale(1);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.7);
            opacity: 0.3;
          }
        }
        
        .pulse-animation {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        .CheckCircle {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 2s ease-in-out forwards;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Patch for potentially missing MdSticky icon
const MdSticky = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z" />
    </svg>
  );
};

// Patch for potentially missing CheckCircle icon
const CheckCircle = ({ className }) => {
  return LucideCheckCircle ? (
    <LucideCheckCircle className={className} />
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" className="CheckCircle" />
      <polyline points="22 4 12 14.01 9 11.01" className="CheckCircle" />
    </svg>
  );
};

export default LessonView;