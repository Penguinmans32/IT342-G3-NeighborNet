// Borrowing.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../backendApi/AuthContext';
import Footer from './SplashScreen/Footer';
import { MdClose, MdImage } from 'react-icons/md';
import { MdStarBorder, MdStarHalf } from 'react-icons/md';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  MdAdd,
  MdSearch,
  MdFilterList,
  MdLocationOn,
  MdAccessTime,
  MdPerson,
  MdStar,
  MdCategory,
  MdCalendarToday,
  MdHandshake
} from 'react-icons/md';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const MessageModal = ({ isOpen, onClose, onSend, ownerName }) => {
  const [messageType, setMessageType] = useState('custom');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const predefinedMessages = [
    { id: 'interest', text: `Hi! I'm interested in borrowing your item.` },
    { id: 'availability', text: 'Is this item still available?' },
    { id: 'details', text: 'Could you provide more details about this item?' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const messageToSend = messageType === 'custom' ? 
      customMessage : 
      predefinedMessages.find(m => m.id === messageType)?.text;
    
    if (messageToSend) {
      setIsSending(true);
      try {
        await onSend(messageToSend);
        onClose();
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">
          Message to {ownerName}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Type Selection */}
          <div className="space-y-3">
            {predefinedMessages.map((message) => (
              <label key={message.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="messageType"
                  value={message.id}
                  checked={messageType === message.id}
                  onChange={(e) => {
                    setMessageType(e.target.value);
                    setCustomMessage('');
                  }}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">{message.text}</span>
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="messageType"
                value="custom"
                checked={messageType === 'custom'}
                onChange={(e) => setMessageType(e.target.value)}
                className="text-blue-500 focus:ring-blue-500"
              />
              <span className="text-gray-700">Custom message</span>
            </label>
          </div>

          {/* Custom Message Input */}
          {messageType === 'custom' && (
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
              required
            />
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg 
                       hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg 
                        hover:bg-blue-600 transition-colors ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const StarRating = ({ rating, onRate, readonly = false, isOwner = false, size = "text-xl" }) => {
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    if (!readonly && !isOwner && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const value = star;
        const filled = hover || rating;

        return (
          <button
            key={star}
            className={`${size} ${isOwner ? 'cursor-not-allowed' : 'cursor-pointer'} 
                       text-yellow-400 transition-colors`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => !isOwner && setHover(value)}
            onMouseLeave={() => !isOwner && setHover(0)}
            disabled={isOwner}
            title={isOwner ? "You can't rate your own item" : ""}
          >
            {filled >= star ? (
              <MdStar />
            ) : filled >= star - 0.5 ? (
              <MdStarHalf />
            ) : (
              <MdStarBorder />
            )}
          </button>
        );
      })}
    </div>
  );
};


const ImageGalleryModal = ({ images = [], isOpen, onClose, currentIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
          break;
        case 'ArrowRight':
          setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen) return null;

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-white rounded-full shadow-lg
                    hover:bg-gray-100 transition-colors"
        >
          <MdClose className="text-2xl text-gray-700" />
        </button>

        {/* Navigation arrows */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={handlePrevious}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-r-xl transition-colors
                     text-white transform -translate-x-2 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={handleNext}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-l-xl transition-colors
                     text-white transform translate-x-2 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Main image */}
        <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
          <img
            src={images[activeIndex]}
            alt={`Gallery item ${activeIndex + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
            }}
          />
          
          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                        bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 justify-center overflow-x-auto py-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0
                          ${index === activeIndex ? 'border-blue-500 scale-110' : 'border-transparent'}`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Borrowing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [itemRatings, setItemRatings] = useState({});
  const [ratingLoading, setRatingLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });
  const [availableCategories, setAvailableCategories] = useState([]);

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    ownerId: null,
    ownerName: '',
  });

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
        setStompClient(stomp);
      };

      stomp.activate();

      return () => {
        if (stomp) {
          stomp.deactivate();
        }
      };
    }
  }, [user]);

  

  const handleRateItem = async (itemId, rating, isOwner) => {
    // Prevent rating if the user is the owner
    if (isOwner) {
      console.log("You can't rate your own item");
      return;
    }
  
    try {
      setRatingLoading(prev => ({ ...prev, [itemId]: true }));
      const response = await axios.post(
        `http://localhost:8080/api/borrowing/items/${itemId}/rate`,
        { rating },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setItemRatings(prev => ({
        ...prev,
        [itemId]: rating
      }));
    } catch (error) {
      console.error('Error rating item:', error);
    } finally {
      setRatingLoading(prev => ({ ...prev, [itemId]: false }));
    }
  };

  
  useEffect(() => {
    const fetchRatings = async () => {
      const ratings = {};
      for (const item of items) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/borrowing/items/${item.id}/rating`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }
          );
          ratings[item.id] = response.data;
        } catch (error) {
          console.error(`Error fetching rating for item ${item.id}:`, error);
        }
      }
      setItemRatings(ratings);
    };
  
    if (items.length > 0) {
      fetchRatings();
    }
  }, [items]);

  const handleMessageClick = (ownerId, ownerName) => {
    setMessageModal({
      isOpen: true,
      ownerId,
      ownerName,
    });
  };

  const handleSendMessage = async (message) => {
    try {
      if (stompClient?.connected) {
        const chatMessage = {
          senderId: user.id,
          receiverId: messageModal.ownerId,
          content: message,
          messageType: 'TEXT',  
          timestamp: new Date().toISOString()
        };
  
        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(chatMessage)
        });
  
        navigate('/messages', {
          state: {
            selectedContact: {
              id: messageModal.ownerId,
              username: messageModal.ownerName
            }
          }
        });
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      navigate('/messages', {
        state: {
          selectedContact: {
            id: messageModal.ownerId,
            username: messageModal.ownerName
          }
        }
      });
    }
  };

  const extractCategories = (items) => {
    // Get unique categories
    const uniqueCategories = [...new Set(items.map(item => item.category))];
    
    // Create category objects with icons
    const categoryIcons = {
      'tools': <MdHandshake className="text-orange-500" />,
      'electronics': <MdAccessTime className="text-purple-500" />,
      'sports': <MdStar className="text-green-500" />,
      'books': <MdPerson className="text-red-500" />,
      'garden': <MdCategory className="text-green-600" />,
      'kitchen': <MdCategory className="text-yellow-500" />,
      // Add more category icons as needed
    };
  
    // Create categories array with "All Items" at the beginning
    const allCategories = [
      { 
        id: 'all', 
        name: 'All Items', 
        icon: <MdCategory className="text-blue-500" />,
        count: items.length
      },
      ...uniqueCategories.map(category => ({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1), // Capitalize first letter
        icon: categoryIcons[category.toLowerCase()] || <MdCategory className="text-gray-500" />,
        count: items.filter(item => item.category === category).length
      }))
    ];
  
    return allCategories;
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/borrowing/items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const itemsWithDefaultImages = response.data.map(item => ({
          ...item,
          imageUrls: item.imageUrls || []
        }));
        
        setItems(itemsWithDefaultImages);
        console.log(itemsWithDefaultImages);
        setAvailableCategories(extractCategories(itemsWithDefaultImages));
      } catch (error) {
        console.error('Error fetching items:', error);
        setItems([]); 
        setAvailableCategories([{ 
          id: 'all', 
          name: 'All Items', 
          icon: <MdCategory className="text-blue-500" />,
          count: 0
        }]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchItems();
  }, []);

  const handleAddItem = () => {
    navigate('/borrowing/add-item');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/homepage')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-900 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Homepage
            </motion.button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Community Borrowing Hub</h1>
              <p className="text-xl text-blue-100">Share resources, build trust, strengthen community</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddItem}
              className="px-6 py-3 bg-white text-blue-900 rounded-full font-medium 
                      flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-md"
            >
              <div className="bg-blue-500 text-white p-1 rounded-full">
                <MdAdd className="text-xl" />
              </div>
              <span>List an Item</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50">
            <MdFilterList className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Categories Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {availableCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl flex items-center gap-2 min-w-max
                            ${selectedCategory === category.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium
                                text-gray-600">
                    {category.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

        {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-video mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))
            ) : (
              // Actual items
              items
                .filter(item => 
                  (selectedCategory === 'all' || item.category === selectedCategory) &&
                  (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden group"
                  >
                    {/* Image Gallery */}
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 h-full">
                            {/* Main Image */}
                            <div className="col-span-2 h-48 relative rounded-lg overflow-hidden">
                              <img
                                src={item.imageUrls[0]}
                                alt={`${item.name} - Main`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                              />
                            </div>
                            
                            {/* Thumbnail Images */}
                            {item.imageUrls.length > 1 && (
                              <div className="grid grid-cols-3 gap-2 col-span-2">
                                {item.imageUrls.slice(1, 4).map((url, index) => (
                                  <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                                    <img
                                      src={url}
                                      alt={`${item.name} - ${index + 2}`}
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

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                        transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setGalleryModal({
                                  isOpen: true,
                                  images: item.imageUrls,
                                  currentIndex: 0
                                })}
                                className="px-4 py-2 bg-white text-blue-600 rounded-full font-medium"
                              >
                                View Images
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/borrowing/item/${item.id}`)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-full font-medium"
                            >
                              {item.owner?.id === user?.id ? 'Manage Item' : 'View Details'}
                            </motion.button>
                          </div>
                        </div>
                      </div>

                    {/* Item Details */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                          {item.category}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <MdLocationOn />
                          {item.location}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        <StarRating
                          rating={itemRatings[item.id] || 0}
                          onRate={(rating) => handleRateItem(item.id, rating, item.owner?.id === user?.id)}
                          isOwner={item.owner?.id === user?.id}
                          size="text-lg"
                        />
                        {ratingLoading[item.id] ? (
                          <span className="text-sm text-gray-500">Updating...</span>
                        ) : (
                          <span className="text-sm text-gray-500">
                            {itemRatings[item.id]?.toFixed(1) || "Not rated"}
                            {item.owner?.id === user?.id && (
                              <span className="ml-2 text-gray-400">(Can't rate own item)</span>
                            )}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* Owner Info and Contact Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <MdPerson className="text-gray-500 text-xl" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {item.owner?.username || "Anonymous"}
                            </p>
                            <p className="text-gray-500">{item.availabilityPeriod}</p>
                          </div>
                        </div>
                        {item.owner?.id !== user?.id && ( 
                            <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMessageClick(item.owner.id, item.owner.username)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium
                                      hover:bg-blue-600 transition-colors"
                          >
                            Message
                          </motion.button>
                          )}
                      </div>

                      {/* Availability Dates */}
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <MdCalendarToday className="text-blue-500" />
                        <span>
                          Available dates: {new Date(item.availableFrom).toLocaleDateString()} - 
                           {new Date(item.availableUntil).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </div>
      </div>

      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={() => setMessageModal({ isOpen: false, ownerId: null, ownerName: '' })}
        onSend={handleSendMessage}
        ownerName={messageModal.ownerName}
      />

      <ImageGalleryModal
        isOpen={galleryModal.isOpen}
        images={galleryModal.images}
        currentIndex={galleryModal.currentIndex}
        onClose={() => setGalleryModal({ isOpen: false, images: [], currentIndex: 0 })}
      />
      <Footer />
    </div>
  );
};

export default Borrowing;