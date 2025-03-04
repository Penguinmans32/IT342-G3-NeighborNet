import { useState, useEffect } from 'react';
import { useAuth } from '../backendApi/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const MessagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stompClient, setStompClient] = useState(null);

  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    
    try {
      await fetch(
        `http://localhost:8080/messages/read/${contact.id}/${user.id}`,
        {
          method: 'PUT'
        }
      );

      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.participant.id === contact.id) {
            return {
              ...conv,
              unreadCount: 0
            };
          }
          return conv;
        });
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const socket = new SockJS('http://localhost:8080/ws');
      const stomp = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stomp.onConnect = () => {
        console.log('Connected to WebSocket');
        stomp.subscribe(`/user/${user.id}/queue/messages`, (message) => {
          const newMessage = JSON.parse(message.body);
          handleNewMessage(newMessage);
        });
      };

      stomp.activate();
      setStompClient(stomp);

      return () => {
        if (stomp) {
          stomp.deactivate();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const handleNewMessage = (message) => {
    setConversations(prevConversations => {
      const updatedConversations = [...prevConversations];
      const conversationIndex = updatedConversations.findIndex(conv => 
        conv.participant.id === (message.senderId === user.id ? message.receiverId : message.senderId)
      );
  
      const displayContent = message.messageType === 'IMAGE' 
        ? '📷 Image' 
        : message.messageType === 'FORM' 
          ? '📋 Agreement' 
          : message.content;
  
      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...updatedConversations[conversationIndex],
          lastMessage: displayContent,
          lastMessageTimestamp: message.timestamp,
          unreadCount: message.senderId !== user.id ? 
            (updatedConversations[conversationIndex].unreadCount + 1) : 
            updatedConversations[conversationIndex].unreadCount
        };
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(updatedConversation);
      } else {
        const newConversation = {
          id: Date.now(),
          participant: {
            id: message.senderId === user.id ? message.receiverId : message.senderId,
            username: message.senderName 
          },
          lastMessage: displayContent,
          lastMessageTimestamp: message.timestamp,
          unreadCount: message.senderId !== user.id ? 1 : 0
        };
        updatedConversations.unshift(newConversation);
      }
  
      return updatedConversations;
    });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`http://localhost:8080/conversations/${user.id}`);
      const data = await response.json();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = (message) => {
    if (stompClient && stompClient.connected) {
      handleNewMessage({
        ...message,
        senderName: user.username,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
         <button
        onClick={() => navigate('/homepage')}
        className="fixed top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 shadow-md"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Homepage</span>
      </button>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex h-[calc(100vh-2rem)]">
            {/* Left Sidebar - Contact List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Messages</h2>
              </div>
              
              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse p-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                          <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleContactSelect(conversation.participant)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                                flex items-center space-x-4 ${
                                  selectedContact?.id === conversation.participant.id
                                    ? 'bg-blue-50'
                                    : ''
                                }`}
                    >
                      {/* Contact Avatar */}
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-lg font-medium">
                          {conversation.participant.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Contact Info */}
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-900">
                          {conversation.participant.username}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {/* Unread Message Indicator */}
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedContact ? (
                <Chat
                  senderId={user.id}
                  receiverId={selectedContact.id}
                  receiverName={selectedContact.username}
                  onMessageSent={handleSendMessage}
                  stompClient={stompClient}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto mb-4">
                      <svg
                        className="w-full h-full text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a contact from the left to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;