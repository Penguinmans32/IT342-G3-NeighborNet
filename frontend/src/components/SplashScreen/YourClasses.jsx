import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, useInView, animate } from "framer-motion"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { MdAdd, MdEdit, MdDelete, MdPeople, MdStar, MdTimeline, MdGridView, MdSearch, MdHub, MdFilterList, MdClose, MdArrowUpward, MdOutlineAnalytics, MdVideoLibrary, MdQuiz, MdLightbulb } from "react-icons/md"
import { Clock, Book, Award, TrendingUp, BookX, Plus, ChevronRight, Sparkles, Flame, Target, PenTool, Calendar, MessageSquare, BarChart, Users, BookOpen, ListFilter, Star } from "lucide-react"
import axios from "axios"
import "../../styles/YourClasses.css"
import LessonList from "./LessonList"
import AddLessonModal from "./AddLessonModal"
import toast, { Toaster } from "react-hot-toast"
import '../../styles/your-classes-styles.css'
import { Tooltip } from "react-tooltip"
import ConfettiExplosion from 'react-confetti-explosion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

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

// Floating gradient elements
const FloatingGradient = ({ delay, duration, size, color, x, y }) => (
  <motion.div
    className={`absolute rounded-full opacity-20 blur-3xl z-0 bg-${color}`}
    style={{ width: size, height: size }}
    initial={{ x: x[0], y: y[0] }}
    animate={{ 
      x: x[1], 
      y: y[1],
      scale: [1, 1.2, 1],
    }}
    transition={{
      repeat: Infinity,
      repeatType: "reverse",
      duration: duration,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const counterRef = useRef(null);
  const inView = useInView(counterRef, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, Math.round);
  const displayCount = useTransform(roundedCount, (latest) => latest.toLocaleString());
  
  useEffect(() => {
    if (inView) {
      count.set(0);
      const controls = animate(count, value, { duration: duration });
      return controls.stop;
    }
  }, [count, inView, value, duration]);
  
  return (
    <motion.span ref={counterRef}>
      {displayCount}
    </motion.span>
  )
}

// Featured Class Card with hover effects
const FeaturedClassCard = ({ classItem, onEdit, thumbnailUrl }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();
  
  // Spring animation for smoother hover effect
  const scale = useSpring(1, { stiffness: 300, damping: 25 });
  
  useEffect(() => {
    scale.set(isHovering ? 1.03 : 1);
  }, [isHovering, scale]);
  
  return (
    <motion.div 
      style={{ scale }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={() => navigate(`/class/${classItem.id}`)}
      className="relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
      
      {/* Glass card effect */}
      <div className="relative z-10 backdrop-blur-[2px] p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{classItem.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatArrayDate(classItem.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(classItem.id);
            }}
            className="p-2 rounded-lg bg-white/70 hover:bg-white shadow-sm backdrop-blur-sm border border-gray-100 text-blue-600"
          >
            <PenTool className="w-4 h-4" />
          </motion.button>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-4 text-sm mb-4">
            <div className="flex items-center gap-1 text-blue-600">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{classItem.enrolledCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{classItem.rating || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600">
              <MdVideoLibrary className="w-4 h-4" />
              <span className="font-semibold">{classItem.lessonCount || 0}</span>
            </div>
          </div>
          
          {/* Circular progress indicator */}
          <div className="flex items-end justify-between">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - (classItem.completionRate || 0) }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <text x="18" y="21" textAnchor="middle" fontSize="8" fill="#4F46E5" fontWeight="bold">
                  {classItem.completionRate || 0}%
                </text>
              </svg>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovering ? 1 : 0, x: isHovering ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="flex items-center text-sm font-medium text-blue-600"
            >
              <span>View class</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </motion.div>
          </div>
        </div>
        
        {/* Hover effect light */}
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg opacity-0 blur-xl transition-opacity z-0"
          animate={{ opacity: isHovering ? 0.15 : 0 }}
        />
      </div>
    </motion.div>
  );
};

// Recent class card with animated progress
const RecentClassCard = ({ classItem, onEdit, thumbnailUrl }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const progressRef = useRef(null);
  const inView = useInView(progressRef, { once: true });
  
  // Calculate activity score based on recency and lessons
  const activityScore = useMemo(() => {
    const lessonCount = classItem.lessonCount || 0;
    const updatedDaysAgo = Math.min(7, (new Date() - new Date(classItem.updatedAt)) / (1000 * 60 * 60 * 24));
    return Math.round(Math.max(10, Math.min(100, (lessonCount * 10) + (7 - updatedDaysAgo) * 10)));
  }, [classItem]);

  return (
    <motion.div
      ref={progressRef}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
    >
      {/* Activity indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${activityScore}%` : 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </div>

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
          
          {/* Status indicator pulse */}
          <motion.div 
            className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${
              classItem.status === "draft" ? "bg-amber-400" : "bg-emerald-400"
            }`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-gray-900 font-semibold line-clamp-1">{classItem.title}</h4>
            {classItem.status === "draft" && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded-md">
                DRAFT
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatArrayDate(classItem.updatedAt)}</span>
          </div>
          
          {/* Mini stats */}
          <div className="flex items-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1 text-blue-600">
              <Users className="w-3 h-3" />
              <span>{classItem.enrolledCount || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Award className="w-3 h-3" />
              <span>{classItem.rating || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Action button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(classItem.id)}
          className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <MdEdit className="text-lg" />
        </motion.button>
      </div>
      
      {/* Hover reveal actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-transparent flex justify-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md flex items-center gap-1"
            >
              <MdOutlineAnalytics className="text-sm" />
              <span>Analytics</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-md flex items-center gap-1"
            >
              <MdQuiz className="text-sm" />
              <span>Add Quiz</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Animated stat card with progressive counting
const StatCard = ({ icon: Icon, label, value, color, trend }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
    >
      {/* Corner accent */}
      <div className={`absolute top-0 right-0 w-16 h-16 bg-${color}/10 rounded-bl-3xl`} />
      
      <div className={`text-${color} flex items-center gap-3 mb-3`}>
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          <Icon className="text-xl" />
        </div>
        <h3 className="font-medium text-gray-800">{label}</h3>
      </div>
      
      <div className="flex items-end gap-3">
        <p className="text-3xl font-bold text-gray-900 mb-0">
          {typeof value === 'number' ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
            >
              <AnimatedCounter value={value} />
            </motion.span>
          ) : value}
        </p>
        
        {trend && (
          <div className={`text-sm mb-1 font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            <div className="flex items-center gap-0.5">
              {trend > 0 ? '↑' : trend < 0 ? '↓' : ''}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Animated gradient underline */}
      <motion.div
        className={`h-1 w-full rounded-full mt-3 overflow-hidden bg-${color}/10`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
      >
        <motion.div
          className={`h-full bg-${color}`}
          initial={{ width: 0 }}
          animate={{ width: isInView ? '100%' : 0 }}
          transition={{ delay: 0.3, duration: 1.2 }}
        />
      </motion.div>
    </motion.div>
  );
};

// Enhanced class card with interactive features
const TreeNode = ({ classItem, index, onExpand, isExpanded, onDelete, onEdit, thumbnailUrl }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isAddingLesson, setIsAddingLesson] = useState(false)
  const [lessons, setLessons] = useState([])
  const [isShowingConfetti, setIsShowingConfetti] = useState(false)
  const navigate = useNavigate()
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" })

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
      setIsShowingConfetti(true)
      setTimeout(() => setIsShowingConfetti(false), 2000)
      
      toast.success("Lesson added successfully!", {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    } catch (error) {
      console.error("Error adding lesson:", error)
    }
  }

  const nodeVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: index * 0.1,
      },
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  }

  // Calculate completion status
  const lessonsCount = lessons?.length || 0;
  const completionPercentage = classItem.status === "published" ? 100 : Math.min(100, Math.max(10, lessonsCount * 20));

  return (
    <motion.div
      ref={nodeRef}
      className="relative"
      variants={nodeVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {isShowingConfetti && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <ConfettiExplosion 
            force={0.6}
            duration={2000}
            particleCount={80}
            width={1200}
          />
        </div>
      )}
      
      <motion.div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        {/* Completion progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 h-1 bg-gray-100">
          <motion.div 
            className={`h-full ${classItem.status === "published" ? "bg-emerald-500" : "bg-blue-500"}`}
            initial={{ width: 0 }}
            animate={{ width: isInView ? `${completionPercentage}%` : 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          />
        </div>
        
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

          {/* Status Indicator with tooltip */}
          <motion.div
            data-tooltip-id={`status-tip-${classItem.id}`}
            data-tooltip-content={classItem.status === "draft" ? "Draft - Not yet published" : "Published - Live to students"}
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
          <Tooltip id={`status-tip-${classItem.id}`} />

          {/* Course Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MdHub className="text-blue-400" />
                {classItem.title}
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-black/30 rounded-lg p-2 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 text-blue-400">
                    <MdPeople className="text-lg" />
                    <span className="font-medium">{classItem.enrolledCount || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Students</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 text-purple-400">
                    <MdStar className="text-lg" />
                    <span className="font-medium">{classItem.rating || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Rating</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <MdVideoLibrary className="text-lg" />
                    <span className="font-medium">{lessons?.length || 0}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Lessons</p>
                </div>
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="space-y-3"
                  >
                    <p className="text-gray-300 text-sm line-clamp-2">{classItem.description || "No description yet..."}</p>

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
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/class/${classItem.id}`)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-lg backdrop-blur-sm flex items-center justify-center gap-2 mt-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>View Dashboard</span>
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4 mt-4">
        <LessonList classId={classItem.id} lessons={lessons || []} onAddLesson={() => setIsAddingLesson(true)} />
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddingLesson(true)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <MdAdd className="text-xl" />
            <span>Add Lesson</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/class/${classItem.id}/create-quiz`)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <MdQuiz className="text-xl" />
            <span>Add Quiz</span>
          </motion.button>
        </div>
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

// Filter chip component
const FilterChip = ({ label, active, onClick, icon: Icon }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition-all ${
      active 
        ? "bg-blue-500 text-white shadow-md" 
        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    <span>{label}</span>
  </motion.button>
);

// AI suggestion card component
const AISuggestionCard = ({ title, description, icon: Icon, onClick, color }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-lg cursor-pointer relative overflow-hidden`}
  >
    {/* Accent corner */}
    <div className={`absolute top-0 right-0 w-16 h-16 bg-${color}/10 rounded-bl-3xl`} />
    
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    
    <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
    
    <div className="mt-3 flex justify-end">
      <div className={`flex items-center text-sm text-${color} font-medium`}>
        <span>Try now</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  </motion.div>
);

// Insights section
const InsightsSection = ({ classes }) => {
  const hasClasses = classes && classes.length > 0;
  const totalStudents = hasClasses 
    ? classes.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0) 
    : 0;
    
  const avgRating = hasClasses
    ? (classes.reduce((acc, curr) => acc + (curr.rating || 0), 0) / classes.length).toFixed(1)
    : "0.0";
    
  // Calculate most popular class
  const mostPopular = hasClasses 
    ? classes.reduce((prev, curr) => (curr.enrolledCount || 0) > (prev.enrolledCount || 0) ? curr : prev, classes[0])
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-blue-600" />
          Performance Insights
        </h2>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">
            Teaching Summary
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Students */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalStudents.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
            </div>
            
            {/* Average Rating */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  {avgRating}
                  {hasClasses && avgRating >= 4.5 && (
                    <span className="text-amber-500 text-sm">★</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>
            
            {/* Most Popular Class */}
            {mostPopular && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-900 line-clamp-1 max-w-[200px]">
                    {mostPopular.title}
                  </div>
                  <div className="text-sm text-gray-600">Most Popular Class</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// New enhanced trends carousel
const TrendsCarousel = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Educational Trends
        </h2>
        
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="#"
          className="px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm hover:bg-purple-100 transition-colors flex items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </motion.a>
      </div>
      
      <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        coverflowEffect={{
          rotate: 20,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        navigation={true}
        modules={[EffectCoverflow, Pagination, Navigation]}
        className="pb-12"
      >
        {[
          {
            title: "AI in Education",
            description: "Implement AI tools to enhance your course with personalized learning experiences.",
            icon: MdLightbulb,
            color: "bg-emerald-500",
            image: "/ai-education.jpg"
          },
          {
            title: "Interactive Assignments",
            description: "Engage students with interactive quizzes and assignments for better retention.",
            icon: MdQuiz,
            color: "bg-blue-500",
            image: "/interactive-assignments.jpg"
          },
          {
            title: "Microlearning",
            description: "Break down complex topics into bite-sized lessons for easier understanding.",
            icon: BookOpen,
            color: "bg-amber-500",
            image: "/microlearning.jpg"
          },
          {
            title: "Video Engagement",
            description: "Implement short, engaging video content with interactive elements.",
            icon: MdVideoLibrary,
            color: "bg-indigo-500",
            image: "/video-engagement.jpg"
          },
        ].map((trend, index) => (
          <SwiperSlide key={index} className="max-w-md">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 relative">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `url(${trend.image || "/trend-default.jpg"})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${trend.color} rounded-lg text-white shadow-lg mb-3`}>
                    <trend.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-white text-xl font-bold">{trend.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{trend.description}</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Learn More</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
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
  const [scrollPosition, setScrollPosition] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(false)
  
  // Track scroll position for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
      setShowScrollTop(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Add confetti animation on first load if there are classes
  useEffect(() => {
    if (!loading && classes.length > 0) {
      setRecentlyAdded(true)
      setTimeout(() => setRecentlyAdded(false), 2000)
    }
  }, [loading, classes.length])

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderQuickStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
    >
      <StatCard 
        icon={Book} 
        label="Total Classes" 
        value={classes.length} 
        color="blue-400" 
        trend={7} 
      />
      <StatCard
        icon={MdPeople}
        label="Total Students"
        value={classes.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0)}
        color="purple-400"
        trend={12}
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
        trend={3}
      />
      <StatCard
        icon={Calendar}
        label="This Month"
        value={`+${classes.filter((c) => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}`}
        color="green-400"
      />
    </motion.div>
  )

  const renderRecentClasses = () => {
    const recentClasses = [...classes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3)

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recently Updated
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors"
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
          className="absolute inset-0 bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white"
          style={{
            opacity: Math.max(0, 1 - scrollPosition / 1000),
            transition: "opacity 0.3s ease-out",
          }}
        />

        {/* Animated blobs */}
        <FloatingGradient 
          delay={0} 
          duration={8} 
          size="500px" 
          color="blue-500" 
          x={[-100, -50]} 
          y={[-100, -50]} 
        />
        
        <FloatingGradient 
          delay={2} 
          duration={10} 
          size="400px" 
          color="purple-500" 
          x={[window.innerWidth - 300, window.innerWidth - 350]} 
          y={[0, 50]} 
        />
        
        <FloatingGradient 
          delay={4} 
          duration={12} 
          size="450px" 
          color="pink-500" 
          x={[window.innerWidth / 2 - 200, window.innerWidth / 2 - 150]} 
          y={[window.innerHeight - 200, window.innerHeight - 250]} 
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
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
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
      
      {/* Confetti effect on first load */}
      {recentlyAdded && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <ConfettiExplosion
            force={0.8}
            duration={2500}
            particleCount={100}
            width={1600}
          />
        </div>
      )}

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

      {/* Scroll-to-top button */}
<AnimatePresence>
  {showScrollTop && (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onClick={handleScrollTop}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MdArrowUpward className="text-xl" />
    </motion.button>
  )}
</AnimatePresence>

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
      className="inline-block mb-4 relative"
    >
      <div className="relative">
        <motion.div 
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          animate={{ 
            background: [
              'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
              'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
              'linear-gradient(90deg, #EC4899 0%, #3B82F6 100%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="relative bg-white p-4 rounded-full shadow-lg">
          <Book className="w-10 h-10 text-blue-600" />
        </div>
      </div>
    </motion.div>

    <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text mb-6 relative">
      Your Classes
      <motion.span
        className="absolute -top-3 -right-3 text-amber-500 text-2xl"
        animate={{ rotate: [0, 20, 0], y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        ✨
      </motion.span>
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
      
      {/* Animated particles */}
      <motion.div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white"
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 3,
              delay: Math.random() * 2,
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </motion.div>
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

      <div className="flex flex-wrap gap-4 items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"
        >
          <MdFilterList className="text-xl" />
          <span className="font-medium">Filters</span>
          {filter !== "all" && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
        </motion.button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-6 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
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
    
    {/* Expandable filter options */}
    <AnimatePresence>
      {isFiltersOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              <FilterChip 
                label="All Classes" 
                active={filter === "all"} 
                onClick={() => setFilter("all")}
                icon={ListFilter} 
              />
              <FilterChip 
                label="Published" 
                active={filter === "published"} 
                onClick={() => setFilter("published")}
                icon={BookOpen} 
              />
              <FilterChip 
                label="Drafts" 
                active={filter === "draft"} 
                onClick={() => setFilter("draft")}
                icon={PenTool}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>

  {!loading && classes.length > 0 && (
    <>
      {renderQuickStats()}
      
      {renderRecentClasses()}
      
      <InsightsSection classes={classes} />
      
      <TrendsCarousel />
    </>
  )}

  {/* Classes Display */}
  {loading ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center items-center h-64"
    >
      <div className="relative">
        <motion.div 
          className="w-20 h-20 border-4 rounded-full"
          style={{ borderColor: 'transparent' }}
          animate={{ 
            rotate: 360,
            borderTopColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#3B82F6'],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
        <motion.div 
          className="absolute top-0 left-0 w-20 h-20 border-4 rounded-full"
          style={{ borderColor: 'transparent' }}
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
            borderRightColor: ['#8B5CF6', '#EC4899', '#3B82F6', '#8B5CF6'], 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    </motion.div>
  ) : filteredAndSortedClasses.length === 0 ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror"
        }}
        className="inline-block mb-5"
      >
        <BookX className="w-24 h-24 text-gray-300 mx-auto" />
      </motion.div>
      
      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
        Start Your Teaching Journey
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Create your first class and share your knowledge with eager learners worldwide.
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/create-class')}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
      >
        <Plus className="w-5 h-5" />
        <span>Create Your First Class</span>
      </motion.button>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[600px] p-8 bg-white rounded-3xl shadow-sm border border-gray-100"
    >
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          {filter === "all" ? "All Classes" : filter === "draft" ? "Draft Classes" : "Published Classes"}
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
            {filteredAndSortedClasses.length}
          </span>
        </h2>
        
        {filteredAndSortedClasses.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>
              Sorted by: <span className="font-medium text-gray-800">
                {sortBy === "newest" 
                  ? "Newest First" 
                  : sortBy === "oldest" 
                    ? "Oldest First" 
                    : sortBy === "popular"
                      ? "Most Popular"
                      : "Highest Rated"}
              </span>
            </span>
          </div>
        )}
      </div>
      
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