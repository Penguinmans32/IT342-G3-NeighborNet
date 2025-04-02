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
} from "lucide-react"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../backendApi/AuthContext";
import DashboardView from "./DashboardView"
import UsersView from "./UsersView"
import ClassesView from "./ClassesView"
import ItemsView from "./ItemsView"
import PostsView from "./PostsView"
import SettingsView from "./SettingsView"

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

  const renderMenuContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardView activityItems={activityItems} />;
      case "users":
        return <UsersView />;
      case "classes":
        return <ClassesView />;
      case "items":
        return <ItemsView />;
      case "posts":
        return <PostsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView activityItems={activityItems} />;
    }
  };

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
            </div>
            <div className="flex items-center gap-4">
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
              {renderMenuContent()}
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

