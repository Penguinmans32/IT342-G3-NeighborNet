import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Heart,
  Users,
  Search,
  Clock,
  Trash2,
  X,
  MoreVertical
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function PostsView() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalEngagements: 0,
    recentPosts: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchPosts();
  }, [search]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/admin/posts/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/admin/posts`, {
        params: { search },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(response.data.data.content);
      setLoading(false);
      console.log('Posts fetched:', response.data.data.content);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setShowDeleteModal(true);
  };

  const deletePost = async () => {
    try {
      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/admin/posts/${selectedPost.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowDeleteModal(false);
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const statsItems = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      icon: MessageSquare,
      color: "blue"
    },
    {
      title: "Total Engagements",
      value: stats.totalEngagements,
      icon: Heart,
      color: "red"
    },
    {
      title: "Recent Posts (24h)",
      value: stats.recentPosts,
      icon: Clock,
      color: "green"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      color: "purple"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsItems.map((stat, index) => {
            const Icon = stat.icon;
            // Define specific background colors for each stat
            const bgColorClass = 
              stat.color === "blue" ? "bg-gradient-to-br from-blue-500 to-blue-600" :
              stat.color === "red" ? "bg-gradient-to-br from-red-500 to-red-600" :
              stat.color === "green" ? "bg-gradient-to-br from-green-500 to-green-600" :
              "bg-gradient-to-br from-purple-500 to-purple-600";

            // Define specific text colors for each stat
            const textColorClass = 
              stat.color === "blue" ? "text-blue-100" :
              stat.color === "red" ? "text-red-100" :
              stat.color === "green" ? "text-green-100" :
              "text-purple-100";

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${bgColorClass} rounded-xl p-6 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={textColorClass}>{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <Icon className={`w-8 h-8 ${textColorClass}`} />
                </div>
              </motion.div>
            );
          })}
        </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={post.author.imageUrl || `https://ui-avatars.com/api/?name=${post.author.username}&background=random`}
                    alt={post.author.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{post.author.username}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{format(new Date(post.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      {post.author.bio && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">{post.author.bio}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClick(post)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Post Content */}
              <div className="mt-4">
                <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="mt-4 rounded-lg w-full"
                  />
                )}
              </div>

              {/* Post Stats */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>{post.likesCount || 0} likes</span>
                  <span>{post.sharesCount || 0} shares</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Post</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}