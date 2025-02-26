import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import axios from 'axios';

const AddBorrowingItem = () => {
  const navigate = useNavigate();
  const [itemData, setItemData] = useState({
    name: '',
    description: '',
    category: '',
    location: '',
    availabilityPeriod: '',
    terms: '',
    imageUrl: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(itemData).forEach(key => {
        formData.append(key, itemData[key]);
      });

      await axios.post('http://localhost:8080/api/borrowing/items', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/borrowing');
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">List an Item for Borrowing</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              {itemData.imageUrl ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(itemData.imageUrl)}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setItemData({ ...itemData, imageUrl: null })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <MdDelete />
                  </button>
                </div>
              ) : (
                <div>
                  <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                  <label className="cursor-pointer text-blue-500 hover:text-blue-600">
                    Upload Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setItemData({
                        ...itemData,
                        imageUrl: e.target.files[0]
                      })}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={itemData.name}
                onChange={(e) => setItemData({ ...itemData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={itemData.description}
                onChange={(e) => setItemData({ ...itemData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={itemData.category}
                  onChange={(e) => setItemData({ ...itemData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="tools">Tools</option>
                  <option value="electronics">Electronics</option>
                  <option value="sports">Sports Equipment</option>
                  <option value="books">Books</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={itemData.location}
                  onChange={(e) => setItemData({ ...itemData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Period
              </label>
              <input
                type="text"
                value={itemData.availabilityPeriod}
                onChange={(e) => setItemData({ ...itemData, availabilityPeriod: e.target.value })}
                placeholder="e.g., Weekends only, 1-2 weeks"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Borrowing Terms
              </label>
              <textarea
                value={itemData.terms}
                onChange={(e) => setItemData({ ...itemData, terms: e.target.value })}
                placeholder="Specify any conditions, deposit requirements, or special instructions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>

            {/* Add datetime inputs for availability period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <input
                  type="datetime-local"
                  value={itemData.availableFrom}
                  onChange={(e) => setItemData({ ...itemData, availableFrom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until
                </label>
                <input
                  type="datetime-local"
                  value={itemData.availableUntil}
                  onChange={(e) => setItemData({ ...itemData, availableUntil: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Contact Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Preferences
              </label>
              <select
                value={itemData.contactPreference}
                onChange={(e) => setItemData({ ...itemData, contactPreference: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Contact Method</option>
                <option value="app">In-App Messages</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/borrowing')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </motion.button>
              
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className={`px-6 py-2 bg-blue-500 text-white rounded-lg 
                          hover:bg-blue-600 transition-colors flex items-center gap-2
                          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Listing Item...
                  </>
                ) : (
                  'List Item'
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBorrowingItem;