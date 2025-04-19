import { motion } from "framer-motion";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Package, 
  ChevronRight, 
  BarChart3,
  MessageCircle,
  User
} from "lucide-react";
import Calendar from "./Calendar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DashboardView() {
  const [dashboardData, setDashboardData] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchGrowthData(timeframe);
  }, [timeframe]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/admin/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const taskRequest = {
        title: newTaskTitle,
        description: "", 
        dueDate: null 
      };

      console.log('Request payload:', JSON.stringify(taskRequest));
  
      await axios.post('https://it342-g3-neighbornet.onrender.com/api/admin/tasks', 
        taskRequest,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setNewTaskTitle('');
      setShowNewTaskModal(false);
      fetchTasks();
    } catch (error) {
      console.error('Error response:', error.response?.data);
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (taskId) => {
    try {
      await axios.put(`https://it342-g3-neighbornet.onrender.com/api/admin/tasks/${taskId}/toggle`, null, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const fetchGrowthData = async (selectedTimeframe) => {
    try {
      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/admin/dashboard/growth/${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setGrowthData(response.data.data);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'USER':
        return <User className="w-5 h-5 text-blue-600" />;
      case 'POST':
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case 'ITEM':
        return <Package className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case 'USER':
        return 'bg-blue-100';
      case 'POST':
        return 'bg-green-100';
      case 'ITEM':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-blue-600">
              {dashboardData?.totalUsers || 0}
            </span>
            <span className="text-sm text-green-500 mb-1 flex items-center">
              <ChevronRight className="w-4 h-4 rotate-90" />
              {dashboardData?.userGrowth?.growthPercentage?.toFixed(1)}% this week
            </span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Active Classes</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-purple-600">
              {dashboardData?.activeClasses || 0}
            </span>
            <span className="text-sm text-green-500 mb-1 flex items-center">
              <ChevronRight className="w-4 h-4 rotate-90" /> Active now
            </span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Posts</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-green-600">
              {dashboardData?.totalPosts || 0}
            </span>
            <span className="text-sm text-green-500 mb-1 flex items-center">
              <ChevronRight className="w-4 h-4 rotate-90" /> Total posts
            </span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
          whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Items</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-600">
              {dashboardData?.totalItems || 0}
            </span>
            <span className="text-sm text-green-500 mb-1 flex items-center">
              <ChevronRight className="w-4 h-4 rotate-90" /> Total items
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
       <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">User Growth</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === 'weekly'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === 'monthly'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('yearly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeframe === 'yearly'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="h-[500px] w-full"> {/* Changed height from h-64 to h-[400px] */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '1rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Users"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 6, fill: '#3b82f6' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {dashboardData?.recentActivity?.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div className={`w-10 h-10 ${getActivityBgColor(item.type)} rounded-full flex items-center justify-center`}>
                    {getActivityIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.time).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Calendar />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
              <button 
                onClick={() => setShowNewTaskModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Add New
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span
                    className={`${
                      task.completed ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showNewTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="w-full px-3 py-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}