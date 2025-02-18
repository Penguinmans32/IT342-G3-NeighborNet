import { useState, useEffect } from "react";
import { useAuth } from "../backendApi/AuthContext";
import { MdMenu, MdAccountCircle, MdDashboard, MdSchool, MdSwapHoriz, MdChat, MdPeople, MdAdd, MdLibraryBooks, MdLogout, MdSearch } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const location = useLocation();
  const isProfilePage = location.pathname === "/profile";

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleProfilePictureUpdate = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUpdating(true);
    try {
      const response = await axios.put(
        "http://localhost:8080/api/users/profile/picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      setProfileData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#fff",
    },
    content: {
      backgroundColor: "#fff",
      margin: "20px",
      borderRadius: "8px",
      padding: "20px",
      display: "flex",
    },
    profileSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: "20px",
      marginLeft: "20px",
    },
    avatar: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      backgroundColor: "#ddd",
      marginBottom: "15px",
    },
    name: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "5px",
      color: "#333",
    },
    bio: {
      color: "#666",
      marginBottom: "10px",
      fontSize: "0.9rem",
    },
    editButton: {
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      color: "#fff",
      border: "none",
      padding: "8px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      marginBottom: "20px",
    },
    tabs: {
      display: "flex",
      borderBottom: "1px solid #eee",
      marginBottom: "20px",
    },
    tab: {
      padding: "10px 20px",
      cursor: "pointer",
      color: "#666",
      borderBottom: "2px solid transparent",
    },
    activeTab: {
      borderBottom: "2px solid #8b5cf6",
      color: "#8b5cf6",
    },
    section: {
      marginBottom: "20px",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#333",
    },
    statsContainer: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
    },
    stat: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    statLabel: {
      color: "#333",
      fontWeight: "bold",
    },
    statValue: {
      color: "#666",
    },
    linkButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: "transparent",
      cursor: "pointer",
      color: "#333",
      marginBottom: "20px",
    },
    progressNote: {
      fontSize: "0.8rem",
      color: "#666",
      fontStyle: "italic",
    },
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div style={styles.container}>
       <header className="sticky top-0 z-50 w-full">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95 overflow-hidden">
            {/* Floating Elements */}
            <div className="absolute inset-0">
              <div className="floating-elements"></div>
              <div className="floating-elements floating-elements2"></div>
              <div className="floating-elements floating-elements3"></div>
            </div>
          </div>

          {/* Main Header Content */}
          <div className="relative z-10 backdrop-blur-sm transition-all duration-300">
            <div className="container mx-auto">
              <div className="flex h-16 items-center justify-between px-4 relative">
                {/* Mobile Menu Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
                  </motion.div>
                </motion.button>

                {/* Logo Section */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => navigate('/homepage')}
                >
                  <motion.div
                    whileHover={{ rotate: 12 }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 shadow-md"
                  >
                    <span className="text-xl font-bold text-blue-600">N</span>
                  </motion.div>
                  <motion.span
                    className="text-xl font-semibold text-white hidden sm:block"
                    whileHover={{ scale: 1.05 }}
                  >
                    Neighbor Net
                  </motion.span>
                </motion.div>

                {/* Search Bar */}
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
                      className="w-full h-10 pl-10 pr-12 rounded-full border-2 border-transparent 
                                bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 
                                focus:ring-purple-400 transition-all shadow-lg hover:bg-white"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                  bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500
                                  opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                      ⌘ K
                    </span>
                  </div>
                </motion.div>

                {/* Profile Section */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4"
                >
                  {!user ? (
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="hidden sm:inline-flex text-white hover:bg-white/10 px-6 py-2.5 
                                  rounded-lg transition-colors shimmer-hover relative overflow-hidden"
                      >
                        Sign In
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-8 py-2.5 bg-white text-blue-600 rounded-full 
                                  overflow-hidden group hover:shadow-xl transition-all duration-300"
                      >
                        <span className="relative z-10">Sign Up</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                        />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                  <span className="text-white hidden lg:block">{user.username}</span>
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

        {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 shadow-lg"
            >
              <div className="p-4">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="search"
                    placeholder="Search Classes, Teachers..."
                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <nav className="py-2">
                {[
                  { icon: <MdDashboard />, label: "Dashboard", path: "/dashboard" },
                  { icon: <MdSchool />, label: "Skills", path: "/skills" },
                  { icon: <MdSwapHoriz />, label: "Borrowing", path: "/borrowing" },
                  { icon: <MdChat />, label: "Messages", path: "/messages" },
                  { icon: <MdPeople />, label: "Community", path: "/community" },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="text-blue-500">{item.icon}</span>
                    {item.label}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
      </header>

      {/* Quick Actions Menu */}
        {isProfileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-16 bg-white shadow-xl rounded-xl w-[300px] overflow-hidden border border-gray-100 z-50"
          >
            {/* Profile Section */}
            <div className="p-6 text-center border-b">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 mx-auto mb-3 relative group"
              >
                <img
                  src={
                    profileData?.imageUrl
                      ? profileData.imageUrl.startsWith('http')
                        ? profileData.imageUrl
                        : `http://localhost:8080${profileData.imageUrl}`
                      : "/placeholder.svg"
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover ring-2 ring-offset-2 ring-blue-500"
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                  }}
                />
                <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <span className="text-white text-sm">Change Photo</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpdate}
                    disabled={isUpdating}
                  />
                </label>
                {isUpdating && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </motion.div>
              <h3 className="font-semibold text-lg">
                {user?.name || profileData?.username || "User"}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {profileData?.email || "Add your email"}
              </p>
              
              {/* Only show the View Profile button if not on the profile page */}
              {!isProfilePage && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors shadow-sm"
                  onClick={() => navigate("/profile")}
                >
                  View Profile
                </motion.button>
              )}
            </div>

            {/* Navigation Menu with Groups */}
            <nav className="py-2">
              {/* Main Features Group */}
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Main Features
                </div>
                {[
                  { icon: <MdDashboard />, label: "Dashboard", path: "/dashboard" },
                  { icon: <MdSchool />, label: "Skills", path: "/skills" },
                  { icon: <MdPeople />, label: "Community", path: "/community" },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="text-xl text-blue-500">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Class Management Group */}
              <div className="px-3 py-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Class Management
                </div>
                {[
                  { icon: <MdAdd />, label: "Create Class", path: "/create-class" },
                  { icon: <MdLibraryBooks />, label: "Your Classes", path: "/your-classes" },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="text-xl text-purple-500">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Communication Group */}
              <div className="px-3 py-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Communication
                </div>
                {[
                  { icon: <MdChat />, label: "Messages", path: "/messages" },
                  { icon: <MdSwapHoriz />, label: "Borrowing", path: "/borrowing" },
                ].map((item, index) => (
                  <motion.button
                    key={index}
                    variants={menuItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.05 }}
                    className="w-full flex items-center gap-3 px-6 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => navigate(item.path)}
                  >
                    <span className="text-xl text-green-500">{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Account Group */}
              <div className="px-3 py-2 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Account
                </div>
                <motion.button
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-full flex items-center gap-3 px-6 py-2.5 text-gray-700 hover:bg-red-50 transition-colors rounded-lg"
                  onClick={logout}
                >
                  <span className="text-xl text-red-500">
                    <MdLogout />
                  </span>
                  <span className="text-red-600">Log out</span>
                </motion.button>
              </div>
            </nav>
          </motion.div>
        )}

      {/* Main content area */}
    <div style={styles.content}>  
      {/* Left side - Profile Information */}
      <div style={styles.profileSection}>
        {/* Profile Picture with Upload Functionality */}
        <div style={styles.avatar} className="relative group">
        <img
            src={
              profileData?.imageUrl
                ? profileData.imageUrl.startsWith('http')
                  ? profileData.imageUrl
                  : `http://localhost:8080${profileData.imageUrl}`
                : "/images/defaultProfile.png"
            }
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              console.error("Error loading image:", e);
              e.target.onerror = null;
              e.target.src = "/images/defaultProfile.png";
            }}
          />
          {/* Hover overlay for photo upload */}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer">
              <span className="text-white text-sm">Change Photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleProfilePictureUpdate}
                disabled={isUpdating}
              />
            </label>
          </div>
          {/* Loading overlay */}
          {isUpdating && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
              <span className="text-white">Updating...</span>
            </div>
          )}
        </div>

        {/* Profile Info */}
        <h1 style={styles.name}>{profileData?.username || user?.username}</h1>
        <p style={styles.bio}>
          {profileData?.email}
        </p>
        <button style={styles.editButton} onClick={() => navigate("/edit-profile")}>
          Edit Profile
        </button>

        {/* Stats */}
        <div style={styles.statsContainer}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Followers</span>
            <span style={styles.statValue}>0</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Following</span>
            <span style={styles.statValue}>0</span>
          </div>
        </div>

        {/* Social Links */}
        <button style={styles.linkButton} onClick={() => navigate("/link-social-accounts")}>
          <span>🔗</span>
          Link social accounts
        </button>

        {/* Progress Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Progress*</h3>
          <p style={styles.progressNote}>*These stats are only visible to you</p>
        </div>
      </div>

      {/* Right side - Tabs and Content */}
      <div className="flex-1 ml-8">
        {/* Tabs */}
        <div style={styles.tabs}>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === "profile" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === "achievements" ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>About Me</h2>
                <p>{profileData?.bio || "No bio yet"}</p>
              </div>
              {/* Additional profile sections can go here */}
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: "center", color: "#666", padding: "20px" }}
            >
              No achievements yet
            </motion.div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default Profile;