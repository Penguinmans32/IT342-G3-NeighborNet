import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../backendApi/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { NotificationProvider, useNotification } from '../backendApi/NotificationContext';
import Footer from './SplashScreen/Footer';
import '../styles/SignIn.css';
import '../styles/Categories.css';
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
  MdNotifications,
  MdNotificationsActive,
  MdNotificationsOff,
  MdInfo,
  MdApps,
  MdCode,
  MdBrush,
  MdBusinessCenter,
  MdTrendingUp,
  MdCamera,
  MdMusicNote,
  MdEdit,
  MdFilterList,
  MdPlayArrow,
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
  const [showOnlyUserClasses, setShowOnlyUserClasses] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotification();

  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalClassCount, setTotalClassCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [displayedResults, setDisplayedResults] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState(false);

  const categories = [
    { id: "all", name: "All Classes", icon: <MdApps className="text-blue-500" /> },
    { id: "programming", name: "Programming", icon: <MdCode className="text-purple-500" /> },
    { id: "design", name: "Design", icon: <MdBrush className="text-pink-500" /> },
    { id: "business", name: "Business", icon: <MdBusinessCenter className="text-green-500" /> },
    { id: "marketing", name: "Marketing", icon: <MdTrendingUp className="text-red-500" /> },
    { id: "photography", name: "Photography", icon: <MdCamera className="text-yellow-500" /> },
    { id: "music", name: "Music", icon: <MdMusicNote className="text-indigo-500" /> },
    { id: "writing", name: "Writing", icon: <MdEdit className="text-cyan-500" /> },
  ];

  const categoryIcons = {
    programming: <MdCode className="text-purple-500" />,
    design: <MdBrush className="text-pink-500" />,
    business: <MdBusinessCenter className="text-green-500" />,
    marketing: <MdTrendingUp className="text-red-500" />,
    photography: <MdCamera className="text-yellow-500" />,
    music: <MdMusicNote className="text-indigo-500" />,
    writing: <MdEdit className="text-cyan-500" />,
    all: <MdApps className="text-blue-500" />,
    default: <MdSchool className="text-gray-500" />
  };

  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { x: 8 },
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      setSearchQuery(searchTerm);
      setHasSearched(true);
      setIsSearchFocused(false);
      
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = classes.filter(classItem => 
        (classItem.title?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (classItem.category?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (classItem.creatorName?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (classItem.description?.toLowerCase().includes(lowerCaseSearchTerm))
      );
      
      setDisplayedResults(filtered);
      
      // Optionally scroll to results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNotificationBellClick = async () => {
    console.log("Notification bell clicked");
    if (!isNotificationsOpen) {
      try {
        console.log("Fetching notifications...");
        console.log("Current user:", user); // Add this debug log
        console.log("Current token:", localStorage.getItem('token')); // Add this debug log
        const notifs = await fetchNotifications();
        console.log("Fetched notifications:", notifs);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    setNotificationsOpen(prev => !prev);
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (classes.length > 0) {
      const counts = {};
      classes.forEach(cls => {
        const category = cls.category?.toLowerCase() || "uncategorized";
        counts[category] = (counts[category] || 0) + 1;
      });
      setCategoryCounts(counts);
      setTotalClassCount(classes.length);

      const uniqueCategories = [...new Set(classes.map(cls => cls.category?.toLowerCase() || "uncategorized"))];
      
      const categoryList = [
        { 
          id: "all", 
          name: "All Classes", 
          icon: categoryIcons.all,
          count: classes.length
        },
        ...uniqueCategories.map(cat => ({
          id: cat,
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          icon: getCategoryIcon(cat),
          count: counts[cat] || 0
        }))
      ];
      
      setAvailableCategories(categoryList);
    }
  }, [classes]);

  const getCategoryIcon = (category) => {
    const iconMap = {
      programming: <MdCode className="text-purple-500" />,
      design: <MdBrush className="text-pink-500" />,
      business: <MdBusinessCenter className="text-green-500" />,
      marketing: <MdTrendingUp className="text-red-500" />,
      photography: <MdCamera className="text-yellow-500" />,
      music: <MdMusicNote className="text-indigo-500" />,
      writing: <MdEdit className="text-cyan-500" />,
      // Add more mappings as needed
      default: <MdSchool className="text-gray-500" />
    };
    
    return iconMap[category.toLowerCase()] || iconMap.default;
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Change the endpoint to fetch all classes
        const response = await axios.get("http://localhost:8080/api/classes/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        let classesData = [];
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          classesData = Object.values(response.data);
        }
        
        setClasses(classesData);
        
        // Separately fetch user's own classes if needed
        const myClassesResponse = await axios.get("http://localhost:8080/api/classes/my-classes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        let myClassesData = [];
        if (Array.isArray(myClassesResponse.data)) {
          myClassesData = myClassesResponse.data;
        } else if (myClassesResponse.data && typeof myClassesResponse.data === 'object') {
          myClassesData = Object.values(myClassesResponse.data);
        }
        
        setUserClasses(myClassesData);
        
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]);
        setUserClasses([]);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
  
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    if (notification.unread) {
        markAsRead(notification.id);
    }
    // Handle notification click (e.g., navigate to relevant page)
};

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
        console.log("User Classes Data:", response.data); 
        setUserClasses(response.data);
      } catch (error) {
        console.error("Error fetching user classes:", error);
      }
    };
  
    if (user) {
      fetchUserClasses();
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

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const getFullThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return "/default-class-image.jpg";
    return thumbnailUrl.startsWith('http') 
      ? thumbnailUrl 
      : `http://localhost:8080${thumbnailUrl}`;
  };

    const getFullProfileImageUrl = (imageUrl) => {
    console.log("Raw imageUrl:", imageUrl);
    if (!imageUrl) {
      return "/images/defaultProfile.png";
    }
    const fullUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `http://localhost:8080${imageUrl}`;
    return fullUrl;
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 shadow-md
                              transform group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-xl font-bold text-blue-600">N</span>
                </div>
                <span className="text-xl font-semibold text-white hidden sm:block
                                group-hover:text-blue-100 transition-colors duration-300">
                  Neighbor Net
                </span>
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
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-500
                                opacity-50 group-hover:opacity-100 transition-opacity duration-300">
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

      <main className="flex-1 flex min-h-screen bg-gray-50">
        {/* Mobile Categories Toggle Button */}
          <div className="lg:hidden fixed left-4 bottom-20 z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsCategoriesSidebarOpen(!isCategoriesSidebarOpen)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg"
            >
              <MdFilterList className="text-2xl" />
            </motion.button>
          </div>

          {/* Categories Sidebar - Desktop Version */}
          <div className="hidden lg:block fixed left-12 top-32 z-40 w-72">
            <div className="sticky top-32 max-h-[calc(100vh-160px)] overflow-y-auto thin-scrollbar">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 pl-4 tracking-tight">
                Categories
              </h2>
              {availableCategories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ x: 8 }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-left
                    transition-all duration-300 relative group
                    ${selectedCategory === category.id 
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                  {/* Category button content - keep the same */}
                  <motion.div
                    className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
                      transition-opacity duration-300
                      ${selectedCategory === category.id 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50'
                        : 'bg-gray-50'
                      }`}
                  />
                  
                  {/* Active Indicator */}
                  {selectedCategory === category.id && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute left-0 w-1.5 h-full bg-blue-500 rounded-full"
                    />
                  )}

                  {/* Content */}
                  <span className="relative z-10 text-xl">{category.icon}</span>
                  <span className="relative z-10 text-base font-medium tracking-wide">
                    {category.name}
                  </span>
                  
                  {/* Count */}
                  <span className="relative z-10 ml-auto text-sm font-medium text-gray-400 
                                opacity-0 group-hover:opacity-100 transition-opacity">
                    {category.count || 0}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

          {/* Mobile Categories Drawer */}
          <AnimatePresence>
            {isCategoriesSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCategoriesSidebarOpen(false)}
                  className="lg:hidden fixed inset-0 bg-black/50 z-40"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "tween", duration: 0.3 }}
                  className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 overflow-y-auto"
                >
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                    <button
                      onClick={() => setIsCategoriesSidebarOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <MdClose />
                    </button>
                  </div>
                  <div className="p-4">
                    {availableCategories.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsCategoriesSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left mb-2
                          ${selectedCategory === category.id 
                            ? 'bg-blue-50 text-blue-600 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <span className="text-xl">{category.icon}</span>
                        <span className="text-base font-medium">
                          {category.name}
                        </span>
                        <span className="ml-auto text-sm text-gray-400">
                          {category.count || 0}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-6 lg:ml-72">
          <div className="max-w-6xl mx-auto">
            {/* Featured Classes Section */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <motion.h2 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-gray-900"
                    >
                      {hasSearched ? `Search for: "${searchQuery}"` : "Featured Classes"}
                    </motion.h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>
                  {hasSearched ? (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        setHasSearched(false);
                        setSearchQuery('');
                        setSearchTerm('');
                      }}
                      className="px-4 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Clear Search
                    </motion.button>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setShowOnlyUserClasses(!showOnlyUserClasses)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        showOnlyUserClasses 
                          ? 'bg-blue-500 text-white hover:bg-blue-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showOnlyUserClasses ? 'Show All Classes' : 'Show My Classes'}
                    </motion.button>
                  )}
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-video rounded-xl bg-gray-200 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))
                  ) : hasSearched ? (
                    displayedResults.length > 0 ? (
                      displayedResults.map((classItem) => (
                        <motion.div
                          key={classItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -5 }}
                          className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={getFullThumbnailUrl(classItem.thumbnailUrl)}
                              alt={classItem.title}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <motion.div
                              initial={false}
                              animate={{ scale: [0.9, 1], opacity: [0, 1] }}
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 text-blue-600"
                              >
                                <MdPlayArrow className="text-3xl" />
                              </motion.button>
                            </motion.div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                {classItem.category || "Uncategorized"}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {classItem.duration || "1h 30m"}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                              {classItem.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                              {classItem.description}
                            </p>
                            
                            <div className="flex items-center gap-3">
                            <img
                                src={classItem.creator?.imageUrl 
                                  ? getFullProfileImageUrl(classItem.creator.imageUrl)
                                  : "/images/defaultProfile.png"
                                }
                                alt={classItem.creator?.username || "Creator"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {classItem.creatorName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {classItem.sections?.length || 0} sections
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="space-x-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="px-6 py-2 bg-white text-blue-600 rounded-full font-medium"
                                onClick={() => navigate(`/class/${classItem.id}`)}
                              >
                                View Class
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-3 py-12 text-center text-gray-500">
                        <MdSearch className="text-5xl mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-medium mb-2">No results found</h3>
                        <p>We couldn't find any classes matching "{searchQuery}"</p>
                      </div>
                    )
                  ) : (
                    classes
                      .filter(classItem => {
                        const categoryMatch = selectedCategory === "all" ? true : classItem.category === selectedCategory;
                        const userClassMatch = showOnlyUserClasses 
                          ? userClasses.some(userClass => userClass.id === classItem.id)
                          : true;
                        return categoryMatch && userClassMatch;
                      })
                      .map((classItem) => (
                        <motion.div
                          key={classItem.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -5 }}
                          className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={getFullThumbnailUrl(classItem.thumbnailUrl)}
                              alt={classItem.title}
                              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <motion.div
                              initial={false}
                              animate={{ scale: [0.9, 1], opacity: [0, 1] }}
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="w-14 h-14 flex items-center justify-center rounded-full bg-white/90 text-blue-600"
                              >
                                <MdPlayArrow className="text-3xl" />
                              </motion.button>
                            </motion.div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                {classItem.category || "Uncategorized"}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {classItem.duration || "1h 30m"}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                              {classItem.title}
                            </h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                              {classItem.description}
                            </p>
                            
                            <div className="flex items-center gap-3">
                            <img
                                src={classItem.creator?.imageUrl 
                                  ? getFullProfileImageUrl(classItem.creator.imageUrl)
                                  : "/images/defaultProfile.png"
                                }
                                alt={classItem.creator?.username || "Creator"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">
                                  {classItem.creatorName}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {classItem.sections?.length || 0} sections
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="space-x-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                className="px-6 py-2 bg-white text-blue-600 rounded-full font-medium"
                                onClick={() => navigate(`/class/${classItem.id}`)}
                              >
                                View Class
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </section>

            {/* Popular Categories Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {availableCategories
                  .filter(category => category.id !== "all")
                  .sort((a, b) => b.count - a.count) // Sort by count in descending order
                  .slice(0, 4) // Get top 4 categories
                  .map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                        {category.icon}
                      </div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {category.count} classes
                      </p>
                    </motion.div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <AnimatePresence>
          {isNotificationsOpen && (
              <>
                  {/* Overlay */}
                  <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setNotificationsOpen(false)}
                      className="fixed inset-0 bg-black/50 z-40"
                  />
                  
                  {/* Notifications Panel */}
                  <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "tween", duration: 0.3 }}
                      className="fixed right-0 top-0 h-screen w-80 bg-white shadow-xl z-50"
                  >
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold">Notifications</h2>
                              <div className="flex items-center gap-4">
                                  {unreadCount > 0 && (
                                      <button
                                          onClick={markAllAsRead}
                                          className="text-sm text-blue-600 hover:text-blue-800"
                                      >
                                          Mark all as read
                                      </button>
                                  )}
                                  <button
                                      onClick={() => setNotificationsOpen(false)}
                                      className="p-2 hover:bg-gray-100 rounded-full"
                                  >
                                      <MdClose className="text-xl" />
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Notifications List */}
                      <div className="overflow-y-auto h-[calc(100vh-64px)]">
                        {console.log("Current notifications:", notifications)}
                        {notifications && notifications.length > 0 ? (
                            notifications.map((notification, index) => {
                                console.log("Rendering notification:", notification);
                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                                                  ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    {notification.type === 'REQUEST' && <MdNotificationsActive className="text-blue-500" />}
                                                    {notification.type === 'ALERT' && <MdNotificationsActive className="text-red-500" />}
                                                    {notification.type === 'UPDATE' && <MdInfo className="text-green-500" />}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 self-center" />
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
                                {console.log("No notifications to display")}
                                <MdNotificationsOff className="text-4xl mb-2" />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                  </motion.div>
              </>
          )}
      </AnimatePresence>

      {isProfileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-16 bg-white shadow-xl rounded-xl w-[300px] overflow-hidden border border-gray-100 z-50"
          >
            <div className="p-6 text-center border-b">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-20 h-20 mx-auto mb-3 relative group"
            >
              <img
                src={profileData?.imageUrl 
                  ? getFullProfileImageUrl(profileData.imageUrl)
                  : "/images/defaultProfile.png"
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover ring-2 ring-offset-2 ring-blue-500"
                onError={(e) => {
                  console.log("Image load error. Using placeholder.");
                  e.target.onerror = null;
                  e.target.src = "/images/defaultProfile.png";
                }}
              />
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
        <Footer />
    </div>
  );
};

export default Homepage;