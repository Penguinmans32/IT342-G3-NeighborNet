import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdInfo, 
  MdNotificationsActive, 
  MdNotifications, 
  MdClose, 
  MdChat,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdAccessTime,
  MdDone,
  MdDoneAll
} from 'react-icons/md';
import TimeAgo from 'react-timeago';

const notificationTypes = {
    REQUEST: {
        icon: <MdNotificationsActive className="text-2xl text-white" />,
        gradient: 'from-blue-500 to-blue-600',
        iconBg: 'bg-blue-500',
        shadow: 'shadow-blue-500/30',
        progressBar: 'bg-blue-300',
        sound: '/sounds/notification_sound.mp3'
    },
    ALERT: {
        icon: <MdWarning className="text-2xl text-white" />,
        gradient: 'from-red-500 to-red-600',
        iconBg: 'bg-red-500',
        shadow: 'shadow-red-500/30',
        progressBar: 'bg-red-300',
        sound: '/sounds/notification_sound.mp3'
    },
    UPDATE: {
        icon: <MdCheckCircle className="text-2xl text-white" />,
        gradient: 'from-green-500 to-green-600',
        iconBg: 'bg-green-500',
        shadow: 'shadow-green-500/30',
        progressBar: 'bg-green-300',
        sound: '/sounds/notification_sound.mp3'
    },
    MESSAGE: {
        icon: <MdChat className="text-2xl text-white" />,
        gradient: 'from-purple-500 to-purple-600',
        iconBg: 'bg-purple-500',
        shadow: 'shadow-purple-500/30',
        progressBar: 'bg-purple-300',
        sound: '/sounds/notification_sound.mp3'
    },
    DEFAULT: {
        icon: <MdNotifications className="text-2xl text-white" />,
        gradient: 'from-gray-500 to-gray-600',
        iconBg: 'bg-gray-500',
        shadow: 'shadow-gray-500/30',
        progressBar: 'bg-gray-300',
        sound: '/sounds/notification_sound.mp3'
    }
};

const Toast = ({ title, message, type = 'DEFAULT', show = true, onClose, duration = 5000 }) => {
    const [progress, setProgress] = React.useState(100);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isDismissing, setIsDismissing] = React.useState(false);
    const notificationStyle = notificationTypes[type] || notificationTypes.DEFAULT;
    const { icon, gradient, iconBg, shadow, progressBar, sound } = notificationStyle;
    const timestamp = React.useRef(new Date()).current;

    // Play sound effect on mount
    React.useEffect(() => {
        if (show) {
            const audio = new Audio(sound);
            audio.volume = 0.5;
            audio.play().catch(() => {}); // Catch and ignore autoplay errors
        }
    }, [show, sound]);

    React.useEffect(() => {
        if (duration && show && !isHovered) {
            const startTime = Date.now();
            const timer = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const newProgress = Math.max(0, 100 - (elapsedTime / duration) * 100);
                setProgress(newProgress);
                
                if (newProgress === 0) {
                    clearInterval(timer);
                    setIsDismissing(true);
                    setTimeout(() => onClose(), 300); // Allow time for exit animation
                }
            }, 10);

            return () => clearInterval(timer);
        }
    }, [duration, show, onClose, isHovered]);

    const handleClose = () => {
        setIsDismissing(true);
        setTimeout(() => onClose(), 300);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0, 
                        x: 0, 
                        scale: 1,
                        transition: {
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                        }
                    }}
                    exit={{ 
                        opacity: 0, 
                        x: 20, 
                        scale: 0.95,
                        transition: { duration: 0.2 }
                    }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    className={`w-full max-w-sm bg-white/95 rounded-xl shadow-lg ${shadow} 
                              overflow-hidden relative backdrop-blur-sm border border-gray-100
                              transform transition-all duration-200
                              ${isDismissing ? 'scale-95 opacity-0' : ''}
                              ${isHovered ? 'translate-x-[-4px] scale-[1.02]' : ''}`}
                >
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5 blur-xl`} />

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100/50">
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full ${progressBar}`}
                            transition={{ duration: 0.1, ease: "linear" }}
                        />
                    </div>

                    <div className="p-4">
                        <div className="flex items-start space-x-4">
                            {/* Animated Icon */}
                            <motion.div
                                whileHover={{ rotate: 12, scale: 1.1 }}
                                className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconBg} 
                                          flex items-center justify-center ${gradient} 
                                          shadow-lg transform -rotate-3`}
                                style={{
                                    boxShadow: `0 10px 30px -10px ${notificationStyle.shadow.split('-')[1]}`
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 10
                                    }}
                                >
                                    {icon}
                                </motion.div>
                            </motion.div>

                            {/* Content with enhanced typography */}
                            <div className="flex-1 pt-1">
                                <motion.h3 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="font-semibold text-gray-900 text-base tracking-tight"
                                >
                                    {title}
                                </motion.h3>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-1 text-sm text-gray-600 line-clamp-2 leading-relaxed"
                                >
                                    {message}
                                </motion.p>
                                
                                {/* Enhanced Timestamp */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-2 flex items-center text-xs text-gray-400 space-x-2"
                                >
                                    <MdAccessTime className="mr-1" />
                                    <TimeAgo date={timestamp} />
                                    <span>•</span>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {progress < 50 ? <MdDoneAll className="text-blue-500" /> : <MdDone className="text-gray-400" />}
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Enhanced Close button */}
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                className="flex-shrink-0 rounded-full p-1.5 hover:bg-gray-100
                                         transition-colors duration-200 group"
                            >
                                <MdClose className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Enhanced gradient border */}
                    <div className={`h-1 bg-gradient-to-r ${gradient} opacity-90`} />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;