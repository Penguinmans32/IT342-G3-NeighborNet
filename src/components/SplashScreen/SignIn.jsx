import {FaSearch, FaChalkboardTeacher, FaHandshake, FaBookReader, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import AuthModals from './AuthModal';
import { useState, useEffect, useRef } from 'react';
import '../../styles/SignIn.css';
import { CategorySection } from './CategorySection';
import ExploreOnlineSection from './ExploreOnlineSection';
import ExpertsSection from './ExpertsSection';
import Testimonials from './Testimonals';
import Questions from './Questions';
import Footer from './Footer';
import ScrollProgressBar from './ScrollProgressBar';
import { useAuth } from '../../backendApi/AuthContext';
import { useNavigate } from 'react-router-dom';


function SignIn() {

  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: '#ffffff' },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out' }
        }
      });
    }
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
        navigate('/homepage');
    }
  }, [user, navigate]);

  const exploreRef = useRef(null);

  const scrollToExplore = () => {
    const yOffset = -80;
    const element = exploreRef.current;
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
  
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const openSignInModal = () => setIsSignInOpen(true);
  const closeSignInModal = () => setIsSignInOpen(false);

  const openSignUpModal = () => setIsSignUpOpen(true);
  const closeSignUpModal = () => setIsSignUpOpen(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      icon: FaChalkboardTeacher,
      title: "Expert Teachers",
      description: "Learn from experienced neighbors passionate about sharing their knowledge",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: FaHandshake,
      title: "Community Connect",
      description: "Build meaningful connections with people in your local area",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: FaBookReader,
      title: "Diverse Classes",
      description: "Explore a wide range of skills from cooking to coding",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      icon: FaUsers,
      title: "Group Learning",
      description: "Join study groups and practice sessions with fellow learners",
      color: "from-pink-400 to-pink-600"
    }
  ];




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-purple-300 overflow-x-hidden relative">
      <ScrollProgressBar />
      {/* Navigation Bar with Glass Effect and Animated Waves */}
      <header className="p-4 fixed w-full top-0 z-50 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/95 via-blue-600/95 to-purple-500/95">
          {/* Particles Container */}
          <div id="particles-js" className="absolute inset-0 opacity-30"></div>
          
          {/* Educational Floating Elements */}
          <div className="absolute inset-0">
            <div className="floating-elements"></div>
            <div className="floating-elements floating-elements2"></div>
            <div className="floating-elements floating-elements3"></div>
          </div>
        </div>

        {/* Header Content with Glass Effect */}
        <div className="relative z-10 backdrop-blur-sm py-1 transition-all duration-300 hover:backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center 
                          transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-blue-600 font-bold text-xl">N</span>
              </div>
              <h1 className="text-2xl font-bold text-white group-hover:text-blue-100 
                        transition-colors duration-300 tracking-wide">
                Neighbor Net
              </h1>
            </div>
            
            {/* Search Bar */}
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

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-6">
              <button 
                className="group relative px-6 py-2.5 text-white hover:text-blue-100 
                        transition-all duration-300 overflow-hidden shimmer-hover" 
                onClick={openSignInModal}
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform 
                            scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </button>
              <button 
                className="relative px-8 py-2.5 bg-black/90 text-white rounded-full 
                        overflow-hidden group transform hover:-translate-y-0.5 
                        transition-all duration-300 hover:shadow-xl border border-white/10 shimmer-hover" 
                onClick={openSignUpModal}
              >
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

          {/* Right Image Section */}
          {/* Add this new Right Content Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            {/* Floating Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4 relative">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  className={`bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl
                            transform transition-all duration-300
                            hover:shadow-2xl hover:bg-gradient-to-br ${feature.color}
                            hover:text-white group`}
                >
                  <feature.icon className="text-3xl mb-4 text-gray-700 group-hover:text-white
                                        transform transition-all duration-300" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm opacity-90">{feature.description}</p>
                  
                  {/* Decorative dots */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <div className="w-1 h-1 rounded-full bg-current opacity-50"></div>
                    <div className="w-1 h-1 rounded-full bg-current opacity-30"></div>
                    <div className="w-1 h-1 rounded-full bg-current opacity-10"></div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Interactive Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-gray-600">Active Classes</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600">Teachers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">5000+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToExplore}
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500
                       text-white rounded-xl font-medium shadow-lg
                       hover:shadow-xl transition-all duration-300
                       flex items-center justify-center space-x-2"
            >
              <span>Explore Classes</span>
              <svg 
                className="w-5 h-5 animate-bounce" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </main>

      <CategorySection />

      {/* Explore Online Section */}
      <div ref={exploreRef}>
        <ExploreOnlineSection />
      </div>
      <ExpertsSection />
      <Testimonials />
      <Questions />
      <Footer />

      {/* Footer Section */}

      <AuthModals
        isSignInOpen={isSignInOpen}
        isSignUpOpen={isSignUpOpen}
        closeSignInModal={closeSignInModal}
        closeSignUpModal={closeSignUpModal}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignUpOpen={setIsSignUpOpen}
      />


      {/* Decorative Elements */}
      <div className="fixed top-40 -right-20 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    </div>
  );
}

export default SignIn;