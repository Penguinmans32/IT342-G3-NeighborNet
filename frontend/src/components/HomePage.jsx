import { motion } from 'framer-motion';
import { useAuth } from '../backendApi/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  MdLogout, 
  MdDashboard, 
  MdChat, 
  MdPeople, 
  MdSwapHoriz, 
  MdSchool,
  MdMenu,
  MdClose,
  MdAdd,
  MdClass,
  MdLibraryBooks, 
} from 'react-icons/md';
import axios from 'axios';

const Homepage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [userClasses, setUserClasses] = useState([]);

  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/classes/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserClasses(response.data);
      }catch (error) {
        console.error('Error fetching user classes:', error);
      }
    };

    if(user) {
      fetchUserClasses();
    }
  }, [user]);

  useEffect(() => {
    if(!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: MdDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: MdSchool, label: 'Skills', path: '/skills' },
    { icon: MdSwapHoriz, label: 'Borrowing', path: '/borrowing' },
    { icon: MdChat, label: 'Messages', path: '/messages' },
    { icon: MdPeople, label: 'Community', path: '/community' },
    { 
      icon: MdAdd, 
      label: 'Add Class', 
      path: '/create-class',
      className: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    { 
      icon: MdLibraryBooks, 
      label: 'Your Classes', 
      path: '/your-classes',
      badge: userClasses.length // Show number of classes
    },
  ];


  const mainMenuItems = menuItems.slice(0, 1);
  const classMenuItems = menuItems.slice(1, 3);
  const otherMenuItems = menuItems.slice(3);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <motion.div 
        initial={{ x: -250 }}
        animate={{ x: isSidebarOpen ? 0 : -250 }}
        className={`fixed md:relative w-64 h-screen bg-white shadow-lg z-20`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-blue-600">NeighborNet</h1>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="mb-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-blue-500">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold">Welcome, {user?.username}!</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>

          {/* Navigation Menu - Now with sections */}
          <nav className="space-y-6">
            {/* Main Menu Section */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Main
              </h3>
              <div className="space-y-1">
                {mainMenuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: '#F3F4F6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="text-xl text-blue-500" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Classes Section */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Classes & Other
              </h3> 
              <div className="space-y-1">
                {classMenuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${
                      item.className || 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="text-xl" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Other Menu Items */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Features
              </h3>
              <div className="space-y-1">
                {otherMenuItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: '#F3F4F6' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="text-xl text-blue-500" />
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="absolute bottom-8 left-4 right-4 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          <MdLogout className="text-xl" />
          <span>Logout</span>
        </motion.button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700"
          >
            <MdMenu className="text-2xl" />
          </button>
          <h1 className="text-lg font-semibold text-blue-600">NeighborNet</h1>
        </div>

        {/* Main Content Area */}
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Share a Skill</h3>
              <p className="text-gray-600 mb-4">
                Share your expertise with your neighbors and earn community points.
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Start Sharing
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Borrow Items</h3>
              <p className="text-gray-600 mb-4">
                Need something? Check what your neighbors are willing to lend.
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Browse Items
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-white rounded-xl shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">Community Chat</h3>
              <p className="text-gray-600 mb-4">
                Connect with your neighbors and join the conversation.
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Start Chatting
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;