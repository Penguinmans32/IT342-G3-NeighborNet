import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { notificationService } from './NotificationService';
import { useAuth } from './AuthContext';
import Toast from '../components/Toast';
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
    const [toasts, setToasts] = useState([]); 
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const [processedMessageIds] = useState(new Set());
    const [messageSourceTracker] = useState(new Map());

    const showToast = useCallback(({ type, title, message, duration = 5000, messageId }) => {
        if (messageId && processedMessageIds.has(messageId)) {
            return;
        }

        const id = Date.now();
        const newToast = { id, type, title, message, duration };
        
        setToasts(prev => [...prev, newToast]);
        
        if (messageId) {
            processedMessageIds.add(messageId);
            setTimeout(() => {
                processedMessageIds.delete(messageId);
            }, 5000);
        }
        
        if (duration) {
            setTimeout(() => {
                setToasts(prev => prev.filter(toast => toast.id !== id));
            }, duration);
        }
    }, [processedMessageIds]);

    // Fetch persistent notifications from backend
    const fetchNotifications = useCallback(async () => {
        if (!user) return [];

        try {
            const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/notifications', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data) {
                setNotifications(response.data);
                const unreadCount = response.data.filter(n => !n.is_read).length;
                setUnreadCount(unreadCount);
                return response.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }, [user]);

    // Connect to WebSocket for real-time notifications
    useEffect(() => {
    if (user && user.id) { // Changed from user.data.id to user.id
        const token = localStorage.getItem('token');
        notificationService.connect(user.id, token); // Changed from user.data.id to user.id

        const unsubscribe = notificationService.subscribe((notification) => {
            console.log("New notification received:", notification);
            fetchNotifications();
            
            if (notification.messageType === 'CHAT' || notification.type === 'CHAT') {
                const isInChat = window.location.pathname === '/messages' || 
                               window.location.pathname.includes('/chat');
                
                if (isInChat) {
                    return;
                }
            }

            const messageId = notification.id || notification.messageId || `${notification.senderId}-${Date.now()}`;
            
            const now = Date.now();
            const recentMessage = messageSourceTracker.get(messageId);
            if (recentMessage && (now - recentMessage) < 5000) {
                return;
            }

            messageSourceTracker.set(messageId, now);
            
            setTimeout(() => {
                messageSourceTracker.delete(messageId);
            }, 5000);

            showToast({
                type: notification.type || 'DEFAULT',
                title: notification.title,
                message: notification.message,
                duration: 5000,
                messageId: messageId
            });
        });

        return () => {
            unsubscribe();
            notificationService.disconnect();
            messageSourceTracker.clear(); 
        };
    }
}, [user, fetchNotifications, showToast]);

    // Initial fetch of notifications
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    // Persistent notification handlers
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            ...notification,
            is_read: false,
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(count => count + 1);
        
        // Show toast for new notification
        showToast({
            type: notification.type,
            title: notification.title,
            message: notification.message,
            duration: 5000
        });
    }, [showToast]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axios.put(`https://it342-g3-neighbornet.onrender.com/api/notifications/${notificationId}/read`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

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

    const deleteAllNotifications = useCallback(async () => {
        try {
            await axios.delete('https://it342-g3-neighbornet.onrender.com/api/notifications', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
    }, []);


    const markAllAsRead = useCallback(async () => {
        try {
            await axios.put('https://it342-g3-neighbornet.onrender.com/api/notifications/mark-all-read', null, {
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
            if (notification && !notification.is_read) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== notificationId);
        });
    }, []);

    const value = {
        notifications,    
        unreadCount,       
        showToast,        
        addNotification,  
        markAsRead,        
        markAllAsRead,    
        deleteNotification, 
        deleteAllNotifications,
        fetchNotifications 
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Toast Container */}
            <div className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                title={toast.title}
                                message={toast.message}
                                type={toast.type}
                                show={true}
                                duration={toast.duration}
                                onClose={() => {
                                    setToasts(prev => 
                                        prev.filter(t => t.id !== toast.id)
                                    );
                                }}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;