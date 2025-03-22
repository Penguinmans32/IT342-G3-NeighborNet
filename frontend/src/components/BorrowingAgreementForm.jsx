import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdImage } from 'react-icons/md';

const BorrowingAgreementForm = ({ onSubmit, onClose, senderId, receiverId, stompClient }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    itemId: '',
    itemName: '',
    borrowingStart: '',
    borrowingEnd: '',
    terms: '',
    status: 'PENDING'
  });

  console.log('Form data:', formData); // Debug log


  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching items for receiverId:', receiverId);

        const response = await fetch(
          `http://localhost:8080/api/borrowing/items/user/${receiverId}`,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched items:', data); // Debug log
        
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('Received non-array data:', data);
          setItems([]);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setError(error.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (receiverId) {
      fetchItems();
    }
  }, [receiverId]);


  const validateDates = (startDate, endDate, itemAvailableFrom, itemAvailableUntil) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availableFrom = new Date(itemAvailableFrom);
    const availableUntil = new Date(itemAvailableUntil);
  
    [start, end, availableFrom, availableUntil].forEach(date => {
      date.setHours(0, 0, 0, 0);
    });
  
    if (start < availableFrom || start > availableUntil) {
      return "Start date must be within the item's available period";
    }
    if (end < availableFrom || end > availableUntil) {
      return "End date must be within the item's available period";
    }
    if (end < start) {
      return "End date cannot be before start date";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    
    try {
      if (!formData.itemId || !formData.borrowingStart || !formData.borrowingEnd || !formData.terms) {
        setError('Please fill in all required fields');
        return;
      }
  
      const selectedItem = items.find(item => item.id.toString() === formData.itemId.toString());
      if (!selectedItem) {
        setError('Selected item not found');
        return;
      }

      const dateError = validateDates(
        formData.borrowingStart,
        formData.borrowingEnd,
        selectedItem.availableFrom,
        selectedItem.availableUntil
      );

      
      
      if (dateError) {
        setError(dateError);
        return;
      }
  
      // Format dates
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        date.setUTCHours(12, 0, 0, 0);
        return date.toISOString();
      };
  
      const agreementData = {
        itemId: parseInt(formData.itemId),
        itemName: selectedItem.name,
        lenderId: receiverId,
        borrowerId: senderId,
        borrowingStart: formatDate(formData.borrowingStart),
        borrowingEnd: formatDate(formData.borrowingEnd),
        terms: formData.terms,
        status: 'PENDING'
      };
  
      await onSubmit(agreementData);
    } catch (error) {
      console.error('Error sending agreement:', error);
      setError(error.message || 'Failed to send agreement. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'itemId') {
      const selected = items.find(item => item.id.toString() === value);
      setSelectedItem(selected);
      setFormData(prev => ({
        ...prev,
        itemId: value,
        itemName: selected?.name || '',
        borrowingStart: '',
        borrowingEnd: ''
      }));
    } else if (name === 'borrowingStart' || name === 'borrowingEnd') {
      const newFormData = {
        ...formData,
        [name]: value
      };
  
      if (selectedItem && newFormData.borrowingStart && newFormData.borrowingEnd) {
        const error = validateDates(
          newFormData.borrowingStart,
          newFormData.borrowingEnd,
          selectedItem.availableFrom,
          selectedItem.availableUntil
        );
  
        if (error) {
          alert(error);
          return;
        }
      }
  
      setFormData(newFormData);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Create Borrowing Agreement</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selection */}
          <div className="p-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Item*
            </label>
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an item to borrow</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.category}
                </option>
              ))}
            </select>
          </div>

          {/* Item Details Section */}
          {selectedItem && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex gap-4">
                {/* Item Images */}
                <div className="w-1/3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {selectedItem.imageUrls && selectedItem.imageUrls.length > 0 ? (
                      <img
                        src={selectedItem.imageUrls[0]}
                        alt={selectedItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MdImage className="text-4xl" />
                      </div>
                    )}
                  </div>
                  {selectedItem.imageUrls && selectedItem.imageUrls.length > 1 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {selectedItem.imageUrls.slice(1, 4).map((url, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={url}
                            alt={`${selectedItem.name} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Item Information */}
                <div className="w-2/3 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedItem.name}</h3>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mt-2">
                      {selectedItem.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Available Period</p>
                      <p className="font-medium">
                        {new Date(selectedItem.availableFrom).toLocaleDateString()} - {new Date(selectedItem.availableUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{selectedItem.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact Preference</p>
                      <p className="font-medium">{selectedItem.contactPreference}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Availability Period</p>
                      <p className="font-medium">{selectedItem.availabilityPeriod}</p>
                    </div>
                  </div>

                  {selectedItem.description && (
                    <div>
                      <p className="text-gray-500">Description</p>
                      <p className="text-sm text-gray-700">{selectedItem.description}</p>
                    </div>
                  )}

                  {selectedItem.terms && (
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">Borrowing Terms</p>
                      <p className="text-sm text-gray-700">{selectedItem.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Agreement Form Fields */}
          <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="borrowingStart"
                value={formData.borrowingStart}
                onChange={handleChange}
                min={selectedItem ? new Date(selectedItem.availableFrom).toISOString().split('T')[0] : ''}
                max={selectedItem ? new Date(selectedItem.availableUntil).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {selectedItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Available from: {new Date(selectedItem.availableFrom).toLocaleDateString()}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="borrowingEnd"
                value={formData.borrowingEnd}
                onChange={handleChange}
                min={formData.borrowingStart || (selectedItem ? new Date(selectedItem.availableFrom).toISOString().split('T')[0] : '')}
                max={selectedItem ? new Date(selectedItem.availableUntil).toISOString().split('T')[0] : ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              {selectedItem && (
                <p className="text-xs text-gray-500 mt-1">
                  Available until: {new Date(selectedItem.availableUntil).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms and Conditions*
              </label>
              <textarea
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter terms and conditions..."
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Agreement'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BorrowingAgreementForm;