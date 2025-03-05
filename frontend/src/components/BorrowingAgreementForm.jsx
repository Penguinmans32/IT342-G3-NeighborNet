import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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

  console.log('Form opened by:', senderId, '(borrower)');
  console.log('Requesting to borrow from:', receiverId, '(lender)');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching items for receiverId:', receiverId); // Debug log

        const response = await fetch(`http://localhost:8080/api/borrowing/items/user/${receiverId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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
    
    const startDate = new Date(formData.borrowingStart);
    const endDate = new Date(formData.borrowingEnd);
    
    // Get the selected item details
    const selectedItem = items.find(item => item.id.toString() === formData.itemId);
    
    const agreementData = {
      itemId: parseInt(formData.itemId),
      itemName: selectedItem?.name, // Add the item name
      lenderId: receiverId,
      borrowerId: senderId,
      borrowingStart: startDate.toISOString().split('.')[0],
      borrowingEnd: endDate.toISOString().split('.')[0],
      terms: formData.terms,
      status: 'PENDING'
    };
  
    try {
      const response = await fetch('http://localhost:8080/chat/send-agreement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agreementData)
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send agreement: ${errorText}`);
      }
  
      const agreement = await response.json();
      console.log('Agreement created:', agreement);
  
      onSubmit(agreement);
      onClose();
    } catch (error) {
      console.error('Error sending agreement:', error);
      alert('Failed to send agreement. Please try again.');
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
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📋 Create Borrowing Agreement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Item
            </label>
            <select
              name="itemId"
              value={formData.itemId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {formData.itemId && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Selected Item Details</h3>
              {items.find(item => item.id.toString() === formData.itemId) && (
                <div className="mt-2 text-sm text-blue-800">
                  <p><strong>Name:</strong> {items.find(item => item.id.toString() === formData.itemId).name}</p>
                  <p><strong>Category:</strong> {items.find(item => item.id.toString() === formData.itemId).category}</p>
                  <p><strong>Location:</strong> {items.find(item => item.id.toString() === formData.itemId).location}</p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrowing Start
              </label>
              <input
                type="date"
                name="borrowingStart"
                value={formData.borrowingStart}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Borrowing End
              </label>
              <input
                type="date"
                name="borrowingEnd"
                value={formData.borrowingEnd}
                onChange={handleChange}
                min={formData.borrowingStart || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter any specific terms or conditions for borrowing..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send Agreement
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default BorrowingAgreementForm;