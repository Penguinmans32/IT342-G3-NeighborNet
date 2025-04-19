import { useRef, useState, useEffect } from 'react';
import {
  MdPlayCircle,
  MdPause,
  MdVolumeUp,
  MdVolumeOff,
  MdClosedCaption,
  MdFullscreen,
  MdFullscreenExit
} from 'react-icons/md';
import VideoCompletionConfetti from './VideoCompletionConfetti';

const LessonPlayer = ({
  videoUrl,
  classId,
  onProgress,
  onComplete,
  isCompleted,
  showTranscript,
  onTranscriptToggle
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset video state when URL changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setError(null);
      setIsLoading(true);
    }
  }, [videoUrl]);

  // Video progress and completion handling
  useEffect(() => {
    if (videoRef.current) {
      const handleVideoProgress = () => {
        const currentTime = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        const progress = (currentTime / duration) * 100;
        
        setCurrentTime(currentTime);
        onProgress(progress);
      };

      const handleVideoEnd = () => {
        setIsPlaying(false);
        setShowConfetti(true);
        onComplete();
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
  }, [onProgress, onComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      } else if (e.code === 'ArrowRight') {
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
      } else if (e.code === 'KeyM') {
        toggleMute();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [duration]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted) {
        videoRef.current.volume = volume;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.parentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-lg">
      <div className="aspect-video relative cursor-pointer" onClick={handlePlayPause}>
        <video
          ref={videoRef}
          src={videoUrl ? `https://it342-g3-neighbornet.onrender.com/api/classes/${classId}/lessons/video/${videoUrl.split('/').pop()}` : ''}
          className="w-full h-full object-cover"
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => {
            console.error("Video loading error:", e);
            setError("Failed to load video");
            setIsLoading(false);
          }}
          controls={false}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
            <p>{error}</p>
          </div>
        )}

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            {isPlaying ? (
              <MdPause className="text-4xl text-white" />
            ) : (
              <MdPlayCircle className="text-4xl text-white" />
            )}
          </div>
        </div>
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
              
              {/* Volume Control */}
              <div className="group relative">
                <button 
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/10 rounded-full hover:text-blue-400 transition-colors"
                >
                  {isMuted ? (
                    <MdVolumeOff className="text-2xl text-gray-500" />
                  ) : (
                    <MdVolumeUp className="text-2xl" />
                  )}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900/95 p-2 rounded-lg shadow-lg">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    className="w-24 h-1 -rotate-90 mb-24 accent-blue-500"
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              <span className="text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onTranscriptToggle}
                className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                  showTranscript ? 'text-blue-400' : 'text-white hover:text-blue-400'
                }`}
              >
                <MdClosedCaption className="text-2xl" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/10 rounded-full hover:text-blue-400 transition-colors"
              >
                {isFullscreen ? (
                  <MdFullscreenExit className="text-2xl" />
                ) : (
                  <MdFullscreen className="text-2xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <VideoCompletionConfetti 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
};

export default LessonPlayer;