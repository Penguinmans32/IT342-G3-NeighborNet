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
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

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
          id: `new-${Date.now()}`,
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
    if (!user?.id) return; // Add this check

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/conversations/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const processedData = (Array.isArray(data) ? data : []).map(conv => ({
        ...conv,
        id: conv.id || `conv-${conv.participant.id}-${Date.now()}`
      }));

      setConversations(Array.isArray(data) ? data : []); // Ensure it's always an array
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.message);
      setConversations([]); // Set empty array on error
    } finally {
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
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Modern Navigation Bar */}
      <nav className="bg-white shadow-md px-4 py-3 flex items-center justify-between fixed top-0 w-full z-10">
        <button
          onClick={() => navigate('/homepage')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back</span>
        </button>
        <div className="text-lg font-semibold text-gray-800">Messages</div>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </nav>

      <div className="pt-16 h-full">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-xl shadow-lg h-full overflow-hidden border border-gray-100">
            <div className="flex h-full">
              {/* Contacts Sidebar with modern styling */}
              <div className="w-96 border-r border-gray-100 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Search conversations..."
                      className="w-full px-4 py-2 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Contacts List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={`loading-skeleton-${i}`} className="animate-pulse p-4 border-b border-gray-50">
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
                        key={`conversation-${conversation.id || conversation.participant.id}`}
                        onClick={() => handleContactSelect(conversation.participant)}
                        className={`w-full p-4 hover:bg-blue-50 transition-all duration-200
                          ${selectedContact?.id === conversation.participant.id ? 'bg-blue-50' : ''}
                          border-l-4 ${selectedContact?.id === conversation.participant.id ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Enhanced Avatar */}
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold shadow-inner">
                              {conversation.participant.username.charAt(0).toUpperCase()}
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                          </div>
                          
                          {/* Contact Info with better typography */}
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">
                              {conversation.participant.username}
                            </h3>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              {conversation.lastMessage?.includes('📷') ? (
                                <span className="flex items-center space-x-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Photo</span>
                                </span>
                              ) : (
                                conversation.lastMessage || 'Start a conversation'
                              )}
                            </p>
                          </div>

                          {/* Enhanced Unread Indicator */}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area with modern styling */}
              <div className="flex-1 flex flex-col bg-gray-50">
                {selectedContact ? (
                  <Chat
                    senderId={user.id}
                    receiverId={selectedContact.id}
                    receiverName={selectedContact.username}
                    onMessageSent={handleSendMessage}
                    stompClient={stompClient}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center p-8 rounded-2xl bg-white shadow-sm">
                      <div className="h-24 w-24 mx-auto mb-6 text-blue-500">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome to Messages
                      </h3>
                      <p className="text-gray-500 max-w-sm">
                        Select a conversation from the left to start messaging or connect with someone new
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;