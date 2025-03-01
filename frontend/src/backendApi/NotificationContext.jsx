import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { notificationService } from './NotificationService';
import { useAuth } from './AuthContext';
import Notification from '../components/Notification';

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

    useEffect(() => {
        if (user) {
            // Connect to WebSocket when user is logged in
            const token = localStorage.getItem('token');
            notificationService.connect(user.id, token);

            // Subscribe to notifications
            const unsubscribe = notificationService.subscribe((notification) => {
                addNotification(notification);
            });

            return () => {
                unsubscribe();
                notificationService.disconnect();
            };
        }
    }, [user]);

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

    const markAsRead = useCallback((notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, unread: false }
                    : notification
            )
        );
        setUnreadCount(count => Math.max(0, count - 1));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, unread: false }))
        );
        setUnreadCount(0);
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
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50">
                <AnimatePresence>
                    {notifications
                        .filter(n => n.duration) // Only show toast notifications
                        .map(({ id, ...props }) => (
                            <div key={id} className="pointer-events-auto">
                                <Notification
                                    {...props}
                                    show={true}
                                    onClose={() => deleteNotification(id)}
                                />
                            </div>
                        ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};