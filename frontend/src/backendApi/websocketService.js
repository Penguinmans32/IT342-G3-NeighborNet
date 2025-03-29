import '../polyfills'
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
    }

    cconnect(userId, onMessageReceived) {
        const socket = new SockJS('http://localhost:8080/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                this.connected = true;
                // Subscribe to messages
                this.subscribeToMessages(userId, onMessageReceived);
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket');
                this.connected = false;
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        this.stompClient.activate();
    }

    subscribeToMessages(userId, onMessageReceived) {
        if (this.subscriptions.has(userId)) {
            this.subscriptions.get(userId).unsubscribe();
        }

        const subscription = this.stompClient.subscribe(
            `/user/${userId}/queue/messages`,
            message => {
                try {
                    const parsedMessage = JSON.parse(message.body);
                    console.log('Received message:', parsedMessage);
                    onMessageReceived(parsedMessage);
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            }
        );

        this.subscriptions.set(userId, subscription);
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