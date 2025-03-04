import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Chat = ({ senderId, receiverId, receiverName, onMessageSent, stompClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (stompClient) {
      const subscription = stompClient.subscribe(`/user/${senderId}/queue/messages`, (message) => {
        const newMessage = JSON.parse(message.body);
        if (newMessage.senderId === receiverId || newMessage.receiverId === receiverId) {
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      });

      fetchMessages();

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [senderId, receiverId, stompClient]);


  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/messages/${senderId}/${receiverId}`
      );
      const data = await response.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && stompClient && stompClient.connected) {
      const chatMessage = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageInput.trim(),
        timestamp: new Date().toISOString()
      };

      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      });

      setMessages(prev => [...prev, chatMessage]);
      
      onMessageSent(chatMessage);
      
      setMessageInput('');
      scrollToBottom();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{receiverName}</h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              message.senderId === senderId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                message.senderId === senderId
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs mt-1 block opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;