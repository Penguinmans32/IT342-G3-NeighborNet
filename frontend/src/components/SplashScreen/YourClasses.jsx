import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  MdAdd, MdEdit, MdDelete, MdPeople, MdStar,
  MdTimeline, MdGridView, MdSearch, MdPlayCircle,
  MdBrightness1, MdRadar, MdHub, MdTrendingUp
} from 'react-icons/md';
import { Play, Clock, Book, Award, TrendingUp } from 'lucide-react';
import axios from "axios"
import '../../styles/YourClasses.css';

const RecentClassCard = ({ classItem, onEdit, thumbnailUrl }) => { // Add thumbnailUrl prop
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
          <motion.img 
            src={thumbnailUrl || '/default-class-image.jpg'} // Use thumbnailUrl prop instead of classItem.thumbnailUrl
            alt={classItem.title}
            className="object-cover w-full h-full transition-opacity duration-300"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="flex-1">
          <h4 className="text-gray-900 font-medium line-clamp-1">{classItem.title}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last edited {new Date(classItem.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(classItem.id)}
          className="p-2 rounded-full bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
        >
          <MdEdit className="text-xl" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={`bg-gradient-to-br from-white/80 to-white/60 rounded-xl p-4 border border-white/20`}
  >
    <div className={`text-${color} flex items-center gap-3 mb-2`}>
      <Icon className="text-2xl" />
      <h3 className="font-medium text-gray-800">{label}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
);

const TreeNode = ({ classItem, index, onExpand, isExpanded, onDelete, onEdit, thumbnailUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        delay: index * 0.1 
      }
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="relative"
      variants={nodeVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className={`
          group relative bg-gradient-to-br from-white/5 to-white/10
          rounded-xl overflow-hidden backdrop-blur-sm border border-white/10
          hover:border-white/20 transition-all duration-300 hover:shadow-2xl
          hover:shadow-blue-500/10
        `}
      >
        {/* Thumbnail Container */}
        <div className="aspect-[5/3] relative overflow-hidden">
          <motion.img
            src={thumbnailUrl || '/default-class-image.jpg'}
            alt={`${classItem.title} thumbnail`}
            className="object-cover w-full h-full transition-transform duration-500 
                     group-hover:scale-110"
            style={{
              opacity: imageLoaded ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                         opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* Status Indicator */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
              classItem.status === 'draft' ? 'bg-orange-400' : 'bg-green-400'
            }`}
          />

          {/* Course Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full 
                         group-hover:translate-y-0 transition-transform duration-500">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MdHub className="text-blue-400" />
                {classItem.title}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-400">
                    <MdPeople className="text-lg" />
                    <span>{classItem.enrolledCount || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Students</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-purple-400">
                    <MdStar className="text-lg" />
                    <span>{classItem.rating || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Rating</p>
                </div>
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {classItem.description}
                    </p>
                    
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(classItem.id)}
                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 
                                 text-blue-400 rounded-lg backdrop-blur-sm flex items-center 
                                 justify-center gap-2 border border-blue-500/30"
                      >
                        <MdEdit />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onDelete(classItem.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 
                                 text-red-400 rounded-lg backdrop-blur-sm flex items-center 
                                 justify-center gap-2 border border-red-500/30"
                      >
                        <MdDelete />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const YourClasses = () => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [expandedClass, setExpandedClass] = useState(null)
  const [thumbnailUrls, setThumbnailUrls] = useState({})
  const [thumbnailCache, setThumbnailCache] = useState({})

  const renderQuickStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
    >
      <StatCard icon={Book} label="Total Classes" value={classes.length} color="blue-400" />
      <StatCard 
        icon={MdPeople} 
        label="Total Students" 
        value={classes.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0)} 
        color="purple-400" 
      />
      <StatCard 
        icon={Award} 
        label="Avg. Rating" 
        value={classes.length ? (classes.reduce((acc, curr) => acc + (curr.rating || 0), 0) / classes.length).toFixed(1) : '0.0'} 
        color="yellow-400" 
      />
      <StatCard 
        icon={TrendingUp} 
        label="This Month" 
        value={`+${classes.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}`} 
        color="green-400" 
      />
    </motion.div>
  );

  const renderRecentClasses = () => {
    const recentClasses = [...classes]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recently Updated</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 text-sm hover:bg-blue-500/20"
          >
            View All
          </motion.button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentClasses.map(classItem => (
            <RecentClassCard 
              key={classItem.id} 
              classItem={classItem} 
              onEdit={handleEdit}
              thumbnailUrl={thumbnailUrls[classItem.id]}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  const renderBackgroundEffects = () => (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>
    </>
  );

  useEffect(() => {
    const loadThumbnailUrls = () => {
      if (!Array.isArray(classes)) {
        console.error('Classes is not an array:', classes);
        return;
      }
  
      const urls = {};
      classes.forEach((classItem) => {
        if (classItem && classItem.id) {
          if (classItem.thumbnailUrl) {
            // Make sure to handle both absolute and relative URLs
            urls[classItem.id] = classItem.thumbnailUrl.startsWith('http') 
              ? classItem.thumbnailUrl 
              : `http://localhost:8080${classItem.thumbnailUrl}`;
          } else {
            urls[classItem.id] = "/default-class-image.jpg";
          }
        }
      });
      setThumbnailUrls(urls);
    };
  
    loadThumbnailUrls();
  }, [classes]);

  const handleExpand = useCallback((id) => {
    setExpandedClass((prev) => (prev === id ? null : id))
  }, [])

  const handleEdit = useCallback(
    (id) => {
      navigate(`/class/${id}/edit`)
    },
    [navigate],
  )

  const handleDeleteClass = useCallback(async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await axios.delete(`http://localhost:8080/api/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setClasses((prev) => prev.filter((c) => c.id !== classId))
      } catch (error) {
        console.error("Error deleting class:", error)
      }
    }
  }, [])

  const getThumbnailUrl = useCallback(
    (thumbnailUrl) => {
      if (!thumbnailUrl) return "/default-class-image.jpg"

      if (thumbnailCache[thumbnailUrl]) {
        return thumbnailCache[thumbnailUrl]
      }

      const fullUrl = `http://localhost:8080${thumbnailUrl}`
      setThumbnailCache((prev) => ({ ...prev, [thumbnailUrl]: fullUrl }))
      return fullUrl
    },
    [thumbnailCache],
  )

  const filteredAndSortedClasses = useMemo(() => {
    // Ensure classes is an array
    if (!Array.isArray(classes)) {
      console.error('Classes is not an array:', classes);
      return [];
    }
  
    try {
      let result = classes.filter((c) => {
        if (!c) return false; // Skip null or undefined items
        if (filter === "all") return true;
        return c.status === filter;
      });
  
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        result = result.filter((c) => {
          if (!c) return false;
          return (
            (c.title?.toLowerCase().includes(query)) ||
            (c.description?.toLowerCase().includes(query))
          );
        });
      }
  
      return [...result].sort((a, b) => {
        if (!a || !b) return 0;
        switch (sortBy) {
          case "oldest":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "popular":
            return (b.enrolledCount || 0) - (a.enrolledCount || 0);
          default:
            return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
        }
      });
    } catch (error) {
      console.error('Error processing classes:', error);
      return [];
    }
  }, [classes, filter, searchQuery, sortBy]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
  }, [])

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/classes/my-classes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
  
        // Add data validation
        const classesData = response.data;
        console.log('API Response:', classesData); // Debug log
  
        if (Array.isArray(classesData)) {
          setClasses(classesData);
        } else if (classesData && Array.isArray(classesData.classes)) {
          // If the data is nested in a 'classes' property
          setClasses(classesData.classes);
        } else if (classesData && typeof classesData === 'object') {
          // If the data is an object with class properties
          setClasses(Object.values(classesData));
        } else {
          console.error('Invalid data format received:', classesData);
          setClasses([]);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        setClasses([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
  
    fetchClasses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      {renderBackgroundEffects()}

        {/* Back Button */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}  // Changed from 100 to -100 to slide in from left
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-6 left-6 z-50"  // Changed right-6 to left-6
        >
          <motion.button
            onClick={() => navigate("/homepage")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex items-center gap-2 px-6 py-3 bg-white/80 
                      hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl 
                      transition-all duration-300 backdrop-blur-sm border border-white/50"
          >
            <motion.div
              whileHover={{ x: -4 }}  // Changed direction of hover
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 
                            rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600 relative z-10"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
            
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}  // Changed direction of hover
              transition={{ duration: 0.2 }}
              className="text-transparent bg-clip-text bg-gradient-to-r 
                        from-blue-600 to-purple-600 font-medium"
            >
              Back Home
            </motion.span>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity 
                          duration-300" />
          </motion.button>
        </motion.div>

      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-16 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-6">
            Classes
          </h1>
          <p className="text-gray-600 text-xl mb-10 max-w-2xl mx-auto">
            Create immersive learning experiences and inspire minds worldwide
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/create-class")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MdAdd className="text-2xl" />
            <span>Create New Class</span>
          </motion.button>
        </motion.div>

        {/* Controls section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 mb-12"
        >
          {/* Search and filters */}
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search your classes..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>

              <div className="flex gap-2 bg-gray-50 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow text-blue-500" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <MdGridView className="text-xl" />
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "timeline" ? "bg-white shadow text-blue-500" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <MdTimeline className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {!loading && classes.length > 0 && renderQuickStats()}

        {!loading && classes.length > 0 && renderRecentClasses()}

        {/* Classes Display */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin-slow" />
            </div>
          </motion.div>
        ) : filteredAndSortedClasses.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <img src="/empty-classes.svg" alt="No classes" className="w-72 h-72 mx-auto mb-8 opacity-50" />
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Start Your Teaching Journey</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first class and share your knowledge with eager learners worldwide.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-class")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MdAdd className="text-2xl" />
              <span>Create Your First Class</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-[600px] p-8"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5" />
            
            {/* Tree Container */}
            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedClasses.map((classItem, index) => (
                <TreeNode
                  key={classItem.id}
                  classItem={classItem}
                  index={index}
                  onExpand={handleExpand}
                  isExpanded={expandedClass === classItem.id}
                  onDelete={handleDeleteClass}
                  onEdit={handleEdit}
                  thumbnailUrl={thumbnailUrls[classItem.id]}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default YourClasses

