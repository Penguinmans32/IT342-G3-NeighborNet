import { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../backendApi/AuthContext';
import axios from 'axios';
import { 
  Key, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
        const isAdmin = user.role && 
            (Array.isArray(user.role) 
                ? user.role.includes('ROLE_ADMIN') 
                : user.role === 'ROLE_ADMIN');
        
        if (isAdmin) {
            navigate('/admin/dashboard', { replace: true });
        }
    }
}, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const response = await axios.post('https://neighbornet-back-production.up.railway.app/api/admin/login', {
            username: email,
            password: password
        });

        if (response.data.success) {
          const { accessToken } = response.data.data;
          localStorage.setItem('token', accessToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          const userResponse = await axios.get('https://neighbornet-back-production.up.railway.app/api/auth/user');
          console.log('User data:', userResponse.data);
          
          const userData = userResponse.data.data;  
          setUser(userData);
          
          if (userData.role && userData.role.includes('ROLE_ADMIN')) {
              navigate('/admin/dashboard');
          } else {
              setError('Unauthorized access');
              localStorage.removeItem('token'); 
              delete axios.defaults.headers.common['Authorization'];
          }
      }
    } catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100 blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-100 blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <svg className="w-full h-full opacity-[0.03]" viewBox="0 0 100 100">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 relative"
          >
            <Key className="w-8 h-8" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-50"
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to access the dashboard</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="relative space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  placeholder="admin@example.com"
                  required
                />
                <motion.div
                  initial={false}
                  animate={{ 
                    height: email ? '100%' : '0%',
                    opacity: email ? 1 : 0
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent pointer-events-none rounded-lg"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: password ? '100%' : '0%',
                    opacity: password ? 1 : 0
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-transparent pointer-events-none rounded-lg"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3 px-6 rounded-lg bg-blue-600 text-white font-medium 
                ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:bg-blue-700'} 
                transition-all duration-200 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;