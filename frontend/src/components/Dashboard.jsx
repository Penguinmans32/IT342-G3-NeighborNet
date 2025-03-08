import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen,Star,
  TrendingUp, MessageCircle, HandshakeIcon, Calendar,
  Bell, ChevronRight, BarChart2, Activity,
  Heart, Share2, MessageSquare, Bookmark
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const [stats, setStats] = useState({
    skillsShared: 0,
    itemsBorrowed: 0,
    activeUsers: 0,
    changes: {
      skillsSharedChange: 0,
      itemsBorrowedChange: 0,
      activeUsersChange: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const getPercentageColor = (value) => {
    if (!value) return 'text-gray-500';
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };
  
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0%';
    const rounded = Math.round(value * 10) / 10;
    return `${rounded > 0 ? '↑' : rounded < 0 ? '↓' : ''}${Math.abs(rounded)}%`;
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/dashboard/stats', {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Ensure the response data has the correct structure
        const data = response.data;
        if (!data.changes) {
          data.changes = {
            skillsSharedChange: 0,
            itemsBorrowedChange: 0,
            activeUsersChange: 0
          };
        }
        
        setStats(data);
        console.log('Dashboard stats:', data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set default values on error
        setStats({
          skillsShared: 0,
          itemsBorrowed: 0,
          activeUsers: 0,
          changes: {
            skillsSharedChange: 0,
            itemsBorrowedChange: 0,
            activeUsersChange: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardStats();
  }, []);

  const recentActivities = [
    {
      type: "skill",
      user: "Sarah Chen",
      action: "shared a new skill",
      title: "Advanced Photography Tips",
      time: "2 hours ago",
      engagement: { likes: 12, comments: 5 }
    },
    {
      type: "borrow",
      user: "Mike Johnson",
      action: "borrowed",
      title: "Professional Camera Kit",
      time: "3 hours ago",
      engagement: { likes: 8, comments: 3 }
    },
    // Add more activities...
  ];

  const upcomingSessions = [
    {
      title: "Guitar Basics Workshop",
      instructor: "John Doe",
      date: "Tomorrow, 3:00 PM",
      participants: 5
    },
    {
      title: "Cooking Class: Italian Cuisine",
      instructor: "Maria Garcia",
      date: "Mar 10, 5:30 PM",
      participants: 8
    },
    // Add more sessions...
  ];

  const communityPosts = [
    {
      id: 1,
      author: {
        name: "Alex Rivera",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      },
      content: "Just finished teaching my first photography class! Thanks everyone for joining! 📸",
      image: "https://source.unsplash.com/random/800x600/?photography",
      likes: 24,
      comments: 8,
      shares: 3,
      time: "1 hour ago"
    },
    // Add more posts...
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-gray-900">
            Welcome back, ey! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your community
          </p>
        </div>

       {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mx-auto max-w-6xl">
        {/* Skills Shared Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`${getPercentageColor(stats?.changes?.skillsSharedChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.skillsSharedChange).replace('text-', 'bg-')}`}>
                {formatPercentage(stats?.changes?.skillsSharedChange)}
            </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1">{stats.skillsShared}</h3>
            <p className="text-gray-600 text-sm">Skills Shared</p>
        </motion.div>

        {/* Items Borrowed Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
            <div className="p-2 bg-green-50 rounded-lg">
                <HandshakeIcon className="w-6 h-6 text-green-600" />
            </div>
            <span className={`${getPercentageColor(stats?.changes?.itemsBorrowedChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.itemsBorrowedChange).replace('text-', 'bg-')}`}>
                {formatPercentage(stats?.changes?.itemsBorrowedChange)}
            </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1">{stats.itemsBorrowed}</h3>
            <p className="text-gray-600 text-sm">Items Borrowed</p>
        </motion.div>

        {/* Active Users Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`${getPercentageColor(stats?.changes?.activeUsersChange)} text-sm font-medium px-2 py-1 rounded-full bg-opacity-10 ${getPercentageColor(stats?.changes?.activeUsersChange).replace('text-', 'bg-')}`}>
                {formatPercentage(stats?.changes?.activeUsersChange)}
            </span>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1">{stats.activeUsers}</h3>
            <p className="text-gray-600 text-sm">Active Users</p>
        </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Community Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Community Feed</h2>
                <button className="text-blue-600 text-sm font-medium">
                  View All
                </button>
              </div>

              {/* Post Creation */}
              <div className="flex items-center gap-4 mb-8">
                <img
                  alt="Your avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Share something with your community..."
                    className="w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 transition-colors font-medium">
                  Post
                </button>
              </div>

              {/* Posts */}
              {communityPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-100 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{post.author.name}</h3>
                        <span className="text-gray-500 text-sm">{post.time}</span>
                      </div>
                      <p className="text-gray-600 mt-2">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post content"
                          className="mt-4 rounded-xl w-full object-cover max-h-96"
                        />
                      )}
                      <div className="flex items-center gap-6 mt-4">
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                          <Heart className="w-5 h-5" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                          <MessageSquare className="w-5 h-5" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Upcoming Sessions</h2>
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{session.title}</h3>
                      <p className="text-sm text-gray-500">by {session.instructor}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <span className="text-gray-600">{session.date}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">{session.participants} participants</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 
                               rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                View All Sessions
              </button>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center
                                  ${activity.type === 'skill' ? 'bg-purple-50' : 'bg-green-50'}`}>
                      {activity.type === 'skill' ? (
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      ) : (
                        <HandshakeIcon className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.title}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.time}</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {activity.engagement.likes}
                          </span>
                          <MessageSquare className="w-4 h-4 text-gray-400 ml-2" />
                          <span className="text-xs text-gray-500">
                            {activity.engagement.comments}
                          </span>
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
    </div>
  );
};

export default Dashboard;