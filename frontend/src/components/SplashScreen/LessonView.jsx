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
  MdChevronRight
} from 'react-icons/md';
import axios from 'axios';

const LessonView = () => {
  const { classId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [prevLesson, setPrevLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/your-classes/${classId}/lessons/${nextLesson.id}`);
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
                  disabled={!nextLesson}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    nextLesson
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {nextLesson ? (
                    <span>Next: {nextLesson.title}</span>
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
    </div>
  );
};

export default LessonView;