import { FaSearch, FaChalkboardTeacher, FaHandshake, FaBookReader, FaUsers } from "react-icons/fa"
import { motion } from "framer-motion"
import AuthModals from "./AuthModal"
import { useState, useEffect, useRef } from "react"
import "../../styles/SignIn.css"
import { CategorySection } from "./CategorySection"
import ExploreOnlineSection from "./ExploreOnlineSection"
import ExpertsSection from "./ExpertsSection"
import Testimonials from "./Testimonals"
import Questions from "./Questions"
import Footer from "./Footer"
import ScrollProgressBar from "./ScrollProgressBar"
import { useAuth } from "../../backendApi/AuthContext"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BookOpen } from 'lucide-react';

function SignIn() {
  // Initialize particles effect
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" },
          opacity: { value: 0.5, random: false },
          size: { value: 3, random: true },
          line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
          move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" },
        },
      })
    }
  }, [])

  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/homepage")
    }
  }, [user, navigate])

  const exploreRef = useRef(null)

  // Smooth scroll to explore section
  const scrollToExplore = () => {
    const yOffset = -80
    const element = exploreRef.current
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset

    window.scrollTo({ top: y, behavior: "smooth" })
  }

  // Modal state management
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [showSignUpAfterSearch, setShowSignUpAfterSearch] = useState(false)
  const [redirectPath, setRedirectPath] = useState(null)
  const [popularClasses, setPopularClasses] = useState([]);

  const openSignInModal = () => setIsSignInOpen(true)
  const closeSignInModal = () => setIsSignInOpen(false)
  const openSignUpModal = () => setIsSignUpOpen(true)
  const closeSignUpModal = () => setIsSignUpOpen(false)

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    skillsShared: 0,
    itemsBorrowed: 0,
    activeUsers: 0,
  })

  const fetchPopularClasses = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/classes/popular');
      setPopularClasses(response.data);
    } catch (error) {
      console.error('Error fetching popular classes:', error);
    }
  };

  useEffect(() => {
    fetchPopularClasses();
  }, []);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/dashboard/stats")
      setDashboardStats(response.data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setDashboardStats({
        skillsShared: 0,
        itemsBorrowed: 0,
        activeUsers: 0,
      })
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Check for redirect from search
  useEffect(() => {
    const location = window.location
    if (location.state?.showSignUp) {
      setShowSignUpAfterSearch(true)
      setRedirectPath(location.state.redirectAfterAuth)
    }
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  // Features data
  const features = [
    {
      icon: FaChalkboardTeacher,
      title: "Expert Teachers",
      description: "Learn from experienced neighbors passionate about sharing their knowledge",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: FaHandshake,
      title: "Community Connect",
      description: "Build meaningful connections with people in your local area",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: FaBookReader,
      title: "Diverse Classes",
      description: "Explore a wide range of skills from cooking to coding",
      color: "from-indigo-400 to-indigo-600",
    },
    {
      icon: FaUsers,
      title: "Group Learning",
      description: "Join study groups and practice sessions with fellow learners",
      color: "from-pink-400 to-pink-600",
    },
  ]

  // Scroll animation state
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-purple-400 overflow-x-hidden relative">
      <ScrollProgressBar />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid-pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute top-40 -right-20 w-72 h-72 bg-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/2 w-72 h-72 bg-indigo-300 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation Bar with Glass Effect */}
      <header className="p-4 fixed w-full top-0 z-50 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-500/95">
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
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div
                className="w-10 h-10 bg-white/95 rounded-xl flex items-center justify-center 
                          transform group-hover:rotate-12 transition-transform duration-300 shadow-lg"
              >
                <span className="text-blue-600 font-bold text-xl">N</span>
              </div>
              <h1
                className="text-2xl font-bold text-white group-hover:text-blue-100 
                        transition-colors duration-300 tracking-wide"
              >
                Neighbor Net
              </h1>
            </div>

            {/* Search Form */}
            <form
              className="w-full md:w-auto md:flex-1 max-w-xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault()
                const searchQuery = e.target.search.value
                if (searchQuery.trim()) {
                  navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
                }
              }}
            >
              <div className="relative group">
                <FaSearch
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 
                                    text-gray-400 text-xl opacity-100"
                />
                <input
                  type="search"
                  name="search"
                  placeholder="Search Classes, Teachers and More"
                  className="w-full px-12 py-3 rounded-full border-2 border-transparent 
                              outline-none bg-white/90 backdrop-blur-sm
                              transition-all duration-300 shadow-lg
                              focus:border-blue-400 focus:shadow-blue-300/30 focus:shadow-xl
                              placeholder-gray-400 focus:placeholder-gray-300 hover:bg-white"
                />
                <span
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500
                                opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                >
                  ⌘ K
                </span>
              </div>
            </form>

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-6 py-2.5 text-white/90 hover:text-white
                            font-medium tracking-wide transition-all duration-300"
                  onClick={openSignInModal}
                >
                  <span className="relative z-10">Sign In</span>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                  <span className="absolute inset-0 rounded-lg border border-white/0 group-hover:border-white/20
                                  transform scale-95 group-hover:scale-100 transition-all duration-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group px-8 py-2.5 rounded-lg overflow-hidden
                            transform transition-all duration-300"
                  onClick={openSignUpModal}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 to-white/100 
                                  opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Animated Border */}
                  <div className="absolute inset-[1px] rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 
                                  opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                  {/* Button Content */}
                  <span className="relative z-10 font-medium bg-gradient-to-r from-blue-600 to-blue-700 
                                  bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-blue-600
                                  transition-all duration-300">
                    Sign Up
                  </span>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 transform translate-x-full group-hover:translate-x-[-100%] 
                                  bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  transition-transform duration-1000 ease-out" />
                </motion.button>
              </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content Section */}
          <div className="space-y-8 animation-fade-in-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "auto" }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="inline-block relative"
              >
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  Community Learning Platform
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold text-white leading-tight mt-6"
              >
                Share Your Skills,
                <br />
                <span className="text-white relative inline-block">
                  Enrich Your Community
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-1 bg-white/30"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                </span>
              </motion.h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white/90 leading-relaxed"
            >
              Join thousands of neighbors sharing their expertise and passion. Learn, teach, and grow together in your
              local community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-medium 
                         inline-flex items-center shadow-lg hover:shadow-xl 
                         transition-all duration-300 group"
                onClick={openSignUpModal}
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

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full font-medium 
                         inline-flex items-center border-2 border-white/50 text-white
                         hover:bg-white/10 transition-all duration-300 group"
                onClick={scrollToExplore}
              >
                <span>Explore Classes</span>
                <svg
                  className="w-5 h-5 ml-2 transform group-hover:translate-y-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.button>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{dashboardStats.skillsShared.toLocaleString()}+</div>
                <div className="text-sm text-white/80">Skills Shared</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-3xl font-bold text-white">{dashboardStats.itemsBorrowed.toLocaleString()}+</div>
                <div className="text-sm text-white/80">Items Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{dashboardStats.activeUsers.toLocaleString()}+</div>
                <div className="text-sm text-white/80">Active Users</div>
              </div>
            </motion.div>
          </div>

          {/* Right Feature Cards Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative"
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
            {/* Floating Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
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
                  <feature.icon
                    className="text-3xl mb-4 text-gray-700 group-hover:text-white
                                        transform transition-all duration-300"
                  />
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

           {/* Interactive Demo Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-8 bg-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-bl-3xl"></div>

                <h3 className="text-lg font-semibold mb-4 text-gray-800">Popular Right Now</h3>

                {popularClasses.length === 0 ? (
                  // No classes case
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mb-3 text-blue-200" />
                    <p className="text-center">No classes available yet.</p>
                    <p className="text-sm text-center mt-1">Be the first to create a class!</p>
                  </div>
                ) : popularClasses.length < 3 ? (
                  // 1 or 2 classes case
                  <div className="space-y-3">
                    {/* Real classes */}
                    {popularClasses.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800">{course.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{course.enrolledCount} students</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              {course.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/class/${course.id}`)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {/* Placeholder cards */}
                    {[...Array(3 - popularClasses.length)].map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold">
                          {popularClasses.length + index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                            <span className="text-gray-300">•</span>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // 3 or more classes case (show top 3)
                  <div className="space-y-3">
                    {popularClasses.slice(0, 3).map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-800">{course.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{course.enrolledCount} students</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              {course.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/class/${course.id}`)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
              <motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Wave Separator */}
      <div className="relative h-24 mt-12 mb-6">
        <svg className="absolute w-full h-full" viewBox="0 0 1440 100" preserveAspectRatio="none" fill="white">
          <path d="M0,50 C150,20 350,0 500,20 C650,40 750,80 900,80 C1050,80 1200,50 1440,20 L1440,100 L0,100 Z"></path>
        </svg>
      </div>

      {/* Content Sections */}
      <div className="bg-white">
        <CategorySection />

        {/* Explore Online Section */}
        <div ref={exploreRef}>
          <ExploreOnlineSection />
        </div>
        <ExpertsSection />
        <Testimonials />
        <Questions />
        <Footer />
      </div>

      {/* Auth Modals */}
      <AuthModals
        isSignInOpen={isSignInOpen}
        isSignUpOpen={isSignUpOpen || showSignUpAfterSearch}
        closeSignInModal={closeSignInModal}
        closeSignUpModal={() => {
          closeSignUpModal()
          setShowSignUpAfterSearch(false)
        }}
        setIsSignInOpen={setIsSignInOpen}
        setIsSignUpOpen={setIsSignUpOpen}
        redirectPath={redirectPath}
      />
    </div>
  )
}

export default SignIn

