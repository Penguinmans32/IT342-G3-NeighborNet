import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BorrowingAgreementForm = ({ onSubmit, onClose, senderId, receiverId, stompClient }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const selectedItem = items.find(item => item.id.toString() === value);
      setFormData(prev => ({
        ...prev,
        itemId: value,
        itemName: selectedItem?.name || ''
      }));
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
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Create Borrowing Agreement</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="borrowingStart"
                value={formData.borrowingStart}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
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
                min={formData.borrowingStart || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
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
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BorrowingAgreementForm;