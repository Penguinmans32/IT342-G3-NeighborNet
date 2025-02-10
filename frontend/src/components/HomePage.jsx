import { motion } from 'framer-motion';
import { useAuth } from '../backendApi/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { MdLogout } from 'react-icons/md'; 
import LoadingScreen from './SplashScreen/LoadingSreen';
import { useState } from 'react';

const Homepage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-purple-300">
      <LoadingScreen 
        isLoading={isLoading}
        message="Preparing your dashboard..."
        timeout={5000}
        onTimeout={() => setIsLoading(false)}
      />
      <div className="absolute top-4 right-4">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-lg 
                     rounded-xl text-white hover:bg-white/20 transition-colors
                     border border-white/20"
        >
          <MdLogout className="text-xl" />
          <span>Logout</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Homepage
          </h1>
          <p className="text-xl text-white/90">
            Coming Soon 
          </p>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.05 }}
                className="p-8 bg-white/10 backdrop-blur-lg rounded-2xl"
              >
                <div className="h-32 bg-white/20 rounded-lg animate-pulse" />
                <div className="mt-4 h-4 bg-white/20 rounded animate-pulse" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="fixed top-40 -right-20 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob" />
      <div className="fixed top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
    </div>
  );
};

export default Homepage;