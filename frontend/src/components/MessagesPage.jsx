import { useState, useEffect, useRef } from "react"
import { useAuth } from "../backendApi/AuthContext"
import { useNavigate } from "react-router-dom"
import Chat from "./Chat"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { motion } from "framer-motion"
import { useLocation } from "react-router-dom"
import { RefreshCw, Info, Check, XCircle } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { showSimpleNotification } from "./SimpleNotification"

const MessagesPage = () => {
  const location = useLocation();
  const navigate = useNavigate()
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stompClient, setStompClient] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stompReady, setStompReady] = useState(false);
  const hasProcessedReturnRequest = useRef(false);

  const [showInstructions, setShowInstructions] = useState(() => {
    const hasSeenInstructions = localStorage.getItem('neighbornet-messages-tips-seen');
    return hasSeenInstructions !== 'true';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [handledReturnRequests, setHandledReturnRequests] = useState(new Set());

  useEffect(() => {
    if (!showInstructions) {
      localStorage.setItem('neighbornet-messages-tips-seen', 'true');
    }
  }, [showInstructions]);

  const handleShowTipsAgain = () => {
    setShowInstructions(true);
  };

  const handleRefreshPage = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleSendReturnRequest = async (returnRequestData) => {
    if (hasProcessedReturnRequest.current) {
      console.log("Already processed a return request in this session, skipping");
      return;
    }
  
    if (!returnRequestData || !returnRequestData.lenderId) {
      console.error('Invalid return request data:', returnRequestData);
      return;
    }
  
    if (!stompClient?.connected) {
      console.error("WebSocket not connected");
      showSimpleNotification("Connection lost. Please refresh the page.", 'error');
      return;
    }
  
    try {
      console.log("Sending return request message via WebSocket");
      const now = new Date();
      const currentTimestamp = `${now.toISOString().slice(0, 19)}.000`;
  
      const requestData = {
        ...returnRequestData,
        status: "PENDING",
        createdAt: currentTimestamp,
      };
  
      const returnRequestMessage = {
        id: Date.now(),
        senderId: user?.data?.id,
        receiverId: returnRequestData.lenderId,
        messageType: "RETURN_REQUEST",
        content: "Sent a return request",
        formData: JSON.stringify(requestData),
        timestamp: currentTimestamp,
      };
  
      hasProcessedReturnRequest.current = true;
      
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(returnRequestMessage)
      });
  
    } catch (error) {
      console.error("Error sending return request:", error);
      showSimpleNotification("Failed to send return request. Please try again.", 'error');
      hasProcessedReturnRequest.current = false;
    }
  };


  const handleContactSelect = async (contact) => {
    if (!contact) {
      console.error('No contact provided');
      return;
    }
  
    if (!contact.id) {
      console.error('Contact has no ID:', contact);
      return;
    }
  
    if (!user?.data?.id) {
      console.error('No user ID available');
      return;
    }
  
    try {
      setSelectedContact(contact);
  
      const response = await fetch(`https://it342-g3-neighbornet.onrender.com/messages/read/${contact.id}/${user.data.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
  
      if (!response.ok) {
        throw new Error(`Failed to mark messages as read: ${response.status}`);
      }
  
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.participant.id === contact.id) {
            return {
              ...conv,
              unreadCount: 0,
            };
          }
          return conv;
        });
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  useEffect(() => {
    if (stompClient && stompReady) {
      const subscription = stompClient.subscribe(`/user/${user?.data?.id}/queue/messages`, (message) => {
        const newMessage = JSON.parse(message.body);

        if (newMessage.senderId === user.data.id && newMessage.clientId) {
          console.log("Skipping own message with clientId:", newMessage.clientId);
          return;
        }
        
        // Update conversations when receiving a new message
        setConversations(prevConversations => {
          const updatedConversations = [...prevConversations];
          const senderId = newMessage.senderId === user.data.id ? newMessage.receiverId : newMessage.senderId;
          
          const conversationIndex = updatedConversations.findIndex(
            conv => conv.participant.id === senderId
          );
  
          const displayContent = newMessage.messageType === "IMAGE" ? "📷 Image" : 
                               newMessage.messageType === "FORM" ? "📋 Agreement" : 
                               newMessage.content;
  
          if (conversationIndex !== -1) {
            const updatedConversation = {
              ...updatedConversations[conversationIndex],
              lastMessage: displayContent,
              lastMessageTimestamp: newMessage.timestamp,
              unreadCount: newMessage.senderId !== user.data.id 
                ? (updatedConversations[conversationIndex].unreadCount || 0) + 1
                : updatedConversations[conversationIndex].unreadCount
            };
            // Remove the conversation from its current position
            updatedConversations.splice(conversationIndex, 1);
            // Add it to the beginning of the array
            updatedConversations.unshift(updatedConversation);
          } else {
            // Create new conversation if it doesn't exist
            const newConversation = {
              id: `conv-${Date.now()}`,
              participant: {
                id: senderId,
                username: newMessage.senderName || "Unknown User"
              },
              lastMessage: displayContent,
              lastMessageTimestamp: newMessage.timestamp,
              unreadCount: newMessage.senderId !== user.data.id ? 1 : 0
            };
            updatedConversations.unshift(newConversation);
          }
  
          return updatedConversations;
        });
      });
  
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, stompReady, user?.data?.id]);

  useEffect(() => {
    const handleOpenChat = (event) => {
      const { contactId, contactName } = event.detail
      const conversation = conversations.find((conv) => conv.participant.id.toString() === contactId.toString())

      if (conversation) {
        handleContactSelect(conversation.participant)
      }
    }

    window.addEventListener("openChat", handleOpenChat)
    return () => window.removeEventListener("openChat", handleOpenChat)
  }, [conversations])

  useEffect(() => {
    if (user?.data?.id) {
      const socket = new SockJS("https://it342-g3-neighbornet.onrender.com/ws");
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
        console.log("Connected to WebSocket");
        setStompClient(stomp);
        setStompReady(true);
      };
  
      stomp.onStompError = (frame) => {
        console.error('STOMP error:', frame);
      };
  
      console.log("Activating STOMP client...");
      stomp.activate();
  
      return () => {
        if (stomp.connected) {
          console.log("Deactivating STOMP client...");
          stomp.deactivate();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (user?.data?.id) {
      fetchConversations()
    }
  }, [user?.data?.id])

  useEffect(() => {
    return () => {
      hasProcessedReturnRequest.current = false;
    };
  }, []);


  useEffect(() => {
    const initializeChat = async () => {
      if (location.state) {
        const { contactId, contactName, returnRequest, timestamp } = location.state;
        
        const returnRequestKey = returnRequest ? 
          `${returnRequest.itemId}-${returnRequest.agreementId}-${timestamp || Date.now()}` : null;
        
        if (returnRequest && returnRequestKey && !handledReturnRequests.has(returnRequestKey)) {
          console.log('Processing return request with key:', returnRequestKey);
          
          if (!contactId && returnRequest?.lenderId) {
            console.log('Using lenderId from returnRequest as contactId');
            const contact = {
              id: returnRequest.lenderId,
              username: returnRequest.item?.owner?.username || 'Unknown User'
            };
            await handleContactSelect(contact);
            
            if (stompClient?.connected) {
              await handleSendReturnRequest(returnRequest);
              setHandledReturnRequests(prev => new Set(prev).add(returnRequestKey));
            }
            return;
          }
    
          if (contactId && contactName) {
            const contact = {
              id: contactId,
              username: contactName
            };
            await handleContactSelect(contact);
            
            if (returnRequest && stompClient?.connected) {
              await handleSendReturnRequest(returnRequest);
              setHandledReturnRequests(prev => new Set(prev).add(returnRequestKey));
            }
            return;
          }
        } else if (returnRequest && returnRequestKey && handledReturnRequests.has(returnRequestKey)) {
          console.log('Skip already handled return request:', returnRequestKey);
        }
        if (contactId && contactName && !returnRequest) {
          const contact = {
            id: contactId,
            username: contactName
          };
          await handleContactSelect(contact);
          return;
        }
  
        console.log('Insufficient contact information provided');
        navigate('/messages'); 
      }
    };
  
    initializeChat();
  }, [location.state, stompClient?.connected, handledReturnRequests]);

  const handleNewMessage = (message) => {
    setConversations((prevConversations) => {
        const updatedConversations = [...prevConversations]
        const conversationIndex = updatedConversations.findIndex(
            (conv) => conv.participant.id === (message.senderId === user.data.id ? message.receiverId : message.senderId),
        )

        const displayContent = message.messageType === "IMAGE" ? "📷 Image" : 
                             message.messageType === "FORM" ? "📋 Agreement" : 
                             message.content

        if (conversationIndex !== -1) {
            const updatedConversation = {
                ...updatedConversations[conversationIndex],
                lastMessage: displayContent,
                lastMessageTimestamp: message.timestamp, // Make sure to use the message timestamp
                unreadCount:
                    message.senderId !== user.data.id
                        ? updatedConversations[conversationIndex].unreadCount + 1
                        : updatedConversations[conversationIndex].unreadCount,
            }
            updatedConversations.splice(conversationIndex, 1)
            updatedConversations.unshift(updatedConversation)
        } else {
            const newConversation = {
                id: `new-${Date.now()}`,
                participant: {
                    id: message.senderId === user.data.id ? message.receiverId : message.senderId,
                    username: message.senderName,
                },
                lastMessage: displayContent,
                lastMessageTimestamp: message.timestamp, // Make sure to use the message timestamp
                unreadCount: message.senderId !== user.data.id ? 1 : 0,
            }
            updatedConversations.unshift(newConversation)
        }

        return updatedConversations
    })
}

const fetchConversations = async () => {
  if (!user?.data?.id) return

  try {
      setLoading(true)
      const response = await fetch(`https://it342-g3-neighbornet.onrender.com/conversations/${user.data.id}`)

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const processedData = (Array.isArray(data) ? data : []).map((conv) => ({
          ...conv,
          id: conv.id || `conv-${conv.participant.id}-${Date.now()}`,
          lastMessageTimestamp: conv.lastMessageTimestamp || null,
      }))

      console.log("Fetched conversations:", response, processedData)

      setConversations(Array.isArray(data) ? processedData : []) 
  } catch (error) {
      console.error("Error fetching conversations:", error)
      setConversations([])
  } finally {
      setLoading(false)
  }
}

const handleSendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    const now = new Date();
    const timestamp = now.toISOString().substring(0, 23);
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const messageToSend = {
      ...message,
      timestamp: timestamp,
      clientId: clientId
    };

    // Update conversations immediately when sending a message
    setConversations(prevConversations => {
      const updatedConversations = [...prevConversations];
      const conversationIndex = updatedConversations.findIndex(
        conv => conv.participant.id === message.receiverId
      );

      const displayContent = message.messageType === "IMAGE" ? "📷 Image" : 
                           message.messageType === "FORM" ? "📋 Agreement" : 
                           message.content;

      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...updatedConversations[conversationIndex],
          lastMessage: displayContent,
          lastMessageTimestamp: timestamp,
          unreadCount: 0 // Reset unread count for sender's messages
        };
        // Remove the conversation from its current position
        updatedConversations.splice(conversationIndex, 1);
        // Add it to the beginning of the array
        updatedConversations.unshift(updatedConversation);
      }

      return updatedConversations;
    });

    // Send message through WebSocket
    stompClient.publish({
      destination: '/app/chat',
      body: JSON.stringify(messageToSend)
    });
  }
};


  const filteredConversations = conversations.filter((conversation) =>
    conversation.participant.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatMessageTime = (timestamp) => {
    try {
      if (!timestamp) {
        console.error('No timestamp provided');
        return 'Invalid Time';
      }
  
      let date;
      if (typeof timestamp === 'string') {
        if (timestamp.endsWith('Z') || timestamp.includes('+')) {
          date = new Date(timestamp);
        } else {
          date = new Date(timestamp + 'Z');
        }
      } else if (timestamp instanceof Date) {
        date = timestamp;
      }
  
      if (!date || isNaN(date.getTime())) {
        console.error('Invalid timestamp format:', timestamp);
        return 'Invalid Time';
      }
  
      const singaporeTime = new Date(date.getTime());
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Singapore'
      }).format(singaporeTime);
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return 'Invalid Time';
    }
  };

console.log('Conversations:', conversations);

return (
  <div className="h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
    {/* Modern Navigation Bar */}
    <nav className="bg-white shadow-sm px-4 py-3 flex items-center justify-between fixed top-0 w-full z-10 backdrop-blur-md bg-white/90">
      <motion.button
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate("/homepage")}
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back</span>
      </motion.button>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-lg font-semibold text-gray-800"
      >
        Messages
      </motion.div>
      
      {/* Refresh Button */}
      <motion.button
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleRefreshPage}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full"
        disabled={isRefreshing}
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="font-medium text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
      </motion.button>
    </nav>

    <div className="pt-16 h-full">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl h-full overflow-hidden border border-gray-100"
        >
          <div className="flex h-full flex-col md:flex-row">
            {/* Contacts Sidebar with Instructions Banner */}
            <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col bg-white">
              {/* Instructions Banner */}
              <AnimatePresence>
                {showInstructions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 relative overflow-hidden"
                  >
                    <div className="p-4 pr-10">
                      <div className="flex items-start space-x-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Info className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 mb-1">Welcome to NeighborNet Messages!</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            Please click the <span className="font-medium text-emerald-600">Refresh</span> button if you notice any unusual behavior like doubled messages or duplicate chat users.
                          </p>
                          
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                              <Check className="h-3 w-3 text-green-500 mr-1" />
                              <span>Send messages & images</span>
                            </div>
                            <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                              <Check className="h-3 w-3 text-green-500 mr-1" />
                              <span>Create borrowing agreements</span>
                            </div>
                            <div className="flex items-center bg-white/70 px-2 py-1 rounded-full">
                              <Check className="h-3 w-3 text-green-500 mr-1" />
                              <span>Send Return Request</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowInstructions(false)}
                      className="absolute top-2 right-2 rounded-full p-1 hover:bg-white/50 transition-colors"
                      aria-label="Close instructions"
                    >
                      <XCircle className="h-4 w-4 text-gray-500" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all duration-200"
                  />
                  <svg
                    className="w-5 h-5 text-gray-400 absolute right-3 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Enhanced Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={`loading-skeleton-${i}`} className="animate-pulse p-4 border-b border-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
                          </div>
                          <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    ))
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                    <motion.button
                      key={`conversation-${conversation.id || conversation.participant.id}`}
                      onClick={() => handleContactSelect(conversation.participant)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 hover:bg-indigo-50 transition-all duration-200
                        ${selectedContact?.id === conversation.participant.id ? "bg-indigo-50" : ""}
                        border-l-4 ${selectedContact?.id === conversation.participant.id ? "border-indigo-500" : "border-transparent"}`}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-semibold shadow-md">
                            {conversation.participant.username.charAt(0).toUpperCase()}
                          </div>
                          {/* Online Status Indicator */}
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
                        </div>

                        {/* Contact Info with better typography */}
                        <div className="flex-1 text-left">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">{conversation.participant.username}</h3>
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(conversation.lastMessageTimestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate flex items-center mt-1">
                            {conversation.lastMessage?.includes("📷") ? (
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Photo</span>
                              </span>
                            ) : conversation.lastMessage?.includes("📋") ? (
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span>Agreement</span>
                              </span>
                            ) : (
                              conversation.lastMessage || "Start a conversation"
                            )}
                          </p>
                        </div>

                        {/* Enhanced Unread Indicator */}
                        {conversation.unreadCount > 0 && (
                          <span className="bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 p-4">
                    <svg
                      className="w-12 h-12 text-gray-300 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-gray-500 text-center">No conversations found</p>
                  </div>
                )}
              </div>
              
              {/* "Having trouble?" floating panel */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="p-4 bg-white border-t border-gray-100"
              >
                <button
                  onClick={handleRefreshPage}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md hover:shadow-lg group"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:animate-spin'}`} />
                  <span className="font-medium">
                    {isRefreshing ? 'Refreshing App...' : 'Having Issues? Refresh App'}
                  </span>
                </button>
                
                {!showInstructions && (
                  <button 
                    onClick={handleShowTipsAgain}
                    className="mt-2 w-full flex items-center justify-center gap-2 text-gray-500 hover:text-indigo-600 text-sm py-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Show tips again</span>
                  </button>
                )}
              </motion.div>
            </div>

            {/* Chat Area with modern styling */}
            <div className="flex-1 flex flex-col bg-gray-50">
              {selectedContact && stompReady ? (
                <Chat
                  key={selectedContact.id}
                  senderId={user.data.id}
                  receiverId={selectedContact.id}
                  receiverName={selectedContact.username}
                  onMessageSent={handleSendMessage}
                  stompClient={stompClient}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center p-8 rounded-2xl bg-white shadow-sm max-w-md mx-4"
                  >
                    <div className="h-24 w-24 mx-auto mb-6 text-indigo-500">
                      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
                    <p className="text-gray-500 max-w-sm">
                      Select a conversation from the left to start messaging or connect with someone new
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-full font-medium hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                    >
                      Start New Chat or Make a Request Borrow
                    </motion.button>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
)
}

export default MessagesPage

