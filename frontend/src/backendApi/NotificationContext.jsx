import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { notificationService } from './NotificationService';
import { useAuth } from './AuthContext';
import Notification from '../components/Notification';
import axios from 'axios';

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
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
      if (user) {
          try {
              console.log("Fetching notifications for user:", user);
              const response = await axios.get('http://localhost:8080/api/notifications', {
                  headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`
                  }
              });
              console.log("Raw response:", response);
              
              if (response.data) {
                  console.log("Setting notifications:", response.data);
                  setNotifications(response.data);
                  const unreadCount = response.data.filter(n => !n.is_read).length;
                  setUnreadCount(unreadCount);
                  return response.data;
              } else {
                  console.log("No notifications data in response");
                  return [];
              }
          } catch (error) {
              console.error('Error fetching notifications:', error);
              if (error.response) {
                  console.error('Error response:', error.response);
              }
              return [];
          }
      }
      return [];
  }, [user]);

  useEffect(() => {
    if (user) {
        fetchNotifications();
    }
}, [user, fetchNotifications]);

useEffect(() => {
  if (user) {
      const token = localStorage.getItem('token');
      notificationService.connect(user.id, token);

      const unsubscribe = notificationService.subscribe((notification) => {
          console.log("New notification received:", notification);
          // When a new notification is received, fetch all notifications again
          fetchNotifications();
      });

      return () => {
          unsubscribe();
          notificationService.disconnect();
      };
  }
}, [user, fetchNotifications]);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            ...notification,
            unread: true,
            time: new Date().toISOString(),
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
        
        // Show toast notification
        showToast(newNotification);
    }, []);

    const showToast = useCallback(({ type, title, message, duration = 5000 }) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, type, title, message, duration }]);
    }, []);

    const markAsRead = useCallback(async (notificationId) => {
      try {
          await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, null, {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
              }
          });
          // Update local state
          setNotifications(prev =>
              prev.map(notification =>
                  notification.id === notificationId
                      ? { ...notification, is_read: true }
                      : notification
              )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
          console.error('Error marking notification as read:', error);
      }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
        await axios.put('http://localhost:8080/api/notifications/mark-all-read', null, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, is_read: true }))
        );
        setUnreadCount(0);
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
}, []);

    const deleteNotification = useCallback((notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === notificationId);
            if (notification?.unread) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== notificationId);
        });
    }, []);

    const value = {
        notifications,
        unreadCount,
        showToast,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
    };

    return (
      <NotificationContext.Provider value={value}>
          {children}
          <div className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50">
              <AnimatePresence>
                  {notifications
                      .filter(n => !n.is_read) // Show only unread notifications as toasts
                      .map((notification) => (
                          <div key={notification.id} className="pointer-events-auto">
                              <Notification
                                  title={notification.title}
                                  message={notification.message}
                                  type={notification.type}
                                  show={true}
                                  onClose={() => markAsRead(notification.id)}
                              />
                          </div>
                      ))}
              </AnimatePresence>
          </div>
      </NotificationContext.Provider>
  );
};