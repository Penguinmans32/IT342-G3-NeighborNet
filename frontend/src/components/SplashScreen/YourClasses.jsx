import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdPeople, MdStar } from 'react-icons/md';
import axios from 'axios';

const YourClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, draft
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, popular

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/classes/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await axios.delete(`http://localhost:8080/api/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setClasses(classes.filter(c => c.id !== classId));
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const filteredClasses = classes.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'popular':
        return b.enrolledCount - a.enrolledCount;
      default: // newest
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Classes</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/create-class')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <MdAdd className="text-xl" />
            <span>Create New Class</span>
          </motion.button>
        </div>

        {/* Filters and Sorting */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="active">Active</option>
              <option value="draft">Drafts</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'} found
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedClasses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <img
              src="/empty-classes.svg" // Add an appropriate image
              alt="No classes"
              className="w-48 h-48 mx-auto mb-4 opacity-50"
            />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Classes Yet</h3>
            <p className="text-gray-500 mb-6">Start sharing your knowledge by creating your first class</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-class')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create Your First Class
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedClasses.map((classItem) => (
              <motion.div
                key={classItem.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Class Image */}
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={classItem.thumbnail || '/default-class-image.jpg'}
                    alt={classItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm">
                    {classItem.status === 'draft' ? (
                      <span className="text-orange-500">Draft</span>
                    ) : (
                      <span className="text-green-500">Active</span>
                    )}
                  </div>
                </div>

                {/* Class Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{classItem.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {classItem.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MdPeople className="mr-1" />
                      <span>{classItem.enrolledCount || 0} enrolled</span>
                    </div>
                    <div className="flex items-center">
                      <MdStar className="mr-1 text-yellow-400" />
                      <span>{classItem.rating || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/class/${classItem.id}/edit`)}
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                    >
                      <MdEdit />
                      <span>Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                    >
                      <MdDelete />
                      <span>Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourClasses;