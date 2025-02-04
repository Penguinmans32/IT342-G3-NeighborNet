import { FaGithub, FaFacebook, FaGoogle, FaSearch } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { motion } from 'framer-motion';
import '../styles/SignIn.css';

function SignIn() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-purple-300 overflow-x-hidden relative">
      {/* Navigation Bar with Glass Effect and Animated Waves */}
      <header className="p-4 fixed w-full top-0 z-50 overflow-hidden">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/95 via-blue-600/95 to-purple-500/95">
          <div className="absolute inset-0">
            <div className="wave"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        </div>

        {/* Header Content with Glass Effect */}
        <div className="relative z-10 backdrop-blur-sm py-1">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center 
                            transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-blue-600 font-bold text-xl">N</span>
              </div>
              <h1 className="text-2xl font-bold text-white group-hover:text-blue-100 
                           transition-colors duration-300 tracking wide">
                Neighbor Net
              </h1>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="flex-1 mx-8 hidden md:block">
              <div className="relative max-w-2xl mx-auto">
                <div className="relative group">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                     text-black text-xl opacity-100" />
                  <input
                    type="text"
                    placeholder="Search Classes, Teachers and More"
                    className="w-full px-12 py-3 rounded-full border-2 border-transparent 
                              outline-none bg-white/90 backdrop-blur-sm
                              transition-all duration-300 shadow-lg
                              focus:border-blue-400 focus:shadow-blue-300/30 focus:shadow-xl
                              placeholder-shown:focus:placeholder-transparent hover:bg-white"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                 bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500
                                 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                    ⌘ K
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Navigation Buttons */}
            <div className="flex items-center space-x-6">
              <button className="group relative px-6 py-2.5 text-white hover:text-blue-100 
                               transition-all duration-300 overflow-hidden">
                Sign In
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform 
                               scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button className="relative px-8 py-2.5 bg-black/90 text-white rounded-full 
                               overflow-hidden group transform hover:-translate-y-0.5 
                               transition-all duration-300 hover:shadow-xl border border-white/10">
                <span className="relative z-10">Sign Up</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content Section */}
          <div className="space-y-8 animation-fade-in-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-white leading-tight"
            >
              Share Your Skills,
              <br />
              <span className="text-blue-900 relative">
                Enrich Your Community
                <motion.span 
                  className="absolute bottom-0 left-0 w-full h-1 bg-blue-900/30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
              </span>
            </motion.h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of neighbors sharing their expertise and passion.
              Learn, teach, and grow together in your local community.
            </p>
            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium 
                         inline-flex items-center shadow-lg hover:shadow-xl 
                         transition-all duration-300 group"
              >
                <span>Start Learning Today</span>
                <svg 
                  className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Right Sign In Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="animation-fade-in-right"
          >
            <div className="bg-white p-8 rounded-2xl shadow-2xl space-y-6 
                          transform hover:scale-[1.01] transition-all duration-300
                          relative overflow-hidden group">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 animate-gradient"></div>
                <div className="absolute inset-0" style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}></div>
              </div>

              <div className="relative z-10">
                <h3 className="text-center text-2xl text-gray-800 font-semibold mb-8">
                  Start Your Learning Journey
                </h3>
                
                {/* Enhanced Social Sign In Buttons */}
                <div className="space-y-4">
                  {[
                    { 
                      icon: FaGoogle, 
                      text: 'Continue with Google',
                      bgColor: 'hover:bg-red-50 hover:border-red-200',
                      iconColor: 'text-red-500',
                      hoverEffect: 'hover:shadow-md'
                    },
                    { 
                      icon: FaGithub, 
                      text: 'Continue with Github',
                      bgColor: 'hover:bg-gray-50 hover:border-gray-300',
                      iconColor: 'text-gray-700',
                      hoverEffect: 'hover:shadow-md'
                    },
                    { 
                      icon: FaFacebook, 
                      text: 'Continue with Facebook',
                      bgColor: 'hover:bg-blue-50 hover:border-blue-200',
                      iconColor: 'text-blue-600',
                      hoverEffect: 'hover:shadow-md'
                    },
                    { 
                      icon: MdEmail, 
                      text: 'Sign up with Email',
                      bgColor: 'hover:bg-green-50 hover:border-green-200',
                      iconColor: 'text-green-600',
                      hoverEffect: 'hover:shadow-md'
                    }
                  ].map((provider, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 px-6 border border-gray-200 rounded-xl flex items-center 
                                justify-center space-x-3 ${provider.bgColor} transition-all duration-300 
                                hover:shadow-md bg-white group`}
                    >
                      <provider.icon className={`text-xl ${provider.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                      <span className="font-medium text-gray-700">{provider.text}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Terms Section */}
                <div className="mt-8 text-sm text-center text-gray-500 leading-relaxed">
                  By joining, you agree to our{' '}
                  <a href="#" className="text-blue-500 hover:underline font-medium">Terms</a>
                  {' • '}
                  <a href="#" className="text-blue-500 hover:underline font-medium">Privacy</a>
                  {' • '}
                  <a href="#" className="text-blue-500 hover:underline font-medium">Community Guidelines</a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-40 -right-20 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    </div>
  );
}

export default SignIn;