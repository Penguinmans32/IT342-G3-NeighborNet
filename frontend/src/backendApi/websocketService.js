import '../polyfills'
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }

    connect(userId, onMessageReceived) {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: () => {},
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.connected = true;
                this.stompClient.subscribe(`/user/${userId}/queue/notifications`, 
                    message => {
                        try {
                            const notification = JSON.parse(message.body);
                            onMessageReceived(notification);
                        } catch (error) {
                            console.error('Error processing message:', error);
                        }
                    }
                );
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                this.connected = false;
            },
            onError: (error) => {
                console.error('WebSocket Error:', error);
                this.connected = false;
            }
        });

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.connected = false;
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;