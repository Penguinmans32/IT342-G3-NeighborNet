import { motion } from "framer-motion";
import { useAuth } from "../backendApi/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import '../styles/SignIn.css';
import {
  MdMenu,
  MdAccountCircle,
  MdDashboard,
  MdSchool,
  MdSwapHoriz,
  MdChat,
  MdPeople,
  MdAdd,
  MdLibraryBooks,
  MdLogout,
  MdSearch,
  MdClose,
} from "react-icons/md";
import axios from "axios";

const Homepage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userClasses, setUserClasses] = useState([]);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';


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

  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/classes/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log("User Classes Data:", response.data); // Add this line to see the data
        setUserClasses(response.data);
      } catch (error) {
        console.error("Error fetching user classes:", error);
      }
    };
  
    if (user) {
      fetchUserClasses();
      console.log("Current User:", user); // Add this line to see the user object
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full overflow-hidden">
        {/* Background Gradient with Animations */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/95 to-purple-600/95">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="floating-elements"></div>
            <div className="floating-elements floating-elements2"></div>
            <div className="floating-elements floating-elements3"></div>
          </div>
        </div>

        {/* Header Content with Glass Effect */}
        <div className="relative z-10 backdrop-blur-sm transition-all duration-300 hover:backdrop-blur-md">
          <div className="container mx-auto">
            <div className="flex h-16 items-center justify-between px-4 relative">
              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
              </motion.button>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 shadow-md
                              transform group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-xl font-bold text-blue-600">N</span>
                </div>
                <span className="text-xl font-semibold text-white hidden sm:block
                                group-hover:text-blue-100 transition-colors duration-300">
                  Neighbor Net
                </span>
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
                    className="w-full h-10 pl-10 pr-4 rounded-full border-2 border-transparent 
                              bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 
                              focus:ring-purple-400 transition-all shadow-lg hover:bg-white"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
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
                      className="hidden sm:inline-flex text-white hover:bg-white/10 px-6 py-2.5 
                                rounded-lg transition-colors shimmer-hover relative overflow-hidden"
                    >
                      Sign In
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform 
                                    scale-x-0 group-hover:scale-x-100 transition-transform duration-300">
                      </span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="relative px-8 py-2.5 bg-black/90 text-white rounded-full 
                                overflow-hidden group transform hover:-translate-y-0.5 
                                transition-all duration-300 hover:shadow-xl border border-white/10 shimmer-hover"
                    >
                      <span className="relative z-10">Sign Up</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      </div>
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
              <input
                type="search"
                placeholder="Search Classes, Teachers..."
                className="w-full h-10 px-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <nav className="py-2">
              {/* Mobile menu items */}
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
              {/* Remove the label and input for changing photo */}
            </motion.div>
            <h3 className="font-semibold text-lg">
              {user?.name || profileData?.username || "User"}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {profileData?.email || "Add your email"}
            </p>
            
            {/* Only show View Profile button if not on profile page */}
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


      {/* Main Content Area */}
      <main className="flex-1 container mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature Cards */}
          {[
            {
              title: "Share a Skill",
              description: "Share your expertise with your neighbors and earn community points.",
              action: "Start Sharing",
              icon: <MdSchool className="text-3xl text-blue-500" />,
            },
            {
              title: "Borrow Items",
              description: "Need something? Check what your neighbors are willing to lend.",
              action: "Browse Items",
              icon: <MdSwapHoriz className="text-3xl text-purple-500" />,
            },
            {
              title: "Community Chat",
              description: "Connect with your neighbors and join the conversation.",
              action: "Start Chatting",
              icon: <MdChat className="text-3xl text-green-500" />,
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">{card.icon}</div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors shadow-sm"
              >
                {card.action}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Homepage;