import Notification from "../components/Notification";
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ type, title, message, duration = 5000 }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const closeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const value = {
    showNotification,
    closeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50">
        <AnimatePresence>
          {notifications.map(({ id, ...props }) => (
            <div key={id} className="pointer-events-auto">
              <Notification
                {...props}
                show={true}
                onClose={() => closeNotification(id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};