import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MdNotificationsActive,
  MdNotifications,
  MdClose,
  MdChat,
  MdCheckCircle,
  MdWarning,
  MdAccessTime,
  MdDone,
  MdDoneAll,
} from "react-icons/md"
import TimeAgo from "react-timeago"

const notificationTypes = {
  REQUEST: {
    icon: <MdNotificationsActive className="text-2xl text-white" />,
    gradient: "from-blue-500 via-blue-400 to-blue-600",
    iconBg: "bg-blue-500",
    shadow: "shadow-blue-500/30",
    progressBar: "bg-blue-300",
    sound: "/sounds/notification_sound.mp3",
    glow: "0 0 20px rgba(59, 130, 246, 0.5)",
  },
  ALERT: {
    icon: <MdWarning className="text-2xl text-white" />,
    gradient: "from-amber-500 via-red-400 to-red-500",
    iconBg: "bg-amber-500",
    shadow: "shadow-amber-500/30",
    progressBar: "bg-amber-300",
    sound: "/sounds/alert_sound.mp3",
    glow: "0 0 20px rgba(245, 158, 11, 0.5)",
  },
  UPDATE: {
    icon: <MdCheckCircle className="text-2xl text-white" />,
    gradient: "from-emerald-400 via-green-400 to-green-500",
    iconBg: "bg-emerald-500",
    shadow: "shadow-emerald-500/30",
    progressBar: "bg-emerald-300",
    sound: "/sounds/success_sound.mp3",
    glow: "0 0 20px rgba(16, 185, 129, 0.5)",
  },
  MESSAGE: {
    icon: <MdChat className="text-2xl text-white" />,
    gradient: "from-violet-400 via-purple-500 to-purple-600",
    iconBg: "bg-violet-500",
    shadow: "shadow-violet-500/30",
    progressBar: "bg-violet-300",
    sound: "/sounds/message_sound.mp3",
    glow: "0 0 20px rgba(139, 92, 246, 0.5)",
  },
  DEFAULT: {
    icon: <MdNotifications className="text-2xl text-white" />,
    gradient: "from-gray-500 via-gray-400 to-gray-600",
    iconBg: "bg-gray-500",
    shadow: "shadow-gray-500/30",
    progressBar: "bg-gray-300",
    sound: "/sounds/notification_sound.mp3",
    glow: "0 0 20px rgba(107, 114, 128, 0.5)",
  },
}

const Toast = ({ title, message, type = "DEFAULT", show = true, onClose, duration = 5000 }) => {
  const [progress, setProgress] = React.useState(100)
  const [isHovered, setIsHovered] = React.useState(false)
  const [isDismissing, setIsDismissing] = React.useState(false)
  const [hasInteracted, setHasInteracted] = React.useState(false)
  const notificationStyle = notificationTypes[type] || notificationTypes.DEFAULT
  const { icon, gradient, iconBg, shadow, progressBar, sound, glow } = notificationStyle
  const timestamp = React.useRef(new Date()).current

  // Enhanced sound effect with fade
  React.useEffect(() => {
    if (show) {
      const audio = new Audio(sound)
      audio.volume = 0
      const fadeIn = setInterval(() => {
        if (audio.volume < 0.5) {
          audio.volume += 0.1
        } else {
          clearInterval(fadeIn)
        }
      }, 50)
      audio.play().catch(() => {})
      return () => clearInterval(fadeIn)
    }
  }, [show, sound])

  // Progress bar and auto-dismiss logic
  React.useEffect(() => {
    if (duration && show && !isHovered) {
      const startTime = Date.now()
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime
        const newProgress = Math.max(0, 100 - (elapsedTime / duration) * 100)
        setProgress(newProgress)

        if (newProgress === 0 && !hasInteracted) {
          clearInterval(timer)
          setIsDismissing(true)
          setTimeout(() => onClose(), 300)
        }
      }, 10)

      return () => clearInterval(timer)
    }
  }, [duration, show, onClose, isHovered, hasInteracted])

  const handleClose = () => {
    setIsDismissing(true)
    setTimeout(() => onClose(), 300)
  }

  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 25,
  }

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
            transition: springTransition,
          }}
          exit={{
            opacity: 0,
            x: 20,
            scale: 0.95,
            transition: { duration: 0.2 },
          }}
          onHoverStart={() => {
            setIsHovered(true)
            setHasInteracted(true)
          }}
          onHoverEnd={() => setIsHovered(false)}
          className={`
            w-full max-w-sm bg-white rounded-xl 
            overflow-hidden relative border border-gray-100
            transform transition-all duration-200
            backdrop-blur-lg bg-white/90
            ${isDismissing ? "scale-95 opacity-0" : ""}
            ${isHovered ? "translate-x-[-4px] scale-[1.02]" : ""}
          `}
          style={{
            boxShadow: `
              0 10px 25px -5px rgba(0, 0, 0, 0.05),
              0 8px 10px -6px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.02),
              ${isHovered ? glow : "none"}
            `,
          }}
        >
          {/* Animated gradient border */}
          <motion.div
            className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              boxShadow: `0 0 8px ${shadow.split("-")[1].replace("30", "20")}`,
            }}
          />

          {/* Enhanced progress bar */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100/50">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${progressBar}`}
              style={{
                transition: "width linear 10ms",
                boxShadow: `0 0 8px ${progressBar}`,
              }}
            />
          </div>

          <div className="p-4 pl-6">
            <div className="flex items-start space-x-4">
              {/* Enhanced animated icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex-shrink-0 w-10 h-10 rounded-full 
                  flex items-center justify-center bg-gradient-to-br ${gradient}
                  relative
                `}
                style={{
                  boxShadow: `0 4px 6px -1px ${shadow.split("-")[1].replace("30", "20")}`,
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  {icon}
                </motion.div>
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    border: `2px solid ${iconBg}`,
                  }}
                />
              </motion.div>

              {/* Enhanced content */}
              <div className="flex-1 pt-0.5">
                <motion.h3
                  initial={{ opacity: 0, y: -5 }}
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

                {/* Enhanced timestamp */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 flex items-center text-xs text-gray-400 space-x-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <MdAccessTime className="mr-1" />
                  </motion.div>
                  <TimeAgo date={timestamp} />
                  <span>•</span>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {progress < 50 ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 0, 360],
                        }}
                        transition={{
                          duration: 0.5,
                          times: [0, 0.5, 1],
                          repeat: 0,
                        }}
                      >
                        <MdDoneAll className="text-blue-500" />
                      </motion.div>
                    ) : (
                      <MdDone className="text-gray-400" />
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Enhanced close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className={`
                  flex-shrink-0 rounded-full p-1
                  hover:bg-gray-100 transition-all duration-200
                  group relative
                `}
              >
                <MdClose className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast