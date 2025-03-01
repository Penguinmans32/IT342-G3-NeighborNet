import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class NotificationService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscribers = new Set();
    }

    connect(userId, token) {
        const socket = new SockJS('http://localhost:8080/ws');
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
                    this.notifySubscribers(notification);
                } catch (error) {
                    console.error('Error processing notification:', error);
                }
            });
        }
    }

    subscribe(callback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(notification) {
        this.subscribers.forEach(callback => callback(notification));
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            this.connected = false;
        }
    }
}

export const notificationService = new NotificationService();