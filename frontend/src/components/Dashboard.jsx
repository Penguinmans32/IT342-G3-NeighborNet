import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, BookOpen, Calendar, Heart, Share2, MessageSquare, HandshakeIcon } from "lucide-react"
import axios from "axios"
import { Link } from "react-router-dom";
import { MdMenu, MdClose, MdSearch, MdNotifications, MdAccountCircle } from "react-icons/md"
import Footer from './SplashScreen/Footer';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState("overview")

  const [stats, setStats] = useState({
    skillsShared: 0,
    itemsBorrowed: 0,
    activeUsers: 0,
    changes: {
      skillsSharedChange: 0,
      itemsBorrowedChange: 0,
      activeUsersChange: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3) // Example unread notification count
  const [user, setUser] = useState(null) // Set to an object with username property when logged in

  const getPercentageColor = (value) => {
    if (!value) return "text-gray-500"
    if (value > 0) return "text-green-500"
    if (value < 0) return "text-red-500"
    return "text-gray-500"
  }

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "0%"
    const rounded = Math.round(value * 10) / 10
    return `${rounded > 0 ? "↑" : rounded < 0 ? "↓" : ""}${Math.abs(rounded)}%`
  }

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:8080/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        // Ensure the response data has the correct structure
        const data = response.data
        if (!data.changes) {
          data.changes = {
            skillsSharedChange: 0,
            itemsBorrowedChange: 0,
            activeUsersChange: 0,
          }
        }

        setStats(data)
        console.log("Dashboard stats:", data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        // Set default values on error
        setStats({
          skillsShared: 0,
          itemsBorrowed: 0,
          activeUsers: 0,
          changes: {
            skillsSharedChange: 0,
            itemsBorrowedChange: 0,
            activeUsersChange: 0,
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const recentActivities = [
    {
      type: "skill",
      user: "Sarah Chen",
      action: "shared a new skill",
      title: "Advanced Photography Tips",
      time: "2 hours ago",
      engagement: { likes: 12, comments: 5 },
    },
    {
      type: "borrow",
      user: "Mike Johnson",
      action: "borrowed",
      title: "Professional Camera Kit",
      time: "3 hours ago",
      engagement: { likes: 8, comments: 3 },
    },
    // Add more activities...
  ]

  const upcomingSessions = [
    {
      title: "Guitar Basics Workshop",
      instructor: "John Doe",
      date: "Tomorrow, 3:00 PM",
      participants: 5,
    },
    {
      title: "Cooking Class: Italian Cuisine",
      instructor: "Maria Garcia",
      date: "Mar 10, 5:30 PM",
      participants: 8,
    },
    // Add more sessions...
  ]

  const communityPosts = [
    {
      id: 1,
      author: {
        name: "Alex Rivera",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      },
      content: "Just finished teaching my first photography class! Thanks everyone for joining! 📸",
      image: "https://source.unsplash.com/random/800x600/?photography",
      likes: 24,
      comments: 8,
      shares: 3,
      time: "1 hour ago",
    },
    // Add more posts...
  ]

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      console.log("Searching for:", searchTerm)
      // Implement search functionality
    }
  }

  const handleNotificationBellClick = () => {
    console.log("Notification bell clicked")
    setUnreadCount(0) // Mark notifications as read
  }

  return (
    <div className="min-h-screen bg-indigo-50/30">
      <style jsx>{`
        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 25%);
          opacity: 0.4;
          animation: float 15s ease-in-out infinite alternate;
        }
        
        .floating-elements2 {
          background: radial-gradient(circle at 80% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 30%);
          animation-duration: 25s;
          animation-delay: 2s;
        }
        
        .floating-elements3 {
          background: radial-gradient(circle at 50% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 20%);
          animation-duration: 20s;
          animation-delay: 5s;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0);
          }
          100% {
            transform: translateY(-10px) translateX(10px) rotate(5deg);
          }
        }
        
        .shimmer-hover {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-hover::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          transform: rotate(30deg);
          transition: transform 0.5s;
          opacity: 0;
        }
        
        .shimmer-hover:hover::after {
          transform: rotate(30deg) translate(0, 0);
          opacity: 1;
          animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
          0% {
            transform: rotate(30deg) translate(-100%, -100%);
          }
          100% {
            transform: rotate(30deg) translate(100%, 100%);
          }
        }
      `}</style>
      <header className="sticky top-0 z-50 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-blue-900 via-purple-600">
          <div className="absolute inset-0">
            <div className="floating-elements"></div>
            <div className="floating-elements floating-elements2"></div>
            <div className="floating-elements floating-elements3"></div>
          </div>
        </div>

        <div className="relative z-10 backdrop-blur-sm transition-all duration-300 hover:backdrop-blur-md">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between px-4 relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
              </motion.button>

              <motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="flex items-center gap-2 group cursor-pointer"
>
  <Link to="/homepage" className="flex items-center gap-2">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 shadow-md
                  transform group-hover:rotate-12 transition-transform duration-300">
      <span className="text-xl font-bold text-blue-600">N</span>
    </div>
    <span className="text-xl font-semibold text-white hidden sm:block
                    group-hover:text-blue-100 transition-colors duration-300">
      Neighbor Net
    </span>
  </Link>
</motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 max-w-2xl mx-4 hidden md:block"
              >
                <div className="relative group">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="search"
                    placeholder="Search Classes, Teachers..."
                    className="w-full h-10 pl-10 pr-4 rounded-full border-2 border-transparent 
                              bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 
                              focus:ring-purple-400 transition-all shadow-lg hover:bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearch}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 300)}
                  />
                  <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500
                                opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    ⌘ K
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                {!user ? (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="hidden sm:inline-flex text-white hover:bg-white/10 px-6 py-2.5 
                                rounded-lg transition-colors shimmer-hover relative overflow-hidden"
                    >
                      
                   
                    </motion.button>
                    
                     
                    
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-white hidden lg:block font-display">
                      {user.username
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(" ")}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleNotificationBellClick}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <div className="relative">
                        <MdNotifications className="text-2xl text-white" />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{unreadCount}</span>
                          </div>
                        )}
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <MdAccountCircle className="text-2xl text-white" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-indigo-900">Welcome back, ey! 👋</h1>
          <p className="text-indigo-600 mt-1">Here's what's happening in your community</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-auto max-w-6xl">
          {/* Skills Shared Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <span
                className={`${getPercentageColor(stats?.changes?.skillsSharedChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.skillsSharedChange).replace("text-", "bg-")}`}
              >
                {formatPercentage(stats?.changes?.skillsSharedChange)}
              </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-blue-700">{stats.skillsShared}</h3>
            <p className="text-blue-600 text-sm font-medium">Skills Shared</p>
          </motion.div>

          {/* Items Borrowed Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <HandshakeIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <span
                className={`${getPercentageColor(stats?.changes?.itemsBorrowedChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.itemsBorrowedChange).replace("text-", "bg-")}`}
              >
                {formatPercentage(stats?.changes?.itemsBorrowedChange)}
              </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-indigo-700">{stats.itemsBorrowed}</h3>
            <p className="text-indigo-600 text-sm font-medium">Items Borrowed</p>
          </motion.div>

          {/* Active Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span
                className={`${getPercentageColor(stats?.changes?.activeUsersChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.activeUsersChange).replace("text-", "bg-")}`}
              >
                {formatPercentage(stats?.changes?.activeUsersChange)}
              </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-purple-700">{stats.activeUsers}</h3>
            <p className="text-purple-600 text-sm font-medium">Active Users</p>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-indigo-900">Community Feed</h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                  View All
                </button>
              </div>

              {/* Post Creation */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Share something with your community..."
                    className="w-full px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 transition-colors font-medium shadow-sm hover:shadow"
                >
                  Post
                </button>
              </div>

              {/* Posts */}
              {communityPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-indigo-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={post.author.avatar || "/placeholder.svg"}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full border-2 border-indigo-200"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-indigo-900">{post.author.name}</h3>
                        <span className="text-indigo-400 text-sm">{post.time}</span>
                      </div>
                      <p className="text-indigo-800 mt-2">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Post content"
                          className="mt-4 rounded-xl w-full object-cover max-h-96 border border-indigo-100"
                        />
                      )}
                      <div className="flex items-center gap-6 mt-4">
                        <button className="flex items-center gap-2 text-indigo-500 hover:text-blue-600 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-indigo-500 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-indigo-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-5 h-5" />
                          <span>{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <h2 className="text-xl font-semibold mb-6 text-purple-900">Upcoming Sessions</h2>
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-purple-900">{session.title}</h3>
                      <p className="text-sm text-purple-700">by {session.instructor}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-purple-600">{session.date}</span>
                        <span className="text-purple-400">•</span>
                        <span className="text-purple-600">{session.participants} participants</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full mt-4 px-4 py-2 border border-purple-600 text-purple-600 
                               rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
              >
                View All Sessions
              </button>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
              <h2 className="text-xl font-semibold mb-6 text-blue-900">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center
                                  ${activity.type === "skill" ? "bg-purple-100" : "bg-blue-100"}`}
                    >
                      {activity.type === "skill" ? (
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      ) : (
                        <HandshakeIcon className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-500">{activity.time}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-blue-500">{activity.engagement.likes}</span>
                          <MessageSquare className="w-4 h-4 text-blue-400 ml-2" />
                          <span className="text-xs text-blue-500">{activity.engagement.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard;