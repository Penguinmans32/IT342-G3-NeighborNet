import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  FaBook, FaCalculator, FaPaintBrush, FaCode, 
  FaMusic, FaChess, FaMicroscope, FaLanguage 
} from 'react-icons/fa';

const LoadingScreen = ({ 
  timeout = 10000,
  message = "Loading your learning experience...",
  onTimeout = () => {},
  isLoading = true
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  const learningIcons = [
    { icon: FaBook, color: "text-blue-500", label: "Literature" },
    { icon: FaCalculator, color: "text-green-500", label: "Mathematics" },
    { icon: FaPaintBrush, color: "text-purple-500", label: "Arts" },
    { icon: FaCode, color: "text-yellow-500", label: "Programming" },
    { icon: FaMusic, color: "text-pink-500", label: "Music" },
    { icon: FaChess, color: "text-red-500", label: "Strategy" },
    { icon: FaMicroscope, color: "text-indigo-500", label: "Science" },
    { icon: FaLanguage, color: "text-teal-500", label: "Languages" }
  ];

  const learningTips = [
    "Did you know? Learning with others increases retention by 50%",
    "Taking short breaks improves long-term learning efficiency",
    "Teaching others helps you master the subject better",
    "Regular practice is better than cramming",
    "Connecting new knowledge to existing concepts enhances understanding",
    "Visual learning aids memory retention",
    "Learning new skills creates new neural pathways",
    "Curiosity makes learning more effective"
  ];

  useEffect(() => {
    let progressInterval;
    let tipInterval;
    
    if (isLoading) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, timeout / 100);

      tipInterval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % learningTips.length);
      }, 3000);

      const timeoutId = setTimeout(() => {
        onTimeout();
      }, timeout);

      return () => {
        clearInterval(progressInterval);
        clearInterval(tipInterval);
        clearTimeout(timeoutId);
      };
    }
  }, [isLoading, timeout, onTimeout]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 z-50"
        >
          <div className="max-w-2xl w-full mx-4">
            <div className="text-center space-y-8">
              <div className="relative h-32">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {learningIcons.map((item, index) => {
                    const Icon = item.icon;
                    const angle = (index / learningIcons.length) * Math.PI * 2;
                    const x = Math.cos(angle) * 60;
                    const y = Math.sin(angle) * 60;

                    return (
                      <motion.div
                        key={index}
                        className={`absolute ${item.color}`}
                        style={{
                          transform: `translate(${x}px, ${y}px)`
                        }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <Icon className="text-2xl" />
                      </motion.div>
                    );
                  })}
                </motion.div>

                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      N
                    </span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-semibold text-gray-800">{message}</h2>
                
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-gray-600 italic"
                >
                  {learningTips[currentTip]}
                </motion.div>
              </motion.div>

              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <motion.p 
                className="text-gray-600"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                {progress}% Complete
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;