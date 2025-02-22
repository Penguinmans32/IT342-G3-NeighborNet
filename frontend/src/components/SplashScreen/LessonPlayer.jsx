import { useRef, useState, useEffect } from 'react';
import {
  MdPlayCircle,
  MdPause,
  MdVolumeUp,
  MdClosedCaption,
  MdFullscreen
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


  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [videoUrl]);

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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden shadow-lg">
      <div className="aspect-video relative">
        <video
          ref={videoRef}
          src={videoUrl ? `http://localhost:8080/api/classes/${classId}/lessons/video/${videoUrl.split('/').pop()}` : ''}
          className="w-full h-full object-cover"
          onLoadedMetadata={handleLoadedMetadata}
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
                onClick={onTranscriptToggle}
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

      <VideoCompletionConfetti 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
    </div>
  );
};

export default LessonPlayer;