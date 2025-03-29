import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import BorrowingAgreementForm from "./BorrowingAgreementForm"
import { MdImage } from "react-icons/md"
import ImageGalleryModal from "./ImageGalleryModal"
import { useLocation, useNavigate } from "react-router-dom"

const formatMessageTime = (timestamp) => {
  try {
    if (!timestamp) {
      console.error("No timestamp provided")
      return "Invalid Time"
    }

    let date
    if (typeof timestamp === "string") {
      if (timestamp.endsWith("Z") || timestamp.includes("+")) {
        date = new Date(timestamp)
      } else {
        date = new Date(timestamp + "Z")
      }
    } else if (timestamp instanceof Date) {
      date = timestamp
    }

    if (!date || isNaN(date.getTime())) {
      console.error("Invalid timestamp format:", timestamp)
      return "Invalid Time"
    }

    const singaporeTime = new Date(date.getTime())
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "Asia/Singapore",
    }).format(singaporeTime)
  } catch (error) {
    console.error("Error formatting time:", error, timestamp)
    return "Invalid Time"
  }
}

const Chat = ({ senderId, receiverId, receiverName = '?', onMessageSent, stompClient }) => {
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showAgreementForm, setShowAgreementForm] = useState(false)
  const fileInputRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedGalleryImages, setSelectedGalleryImages] = useState([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryStartIndex, setGalleryStartIndex] = useState(0)
  const [showItemDetails, setShowItemDetails] = useState(false)
  const chatContainerRef = useRef(null)
  const location = useLocation();
  const navigate = useNavigate(); 
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (!senderId || !receiverId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  const handleOpenGallery = (images, startIndex = 0) => {
    setSelectedGalleryImages(images)
    setGalleryStartIndex(startIndex)
    setIsGalleryOpen(true)
  }

  const handleReturnResponse = async (returnRequestId, status) => {
    console.log("Handling return response:", { returnRequestId, status });
  
    if (!returnRequestId) {
      console.error("No return request ID provided");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/api/borrowing/returns/return/${returnRequestId}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          status,
          returnRequestId 
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to update return request status: ${errorText}`);
      }

      const updatedAgreement = await response.json();


      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.messageType === "RETURN_REQUEST") {
            try {
              const returnData = JSON.parse(msg.formData);
              if (returnData.agreementId === returnRequestId) {
                const updatedData = {
                  ...returnData,
                  status: status === "CONFIRMED" ? "RETURNED" : "RETURN_REJECTED"
                };
                return {
                  ...msg,
                  formData: JSON.stringify(updatedData)
                };
              }
            } catch (error) {
              console.error("Error parsing return data:", error);
            }
          }
          return msg;
        })
      );

      await fetchMessages();
  
      console.log("Return request updated successfully");
  
    } catch (error) {
      console.error("Error updating return request status:", error);
      alert("Failed to update return request status. Please try again.");
    }
  };

  const handleSendReturnRequest = async (returnRequestData) => {
    try {
      const now = new Date();
      const currentTimestamp = `${now.toISOString().slice(0, 19)}.000`;
  
      const requestData = {
        ...returnRequestData,
        agreementId: returnRequestData.agreementId,
        status: "PENDING",
        createdAt: currentTimestamp,
      };
      
      const response = await fetch("http://localhost:8080/api/borrowing/returns/send-return-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send return request");
      }
  
      const returnRequestMessage = {
        id: `temp-return-${Date.now()}`,
        senderId,
        receiverId,
        messageType: "RETURN_REQUEST",
        content: "Sent a return request",
        formData: JSON.stringify({
          ...requestData,
          id: requestData.agreementId,
          status: "PENDING"
        }),
        timestamp: currentTimestamp,
      };
  
      setMessages((prev) => [...prev, returnRequestMessage]);
      scrollToBottom();
    } catch (error) {
      console.error("Error sending return request:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const handleReturnRequest = async (returnRequest) => {
      if (!returnRequest || !stompClient?.connected) return;
  
      try {
        await handleSendReturnRequest(returnRequest);
        navigate(location.pathname, { replace: true, state: {} });
      } catch (error) {
        console.error("Error sending return request:", error);
      }
    };
  
    if (location.state?.returnRequest) {
      handleReturnRequest(location.state.returnRequest);
    }
  }, [location.state]);

  const handleAgreementResponse = async (agreementId, status) => {
    try {
      const response = await fetch(`http://localhost:8080/chat/agreement/${agreementId}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update agreement status");
      }
  
      await fetchMessages();
  
    } catch (error) {
      console.error("Error updating agreement status:", error);
      alert("Failed to update agreement status. Please try again.");
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    setSelectedImage(file)
  }

  const handleSendImage = async () => {
    if (!selectedImage) return

    const formData = new FormData()
    formData.append("image", selectedImage)

    try {
      const response = await fetch("http://localhost:8080/chat/upload-image", {
        method: "POST",
        body: formData,
      })
      const imageUrl = await response.text()

      const imageMessage = {
        senderId,
        receiverId,
        messageType: "IMAGE",
        content: "Sent an image",
        imageUrl,
        timestamp: new Date().toISOString(),
      }

      const tempMessage = { ...imageMessage, id: `temp-${Date.now()}` }
      setMessages((prev) => [...prev, tempMessage])

      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: "/app/chat",
          body: JSON.stringify(imageMessage),
        })
      }

      onMessageSent(imageMessage)
      setImagePreview(null)
      setSelectedImage(null)
      scrollToBottom()
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const clearImagePreview = () => {
    setImagePreview(null)
    setSelectedImage(null)
    fileInputRef.current.value = ""
  }

  const handleSendAgreement = async (formData) => {
    try {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            date.setUTCHours(12, 0, 0, 0);
            return `${date.toISOString().slice(0, 19)}.000`;
        }

        const now = new Date();
        const currentTimestamp = `${now.toISOString().slice(0, 19)}.000`;

        const requestData = {
            ...formData,
            lenderId: receiverId,
            borrowerId: senderId,
            borrowingStart: formatDate(formData.borrowingStart),
            borrowingEnd: formatDate(formData.borrowingEnd),
            createdAt: currentTimestamp,
        };

        console.log("Sending agreement data:", requestData);

        const response = await fetch("http://localhost:8080/chat/send-agreement", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(requestData),
        });

        const responseText = await response.text();
        let responseData;

        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }

        if (!response.ok) {
            if (responseData === "A pending agreement already exists for this item") {
                alert(
                    "You already have a pending agreement for this item. Please wait for the lender's response or check your existing agreements."
                );
            } else {
                alert(`Failed to send agreement: ${responseData}`);
            }
            return;
        }

        const agreementMessage = {
            id: `temp-agreement-${Date.now()}`,
            senderId,
            receiverId,
            messageType: "FORM",
            content: "Sent a borrowing agreement",
            formData: JSON.stringify({
                ...responseData,
                itemName: formData.itemName,
            }),
            timestamp: currentTimestamp 
        };

        setMessages((prev) => [...prev, agreementMessage]);
        setShowAgreementForm(false);
        scrollToBottom();
    } catch (error) {
        console.error("Error sending agreement:", error);
        alert("An unexpected error occurred. Please try again.");
    }
};

  useEffect(() => {
    let subscription;

    const setupWebSocketConnection = async () => {
      if (!stompClient) {
        console.log("No STOMP client available");
        return;
      }

      try {
        // Wait for client to be fully connected
        while (!stompClient.connected) {
          console.log("Waiting for STOMP connection...");
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log("STOMP client connected, setting up subscription...");
        
        subscription = stompClient.subscribe(`/user/${senderId}/queue/messages`, (message) => {
          const newMessage = JSON.parse(message.body);
          console.log("Received websocket message:", newMessage);

          // Handle Agreement Updates
          if (newMessage.messageType === "AGREEMENT_UPDATE") {
            const updatedAgreement = JSON.parse(newMessage.formData);
            console.log("Received AGREEMENT_UPDATE:", updatedAgreement);
            
            if (updatedAgreement.status === "ACCEPTED") {
              console.log("Agreement update received:", JSON.parse(newMessage.formData));
              setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                  if (msg.messageType === "FORM") {
                    try {
                      const formData = JSON.parse(msg.formData);
                      if (formData.itemId === updatedAgreement.itemId && 
                          formData.id !== updatedAgreement.id && 
                          formData.status === "PENDING") {
                        return {
                          ...msg,
                          formData: JSON.stringify({
                            ...formData,
                            status: "REJECTED",
                            rejectionReason: "Another request has been accepted for this item"
                          })
                        };
                      }
                      else if (formData.id === updatedAgreement.id) {
                        return {
                          ...msg,
                          formData: JSON.stringify(updatedAgreement)
                        };
                      }
                    } catch (error) {
                      console.error("Error parsing form data:", error);
                    }
                  }
                  return msg;
                })
              );
            } else {
              setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                  if (msg.messageType === "FORM") {
                    try {
                      const formData = JSON.parse(msg.formData);
                      if (formData.id === updatedAgreement.id) {
                        return {
                          ...msg,
                          formData: JSON.stringify(updatedAgreement)
                        };
                      }
                    } catch (error) {
                      console.error("Error parsing form data:", error);
                    }
                  }
                  return msg;
                })
              );
            }
            return;
          }

          if (newMessage.senderId === receiverId || newMessage.receiverId === receiverId) {
            const processedMessage = {
              ...newMessage,
              timestamp: newMessage.timestamp || new Date().toISOString(),
            };
          
            setMessages((prev) => {
              // Check if message already exists (either by ID or content for temp messages)
              const messageExists = prev.some(msg => {
                // If message has an ID and it matches
                if (msg.id && processedMessage.id && msg.id.toString() === processedMessage.id.toString()) {
                  return true;
                }
                
                // For temp messages, check content and timestamp
                if (msg.id?.toString().startsWith('temp-') && 
                    msg.content === processedMessage.content &&
                    Math.abs(new Date(msg.timestamp) - new Date(processedMessage.timestamp)) < 1000) {
                  return true;
                }
                
                return false;
              });
          
              // If message already exists, don't add it again
              if (messageExists) {
                return prev;
              }
          
              const filteredMessages = prev.filter((msg) => {
                if (!msg.id) return true;
                
                const msgId = msg.id.toString();
                
                const isTempMessage = typeof msgId === 'string' && msgId.startsWith('temp-');
          
                return !(isTempMessage && msg.content === processedMessage.content);
              });
          
              const getMessageTypeWeight = (type) => {
                switch (type) {
                  case "FORM":
                    return 3;
                  case "IMAGE":
                    return 2;
                  case "TEXT":
                    return 1;
                  default:
                    return 0;
                }
              };
          
              const updatedMessages = [...filteredMessages, processedMessage].sort((a, b) => {
                const timestampA = new Date(a.timestamp).getTime();
                const timestampB = new Date(b.timestamp).getTime();
          
                if (timestampA === timestampB) {
                  return getMessageTypeWeight(a.messageType) - getMessageTypeWeight(b.messageType);
                }
                return timestampA - timestampB;
              });
          
              return updatedMessages;
            });          
          
            scrollToBottom();
          }
        });

        console.log("Subscription set up, fetching messages...");
        await fetchMessages();
        console.log("Initial messages fetched");

      } catch (error) {
        console.error("Error in WebSocket setup:", error);
      }
    };
    setupWebSocketConnection();

    return () => {
      if (subscription) {
        try {
          console.log("Cleaning up subscription...");
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing:", error);
        }
      }
    };
  }, [senderId, receiverId, stompClient]);

  const fetchMessages = async () => {
    if (!senderId || !receiverId) {
      console.error('Missing senderId or receiverId');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/messages/${senderId}/${receiverId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        return;
      }
  
      setMessages((prev) => {
        const allMessages = [...prev, ...data];
        const uniqueMessages = allMessages.filter((message, index, self) => {
          return index === self.findIndex((m) => {
            if (m.id && message.id) {
              return m.id.toString() === message.id.toString();
            }
            return m.content === message.content && 
                   m.timestamp === message.timestamp &&
                   m.senderId === message.senderId;
          });
        });
  
        return uniqueMessages.sort((a, b) => {
          const timestampA = new Date(a.timestamp).getTime();
          const timestampB = new Date(b.timestamp).getTime();
  
          if (timestampA === timestampB) {
            return getMessageTypeWeight(a.messageType) - getMessageTypeWeight(b.messageType);
          }
          return timestampA - timestampB;
        });
      });
  
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && stompClient && stompClient.connected) {
      const now = new Date()
      const timestamp = now.toISOString().slice(0, 23) 
  
      const chatMessage = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageInput.trim(),
        messageType: "TEXT",
        timestamp: timestamp,
      }
  
      try {
        const tempMessage = { 
          ...chatMessage, 
          id: `temp-${Date.now().toString()}` 
        }
        
        stompClient.publish({
          destination: "/app/chat",
          body: JSON.stringify(chatMessage),
        })
  
        setMessages((prev) => [...prev, tempMessage])
        setMessageInput("")
        scrollToBottom()
      } catch (error) {
        console.error("Error sending message:", error)
        alert("Failed to send message. Please try again.")
      }
    }
}

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  )

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {}

    messages.forEach((message) => {
      const date = new Date(message.timestamp)
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(message)
    })

    return groups
  }

  const messageGroups = groupMessagesByDate()

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
      {/* Enhanced Chat Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white border-b border-gray-200 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          {/* Left side - User info */}
          <div className="flex items-center space-x-4">
            <div className="relative">
            <div
                className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center text-white text-lg font-semibold shadow-md
                          border-2 border-white"
              >
                {receiverName ? receiverName.charAt(0).toUpperCase() : '?'}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"
              ></motion.div>
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900">{receiverName}</h3>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs text-green-500">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"
                  ></motion.div>
                  Online
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">
                  Local Time:{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                    timeZone: "Asia/Singapore",
                  }).format(new Date())}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Item info button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full ${showItemDetails ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"} transition-all duration-200`}
            onClick={() => setShowItemDetails((prev) => !prev)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.button>
        </div>

        {/* Expandable item details section */}
        <AnimatePresence>
          {showItemDetails && messages[0]?.item && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:space-x-4">
                {/* Item image */}
                <div className="flex-shrink-0 mb-4 md:mb-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden shadow-md cursor-pointer"
                    onClick={() =>
                      messages[0].item.imageUrls?.length > 0 && handleOpenGallery(messages[0].item.imageUrls, 0)
                    }
                  >
                    <img
                      src={messages[0].item.imageUrls?.[0] || "https://via.placeholder.com/100?text=No+Image"}
                      alt={messages[0].item.name}
                      className="w-full h-full object-cover"
                    />
                    {messages[0].item.imageUrls?.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-lg">
                        +{messages[0].item.imageUrls.length - 1}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Item details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{messages[0].item.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                          {messages[0].item.category}
                        </span>
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                          {messages[0].item.availabilityPeriod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/60 p-2 rounded-lg">
                      <p className="text-gray-500 text-xs">Available Period</p>
                      <p className="font-medium text-gray-800">
                        {Array.isArray(messages[0].item.availableFrom)
                          ? new Date(
                              messages[0].item.availableFrom[0],
                              messages[0].item.availableFrom[1] - 1,
                              messages[0].item.availableFrom[2],
                            ).toLocaleDateString()
                          : new Date(messages[0].item.availableFrom).toLocaleDateString()}{" "}
                        -{" "}
                        {Array.isArray(messages[0].item.availableUntil)
                          ? new Date(
                              messages[0].item.availableUntil[0],
                              messages[0].item.availableUntil[1] - 1,
                              messages[0].item.availableUntil[2],
                            ).toLocaleDateString()
                          : new Date(messages[0].item.availableUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <p className="text-gray-500 text-xs">Location</p>
                      <p className="font-medium text-gray-800">{messages[0].item.location}</p>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <p className="text-gray-500 text-xs">Contact Preference</p>
                      <p className="font-medium text-gray-800">{messages[0].item.contactPreference}</p>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <p className="text-gray-500 text-xs">Terms</p>
                      <p className="font-medium text-gray-800 line-clamp-1">{messages[0].item.terms}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-indigo-50/30 to-purple-50/30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 100%, #e5e7eb 1px, transparent 1px),
            radial-gradient(circle at 0% 100%, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      >
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                {date}
              </div>
            </div>

            {msgs.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 flex items-end"
              >
                {/* Receiver's Avatar - Only show for received messages */}
                {msg.senderId !== senderId && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {receiverName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${msg.senderId === senderId ? "items-end ml-auto" : "items-start"}`}>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={`inline-block ${
                      msg.senderId === senderId
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-none shadow-md"
                        : "bg-white border border-gray-200 rounded-2xl rounded-bl-none shadow-sm"
                    } px-4 py-2 max-w-xs lg:max-w-md hover:shadow-lg transition-all duration-200`}
                  >
                    {msg.messageType === "IMAGE" ? (
                      <div className="rounded-lg overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.02 }}
                          src={msg.imageUrl}
                          alt="Shared"
                          className="max-w-full h-auto cursor-pointer rounded-lg"
                          loading="lazy"
                          onClick={() => handleOpenGallery([msg.imageUrl], 0)}
                        />
                      </div>
                    ) : msg.messageType === "FORM" ? (
                      (() => {
                        try {
                          const formData = JSON.parse(msg.formData)
                          console.log("Rendering agreement:", formData);
                          const isLender = senderId === formData.lenderId
                          const isBorrower = senderId === formData.borrowerId
                          const isPending = formData.status === "PENDING"
                          const isOverlappingWithAccepted = messages.some(otherMsg => {
                            if (otherMsg.messageType === "FORM") {
                              try {
                                const otherFormData = JSON.parse(otherMsg.formData);
                                return (
                                  otherFormData.itemId === formData.itemId &&
                                  otherFormData.status === "ACCEPTED" &&
                                  otherFormData.id !== formData.id
                                );
                              } catch (error) {
                                return false;
                              }
                            }
                            return false;
                          });
                          
                          const canRespond = isPending && 
                            isLender && 
                            msg.senderId === formData.borrowerId && 
                            formData.status === "PENDING" &&
                            !isOverlappingWithAccepted;

                            console.log("Agreement Data:", {
                              formData,
                              itemId: formData.itemId,
                              status: formData.status,
                              agreementId: formData.id
                          });

                          return (
                            <div
                              className={`${msg.senderId === senderId ? "bg-white/20" : "bg-white/90"} p-4 rounded-lg`}
                            >
                              <h4
                                className={`font-semibold ${msg.senderId === senderId ? "text-white" : "text-gray-900"}`}
                              >
                                <span className="mr-2">📋</span> Borrowing Agreement
                              </h4>
                              <div
                                className={`text-sm mt-2 ${msg.senderId === senderId ? "text-white/90" : "text-gray-700"}`}
                              >
                                <div className="mb-2">
                                  <p>
                                    <strong>Item:</strong> {formData.itemName}
                                  </p>
                                  <p>
                                    <strong>Period:</strong> {(() => {
                                      try {
                                        const formatDateTime = (dateString) => {
                                          const date = new Date(dateString)
                                          if (isNaN(date.getTime())) {
                                            return "Invalid Date"
                                          }
                                          return date.toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        }

                                        const start = formatDateTime(formData.borrowingStart)
                                        const end = formatDateTime(formData.borrowingEnd)

                                        return `${start} - ${end}`
                                      } catch (error) {
                                        console.error("Date parsing error:", error)
                                        return "Invalid Date Range"
                                      }
                                    })()}
                                  </p>
                                  <p>
                                    <strong>Terms:</strong> {formData.terms}
                                  </p>
                                </div>
                                <div
                                  className={`font-medium ${
                                    formData.status === "PENDING"
                                      ? msg.senderId === senderId
                                        ? "text-yellow-200"
                                        : "text-yellow-600"
                                      : formData.status === "ACCEPTED"
                                        ? msg.senderId === senderId
                                          ? "text-green-200"
                                          : "text-green-600"
                                        : msg.senderId === senderId
                                          ? "text-red-200"
                                          : "text-red-600"
                                  }`}
                                >
                                  {formData.status === "PENDING"
                                    ? "⏳ Pending Response"
                                    : formData.status === "ACCEPTED"
                                      ? "✅ Accepted"
                                      : "❌ Rejected"}
                                </div>
                                {(() => {
                                        // First, check if ANY agreement for this item has been accepted
                                        const hasAcceptedAgreement = messages.some(otherMsg => {
                                            if (otherMsg.messageType === "FORM") {
                                                try {
                                                    const otherFormData = JSON.parse(otherMsg.formData);
                                                    return otherFormData.itemId === formData.itemId && 
                                                          otherFormData.status === "ACCEPTED";
                                                } catch (error) {
                                                    return false;
                                                }
                                            }
                                            return false;
                                        });

                                        if (formData.status === "ACCEPTED") {
                                            return (
                                                <div className="mt-3 text-sm text-green-500">
                                                    This request has been accepted.
                                                </div>
                                            );
                                        }
                                        
                                        if (hasAcceptedAgreement) {
                                            // If ANY agreement for this item has been accepted, show this message
                                            // regardless of the current agreement's status or user role
                                            return (
                                                <div className="mt-3 text-sm text-red-500">
                                                    Another request has been accepted for this item.
                                                </div>
                                            );
                                        }

                                        if (formData.status === "REJECTED") {
                                            return (
                                                <div className="mt-3 text-sm text-red-500">
                                                    {formData.rejectionReason || "This request has been rejected."}
                                                </div>
                                            );
                                        }
                                        if (isLender && formData.status === "PENDING") {
                                            return (
                                                <div className="mt-3 flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleAgreementResponse(formData.id, "ACCEPTED")}
                                                        className="px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 text-sm font-medium shadow-sm transition-all duration-200"
                                                    >
                                                        Accept
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleAgreementResponse(formData.id, "REJECTED")}
                                                        className="px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm font-medium shadow-sm transition-all duration-200"
                                                    >
                                                        Reject
                                                    </motion.button>
                                                </div>
                                            );
                                        }

                                        // For borrowers with pending agreements or any other case
                                        return (
                                            <div className="mt-3 text-sm text-yellow-200">
                                                Awaiting response...
                                            </div>
                                        );
                                    })()}
                              </div>
                            </div>
                          )
                        } catch (error) {
                          console.error("Error parsing agreement data:", error)
                          return null
                        }
                      })()
                    ) : msg.messageType === "RETURN_REQUEST" ? (
                      // Return Request handling
                      (() => {
                        try {
                          const returnData = JSON.parse(msg.formData);
                          const isOwner = senderId === returnData.lenderId;
                          const isBorrower = senderId === returnData.borrowerId;
                          const isPending = returnData.status === "RETURN_PENDING" || returnData.status === "PENDING";
                    
                          return (
                            <div className={`${msg.senderId === senderId ? "bg-white/20" : "bg-white/90"} p-4 rounded-lg`}>
                              <h4 className={`font-semibold ${msg.senderId === senderId ? "text-white" : "text-gray-900"}`}>
                                <span className="mr-2">🔄</span> Return Request
                              </h4>
                              <div className={`text-sm mt-2 ${msg.senderId === senderId ? "text-white/90" : "text-gray-700"}`}>
                                <div className="mb-2">
                                  <p>
                                    <strong>Item:</strong> {returnData.itemName}
                                  </p>
                                  <p>
                                    <strong>Borrowing Period:</strong>{" "}
                                    {new Date(returnData.borrowingStart).toLocaleDateString()} -{" "}
                                    {new Date(returnData.borrowingEnd).toLocaleDateString()}
                                  </p>
                                  {returnData.returnNote && (
                                    <p>
                                      <strong>Return Note:</strong> {returnData.returnNote}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`font-medium ${
                                    returnData.status === "PENDING" || returnData.status === "RETURN_PENDING"
                                      ? msg.senderId === senderId
                                        ? "text-yellow-200"
                                        : "text-yellow-600"
                                      : returnData.status === "RETURNED"
                                      ? msg.senderId === senderId
                                        ? "text-green-200"
                                        : "text-green-600"
                                      : msg.senderId === senderId
                                      ? "text-red-200"
                                      : "text-red-600"
                                  }`}
                                >
                                  {returnData.status === "RETURN_PENDING" || returnData.status === "PENDING"
                                    ? "⏳ Pending Confirmation"
                                    : returnData.status === "RETURNED"
                                    ? "✅ Return Confirmed"
                                    : "❌ Return Rejected"}
                                </div>
                    
                                {isPending && isOwner && (
                                  <div className="mt-3 flex gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        // Make sure we have the agreement ID from the return data
                                        if (returnData && returnData.agreementId) {
                                          handleReturnResponse(returnData.agreementId, "CONFIRMED");
                                        } else {
                                          console.error("No agreement ID found in return data");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 text-sm font-medium shadow-sm transition-all duration-200"
                                    >
                                      Confirm Return
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => {
                                        if (returnData && returnData.agreementId) {
                                          handleReturnResponse(returnData.agreementId, "REJECTED");
                                        } else {
                                          console.error("No agreement ID found in return data");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm font-medium shadow-sm transition-all duration-200"
                                    >
                                      Reject
                                    </motion.button>
                                  </div>
                                )}
                    
                                {returnData.status === "RETURNED" && (
                                  <div className="mt-3 text-sm text-green-500">Return has been confirmed.</div>
                                )}
                                {(returnData.status === "RETURN_REJECTED" || returnData.status === "REJECTED") && (
                                  <div className="mt-3 text-sm text-red-500">
                                    {returnData.rejectionReason || "Return request has been rejected."}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch (error) {
                          console.error("Error parsing return request data:", error);
                          return null;
                        }
                      })()
                    ) : msg.messageType === "TEXT" ? (
                      <div className="flex flex-col gap-2">
                        {msg.item && (
                          <div
                            className={`${msg.senderId === senderId ? "bg-white/20" : "bg-gray-50"} rounded-lg p-3 ${msg.senderId === senderId ? "" : "border border-gray-200"}`}
                          >
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 mb-3 rounded-lg">
                              {msg.item.imageUrls && msg.item.imageUrls.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                                  {/* Main Image */}
                                  <div className="col-span-2 h-48 relative rounded-lg overflow-hidden">
                                    <motion.img
                                      whileHover={{ scale: 1.03 }}
                                      transition={{ duration: 0.2 }}
                                      src={msg.item.imageUrls[0]}
                                      alt={`${msg.item.name} - Main`}
                                      className="w-full h-full object-cover cursor-pointer"
                                      onClick={() => handleOpenGallery(msg.item.imageUrls, 0)}
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = "https://via.placeholder.com/400x300?text=No+Image"
                                      }}
                                    />
                                  </div>

                                  {/* Thumbnail Images */}
                                  {msg.item.imageUrls.length > 1 && (
                                    <div className="grid grid-cols-3 gap-2 col-span-2">
                                      {msg.item.imageUrls.slice(1, 4).map((url, index) => (
                                        <motion.div
                                          key={index}
                                          whileHover={{ scale: 1.05 }}
                                          className="aspect-square relative rounded-lg overflow-hidden cursor-pointer shadow-sm"
                                          onClick={() => handleOpenGallery(msg.item.imageUrls, index + 1)}
                                        >
                                          <img
                                            src={url || "/placeholder.svg"}
                                            alt={`${msg.item.name} - ${index + 2}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null
                                              e.target.src = "https://via.placeholder.com/150?text=No+Image"
                                            }}
                                          />
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full p-4">
                                  <MdImage className="text-4xl text-gray-400 mb-2" />
                                  <p className="text-gray-500 text-sm text-center">No images available</p>
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className="flex justify-between items-start">
                              <div>
                                <h4
                                  className={`font-medium ${msg.senderId === senderId ? "text-white" : "text-gray-900"}`}
                                >
                                  {msg.item.name}
                                </h4>
                                <p
                                  className={`text-sm ${msg.senderId === senderId ? "text-white/80" : "text-gray-500"}`}
                                >
                                  {msg.item.category}
                                </p>
                                <p
                                  className={`text-xs ${msg.senderId === senderId ? "text-white/70" : "text-gray-400"}`}
                                >
                                  Available:{" "}
                                  {Array.isArray(msg.item.availableFrom)
                                    ? new Date(
                                        msg.item.availableFrom[0],
                                        msg.item.availableFrom[1] - 1,
                                        msg.item.availableFrom[2],
                                      ).toLocaleDateString()
                                    : new Date(msg.item.availableFrom).toLocaleDateString()}{" "}
                                  -
                                  {Array.isArray(msg.item.availableUntil)
                                    ? new Date(
                                        msg.item.availableUntil[0],
                                        msg.item.availableUntil[1] - 1,
                                        msg.item.availableUntil[2],
                                      ).toLocaleDateString()
                                    : new Date(msg.item.availableUntil).toLocaleDateString()}
                                </p>
                                {msg.item.description && (
                                  <p
                                    className={`text-sm ${msg.senderId === senderId ? "text-white/90" : "text-gray-600"} mt-2`}
                                  >
                                    {msg.item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className={msg.item ? "mt-2" : ""}>{msg.content}</div>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </motion.div>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {msg.senderId === senderId && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        className="w-4 h-4 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </div>
                </div>

                {/* Sender's Avatar - Only show for sent messages */}
                {msg.senderId === senderId && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {"You"}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                {receiverName.charAt(0).toUpperCase()}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm"
            >
              <TypingIndicator />
            </motion.div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Area */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 p-4 bg-white/80 backdrop-blur-sm"
          >
            <div className="relative inline-block">
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={imagePreview}
                alt="Preview"
                className="max-h-32 rounded-lg shadow-md"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearImagePreview}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-md"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="border-t p-4 bg-white shadow-md"
      >
        <div className="flex items-center gap-3">
          {/* Image Upload Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors duration-200 shadow-sm"
              title="Send Image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-1 -right-1 bg-indigo-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-full shadow-sm"
              >
                +
              </motion.span>
            </motion.button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          </div>

          {/* Agreement Form Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAgreementForm(true)}
            className="p-2.5 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-full transition-colors duration-200 shadow-sm"
            title="Send Borrowing Agreement"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </motion.button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (selectedImage) {
                    handleSendImage()
                  } else {
                    sendMessage()
                  }
                }
              }}
              className="w-full border border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-12 shadow-sm transition-all duration-200"
              placeholder={selectedImage ? "Press Enter to send image..." : "Type a message..."}
            />
            {messageInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-14 top-1/2 transform -translate-y-1/2 text-xs text-gray-400"
              >
                Press Enter to send
              </motion.div>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={selectedImage ? handleSendImage : sendMessage}
            disabled={!messageInput.trim() && !selectedImage}
            className={`p-3 rounded-full transition-all duration-200 shadow-md
              ${
                messageInput.trim() || selectedImage
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isGalleryOpen && (
          <ImageGalleryModal
            images={selectedGalleryImages}
            isOpen={isGalleryOpen}
            onClose={() => setIsGalleryOpen(false)}
            currentIndex={galleryStartIndex}
          />
        )}
      </AnimatePresence>

      {/* Agreement Form Modal */}
      <AnimatePresence>
        {showAgreementForm && (
          <BorrowingAgreementForm
            onSubmit={handleSendAgreement}
            onClose={() => setShowAgreementForm(false)}
            senderId={senderId}
            receiverId={receiverId}
            stompClient={stompClient}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Chat

