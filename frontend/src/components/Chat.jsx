import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BorrowingAgreementForm from './BorrowingAgreementForm';
import { MdImage, MdClose } from 'react-icons/md';
import ImageGalleryModal from './ImageGalleryModal';


const formatMessageTime = (timestamp) => {
  try {
    if (!timestamp) {
      console.error('No timestamp provided');
      return 'Invalid Time';
    }

    // Convert timestamp to Date object
    let date;
    if (typeof timestamp === 'string') {
      // If timestamp contains timezone info
      if (timestamp.endsWith('Z') || timestamp.includes('+')) {
        date = new Date(timestamp);
      } else {
        // If timestamp is in database format without timezone (assuming UTC)
        // Add 'Z' to make it explicit UTC
        date = new Date(timestamp + 'Z');
      }
    } else if (timestamp instanceof Date) {
      date = timestamp;
    }

    if (!date || isNaN(date.getTime())) {
      console.error('Invalid timestamp format:', timestamp);
      return 'Invalid Time';
    }

    // Convert UTC time to Singapore time
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


const Chat = ({ senderId, receiverId, receiverName, onMessageSent, stompClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const fileInputRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [showItemDetails, setShowItemDetails] = useState(false);


  const handleOpenGallery = (images, startIndex = 0) => {
    setSelectedGalleryImages(images);
    setGalleryStartIndex(startIndex);
    setIsGalleryOpen(true);
  };

  const handleAgreementResponse = async (agreementId, status) => {
    try {
      const response = await fetch(`http://localhost:8080/chat/agreement/${agreementId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update agreement status');
      }
  
      const updatedAgreement = await response.json();
  
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify({
            senderId,
            receiverId,
            messageType: 'FORM',
            content: `Agreement ${status.toLowerCase()}`,
            formData: JSON.stringify(updatedAgreement)
          })
        });
      }
  
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.messageType === 'FORM') {
            const formData = JSON.parse(msg.formData);
            if (formData.id === agreementId) {
              return {
                ...msg,
                formData: JSON.stringify({ ...formData, status })
              };
            }
          }
          return msg;
        })
      );
  
    } catch (error) {
      console.error('Error updating agreement status:', error);
      alert('Failed to update agreement status. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setSelectedImage(file);
  };

  const handleSendImage = async () => {
    if (!selectedImage) return;
  
    const formData = new FormData();
    formData.append('image', selectedImage);
  
    try {
      const response = await fetch('http://localhost:8080/chat/upload-image', {
        method: 'POST',
        body: formData
      });
      const imageUrl = await response.text();
      
      const imageMessage = {
        senderId,
        receiverId,
        messageType: 'IMAGE',
        content: 'Sent an image',
        imageUrl,
        timestamp: new Date().toISOString()
      };
  
      const tempMessage = { ...imageMessage, id: `temp-${Date.now()}` };
      setMessages(prev => [...prev, tempMessage]);
  
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(imageMessage)
        });
      }
  
      onMessageSent(imageMessage);
      setImagePreview(null);
      setSelectedImage(null);
      scrollToBottom();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    setSelectedImage(null);
    fileInputRef.current.value = '';
  };

  const handleSendAgreement = async (formData) => {
    try {
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setUTCHours(12, 0, 0, 0);
        return date.toISOString();
      };
  
      const requestData = {
        ...formData,
        lenderId: receiverId,
        borrowerId: senderId,
        borrowingStart: formatDate(formData.borrowingStart),
        borrowingEnd: formatDate(formData.borrowingEnd)
      };
  
      console.log('Sending agreement data:', requestData);
  
      const response = await fetch('http://localhost:8080/chat/send-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
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
          alert("You already have a pending agreement for this item. Please wait for the lender's response or check your existing agreements.");
        } else {
          alert(`Failed to send agreement: ${responseData}`);
        }
        return;
      }

      const agreementMessage = {
        id: `temp-agreement-${Date.now()}`,
        senderId,
        receiverId,
        messageType: 'FORM',
        content: 'Sent a borrowing agreement',
        formData: JSON.stringify({
          ...responseData,
          itemName: formData.itemName 
        }),
        timestamp: new Date().toISOString()
      };
  
      setMessages(prev => [...prev, agreementMessage]);
      setShowAgreementForm(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending agreement:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (stompClient) {
      const subscription = stompClient.subscribe(`/user/${senderId}/queue/messages`, (message) => {
        const newMessage = JSON.parse(message.body);
        if (newMessage.senderId === receiverId || newMessage.receiverId === receiverId) {
          const processedMessage = {
            ...newMessage,
            timestamp: newMessage.timestamp || new Date().toISOString()
          };
          
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => 
              !msg.id?.startsWith('temp-') || 
              msg.content !== processedMessage.content
            );
  
            const getMessageTypeWeight = (type) => {
              switch (type) {
                case 'FORM': return 3;
                case 'IMAGE': return 2;
                case 'TEXT': return 1;
                default: return 0;
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
      
      // Add message type weights for sorting
      const getMessageTypeWeight = (type) => {
        switch (type) {
          case 'FORM': return 3;
          case 'IMAGE': return 2;
          case 'TEXT': return 1;
          default: return 0;
        }
      };
  

      const sortedData = data.sort((a, b) => {
        const timestampA = new Date(a.timestamp).getTime();
        const timestampB = new Date(b.timestamp).getTime();
        
        if (timestampA === timestampB) {
          return getMessageTypeWeight(a.messageType) - getMessageTypeWeight(b.messageType);
        }
        return timestampA - timestampB;
      });
  
      setMessages(sortedData);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim() && stompClient && stompClient.connected) {
      // Create timestamp in UTC
      const now = new Date();
      const utcTimestamp = now.toISOString().replace('Z', ''); // Remove Z to match DB format
  
      const chatMessage = {
        senderId: senderId,
        receiverId: receiverId,
        content: messageInput.trim(),
        messageType: 'TEXT',
        timestamp: utcTimestamp
      };
  
      const tempMessage = { ...chatMessage, id: `temp-${Date.now()}` };
      setMessages(prev => {
        const newMessages = [...prev, tempMessage].sort((a, b) => 
          new Date(a.timestamp + 'Z').getTime() - new Date(b.timestamp + 'Z').getTime()
        );
        return newMessages;
      });
  
      stompClient.publish({
        destination: '/app/chat',
        body: JSON.stringify(chatMessage)
      });
  
      onMessageSent(chatMessage);
      setMessageInput('');
      scrollToBottom();
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
   <div className="bg-white border-b border-gray-200 p-4">
    <div className="flex items-center justify-between">
      {/* Left side - User info */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 
                      flex items-center justify-center text-white text-lg font-semibold shadow-md
                      border-2 border-white">
            {receiverName.charAt(0).toUpperCase()}
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white"></div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-gray-900">{receiverName}</h3>
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-xs text-green-500">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
              Online
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              Local Time: {new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'Asia/Singapore'
              }).format(new Date())}
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Item info button */}
      <button 
        className="text-gray-400 hover:text-gray-600"
        onClick={() => setShowItemDetails(prev => !prev)} // Add this state
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>

    {/* Expandable item details section */}
    <AnimatePresence>
      {showItemDetails && messages[0]?.item && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <div className="flex space-x-4">
            {/* Item image */}
            <div className="flex-shrink-0">
              <img
                src={messages[0].item.imageUrls?.[0] || 'https://via.placeholder.com/100?text=No+Image'}
                alt={messages[0].item.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>

            {/* Item details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{messages[0].item.name}</h4>
                  <p className="text-sm text-gray-500">{messages[0].item.category}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {messages[0].item.availabilityPeriod}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Available Period</p>
                  <p className="font-medium">
                    {Array.isArray(messages[0].item.availableFrom) ? 
                      new Date(
                        messages[0].item.availableFrom[0], 
                        messages[0].item.availableFrom[1] - 1, 
                        messages[0].item.availableFrom[2]
                      ).toLocaleDateString() : 
                      new Date(messages[0].item.availableFrom).toLocaleDateString()
                    } - {
                      Array.isArray(messages[0].item.availableUntil) ? 
                      new Date(
                        messages[0].item.availableUntil[0], 
                        messages[0].item.availableUntil[1] - 1, 
                        messages[0].item.availableUntil[2]
                      ).toLocaleDateString() : 
                      new Date(messages[0].item.availableUntil).toLocaleDateString()
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Location</p>
                  <p className="font-medium">{messages[0].item.location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact Preference</p>
                  <p className="font-medium">{messages[0].item.contactPreference}</p>
                </div>
                <div>
                  <p className="text-gray-500">Terms</p>
                  <p className="font-medium line-clamp-1">{messages[0].item.terms}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 100% 100%, #e5e7eb 2px, transparent 2px),
            radial-gradient(circle at 0% 100%, #e5e7eb 2px, transparent 2px)
          `,
          backgroundSize: '40px 40px'
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4 flex items-end">
            {/* Receiver's Avatar - Only show for received messages */}
            {msg.senderId !== senderId && (
              <div className="flex-shrink-0 mr-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {receiverName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {/* Message Content */}
            <div className={`flex flex-col ${msg.senderId === senderId ? 'items-end ml-auto' : 'items-start'}`}>
              <div className={`inline-block ${
                msg.senderId === senderId 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-none' 
                  : 'bg-white border border-gray-200 rounded-2xl rounded-bl-none'
              } px-4 py-2 max-w-xs lg:max-w-md shadow-sm hover:shadow-md transition-shadow duration-200`}>
                {msg.messageType === 'IMAGE' ? (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={msg.imageUrl} 
                      alt="Shared" 
                      className="max-w-full h-auto cursor-pointer" 
                      loading="lazy"
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                  </div>
                ) : msg.messageType === 'FORM' ? (
                  (() => {
                    try {
                      const formData = JSON.parse(msg.formData);
                      const isLender = senderId === formData.lenderId;
                      const isBorrower = senderId === formData.borrowerId;
                      const isPending = formData.status === 'PENDING';
                      const canRespond = isPending && isLender && msg.senderId === formData.borrowerId;

                      return (
                        <div className="bg-white/90 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900">📋 Borrowing Agreement</h4>
                          <div className="text-sm mt-2">
                            <div className="mb-2">
                              <p><strong>Item:</strong> {formData.itemName}</p>
                              <p><strong>Period:</strong> {(() => {
                                try {
                                  const formatDateTime = (dateString) => {
                                    const date = new Date(dateString);
                                    if (isNaN(date.getTime())) {
                                      return 'Invalid Date';
                                    }
                                    return date.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    });
                                  };

                                  const start = formatDateTime(formData.borrowingStart);
                                  const end = formatDateTime(formData.borrowingEnd);

                                  return `${start} - ${end}`;
                                } catch (error) {
                                  console.error('Date parsing error:', error);
                                  return 'Invalid Date Range';
                                }
                              })()}</p>
                              <p><strong>Terms:</strong> {formData.terms}</p>
                            </div>
                            <div className={`font-medium ${
                              formData.status === 'PENDING' ? 'text-yellow-600' :
                              formData.status === 'ACCEPTED' ? 'text-green-600' :
                              'text-red-600'
                            }`}>
                              {formData.status === 'PENDING' ? '⏳ Pending Response' :
                              formData.status === 'ACCEPTED' ? '✅ Accepted' :
                              '❌ Rejected'}
                            </div>
                            {canRespond && (
                              <div className="mt-2 flex gap-2">
                                <button
                                  onClick={() => handleAgreementResponse(formData.id, 'ACCEPTED')}
                                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleAgreementResponse(formData.id, 'REJECTED')}
                                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      console.error('Error parsing agreement data:', error);
                      return null;
                    }
                  })()
                ) : msg.messageType === 'TEXT' ? (
                  <div className="flex flex-col gap-2">
                  {msg.item && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 mb-3">
                        {msg.item.imageUrls && msg.item.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                            {/* Main Image */}
                            <div className="col-span-2 h-48 relative rounded-lg overflow-hidden">
                              <img
                                src={msg.item.imageUrls[0]}
                                alt={`${msg.item.name} - Main`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => handleOpenGallery(msg.item.imageUrls, 0)}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                              />
                            </div>
                            
                            {/* Thumbnail Images */}
                            {msg.item.imageUrls.length > 1 && (
                              <div className="grid grid-cols-3 gap-2 col-span-2">
                                {msg.item.imageUrls.slice(1, 4).map((url, index) => (
                                  <div 
                                    key={index} 
                                    className="aspect-square relative rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => handleOpenGallery(msg.item.imageUrls, index + 1)}
                                  >
                                    <img
                                      src={url}
                                      alt={`${msg.item.name} - ${index + 2}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                      }}
                                    />
                                  </div>
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
                          <h4 className="font-medium text-gray-900">{msg.item.name}</h4>
                          <p className="text-sm text-gray-500">{msg.item.category}</p>
                          <p className="text-xs text-gray-400">
                            Available: {Array.isArray(msg.item.availableFrom) ? 
                              new Date(msg.item.availableFrom[0], msg.item.availableFrom[1] - 1, msg.item.availableFrom[2]).toLocaleDateString() : 
                              new Date(msg.item.availableFrom).toLocaleDateString()} - 
                            {Array.isArray(msg.item.availableUntil) ? 
                              new Date(msg.item.availableUntil[0], msg.item.availableUntil[1] - 1, msg.item.availableUntil[2]).toLocaleDateString() : 
                              new Date(msg.item.availableUntil).toLocaleDateString()}
                          </p>
                          {msg.item.description && (
                            <p className="text-sm text-gray-600 mt-2">
                              {msg.item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={msg.item ? "mt-2" : ""}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
              </div>
              <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
              <span>{formatMessageTime(msg.timestamp)}</span>
                {msg.senderId === senderId && (
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>

            {/* Sender's Avatar - Only show for sent messages */}
            {msg.senderId === senderId && (
              <div className="flex-shrink-0 ml-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {'You'}
                </div>
              </div>
            )}
          </div>
        ))}

          {isTyping && (
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0 mr-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {receiverName.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
        <div ref={messagesEndRef} />
      </div>
  
      {/* Image Preview Area */}
      {imagePreview && (
        <div className="border-t border-gray-200 p-4">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-32 rounded-lg"
            />
            <button
              onClick={clearImagePreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
        
      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <div className="flex items-center gap-3">
          {/* Image Upload Button */}
          <div className="relative">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              title="Send Image"
            >
              <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white w-4 h-4 text-xs flex items-center justify-center rounded-full">
                +
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
          </div>
  
          {/* Agreement Form Button */}
          <button
            onClick={() => setShowAgreementForm(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            title="Send Borrowing Agreement"
          >
            <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
  
          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (selectedImage) {
                    handleSendImage();
                  } else {
                    sendMessage();
                  }
                }
              }}
              className="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              placeholder={selectedImage ? "Press Enter to send image..." : "Type a message..."}
            />
          </div>
  
          {/* Send Button */}
          <button
            onClick={selectedImage ? handleSendImage : sendMessage}
            disabled={!messageInput.trim() && !selectedImage}
            className={`p-2 rounded-full transition-colors duration-200
              ${(messageInput.trim() || selectedImage)
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

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
  );
};

export default Chat;