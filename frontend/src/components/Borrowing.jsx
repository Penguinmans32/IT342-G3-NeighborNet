// Borrowing.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../backendApi/AuthContext';
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
import axios from 'axios';

const Borrowing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Categories for borrowing items
  const categories = [
    { id: 'all', name: 'All Items', icon: <MdCategory className="text-blue-500" /> },
    { id: 'tools', name: 'Tools', icon: <MdHandshake className="text-orange-500" /> },
    { id: 'electronics', name: 'Electronics', icon: <MdAccessTime className="text-purple-500" /> },
    { id: 'sports', name: 'Sports Equipment', icon: <MdStar className="text-green-500" /> },
    { id: 'books', name: 'Books', icon: <MdPerson className="text-red-500" /> },
    // Add more categories as needed
  ];

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/borrowing/items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Function to handle adding a new item
  const handleAddItem = () => {
    navigate('/borrowing/add-item');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
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
                       flex items-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <MdAdd className="text-xl" />
              List an Item
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
            {categories.map((category) => (
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
                {category.name}
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
                  <div className="aspect-video relative">
                    <img
                      src={item.imageUrl || '/default-item-image.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                  transition-opacity flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={() => navigate(`/borrowing/item/${item.id}`)}
                        className="px-6 py-2 bg-white text-blue-600 rounded-full font-medium"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>

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
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.owner.avatarUrl || '/default-avatar.jpg'}
                          alt={item.owner.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{item.owner.name}</p>
                          <p className="text-gray-500">{item.availabilityPeriod}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <MdStar className="text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Borrowing;