import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertCircle } from 'lucide-react';
import ReactDOM from "react-dom/client"

export function showSimpleNotification(message, type = 'warning', duration = 3000) {
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '16px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  const notification = document.createElement('div');
  container.appendChild(notification);
  
  const root = ReactDOM.createRoot(notification);
  root.render(<SimpleNotificationElement message={message} type={type} duration={duration} onClose={() => {
    root.unmount();
    notification.remove();
  }} />);
}

function SimpleNotificationElement({ message, type, duration, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const bgColor = type === 'error' ? 'bg-rose-50 border-rose-200' : 
                 type === 'success' ? 'bg-emerald-50 border-emerald-200' : 
                 'bg-amber-50 border-amber-200';
  
  const textColor = type === 'error' ? 'text-rose-800' : 
                   type === 'success' ? 'text-emerald-800' : 
                   'text-amber-800';
  
  const iconColor = type === 'error' ? 'text-rose-500' : 
                   type === 'success' ? 'text-emerald-500' : 
                   'text-amber-500';
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`mb-2 flex items-center space-x-2 p-3 rounded-lg shadow-md border ${bgColor} max-w-sm`}
        >
          <div className={iconColor}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className={`text-sm flex-1 ${textColor}`}>{message}</p>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`${textColor} opacity-70 hover:opacity-100`}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}