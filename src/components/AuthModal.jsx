import { motion } from 'framer-motion';
import { FaGoogle, FaGithub, FaFacebook, FaBookReader, FaUsers, FaChalkboardTeacher, FaHandshake } from 'react-icons/fa';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';
import Modal from './Modal';

const AuthModals = ({ isSignInOpen, isSignUpOpen, closeSignInModal, closeSignUpModal, setIsSignInOpen, setIsSignUpOpen }) => {
  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const switchToSignUp = () => {
    closeSignInModal();
    setTimeout(() => setIsSignUpOpen(true), 100);
  };

  const switchToSignIn = () => {
    closeSignUpModal();
    setTimeout(() => setIsSignInOpen(true), 100);
  };

  const socialButtons = [
    { 
      icon: FaGoogle, 
      text: 'Continue with Google',
      bgColor: 'hover:bg-red-50',
      iconColor: 'text-red-500'
    },
    { 
      icon: FaGithub, 
      text: 'Continue with Github',
      bgColor: 'hover:bg-gray-50',
      iconColor: 'text-gray-700'
    },
    { 
      icon: FaFacebook, 
      text: 'Continue with Facebook',
      bgColor: 'hover:bg-blue-50',
      iconColor: 'text-blue-600'
    }
  ];

  const InputField = ({ icon: Icon, placeholder, type = "text" }) => (
    <motion.div
      variants={inputVariants}
      whileFocus="focus"
      whileTap="tap"
      className="relative"
    >
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
                 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 
                 transition-all duration-300 outline-none"
      />
    </motion.div>
  );

  return (
    <>
      {/* Sign In Modal */}
      <Modal isOpen={isSignInOpen} onClose={closeSignInModal}>
        <div className="grid md:grid-cols-2">
         {/* Left Side - Image/Branding */}
            <div className="hidden md:block bg-gradient-to-br from-blue-500 to-purple-500 p-8 text-white">
            <div className="h-full flex flex-col justify-between max-w-sm">
                {/* Header */}
                <div>
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <p className="text-white/90">Continue your learning journey with your neighbors</p>
                </div>

                {/* Center Image with animation */}
                <div className="flex justify-center items-center my-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-72 h-72 md:w-96 md:h-96"
                >
                    <motion.img
                    src="/images/girl.jpg"
                    alt="Welcome back illustration"
                    className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 group-hover:scale-110 rounded-lg" // Added rounded corners
                    whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                    transition={{ duration: 0.5 }}
                    />
                    {/* Enhanced glow effect */}
                    <div className="absolute inset-0 bg-white/20 rounded-lg blur-3xl -z-10 group-hover:bg-white/30 transition-colors duration-300" />
                </motion.div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FaBookReader className="text-white" />
                    </div>
                    <p className="text-sm">Access to all community classes</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FaUsers className="text-white" />
                    </div>
                    <p className="text-sm">Connect with local experts</p>
                </div>
                </div>
            </div>
            </div>

          {/* Right Side - Form */}
          <div className="p-8 max-w-md mx-auto w-full">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Welcome Back!</h3>
                <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
              </div>

              <div className="space-y-4">
                <InputField icon={MdEmail} placeholder="Email address" type="email" />
                <InputField icon={MdLock} placeholder="Password" type="password" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                         text-white rounded-xl font-medium shadow-lg
                         hover:shadow-xl transition-all duration-300"
              >
                Sign In
              </motion.button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                {socialButtons.map((button, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 border border-gray-200 rounded-xl 
                             flex items-center justify-center space-x-3 ${button.bgColor} 
                             transition-all duration-300 hover:shadow-md bg-white`}
                  >
                    <button.icon className={`text-xl ${button.iconColor}`} />
                    <span className="font-medium text-gray-700">{button.text}</span>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={switchToSignUp}
                  className="text-blue-500 hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Sign Up Modal */}
        <Modal isOpen={isSignUpOpen} onClose={closeSignUpModal}>
        <div className="grid md:grid-cols-2">
            {/* Left Side - Image/Branding */}
                <div className="hidden md:block bg-gradient-to-br from-blue-500 to-purple-500 p-8 text-white">
                <div className="h-full flex flex-col justify-between">
                    {/* Header */}
                    <div>
                    <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
                    <p className="text-white/90">Start sharing and learning with neighbors</p>
                    </div>

                    {/* Center Image with animation */}
                    <div className="flex justify-center items-center my-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-100 h-100"
                    >
                        <img
                        src="/images/SharingSkills.jpeg" //
                        alt="Community illustration"
                        className="w-full h-full object-contain filter drop-shadow-lg"
                        />
                        {/* Optional: Add a subtle glow effect */}
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl -z-10" />
                    </motion.div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <FaChalkboardTeacher className="text-white" />
                        </div>
                        <p className="text-sm">Teach or learn from others</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <FaHandshake className="text-white" />
                        </div>
                        <p className="text-sm">Build meaningful connections</p>
                    </div>
                    </div>
                </div>
                </div>

            {/* Right Side - Form */}
            <div className="p-8 max-w-md mx-auto w-full">
            <div className="space-y-6">
                <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">Create Account</h3>
                <p className="text-gray-600 mt-2">Join our community today</p>
                </div>

                <div className="space-y-4">
                <InputField icon={MdPerson} placeholder="Full name" />
                <InputField icon={MdEmail} placeholder="Email address" type="email" />
                <InputField icon={MdLock} placeholder="Password" type="password" />
                <InputField icon={MdLock} placeholder="Confirm password" type="password" />
                </div>

                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                        text-white rounded-xl font-medium shadow-lg
                        hover:shadow-xl transition-all duration-300"
                >
                Create Account
                </motion.button>

                {/* Replace social buttons with a message */}
                <div className="text-center text-sm text-gray-500">
                <p>Want to use social sign-in?</p>
                <button 
                    onClick={switchToSignIn}
                    className="text-blue-500 hover:underline font-medium"
                >
                    Sign in with social accounts
                </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-500 hover:underline">Terms</a>
                {' • '}
                <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
                </p>

                <p className="text-center text-gray-600">
                Already have an account?{' '}
                <button 
                    onClick={switchToSignIn}
                    className="text-blue-500 hover:underline font-medium"
                >
                    Sign In
                </button>
                </p>
            </div>
            </div>
        </div>
        </Modal>
    </>
  );
};

export default AuthModals;