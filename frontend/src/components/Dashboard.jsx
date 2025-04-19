import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  BookOpen,
  Calendar,
  Heart,
  Share2,
  MessageSquare,
  ImageIcon,
  Sparkles,
  ChevronRight,
  X,
  Edit,
  Trash2,
} from "lucide-react"
import axios from "axios"
import Footer from "./SplashScreen/Footer"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../backendApi/AuthContext"
import { createGlobalStyle } from "styled-components"
import '../styles/dashboard-styles.css'
import { showSimpleNotification } from "./SimpleNotification"

const GlobalStyle = createGlobalStyle`
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
`

const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const Dashboard = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [error, setError] = useState(null)
  const [newPostContent, setNewPostContent] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [comments, setComments] = useState({})
  const [userProfileData, setUserProfileData] = useState(null);
  const [newComments, setNewComments] = useState({})
  const [showComments, setShowComments] = useState({})
  const [isCommenting, setIsCommenting] = useState({})
  const [editingPostId, setEditingPostId] = useState(null)
  const [editedContent, setEditedContent] = useState("")
  const [recentClasses, setRecentClasses] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const [recentActivities, setRecentActivities] = useState([])
  const [profileData, setProfileData] = useState(null)
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

  const calculatePercentage = (current, total) => {
    if (total === 0) return 0;
    return ((current / total) * 100);
  };
  
  const totalActivities = stats.skillsShared + stats.itemsBorrowed + stats.activeUsers;
  const skillsSharedPercentage = calculatePercentage(stats.skillsShared, totalActivities);
  const itemsBorrowedPercentage = calculatePercentage(stats.itemsBorrowed, totalActivities);
  const activeUsersPercentage = calculatePercentage(stats.activeUsers, totalActivities);

  const getFullThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return "/default-class-image.jpg"
    return thumbnailUrl.startsWith("http") ? thumbnailUrl : `https://it342-g3-neighbornet.onrender.com${thumbnailUrl}`
  }

  const navigateToProfile = (userId) => {
    if (userId === user?.data?.id) {
      navigate('/profile');
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
  
        const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setUserProfileData(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
  
    if (user?.data) {
      fetchUserProfile();
    }
  }, [user?.data]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/activities/recent", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        setRecentActivities(response.data)
      } catch (error) {
        console.error("Error fetching recent activities:", error)
      }
    }

    fetchRecentActivities()
  }, [navigate])

  useEffect(() => {
    const fetchRecentClasses = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/classes/recent?limit=5", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })


        setRecentClasses(response.data)
      } catch (error) {
        console.error("Error fetching recent classes:", error)
      }
    }

    fetchRecentClasses()
  }, [navigate])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }
  
        const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
  
        const postsWithUniqueKeys = response.data.content.map((post) => ({
          ...post,
          isLiked: post.isLiked || false,
          isEdited: post.isEdited || false,
          comments: (post.comments || []).map(comment => ({
            ...comment,
            clientId: generateUniqueId() 
          }))
        }))
  
        setPosts(postsWithUniqueKeys)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching posts:", error)
        if (error.response?.status === 401) {
          navigate("/login")
        }
      }
    }
  
    fetchPosts()
  }, [navigate])

  const handleEditComment = async (postId, commentId, content) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.put(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/comments/${commentId}`,
        { content: editedCommentContent },
        { headers }
      );
  
      // Reset states and refresh comments
      setEditingCommentId(null);
      setEditedCommentContent('');
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map(c => {
              if (c.id === commentId) {
                return { ...c, content: editedCommentContent };
              }
              return c;
            })
          };
        }
        return p;
      }));
  
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setPosts((prev) => prev.filter((post) => post.id !== postId))
    } catch (error) {
      console.error("Error deleting post:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    }
  }

  const handleStartEdit = (post) => {
    setEditingPostId(post.id)
    setEditedContent(post.content)
  }

  const handleCancelEdit = () => {
    setEditingPostId(null)
    setEditedContent("")
  }

  const handleUpdatePost = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.put(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}`,
        { content: editedContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setPosts((prev) => prev.map((post) => (post.id === postId ? response.data : post)))
      setEditingPostId(null)
      setEditedContent("")
    } catch (error) {
      console.error("Error updating post:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    }
  }

  const handleSharePost = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const shareMessage = prompt("Add a message to your share (optional):")

      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/share`,
        { content: shareMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setPosts((prev) => [response.data, ...prev])
    } catch (error) {
      console.error("Error sharing post:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
      if (error.response?.status === 400) {
        showSimpleNotification("You cannot share your own post", 'error')
      }
    }
  }

  const handleToggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const handleAddComment = async (postId) => {
    if (!newComments[postId]?.trim()) return;
  
    try {
      setIsCommenting((prev) => ({ ...prev, [postId]: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
  
      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/comments`,
        { content: newComments[postId] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const updatedPost = {
        ...response.data,
        comments: response.data.comments.map(comment => ({
          ...comment,
          clientId: generateUniqueId()
        }))
      };
  
      setPosts((prev) => 
        prev.map((post) => post.id === postId ? updatedPost : post)
      );
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsCommenting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/comments/${commentId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setPosts((prev) => prev.map((post) => (post.id === postId ? response.data : post)))
    } catch (error) {
      console.error("Error liking comment:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    }
  }

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setPosts((prev) => prev.map((post) => (post.id === postId ? response.data : post)))
    } catch (error) {
      console.error("Error deleting comment:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""

    let date
    if (Array.isArray(dateString)) {
      date = new Date(
        dateString[0],
        dateString[1] - 1,
        dateString[2],
        dateString[3],
        dateString[4],
        dateString[5],
        dateString[6] / 1000000,
      )
    } else {
      date = new Date(dateString)
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString)
      return "Invalid Date"
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInSeconds < 60) {
      return "Just now"
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
    }
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
    }
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return

    setIsPosting(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const formData = new FormData()
      formData.append("content", newPostContent)
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      const response = await axios.post("https://it342-g3-neighbornet.onrender.com/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setPosts((prev) => [response.data, ...prev])
      setNewPostContent("")
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating post:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    } finally {
      setIsPosting(false)
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const response = await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      setPosts((prev) => prev.map((post) => (post.id === postId ? response.data : post)))
    } catch (error) {
      console.error("Error liking post:", error)
      if (error.response?.status === 401) {
        navigate("/login")
      }
    }
  }

  const getPercentageColor = (value) => {
    if (!value || value === 0) return "text-gray-500";
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-gray-500";
  };
  const formatPercentage = (value) => {
    if (!value || value === 0) return "0%";
    const rounded = Math.round(value * 10) / 10;
    return `${rounded > 0 ? "↑" : rounded < 0 ? "↓" : ""}${Math.abs(rounded)}%`;
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        const data = response.data
        if (!data.changes) {
          data.changes = {
            skillsSharedChange: 0,
            itemsBorrowedChange: 0,
            activeUsersChange: 0,
          }
        }

        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
      <GlobalStyle />
      <div className="floating-elements"></div>
      <div className="floating-elements floating-elements2"></div>
      <div className="floating-elements floating-elements3"></div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/homepage")}
        className="absolute top-4 left-4 z-10 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 
                text-white rounded-full hover:shadow-lg transition-all duration-300 ease-in-out
                font-medium hover:scale-105 flex items-center gap-2"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Homepage
      </motion.button>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
         <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-blue-600">
          Welcome back! <span className="wave" style={{ 
            fontSize: '0.9em', 
            color: '#FFD700',  // Golden color
            textShadow: '0 0 1px rgba(0,0,0,0.3)'  // Adds a subtle shadow
          }}>👋</span>
        </h1>
          <p className="text-indigo-600 mt-2 text-lg">Here's what's happening in your community</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 mx-auto max-w-6xl">
          {/* Skills Shared Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 group hover:translate-y-[-5px]"
          >
           <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className={`${getPercentageColor(skillsSharedPercentage)} text-sm font-medium px-3 py-1 rounded-full bg-opacity-10 ${getPercentageColor(skillsSharedPercentage).replace("text-", "bg-")}`}
            >
              {formatPercentage(skillsSharedPercentage)}
            </span>
          </div>
          <h3 className="text-4xl font-bold mt-4 mb-1 text-blue-700 group-hover:scale-110 transition-transform origin-left">
            {stats.skillsShared}
          </h3>
          <p className="text-blue-600 text-sm font-medium">Skills Shared</p>
        </motion.div>

          {/* Items Borrowed Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-indigo-500 group hover:translate-y-[-5px]"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <span
                className={`${getPercentageColor(itemsBorrowedPercentage)} text-sm font-medium px-3 py-1 rounded-full bg-opacity-10 ${getPercentageColor(itemsBorrowedPercentage).replace("text-", "bg-")}`}
              >
                {formatPercentage(itemsBorrowedPercentage)}
              </span>
            </div>
            <h3 className="text-4xl font-bold mt-4 mb-1 text-indigo-700 group-hover:scale-110 transition-transform origin-left">
              {stats.itemsBorrowed}
            </h3>
            <p className="text-indigo-600 text-sm font-medium">Items Borrowed</p>
          </motion.div>

          {/* Active Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-purple-500 group hover:translate-y-[-5px]"
          >
             <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span
                className={`${getPercentageColor(activeUsersPercentage)} text-sm font-medium px-3 py-1 rounded-full bg-opacity-10 ${getPercentageColor(activeUsersPercentage).replace("text-", "bg-")}`}
              >
                {formatPercentage(activeUsersPercentage)}
              </span>
            </div>
            <h3 className="text-4xl font-bold mt-4 mb-1 text-purple-700 group-hover:scale-110 transition-transform origin-left">
              {stats.activeUsers}
            </h3>
            <p className="text-purple-600 text-sm font-medium">Active Users</p>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-indigo-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Community Feed
                </h2>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors px-3 py-1 rounded-full hover:bg-blue-50">
                  View All
                </button>
              </div>  

              {/* Post Creation */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                <img
                  src={userProfileData?.imageUrl || "/images/defaultProfile.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    if (e.currentTarget.src !== "/images/defaultProfile.png") {
                      e.currentTarget.src = "/images/defaultProfile.png";
                    }
                  }}
                />
                </div>
                <div className="flex-1 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share something with your community..."
                    className="w-full px-4 py-3 bg-white rounded-xl border border-indigo-200 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            placeholder:text-indigo-300 resize-none min-h-[80px]"
                  />
                  {imagePreview && (
                    <div className="relative mt-3 bg-white p-2 rounded-xl border border-indigo-200">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-60 rounded-lg w-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <label className="cursor-pointer shimmer-hover">
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                      <div className="p-2 bg-white rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 border border-indigo-200">
                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm text-indigo-600 font-medium">Add Image</span>
                      </div>
                    </label>
                    <button
                      onClick={handleCreatePost}
                      disabled={isPosting || !newPostContent.trim()}
                      className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                              transition-all font-medium shadow-sm hover:shadow-md
                              ${
                                isPosting || !newPostContent.trim()
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:translate-y-[-2px]"
                              }`}
                    >
                      {isPosting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Posting...
                        </div>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-indigo-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0"
                  >
                    <div className="flex items-start gap-4">
                    <div 
                      onClick={() => navigateToProfile(post.author.id)}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 
                                flex items-center justify-center overflow-hidden flex-shrink-0 
                                border-2 border-white shadow-sm cursor-pointer
                                hover:border-blue-300 transition-all"
                    >
                      <img
                        src={post.author.imageUrl || "/images/defaultProfile.png"}
                        alt={post.author.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                          <h3 
                              onClick={() => navigateToProfile(post.author.id)}
                              className="font-semibold text-indigo-900 cursor-pointer
                                        hover:text-blue-600 transition-colors"
                            >
                              {post.author.username}
                            </h3>
                            {user?.data?.id === post.author.id && (
                              <div className="ml-4 flex items-center gap-2">
                                <button
                                  onClick={() => handleStartEdit(post)}
                                  className="text-indigo-500 hover:text-indigo-600 text-sm flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <span
                            className="text-indigo-400 text-sm bg-indigo-50 px-2 py-1 rounded-full"
                            title={new Date(post.createdAt).toLocaleString()}
                          >
                            {formatDate(post.createdAt)}
                          </span>
                        </div>

                        {/* Decide whether to show shared post or original content */}
                        {post.originalPost ? (
                          // This is a shared post
                          <div className="border-l-4 border-indigo-200 pl-4 mt-3 bg-indigo-50/50 rounded-r-xl p-3">
                            <div className="text-sm text-indigo-600 mb-2 font-medium flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              <span 
                                onClick={() => navigateToProfile(post.sharedBy.id)}
                                className="cursor-pointer hover:text-blue-600 transition-colors"
                              >
                                {post.sharedBy.username}
                              </span>
                              {" shared this post"}
                            </div>
                            {post.content && (
                              <p className="text-indigo-800 mb-4 bg-white p-3 rounded-xl border border-indigo-100">
                                {post.content}
                              </p>
                            )}
                            <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                              <img
                                  onClick={() => navigateToProfile(post.originalPost.author.id)}
                                  src={post.originalPost.author.imageUrl || "/images/defaultProfile.png"}
                                  alt={post.originalPost.author.username}
                                  className="w-8 h-8 rounded-full border border-indigo-200 cursor-pointer
                                            hover:border-blue-300 transition-all"
                                />
                                <div>
                                <div 
                                  onClick={() => navigateToProfile(post.originalPost.author.id)}
                                  className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                  {post.originalPost.author.username}
                                </div>
                                </div>
                              </div>
                              <p className="text-indigo-800">{post.originalPost.content}</p>
                              {post.originalPost.imageUrl && (
                                <img
                                  src={post.originalPost.imageUrl || "/placeholder.svg"}
                                  alt="Original post content"
                                  className="mt-3 rounded-xl w-full object-cover max-h-96 border border-indigo-100"
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          // Original post content
                          <>
                            {editingPostId === post.id ? (
                              <div className="mt-3">
                                <textarea
                                  value={editedContent}
                                  onChange={(e) => setEditedContent(e.target.value)}
                                  className="w-full px-4 py-3 bg-white rounded-xl border border-indigo-200 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                          resize-none min-h-[100px]"
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePost(post.id)}
                                    disabled={!editedContent.trim()}
                                    className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-colors
                                            ${!editedContent.trim() ? "opacity-50 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"}`}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-indigo-800 mt-3 bg-white p-4 rounded-xl border border-indigo-100">
                                  {post.content}
                                  {post.isEdited && (
                                    <span className="text-xs text-indigo-400 ml-2 italic">(edited)</span>
                                  )}
                                </p>
                                {post.imageUrl && (
                                  <img
                                    src={post.imageUrl || "/placeholder.svg"}
                                    alt="Post content"
                                    className="mt-3 rounded-xl w-full object-cover max-h-96 border border-indigo-100 shadow-sm"
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Post actions */}
                        <div className="flex items-center gap-6 mt-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 transition-colors rounded-full px-3 py-1.5
                                      ${
                                        post.isLiked
                                          ? "text-red-600 bg-red-50"
                                          : "text-indigo-500 hover:text-red-600 hover:bg-red-50"
                                      }`}
                          >
                            <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                            <span className="font-medium">{post.likesCount}</span>
                          </button>
                          <button
                            onClick={() => handleToggleComments(post.id)}
                            className={`flex items-center gap-2 transition-colors rounded-full px-3 py-1.5
                                      ${
                                        showComments[post.id]
                                          ? "text-blue-600 bg-blue-50"
                                          : "text-indigo-500 hover:text-blue-600 hover:bg-blue-50"
                                      }`}
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span className="font-medium">{post.commentsCount}</span>
                          </button>
                          <button
                            onClick={() => handleSharePost(post.id)}
                            className={`flex items-center gap-2 transition-colors rounded-full px-3 py-1.5
                                      ${
                                        post.isShared
                                          ? "text-green-600 bg-green-50"
                                          : "text-indigo-500 hover:text-green-600 hover:bg-green-50"
                                      }`}
                          >
                            <Share2 className={`w-5 h-5 ${post.isShared ? "fill-current" : ""}`} />
                            <span className="font-medium">{post.sharesCount}</span>
                          </button>
                        </div>

                        {/* Comments section */}
                        <AnimatePresence>
                          {showComments[post.id] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 space-y-4 overflow-hidden"
                            >
                              {/* Add comment input */}
                              <div className="flex gap-3">
                                <img
                                  src={userProfileData?.imageUrl || "/images/defaultProfile.png"}
                                  alt="Profile"
                                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100"
                                />
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    value={newComments[post.id] || ""}
                                    onChange={(e) =>
                                      setNewComments((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Write a comment..."
                                    className="flex-1 px-4 py-2 bg-white rounded-xl border border-indigo-200 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={isCommenting[post.id] || !newComments[post.id]?.trim()}
                                    className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl transition-colors
                                            ${
                                              isCommenting[post.id] || !newComments[post.id]?.trim()
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:from-blue-700 hover:to-indigo-700"
                                            }`}
                                  >
                                    {isCommenting[post.id] ? "Posting..." : "Post"}
                                  </button>
                                </div>
                              </div>

                              {/* Comments list */}
                              {post.comments.map((comment, idx) => (
                                <motion.div
                                  key={comment.clientId || `comment-${generateUniqueId()}`}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex gap-3"
                                >
                                   <img
                                      onClick={() => navigateToProfile(comment.author.id)}
                                      src={comment.author.imageUrl || "/images/defaultProfile.png"}
                                      alt={comment.author.username}
                                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100
                                                cursor-pointer hover:border-blue-300 transition-all"
                                    />
                                  <div className="flex-1">
                                    <div className="bg-indigo-50 rounded-xl px-4 py-3">
                                      <div className="flex justify-between items-start">
                                      <span 
                                          onClick={() => navigateToProfile(comment.author.id)}
                                          className="font-medium text-indigo-900 cursor-pointer
                                                  hover:text-blue-600 transition-colors"
                                        >
                                          {comment.author.username}
                                        </span>
                                        <span
                                          className="text-xs text-indigo-400 bg-white px-2 py-0.5 rounded-full"
                                          title={new Date(comment.createdAt).toLocaleString()}
                                        >
                                          {formatDate(comment.createdAt)}
                                        </span>
                                      </div>
                                      {editingCommentId === comment.id ? (
                                        <div className="mt-2">
                                          <input
                                            type="text"
                                            value={editedCommentContent}
                                            onChange={(e) => setEditedCommentContent(e.target.value)}
                                            className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          />
                                          <div className="flex justify-end gap-2 mt-2">
                                            <button
                                              onClick={() => {
                                                setEditingCommentId(null);
                                                setEditedCommentContent('');
                                              }}
                                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() => handleEditComment(post.id, comment.id)}
                                              className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-indigo-800 mt-1">{comment.content}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                      <button
                                        onClick={() => handleLikeComment(post.id, comment.id)}
                                        className={`flex items-center gap-1 transition-colors
                                          ${comment.isLiked ? "text-red-600" : "text-indigo-500 hover:text-red-600"}`}
                                      >
                                        <Heart className={`w-4 h-4 ${comment.isLiked ? "fill-current" : ""}`} />
                                        <span>{comment.likesCount}</span>
                                      </button>
                                      {user?.data?.id === comment.author.id && (
                                        <>
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(comment.id);
                                              setEditedCommentContent(comment.content);
                                            }}
                                            className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-purple-100"
            >
              <h2 className="text-xl font-bold mb-6 text-purple-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Recent Classes
              </h2>
              <div className="space-y-4">
                {recentClasses.map((classItem) => (
                  <motion.div
                    key={classItem.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
                    onClick={() => navigate(`/class/${classItem.id}`)}
                  >
                    <div className="w-14 h-14 rounded-xl bg-purple-100 overflow-hidden shadow-sm">
                      {classItem.thumbnailUrl ? (
                        <img
                          src={getFullThumbnailUrl(classItem.thumbnailUrl) || "/placeholder.svg"}
                          alt={classItem.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 line-clamp-1">{classItem.title}</h3>
                      <p className="text-sm text-purple-700">by {classItem.creator.username}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {formatDate(classItem.createdAt)}
                        </span>
                        <span className="text-purple-400">•</span>
                        <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {classItem.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => navigate("/homepage")}
                className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white 
                          rounded-xl hover:shadow-md transition-all duration-300 text-sm font-medium hover:translate-y-[-2px]"
              >
                View All Classes
              </button>
            </motion.div>

            {/* Recent Activities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-blue-100"
            >
              <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Recent Activities
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                                  ${activity.type === "class" ? "bg-gradient-to-br from-purple-500 to-indigo-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}
                    >
                      {activity.type === "class" ? (
                        activity.thumbnailUrl ? (
                          <img
                            src={getFullThumbnailUrl(activity.thumbnailUrl) || "/placeholder.svg"}
                            alt={activity.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-white" />
                        )
                      ) : (
                        <Calendar className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-blue-900 line-clamp-2">
                        <span className="font-semibold">{activity.user.username}</span> {activity.action}{" "}
                        <span className="font-semibold">{activity.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                          {formatDate(activity.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-xs text-blue-500">{activity.engagement.likes}</span>
                          <MessageSquare className="w-4 h-4 text-blue-400 ml-2" />
                          <span className="text-xs text-blue-500">{activity.engagement.comments}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
          .wave {
            animation-name: wave-animation;
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
            transform-origin: 70% 70%;
            display: inline-block;
          }
          
          @keyframes wave-animation {
            0% { transform: rotate( 0.0deg) }
            10% { transform: rotate(14.0deg) }
            20% { transform: rotate(-8.0deg) }
            30% { transform: rotate(14.0deg) }
            40% { transform: rotate(-4.0deg) }
            50% { transform: rotate(10.0deg) }
            60% { transform: rotate( 0.0deg) }
            100% { transform: rotate( 0.0deg) }
          }
        `
      }} />
    </div>
  )
}

export default Dashboard

