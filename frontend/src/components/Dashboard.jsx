import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, BookOpen, Calendar, Heart, Share2, MessageSquare, HandshakeIcon, ImageIcon } from "lucide-react"
import axios from "axios"
import Footer from './SplashScreen/Footer';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../backendApi/AuthContext";
import { createGlobalStyle } from "styled-components";

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
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [comments, setComments] = useState({}); 
  const [newComments, setNewComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [isCommenting, setIsCommenting] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
  
        const response = await axios.get("http://localhost:8080/api/posts", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const postsWithLikeStatus = response.data.content.map(post => ({
          ...post,
          isLiked: post.isLiked || false,
          isEdited: post.isEdited || false,
        }));
  
        setPosts(postsWithLikeStatus);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };
  
    fetchPosts();
  }, [navigate]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      await axios.delete(
        `http://localhost:8080/api/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditedContent(post.content);
  };
  
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedContent('');
  };
  
  const handleUpdatePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        { content: editedContent },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? response.data : post
        )
      );
      setEditingPostId(null);
      setEditedContent('');
    } catch (error) {
      console.error("Error updating post:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const shareMessage = prompt('Add a message to your share (optional):');
      
      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/share`,
        { content: shareMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setPosts(prev => [response.data, ...prev]);
    } catch (error) {
      console.error("Error sharing post:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      if (error.response?.status === 400) {
        alert("You cannot share your own post");
      }
    }
  };

  const handleToggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleAddComment = async (postId) => {
    if (!newComments[postId]?.trim()) return;
  
    try {
      setIsCommenting(prev => ({ ...prev, [postId]: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/comments`,
        { content: newComments[postId] },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? response.data : post
        )
      );
      setNewComments(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/comments/${commentId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? response.data : post
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  
  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await axios.delete(
        `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? response.data : post
        )
      );
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';

    let date;
    if (Array.isArray(dateString)) {
      date = new Date(
        dateString[0], 
        dateString[1] - 1,
        dateString[2],    
        dateString[3],    
        dateString[4],    
        dateString[5], 
        dateString[6] / 1000000 
      );
    } else {
      date = new Date(dateString);
    }
  
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid Date';
    }
  
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) return;
    
    setIsPosting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('content', newPostContent);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await axios.post(
        "http://localhost:8080/api/posts",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setPosts(prev => [response.data, ...prev]);
      setNewPostContent('');
      setSelectedImage(null);
    } catch (error) {
      console.error("Error creating post:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? response.data
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-indigo-50/30">
      <GlobalStyle />
       <button
          onClick={() => navigate('/homepage')}
          className="absolute top-4 left-4 z-10 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 
                  text-white rounded-lg hover:shadow-lg transition-all duration-300 ease-in-out
                  font-medium hover:scale-105"
        >
          Homepage
      </button>
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
                  <img
                    src={user?.imageUrl || "/images/defaultProfile.png"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share something with your community..."
                    className="w-full px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {imagePreview && (
                    <div className="relative mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="p-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors">
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                  </label>
                  <button
                    onClick={handleCreatePost}
                    disabled={isPosting || !newPostContent.trim()}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-lg
                              transition-colors font-medium shadow-sm hover:shadow
                              ${(isPosting || !newPostContent.trim()) 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-blue-700'}`}
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>

              {/* Posts */}
                {posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-indigo-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={post.author.imageUrl || "/images/defaultProfile.png"}
                        alt={post.author.username}
                        className="w-10 h-10 rounded-full border-2 border-indigo-200"
                      />
                      <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className="font-medium text-indigo-900">{post.author.username}</h3>
                          {user?.id === post.author.id && (
                            <div className="ml-4 flex items-center gap-2">
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="text-indigo-500 hover:text-indigo-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-indigo-400 text-sm" title={new Date(post.createdAt).toLocaleString()}>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                        
                        {/* Decide whether to show shared post or original content */}
                        {post.originalPost ? (
                          // This is a shared post
                          <div className="border-l-4 border-indigo-200 pl-4 mt-2">
                            <div className="text-sm text-indigo-600 mb-2">
                              {post.sharedBy.username} shared this post
                            </div>
                            {post.content && (
                              <p className="text-indigo-800 mb-4">{post.content}</p>
                            )}
                            <div className="bg-indigo-50 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <img
                                  src={post.originalPost.author.imageUrl || "/images/defaultProfile.png"}
                                  alt={post.originalPost.author.username}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div>
                                  <div className="font-medium">{post.originalPost.author.username}</div>
                                  <div className="text-xs text-indigo-400">
                                    {formatDate(post.originalPost.createdAt)}
                                  </div>
                                </div>
                              </div>
                              <p className="text-indigo-800">{post.originalPost.content}</p>
                              {post.originalPost.imageUrl && (
                                <img
                                  src={post.originalPost.imageUrl}
                                  alt="Original post content"
                                  className="mt-2 rounded-lg w-full object-cover max-h-96"
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          // Original post content
                          <>
                          {editingPostId === post.id ? (
                            <div className="mt-2">
                              <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200 
                                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-indigo-600 hover:text-indigo-700"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdatePost(post.id)}
                                  disabled={!editedContent.trim()}
                                  className={`px-4 py-1 bg-blue-600 text-white rounded-lg transition-colors
                                            ${!editedContent.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-indigo-800 mt-2">
                                {post.content}
                                {post.isEdited && (
                                  <span className="text-xs text-indigo-400 ml-2">(edited)</span>
                                )}
                              </p>
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt="Post content"
                                  className="mt-4 rounded-xl w-full object-cover max-h-96 border border-indigo-100"
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
                            className={`flex items-center gap-2 transition-colors
                                      ${post.isLiked 
                                        ? 'text-blue-600' 
                                        : 'text-indigo-500 hover:text-blue-600'}`}
                          >
                            <Heart 
                              className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} 
                            />
                            <span>{post.likesCount}</span>
                          </button>
                          <button 
                            onClick={() => handleToggleComments(post.id)}
                            className="flex items-center gap-2 text-indigo-500 hover:text-blue-600 transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>{post.commentsCount}</span>
                          </button>
                          <button 
                            onClick={() => handleSharePost(post.id)}
                            className={`flex items-center gap-2 transition-colors
                                      ${post.isShared 
                                        ? 'text-blue-600' 
                                        : 'text-indigo-500 hover:text-blue-600'}`}
                          >
                            <Share2 className={`w-5 h-5 ${post.isShared ? 'fill-current' : ''}`} />
                            <span>{post.sharesCount}</span>
                          </button>
                        </div>

                        {/* Comments section */}
                        {showComments[post.id] && (
                          <div className="mt-4 space-y-4">
                            {/* Add comment input */}
                            <div className="flex gap-3">
                              <img
                                src={user?.imageUrl || "/images/defaultProfile.png"}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={newComments[post.id] || ''}
                                  onChange={(e) => setNewComments(prev => ({
                                    ...prev,
                                    [post.id]: e.target.value
                                  }))}
                                  placeholder="Write a comment..."
                                  className="flex-1 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200 
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={isCommenting[post.id] || !newComments[post.id]?.trim()}
                                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors
                                            ${(isCommenting[post.id] || !newComments[post.id]?.trim()) 
                                              ? 'opacity-50 cursor-not-allowed' 
                                              : 'hover:bg-blue-700'}`}
                                >
                                  {isCommenting[post.id] ? 'Posting...' : 'Post'}
                                </button>
                              </div>
                            </div>

                            {/* Comments list */}
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <img
                                  src={comment.author.imageUrl || "/images/defaultProfile.png"}
                                  alt={comment.author.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="bg-indigo-50 rounded-lg px-4 py-3">
                                    <div className="flex justify-between items-start">
                                      <span className="font-medium text-indigo-900">
                                        {comment.author.username}
                                      </span>
                                      <span className="text-xs text-indigo-400" title={new Date(comment.createdAt).toLocaleString()}>
                                        {formatDate(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-indigo-800 mt-1">{comment.content}</p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <button
                                      onClick={() => handleLikeComment(post.id, comment.id)}
                                      className={`flex items-center gap-1 transition-colors
                                                ${comment.isLiked 
                                                  ? 'text-blue-600' 
                                                  : 'text-indigo-500 hover:text-blue-600'}`}
                                    >
                                      <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                                      <span>{comment.likesCount}</span>
                                    </button>
                                    {(user?.id === comment.author.id || user?.id === post.author.id) && (
                                      <button
                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                        className="text-red-500 hover:text-red-600 transition-colors"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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