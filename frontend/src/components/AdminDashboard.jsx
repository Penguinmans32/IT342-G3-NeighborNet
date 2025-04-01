import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  GraduationCap,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  LogOut,
  Activity,
  BookOpen,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../backendApi/AuthContext";

export default function AdminDashboard() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
    { id: "classes", label: "User Classes", icon: <GraduationCap className="w-5 h-5" /> },
    { id: "items", label: "User Items", icon: <Package className="w-5 h-5" /> },
    { id: "posts", label: "User Posts", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ]

  const activityItems = [
    {
      icon: <User className="w-5 h-5 text-blue-600" />,
      title: "New user registered",
      time: "2 minutes ago",
      bgColor: "bg-blue-100",
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-green-600" />,
      title: "New post created",
      time: "15 minutes ago",
      bgColor: "bg-green-100",
    },
    {
      icon: <GraduationCap className="w-5 h-5 text-purple-600" />,
      title: "Class enrollment completed",
      time: "1 hour ago",
      bgColor: "bg-purple-100",
    },
    {
      icon: <Activity className="w-5 h-5 text-red-600" />,
      title: "System update completed",
      time: "3 hours ago",
      bgColor: "bg-red-100",
    },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarCollapsed ? "5rem" : "16rem" }}
        className="relative bg-white border-r border-gray-200 flex flex-col z-10"
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-center">
          <motion.h1
            initial={false}
            animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
            className="text-xl font-bold text-blue-600"
          >
            {!isSidebarCollapsed && "Admin Panel"}
          </motion.h1>
          {isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </motion.div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-12 bg-white border border-gray-200 rounded-full p-1.5 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeMenu === item.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon}
              <motion.span
                initial={false}
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : "auto",
                  display: isSidebarCollapsed ? "none" : "block",
                }}
                className="font-medium"
              >
                {!isSidebarCollapsed && item.label}
              </motion.span>
              {activeMenu === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className={`${isSidebarCollapsed ? "ml-0" : "ml-auto"} h-2 w-2 rounded-full bg-blue-600`}
                />
              )}
            </motion.button>
          ))}
        </nav>

       {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <motion.div
            className="flex items-center gap-3"
            initial={false}
            animate={{ justifyContent: isSidebarCollapsed ? "center" : "flex-start" }}
          >
            <div className="relative">
              <img
                src="/images/defaultProfile.png"
                alt={user?.username || "Admin"}
                className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={false}
                animate={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  width: isSidebarCollapsed ? 0 : "auto",
                  display: isSidebarCollapsed ? "none" : "block",
                }}
              >
                <h3 className="font-medium text-gray-800">
                  {user?.username || "Admin"}
                </h3>
                <p className="text-sm text-gray-500">
                  {user?.email || "admin@neighbornet.com"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <button 
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors" 
                aria-label="User profile"
              >
                <User className="w-6 h-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors" 
                aria-label="Log out"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 overflow-auto h-[calc(100vh-4.5rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                  {menuItems.find((item) => item.id === activeMenu)?.label || "Dashboard"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Today:</span>
                  <span className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
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
                    <span className="text-3xl font-bold text-blue-600">1,234</span>
                    <span className="text-sm text-green-500 mb-1 flex items-center">
                      <ChevronRight className="w-4 h-4 rotate-90" /> 12% this week
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
                    <span className="text-3xl font-bold text-purple-600">56</span>
                    <span className="text-sm text-green-500 mb-1 flex items-center">
                      <ChevronRight className="w-4 h-4 rotate-90" /> 3 new today
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
                    <span className="text-3xl font-bold text-green-600">892</span>
                    <span className="text-sm text-green-500 mb-1 flex items-center">
                      <ChevronRight className="w-4 h-4 rotate-90" /> 45 this week
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Revenue</h3>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-amber-600">$24.5k</span>
                    <span className="text-sm text-green-500 mb-1 flex items-center">
                      <ChevronRight className="w-4 h-4 rotate-90" /> 18% this month
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Charts and Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">User Growth</h2>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                        Weekly
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                        Monthly
                      </button>
                      <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded-md transition-colors">
                        Yearly
                      </button>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would appear here</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
                      <button className="text-sm text-blue-600 hover:underline">View all</button>
                    </div>
                    <div className="space-y-4">
                      {activityItems.map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center`}>
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar and Tasks Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Calendar</h2>
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium">April 2025</span>
                      <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Placeholder */}
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Calendar would appear here</p>
                    </div>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                      <button className="text-sm text-blue-600 hover:underline">Add New</button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { title: "Review new user applications", completed: true },
                        { title: "Prepare monthly report", completed: false },
                        { title: "Update user documentation", completed: false },
                        { title: "Schedule team meeting", completed: false },
                      ].map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            readOnly
                          />
                          <span className={`${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>


      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-sm mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

