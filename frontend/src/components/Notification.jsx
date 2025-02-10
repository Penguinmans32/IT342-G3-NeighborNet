import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';

const notificationTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-gradient-to-r from-green-500/10 to-green-500/20 border-green-500/20 text-green-700',
    iconClassName: 'text-green-500',
    progressBarClass: 'from-green-500 to-green-400',
  },
  error: {
    icon: XCircle,
    className: 'bg-gradient-to-r from-red-500/10 to-red-500/20 border-red-500/20 text-red-700',
    iconClassName: 'text-red-500',
    progressBarClass: 'from-red-500 to-red-400',
  },
  info: {
    icon: Info,
    className: 'bg-gradient-to-r from-blue-500/10 to-blue-500/20 border-blue-500/20 text-blue-700',
    iconClassName: 'text-blue-500',
    progressBarClass: 'from-blue-500 to-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/20 border-yellow-500/20 text-yellow-700',
    iconClassName: 'text-yellow-500',
    progressBarClass: 'from-yellow-500 to-yellow-400',
  },
};

const Notification = ({
  type = 'info',
  title,
  message,
  onClose,
  duration = 5000,
  show = true,
}) => {
  const { icon: Icon, className, iconClassName, progressBarClass } = notificationTypes[type];

  useEffect(() => {
    if (show && duration !== Infinity) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ 
            opacity: 0, 
            y: -20, 
            scale: 0.95, 
            transition: { duration: 0.2 }
          }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className={`fixed top-4 right-4 z-50 min-w-[320px] max-w-md rounded-xl border 
            backdrop-blur-xl shadow-lg ${className} p-4`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-start gap-3 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 25,
                delay: 0.1 
              }}
              className={`p-2 rounded-full bg-white/90 shadow-sm`}
            >
              <Icon className={`h-5 w-5 ${iconClassName}`} />
            </motion.div>

            <div className="flex-1 pt-1">
              {title && (
                <motion.h3 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-semibold leading-5"
                >
                  {title}
                </motion.h3>
              )}
              {message && (
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-1 text-sm opacity-90"
                >
                  {message}
                </motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.8 }}
              onClick={onClose}
              className={`shrink-0 rounded-full p-1 hover:bg-black/5 
                transition-colors duration-200`}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {duration !== Infinity && (
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: 0 }}
                animate={{ x: '-100%' }}
                transition={{ 
                  duration: duration / 1000, 
                  ease: 'linear'
                }}
                className={`absolute inset-0 bg-gradient-to-r ${progressBarClass} opacity-50`}
              />
            </div>
          )}

          {/* Background gradient animation */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl opacity-50"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, transparent 0%, transparent 100%)',
                'radial-gradient(circle at 100% 100%, transparent 0%, transparent 100%)'
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;