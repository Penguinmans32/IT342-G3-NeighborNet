import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class NotificationService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscribers = new Set();
        this.processedMessageIds = new Set(); // Add this to track processed messages
    }

    connect(userId, token) {
        const socket = new SockJS('https://neighbornet-back-production.up.railway.app/ws');
        this.client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            debug: () => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to notification service');
                this.connected = true;
                this.subscribeToUserNotifications(userId);
            },
            onDisconnect: () => {
                console.log('Disconnected from notification service');
                this.connected = false;
            },
            onError: (error) => {
                console.error('Notification service error:', error);
                setTimeout(() => {
                    if (!this.connected) {
                        this.connect(userId, token);
                    }
                }, 5000);
            }
        });

        this.client.activate();
    }

    subscribeToUserNotifications(userId) {
        if (this.client && this.connected) {
            this.client.subscribe(`/user/${userId}/queue/notifications`, message => {
                try {
                    const notification = JSON.parse(message.body);
                    this.handleMessage(notification);
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            });
        }
    }

    handleMessage(message) {
        // Generate or use existing message ID
        const messageId = message.id || message.messageId || `msg_${Date.now()}`;

        // Check if we've already processed this message
        if (this.processedMessageIds.has(messageId)) {
            console.log('Duplicate message detected, skipping:', messageId);
            return;
        }

        // Add to processed messages
        this.processedMessageIds.add(messageId);

        // Clean up message ID after 5 seconds
        setTimeout(() => {
            this.processedMessageIds.delete(messageId);
        }, 5000);

        // Create notification with message ID
        const notification = {
            ...message,
            messageId: messageId
        };

        // Notify subscribers
        this.notifySubscribers(notification);
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(notification) {
        this.subscribers.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                console.error('Error in notification subscriber:', error);
            }
        });
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
        // Clear processed message IDs on disconnect
        this.processedMessageIds.clear();
    }
}

export const notificationService = new NotificationService();