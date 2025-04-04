import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { MdAdd, MdEdit, MdDelete, MdPeople, MdStar, MdTimeline, MdGridView, MdSearch, MdHub } from "react-icons/md"
import { Clock, Book, Award, TrendingUp, BookX } from "lucide-react"
import axios from "axios"
import "../../styles/YourClasses.css"
import LessonList from "./LessonList"
import AddLessonModal from "./AddLessonModal"
import toast, { Toaster } from "react-hot-toast"
import '../../styles/your-classes-styles.css'

const formatArrayDate = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 7) {
    return 'Invalid Date';
  }

  const [year, month, day, hour, minute, second, nano] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second, nano / 1000000);

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const RecentClassCard = ({ classItem, onEdit, thumbnailUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
          <motion.img
            src={thumbnailUrl || "/default-class-image.jpg"}
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
            <span>Last edited {formatArrayDate(classItem.updatedAt)}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(classItem.id)}
          className="p-2 rounded-full bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition-colors"
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
    className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
  >
    <div className={`text-${color} flex items-center gap-3 mb-2`}>
      <Icon className="text-2xl" />
      <h3 className="font-medium text-gray-800">{label}</h3>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </motion.div>
)

const TreeNode = ({ classItem, index, onExpand, isExpanded, onDelete, onEdit, thumbnailUrl }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [lessons, setLessons] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/classes/${classItem.id}/lessons`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        setLessons(response.data)
      } catch (error) {
        console.error("Error fetching lessons:", error)
        setLessons([]) // Set empty array on error
      }
    }

    if (classItem?.id) {
      fetchLessons()
    }
  }, [classItem?.id])

  const handleAddLesson = async (formData) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/classes/${classItem.id}/lessons`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setLessons((prev) => [...prev, response.data])
      setIsAddingLesson(false)
    } catch (error) {
      console.error("Error adding lesson:", error)
    }
  }

  const nodeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
    hover: {
      y: -5,
      transition: { duration: 0.3 },
    },
  }

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
      <motion.div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        {/* Thumbnail Container */}
        <div className="aspect-[5/3] relative overflow-hidden">
          <motion.img
            src={thumbnailUrl || "/default-class-image.jpg"}
            alt={`${classItem.title} thumbnail`}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            style={{
              opacity: imageLoaded ? 1 : 0,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

          {/* Status Indicator */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
              classItem.status === "draft" ? "bg-orange-400" : "bg-green-400"
            }`}
          />

          {/* Course Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
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
                    <p className="text-gray-300 text-sm line-clamp-2">{classItem.description}</p>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEdit(classItem.id)}
                        className="flex-1 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg backdrop-blur-sm flex items-center justify-center gap-2 border border-blue-500/30"
                      >
                        <MdEdit />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          onDelete(classItem.id)
                        }}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg backdrop-blur-sm flex items-center justify-center gap-2 border border-red-500/30"
                      >
                        <MdDelete />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <LessonList classId={classItem.id} lessons={lessons || []} onAddLesson={() => setIsAddingLesson(true)} />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/class/${classItem.id}/create-quiz`)}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <MdAdd className="text-xl" />
          <span>Add Quiz/Exercise</span>
        </motion.button>
      </div>


      {isAddingLesson && (
        <AddLessonModal
          isOpen={isAddingLesson}
          onClose={() => setIsAddingLesson(false)}
          onSubmit={handleAddLesson}
          classId={classItem.id}
        />
      )}
    </motion.div>
  )
}

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
  const [scrollPosition, setScrollPosition] = useState(0)

  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        value={
          classes.length
            ? (classes.reduce((acc, curr) => acc + (curr.rating || 0), 0) / classes.length).toFixed(1)
            : "0.0"
        }
        color="yellow-400"
      />
      <StatCard
        icon={TrendingUp}
        label="This Month"
        value={`+${classes.filter((c) => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}`}
        color="green-400"
      />
    </motion.div>
  )

  const renderRecentClasses = () => {
    const recentClasses = [...classes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
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
          {recentClasses.map((classItem) => (
            <RecentClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={handleEdit}
              thumbnailUrl={thumbnailUrls[classItem.id]}
            />
          ))}
        </div>
      </motion.div>
    )
  }

  const renderBackgroundEffects = () => (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic gradient background that transitions to white */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white"
          style={{
            opacity: Math.max(0, 1 - scrollPosition / 1000),
            transition: "opacity 0.3s ease-out",
          }}
        />

        {/* Animated blobs */}
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            y: [0, 20, 0],
            x: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          style={{
            opacity: Math.max(0.2, 1 - scrollPosition / 500),
          }}
        />
        <motion.div
          className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 1,
          }}
          style={{
            opacity: Math.max(0.2, 1 - scrollPosition / 600),
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            y: [0, 25, 0],
            x: [0, 10, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            delay: 2,
          }}
          style={{
            opacity: Math.max(0.2, 1 - scrollPosition / 700),
          }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div
        className="fixed inset-0 bg-[url('/grid-pattern.svg')] bg-center pointer-events-none opacity-5"
        style={{
          backgroundSize: "30px 30px",
        }}
      />
    </>
  )

  useEffect(() => {
    const loadThumbnailUrls = () => {
      if (!Array.isArray(classes)) {
        console.error("Classes is not an array:", classes)
        return
      }

      const urls = {}
      classes.forEach((classItem) => {
        if (classItem && classItem.id) {
          if (classItem.thumbnailUrl) {
            // Make sure to handle both absolute and relative URLs
            urls[classItem.id] = classItem.thumbnailUrl.startsWith("http")
              ? classItem.thumbnailUrl
              : `http://localhost:8080${classItem.thumbnailUrl}`
          } else {
            urls[classItem.id] = "/default-class-image.jpg"
          }
        }
      })
      setThumbnailUrls(urls)
    }

    loadThumbnailUrls()
  }, [classes])

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
    const confirmDelete = () => {
      return new Promise((resolve) => {
        toast.custom(
          (t) => (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold mb-2">Delete Class</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this class? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => {
                    toast.dismiss(t.id)
                    resolve(false)
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => {
                    toast.dismiss(t.id)
                    resolve(true)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
          {
            duration: Number.POSITIVE_INFINITY,
          },
        )
      })
    }

    if (await confirmDelete()) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/classes/${classId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.status === 200) {
          setClasses((prev) => prev.filter((c) => c.id !== classId))
          toast.success("Class deleted successfully!")
        }
      } catch (error) {
        console.error("Error deleting class:", error)
        toast.error("Failed to delete class. Please try again.")
      }
    }
  }, [])

  const filteredAndSortedClasses = useMemo(() => {
    // Ensure classes is an array
    if (!Array.isArray(classes)) {
      console.error("Classes is not an array:", classes)
      return []
    }

    try {
      let result = classes.filter((c) => {
        if (!c) return false // Skip null or undefined items
        if (filter === "all") return true
        return c.status === filter
      })

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        result = result.filter((c) => {
          if (!c) return false
          return c.title?.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query)
        })
      }

      return [...result].sort((a, b) => {
        if (!a || !b) return 0
        switch (sortBy) {
          case "oldest":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          case "popular":
            return (b.enrolledCount || 0) - (a.enrolledCount || 0)
          default:
            return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
        }
      })
    } catch (error) {
      console.error("Error processing classes:", error)
      return []
    }
  }, [classes, filter, searchQuery, sortBy])

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
        })

        // Add data validation
        const classesData = response.data
        console.log("API Response:", classesData) // Debug log

        if (Array.isArray(classesData)) {
          setClasses(classesData)
        } else if (classesData && Array.isArray(classesData.classes)) {
          // If the data is nested in a 'classes' property
          setClasses(classesData.classes)
        } else if (classesData && typeof classesData === "object") {
          // If the data is an object with class properties
          setClasses(Object.values(classesData))
        } else {
          console.error("Invalid data format received:", classesData)
          setClasses([])
        }
      } catch (error) {
        console.error("Error fetching classes:", error)
        setClasses([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {renderBackgroundEffects()}
      <Toaster position="top-right" />

      {/* Back to Home Button */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-6 z-50"
      >
        <motion.button
          onClick={() => navigate("/homepage")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
        >
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
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
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-medium"
          >
            Back Home
          </motion.span>

          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-16 text-center"
          style={{
            transform: `translateY(${scrollPosition * 0.1}px)`,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-white p-3 rounded-full shadow-lg">
                <Book className="w-10 h-10 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-6">
            Your Classes
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

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-lg p-6 mb-12 border border-gray-100"
        >
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
              />

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <BookX className="w-20 h-20 text-gray-400 opacity-50 mx-auto" />
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
            className="relative min-h-[600px] p-8 bg-white rounded-3xl shadow-sm border border-gray-100"
          >
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
      <Footer />
    </div>
  )
}

export default YourClasses

