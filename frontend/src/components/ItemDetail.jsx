// ItemDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../backendApi/AuthContext';
import axios from 'axios';
import {
  MdArrowBack,
  MdLocationOn,
  MdPerson,
  MdCalendarToday,
  MdAccessTime,
  MdEmail,
  MdPhone,
  MdInfo,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from 'react-icons/md';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowRequest, setBorrowRequest] = useState({
    startDate: '',
    endDate: '',
    message: '',
  });

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/borrowing/items/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8080/api/borrowing/requests`, {
        itemId: id,
        ...borrowRequest
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Show success message and close form
      setShowBorrowForm(false);
      // You can add a toast notification here
    } catch (error) {
      console.error('Error submitting borrow request:', error);
      // Show error message
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold text-gray-700">Item not found</h2>
        <button
          onClick={() => navigate('/borrowing')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/borrowing')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
          >
            <MdArrowBack className="text-xl" />
            <span>Back to Items</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <>
                  <img
                    src={item.imageUrls[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? item.imageUrls.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2
                                 bg-white/80 p-2 rounded-full hover:bg-white"
                      >
                        <MdChevronLeft className="text-2xl" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === item.imageUrls.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2
                                 bg-white/80 p-2 rounded-full hover:bg-white"
                      >
                        <MdChevronRight className="text-2xl" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {item.imageUrls && item.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {item.imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2
                              ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img
                      src={url}
                      alt={`${item.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <MdLocationOn />
                  {item.location}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-600">{item.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <MdCalendarToday className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Available From</p>
                    <p className="font-medium">
                      {new Date(item.availableFrom).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <MdCalendarToday className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Available Until</p>
                    <p className="font-medium">
                      {new Date(item.availableUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Owner</h3>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdPerson className="text-2xl text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{item.owner?.username || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">{item.availabilityPeriod}</p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            {item.terms && (
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Terms and Conditions</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">{item.terms}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {item.owner?.id !== user?.id ? (
            // Show borrow and contact buttons for non-owners
            <div className="flex gap-4 pt-4">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowBorrowForm(true)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                            hover:bg-blue-600 transition-colors"
                >
                Request to Borrow
                </motion.button>
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowContactInfo(true)}
                className="flex-1 px-6 py-3 bg-white text-blue-500 rounded-lg font-medium
                            border-2 border-blue-500 hover:bg-blue-50 transition-colors"
                >
                Contact Owner
                </motion.button>
            </div>
            ) : (
            // Show management buttons for owners
            <div className="flex gap-4 pt-4">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/borrowing/edit/${item.id}`)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                            hover:bg-blue-600 transition-colors"
                >
                Edit Item
                </motion.button>
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {/* Add delete functionality */}}
                className="flex-1 px-6 py-3 bg-white text-red-500 rounded-lg font-medium
                            border-2 border-red-500 hover:bg-red-50 transition-colors"
                >
                Delete Item
                </motion.button>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      {showBorrowForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Request to Borrow</h3>
              <button
                onClick={() => setShowBorrowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MdClose />
              </button>
            </div>
            
            <form onSubmit={handleBorrowSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={borrowRequest.startDate}
                  onChange={(e) => setBorrowRequest({
                    ...borrowRequest,
                    startDate: e.target.value
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={borrowRequest.endDate}
                  onChange={(e) => setBorrowRequest({
                    ...borrowRequest,
                    endDate: e.target.value
                  })}
                  min={borrowRequest.startDate}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Owner
                </label>
                <textarea
                  value={borrowRequest.message}
                  onChange={(e) => setBorrowRequest({
                    ...borrowRequest,
                    message: e.target.value
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Explain why you'd like to borrow this item..."
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-medium
                          hover:bg-blue-600 transition-colors"
              >
                Submit Request
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Contact Info Modal */}
      {showContactInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Contact Information</h3>
              <button
                onClick={() => setShowContactInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <MdClose />
              </button>
            </div>
            
            <div className="space-y-4">
              {item.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MdEmail className="text-xl text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{item.email}</p>
                  </div>
                </div>
              )}
              
              {item.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MdPhone className="text-xl text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{item.phone}</p>
                  </div>
                </div>
              )}

              {/* Preferred Contact Method */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MdInfo className="text-xl text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Preferred Contact Method</p>
                  <p className="font-medium">{item.contactPreference}</p>
                </div>
              </div>

              {/* Contact Note */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Please respect the owner's preferred contact method and contact during reasonable hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Toast Notification */}
      {/* You can add a toast notification system here */}
    </div>
  );
};

export default ItemDetail;