import '../polyfills'
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map(); // Add this line if missing
    }

    connect(userId, onMessageReceived) { // Fixed typo in method name from 'cconnect'
        if (!userId) {
            console.error('No user ID provided for WebSocket connection');
            return;
        }

        const socket = new SockJS('https://it342-g3-neighbornet.onrender.com/ws');
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket with userId:', userId);
                this.connected = true;
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

        console.log('Activating STOMP client for userId:', userId);
        this.stompClient.activate();
    }

    subscribeToMessages(userId, onMessageReceived) {
        if (!userId) {
            console.error('No user ID provided for subscription');
            return;
        }

        if (this.subscriptions.has(userId)) {
            console.log('Unsubscribing from previous subscription');
            this.subscriptions.get(userId).unsubscribe();
        }

        console.log(`Subscribing to /user/${userId}/queue/messages`);
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

    sendMessage(message) {
        if (!this.stompClient || !this.connected) {
            console.error('WebSocket is not connected');
            return;
        }

        try {
            this.stompClient.publish({
                destination: '/app/chat',
                body: JSON.stringify(message)
            });
            console.log('Message sent:', message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    disconnect() {
        if (this.stompClient) {
            Array.from(this.subscriptions.values()).forEach(subscription => {
                subscription.unsubscribe();
            });
            this.subscriptions.clear();
            this.stompClient.deactivate();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;