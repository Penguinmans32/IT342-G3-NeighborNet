import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { motion, AnimatePresence } from 'framer-motion';
import BorrowingAgreementForm from './BorrowingAgreementForm';

const Chat = ({ senderId, receiverId, receiverName, onMessageSent, stompClient }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const fileInputRef = useRef(null);

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
  
      // Send a message about the status update
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
  
      // Update the messages list to reflect the new status
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
  
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(imageMessage)
        });
      }
  
      setMessages(prev => [...prev, imageMessage]);
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
      const response = await fetch('http://localhost:8080/chat/send-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          lenderId: senderId,
          borrowerId: receiverId
        })
      });
  
      const agreement = await response.json();
      
      const agreementMessage = {
        senderId,
        receiverId,
        messageType: 'FORM',
        content: 'Sent a borrowing agreement',
        formData: JSON.stringify(agreement),
        timestamp: new Date().toISOString()
      };


      setMessages(prev => [...prev, agreementMessage]);
      
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(agreementMessage)
        });
      }
  
      setShowAgreementForm(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending agreement:', error);
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
          setMessages(prev => [...prev, processedMessage]);
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
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`mb-4 ${msg.senderId === senderId ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block ${msg.senderId === senderId ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg px-4 py-2 max-w-xs lg:max-w-md`}>
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
              <div className="bg-white/90 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900">📋 Borrowing Agreement</h4>
                <div className="text-sm mt-2">
                  {(() => {
                    const formData = JSON.parse(msg.formData);
                    const isLender = senderId === formData.lenderId;
                    const isBorrower = senderId === formData.borrowerId;
                    const isPending = formData.status === 'PENDING';
                    const canRespond = (isLender && msg.senderId === formData.borrowerId) || 
                                     (isBorrower && msg.senderId === formData.lenderId);

                    return (
                      <>
                        <div className="mb-2">
                          <p><strong>Item:</strong> {formData.itemName}</p>
                          <p><strong>Period:</strong> {new Date(formData.borrowingStart).toLocaleDateString()} - {new Date(formData.borrowingEnd).toLocaleDateString()}</p>
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
                        {isPending && canRespond && (
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
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <span>{msg.content}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
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
  
      {/* Agreement Form Modal */}
      <AnimatePresence>
      {showAgreementForm && (
        <BorrowingAgreementForm
          onSubmit={handleSendAgreement}
          onClose={() => setShowAgreementForm(false)}
          senderId={senderId}
          receiverId={receiverId}
          stompClient={stompClient} // Add this prop
        />
      )}
      </AnimatePresence>
    </div>
  );
};

export default Chat;