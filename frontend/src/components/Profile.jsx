import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAchievements } from "../backendApi/useAchievements"
import { useActivities } from "../backendApi/useActivities"
import { AchievementIcon } from "./AchievementIcon"
import { useParams } from "react-router-dom"
import {
  User,
  Edit,
  Home,
  Camera,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Star,
  BookOpen,
  Package,
  Award,
  Activity,
  ChevronRight,
  Heart,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Clock,
} from "lucide-react"
import axios from "axios"
import Footer from "./SplashScreen/Footer"
import { useAuth } from "../backendApi/AuthContext"


const ActivityPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-600 hover:bg-blue-50'
        }`}
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default function Profile() {
  const { user } = useAuth()
  const router = useNavigate()
  const [activeTab, setActiveTab] = useState("profile")
  const { userId } = useParams(); 
  const [isUpdating, setIsUpdating] = useState(false)
  const [savedClasses, setSavedClasses] = useState([])
  const { achievements, loading: achievementsLoading } = useAchievements(userId || user?.data?.id);
  const { activities, loading: activitiesLoading } = useActivities(userId || user?.data?.id);
  const [userStats, setUserStats] = useState({
    classesCreated: 0,
    itemsPosted: 0,
    communityScore: 0,
  })
  const [isSavedClassesLoading, setIsSavedClassesLoading] = useState(true)
  const [currentActivityPage, setCurrentActivityPage] = useState(1);
  const activitiesPerPage = 3;
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    imageUrl: "",
    bio: "",
    skills: [],
    interests: [],
    socialLinks: {
      github: "",
      twitter: "",
      linkedin: "",
      facebook: "",
    },
  })
  const [showTooltip, setShowTooltip] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const profileRef = useRef(null)


  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing 
        ? `https://neighbornet-back-production.up.railway.app/api/users/${userId}/unfollow`
        : `https://neighbornet-back-production.up.railway.app/api/users/${userId}/follow`;
  
      const response = await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.data) {
        setFollowerCount(response.data.followersCount);
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  useEffect(() => {
    const fetchFollowData = async () => {
      try {
        const targetId = userId || user?.id;
        if (!targetId) return;
  
        const response = await axios.get(`https://neighbornet-back-production.up.railway.app/api/users/${targetId}/followers-data`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setFollowerCount(response.data.followersCount);
        setFollowingCount(response.data.followingCount);
        setIsFollowing(response.data.isFollowing);
        console.log("Follow data:", response.data);
      } catch (error) {
        console.error("Error fetching follow data:", error);
      }
    };
  
    if (user) {
      fetchFollowData();
    }
  }, [userId, user]);


  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fetchUserStats = async () => {
    try {
      const targetId = userId || user?.data?.id;
      if (!targetId) {
        console.log("No target ID available");
        return;
      }
  
      const [classStats, itemStats] = await Promise.all([
        axios.get(`https://neighbornet-back-production.up.railway.app/api/classes/user-stats/${targetId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get(`https://neighbornet-back-production.up.railway.app/api/borrowing/items/user-stats/${targetId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);
  
      const communityScore = Math.min(
        100,
        classStats.data.classesCreated * 10 +
          classStats.data.enrolledClasses * 5 +
          itemStats.data.itemsPosted * 8 +
          itemStats.data.currentlyLent * 15,
      );
  
      setUserStats({
        classesCreated: classStats.data.classesCreated,
        itemsPosted: itemStats.data.itemsPosted,
        communityScore,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats({
        classesCreated: 0,
        itemsPosted: 0,
        communityScore: 0,
      });
    }
  };
  
  useEffect(() => {
    if (user?.data?.id || userId) {
      fetchUserStats();
    }
  }, [user, userId]);

  useEffect(() => {
    if (user) {
      fetchUserStats()
    }
  }, [user])

  const fetchSavedClasses = async () => {
    try {
      const targetId = userId || user?.id;
      const endpoint = userId 
        ? `https://neighbornet-back-production.up.railway.app/api/classes/saved/${targetId}` // For viewing other profiles
        : "https://neighbornet-back-production.up.railway.app/api/classes/saved"; // For current user
  
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setSavedClasses(response.data);
    } catch (error) {
      console.error("Error fetching saved classes:", error);
    } finally {
      setIsSavedClassesLoading(false);
    }
  };

  useEffect(() => {
    if (user) { 
      fetchSavedClasses();
    }
  }, [user, userId]); 

  useEffect(() => {
    const fetchProfileData = async (targetUserId) => {
      try {
        const endpoint = targetUserId 
          ? `https://neighbornet-back-production.up.railway.app/api/users/${targetUserId}/profile` 
          : "https://neighbornet-back-production.up.railway.app/api/users/profile";
    
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
    
        setProfileData({
          ...response.data,
          skills: response.data.skills || [],
          interests: response.data.interests || [],
          socialLinks: response.data.socialLinks || {
            github: "",
            twitter: "",
            linkedin: "",
            facebook: "",
          },
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
  
    if (user?.data) {
      if (userId && userId !== user.data.id?.toString()) {
        fetchProfileData(userId);
      } else {
        fetchProfileData();
      }
    }
  }, [user, userId]);


  const handleProfilePictureUpdate = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setIsUpdating(true)
    try {
      const response = await axios.put("https://neighbornet-back-production.up.railway.app/api/users/profile/picture", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setProfileData((prev) => ({
        ...prev,
        imageUrl: response.data.imageUrl,
      }))

      // Show tooltip feedback
      setShowTooltip(true)
      setTimeout(() => setShowTooltip(false), 3000)
    } catch (error) {
      console.error("Error updating profile picture:", error)
    } finally {
      setIsUpdating(false)
    }
  };

  const getIconColor = (iconName) => {
    const colors = {
      'BookOpen': 'text-blue-500',
      'Package': 'text-indigo-500',
      'Star': 'text-amber-500',
      'Award': 'text-emerald-500',
      'Heart': 'text-rose-500',
      'Crown': 'text-purple-500',
      'HandShake': 'text-green-500',
      'Gift': 'text-pink-500',
      'MessageCircle': 'text-cyan-500',
      'Target': 'text-orange-500',
      'Share2': 'text-violet-500',
      'Users': 'text-teal-500',
      'ThumbsUp': 'text-yellow-500'
    };
    return colors[iconName] || 'text-gray-500';
  };

  const getActivityIcon = (iconName) => {
    return <AchievementIcon 
      iconName={iconName} 
      className={`h-4 w-4 ${getIconColor(iconName)}`}
    />;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Accent color blobs */}
      <div className="absolute top-40 -right-40 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-50"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-50 blur-3xl opacity-40"></div>

      {/* Navigation header */}
      <div
        className={`sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-100 shadow-sm transition-all duration-300 ${
          scrollY > 50 ? "py-2" : "py-3"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => router("/homepage")}
            className="group flex items-center gap-2 text-slate-700 hover:text-blue-600 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Home</span>
          </button>

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">{profileData?.username || user?.username}</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="h-9 w-9 rounded-full border-2 border-white shadow-sm overflow-hidden relative"
              >
                <img
                  src={
                    profileData?.imageUrl
                      ? profileData.imageUrl.startsWith("http")
                        ? profileData.imageUrl
                        : `https://neighbornet-back-production.up.railway.app${profileData.imageUrl}`
                      : "/images/defaultProfile.png?height=36&width=36"
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/defaultProfile.png?height=36&width=36"
                  }}
                />
                {!profileData?.imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-100 text-blue-500">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            </div>

            {/* Success tooltip */}
            <AnimatePresence>
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 bg-green-50 border border-green-100 text-green-700 px-3 py-2 rounded-md shadow-md z-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Profile picture updated!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4" ref={profileRef}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <div className="flex flex-col items-center">
                {/* Profile picture with upload overlay */}
                <div className="relative group mb-6 mt-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md"
                  >
                    <img
                      src={
                        profileData?.imageUrl
                          ? profileData.imageUrl.startsWith("http")
                            ? profileData.imageUrl
                            : `https://neighbornet-back-production.up.railway.app${profileData.imageUrl}`
                          : "/images/defaultProfile.png?height=128&width=128"
                      }
                      alt="Profile picture"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/images/defaultProfile.png?height=128&width=128"
                      }}
                    />

                    {/* Upload overlay - Only show on own profile */}
                    {(!userId || userId === user?.id?.toString()) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer flex flex-col items-center">
                          <Camera className="h-6 w-6 text-white mb-1" />
                          <span className="text-white text-xs font-medium">Change Photo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureUpdate}
                            disabled={isUpdating}
                          />
                        </label>
                      </div>
                    )}
                  </motion.div>

                  {/* Loading overlay */}
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40 rounded-full"></div>
                      <div className="z-10 h-10 w-10 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    </div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></div>
                </div>

                {/* Profile info */}
                <h1 className="text-2xl font-bold text-slate-800 mb-1">
                  {profileData?.username || user?.username}
                </h1>
                {(!userId || userId === user?.id?.toString()) ? (
                    <p className="text-slate-500 mb-2">
                      {profileData?.email || user?.email}
                    </p>
                  ) : (
                    <>
                      <p className="text-slate-500 mb-2">
                        Community Member
                      </p>
                      {/* Message Button - Only show on other profiles */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          try {
                            // First, ensure a conversation exists or create one
                            const response = await axios.post(
                              'https://neighbornet-back-production.up.railway.app/conversations/create',
                              {
                                userId1: user.data.id,
                                userId2: userId
                              },
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem("token")}`
                                }
                              }
                            );

                            router(`/messages`);

                            setTimeout(() => {
                              const event = new CustomEvent('openChat', {
                                detail: {
                                  contactId: userId,
                                  contactName: profileData?.username
                                }
                              });
                              window.dispatchEvent(event);
                            }, 100);
                          } catch (error) {
                            console.error('Error creating conversation:', error);
                          }
                        }}
                        className="mb-4 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 px-4 
                                  rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                                  flex items-center justify-center"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </motion.button>
                    </>
                  )}
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-6">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  <span>Online</span>
                </div>

                {(!userId || userId === user?.id?.toString()) && (
                  <motion.button
                    onClick={() => router("/edit-profile")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mb-8 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 px-4 
                              rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
                              flex items-center justify-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </motion.button>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 w-full gap-4 mb-8">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <span className="text-slate-500 text-sm mb-1">Followers</span>
                    <span className="text-slate-800 font-bold text-xl">{followerCount}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <span className="text-slate-500 text-sm mb-1">Following</span>
                    <span className="text-slate-800 font-bold text-xl">{followingCount}</span>
                  </motion.div>
                </div>

                {userId && userId !== user?.id?.toString() && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFollowToggle}
                    className={`w-full py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md 
                      transition-all duration-200 flex items-center justify-center mb-6
                      ${isFollowing 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </motion.button>
                )}

                {/* Social links */}
                <div className="w-full mb-8">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Social Profiles</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profileData?.socialLinks?.twitter && (
                      <motion.a
                        href={profileData.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        className="rounded-full h-10 w-10 bg-white border border-slate-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition-colors"
                      >
                        <Twitter className="h-4 w-4 text-blue-500" />
                      </motion.a>
                    )}
                    {profileData?.socialLinks?.github && (
                      <motion.a
                        href={profileData.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        className="rounded-full h-10 w-10 bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:border-slate-200 transition-colors"
                      >
                        <Github className="h-4 w-4 text-slate-800" />
                      </motion.a>
                    )}
                    {profileData?.socialLinks?.linkedin && (
                      <motion.a
                        href={profileData.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        className="rounded-full h-10 w-10 bg-white border border-slate-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-100 transition-colors"
                      >
                        <Linkedin className="h-4 w-4 text-blue-700" />
                      </motion.a>
                    )}
                    {profileData?.socialLinks?.facebook && (
                      <motion.a
                        href={profileData.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -3, scale: 1.05 }}
                        className="rounded-full h-10 w-10 bg-white border border-slate-100 flex items-center justify-center hover:bg-red-50 hover:border-red-100 transition-colors"
                      >
                        <Mail className="h-4 w-4 text-red-500" />
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Skills section */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-800">Skills</h3>
                    <span className="text-xs font-normal px-2 py-1 rounded-full border border-slate-100 text-slate-600">
                      {profileData?.skills?.length || 0} Skills
                    </span>
                  </div>

                  <div className="space-y-4">
                    {profileData?.skills?.map((skill, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700 font-medium">{skill.name}</span>
                          <span className="text-slate-500">{skill.level}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className="h-full bg-blue-500 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    ))}

                    {(!profileData?.skills || profileData.skills.length === 0) && (
                      <div className="text-center py-4 text-slate-400 text-sm">No skills added yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Custom tabs */}
              <div className="w-full border-b border-slate-100 flex">
                {[
                  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
                  { id: "achievements", label: "Achievements", icon: <Award className="h-4 w-4" /> },
                  { id: "activity", label: "Activity", icon: <Activity className="h-4 w-4" /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-center transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span className={activeTab === tab.id ? "text-blue-500" : "text-slate-400"}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                          <User className="mr-2 h-5 w-5 text-blue-500" />
                          About Me
                        </h2>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                          <p className="text-slate-600 leading-relaxed">
                            {profileData?.bio ||
                              "Hi there! I'm a passionate developer who loves creating beautiful and functional web applications. I specialize in front-end development with React and have experience with various back-end technologies."}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                          <Heart className="mr-2 h-5 w-5 text-blue-500" />
                          Interests
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.interests?.length > 0 ? (
                            profileData.interests.map((interest, index) => (
                              <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-sm border border-blue-100"
                              >
                                {interest}
                              </motion.span>
                            ))
                          ) : (
                            <div className="text-slate-400 text-sm py-2">No interests added yet</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                            <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                            Favorite Classes
                          </h2>
                          {(!userId || userId === user?.id?.toString()) && savedClasses.length > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.05, x: 3 }}
                              className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                              onClick={() => router("/saved-classes")}
                            >
                              <span>View all</span>
                              <ChevronRight className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {isSavedClassesLoading ? (
                            // Loading skeleton
                            [...Array(2)].map((_, index) => (
                              <div key={index} className="animate-pulse bg-slate-50 rounded-lg overflow-hidden">
                                <div className="h-32 bg-slate-100"></div>
                                <div className="p-4 space-y-2">
                                  <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                                  <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                                </div>
                              </div>
                            ))
                          ) : savedClasses.length > 0 ? (
                            savedClasses.slice(0, 4).map((classItem, index) => (
                              <motion.div
                                key={classItem.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                onClick={() => router(`/class/${classItem.id}`)}
                                className="group cursor-pointer overflow-hidden bg-white rounded-lg border border-slate-100 hover:shadow-md transition-all duration-300"
                              >
                                <div className="h-32 relative overflow-hidden">
                                  <img
                                    src={
                                      classItem.thumbnailUrl
                                        ? classItem.thumbnailUrl.startsWith("http")
                                          ? classItem.thumbnailUrl
                                          : `https://neighbornet-back-production.up.railway.app${classItem.thumbnailUrl}`
                                        : "/default-class-image.jpg"
                                    }
                                    alt={classItem.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                                      {classItem.category || "Uncategorized"}
                                    </span>
                                    {classItem.averageRating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 text-amber-400" />
                                        <span className="text-sm text-slate-600">
                                          {classItem.averageRating.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <h3 className="font-medium text-slate-800 mb-1 line-clamp-1">{classItem.title}</h3>
                                  <p className="text-sm text-slate-500 line-clamp-2">{classItem.description}</p>
                                  <div className="mt-3 flex items-center gap-2">
                                    <img
                                      src={classItem.creator?.imageUrl || "/images/defaultProfile.png"}
                                      alt={classItem.creatorName}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-xs text-slate-600">{classItem.creatorName}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="col-span-2 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            {(!userId || userId === user?.data?.id?.toString()) ? (
                              <>
                                <div className="text-slate-400 mb-2">No favorite classes yet</div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => router("/homepage")}
                                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                                >
                                  Browse classes
                                </motion.button>
                              </>
                            ) : (
                              <div className="text-slate-400">
                                This user hasn't saved any classes yet
                              </div>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                    {activeTab === "achievements" && (
                        <motion.div
                          key="achievements"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {achievementsLoading ? (
                              // Loading skeleton
                              [...Array(6)].map((_, index) => (
                                <div key={index} className="animate-pulse bg-slate-50 rounded-lg p-6">
                                  <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4"></div>
                                  <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                                  <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto"></div>
                                </div>
                              ))
                            ) : achievements.length > 0 ? (
                              achievements.map((achievement, index) => (
                                <motion.div
                                  key={achievement.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 }}
                                  whileHover={{ y: -5 }}
                                  className={`overflow-hidden border rounded-lg ${
                                    achievement.unlocked ? "bg-white border-blue-100" : "bg-slate-50 border-slate-100"
                                  }`}
                                >
                                  <div className="p-6 flex flex-col items-center text-center">
                                  <div className={`mb-4 ${achievement.unlocked ? "" : "opacity-30"}`}>
                                      <AchievementIcon 
                                        iconName={achievement.iconName} 
                                        className={`h-8 w-8 ${
                                          achievement.unlocked 
                                            ? getIconColor(achievement.iconName) 
                                            : "text-gray-400"
                                        }`}
                                      />
                                    </div>
                                    <h3
                                      className={`font-medium mb-2 ${
                                        achievement.unlocked ? "text-slate-800" : "text-slate-400"
                                      }`}
                                    >
                                      {achievement.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">{achievement.description}</p>

                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${achievement.progress}%` }}
                                        transition={{ duration: 1, delay: index * 0.2 }}
                                        className={`h-full rounded-full ${
                                          achievement.unlocked ? "bg-blue-500" : "bg-slate-300"
                                        }`}
                                      ></motion.div>
                                    </div>

                                    <div className="mt-3 text-xs text-slate-500">
                                      {achievement.unlocked ? (
                                        <span className="text-blue-500">
                                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                        </span>
                                      ) : (
                                        <span>{Math.round(achievement.progress)}% progress</span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <div className="col-span-3 text-center py-8">
                                <div className="text-slate-400">No achievements yet</div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                        {activeTab === "activity" && (
                          <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="activities-section" // Added for scroll reference
                          >
                            <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                              {activitiesLoading ? (
                                // Loading skeleton
                                [...Array(3)].map((_, index) => (
                                  <div key={index} className="animate-pulse">
                                    <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-slate-200"></div>
                                    <div className="mb-1 flex items-center gap-2">
                                      <div className="h-3.5 w-24 bg-slate-200 rounded"></div>
                                      <div className="h-3.5 w-16 bg-slate-200 rounded ml-2"></div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-slate-100">
                                      <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 bg-slate-200 rounded"></div>
                                        <div className="flex-1">
                                          <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                                          <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : activities.length > 0 ? (
                                <>
                                  {/* Paginated Activities */}
                                  {activities
                                    .slice(
                                      (currentActivityPage - 1) * activitiesPerPage,
                                      currentActivityPage * activitiesPerPage
                                    )
                                    .map((activity, index) => (
                                      <motion.div
                                        key={activity.id}
                                        className="relative"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.15 }}
                                      >
                                        <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                        <div className="mb-1 text-sm text-slate-500 flex items-center gap-2">
                                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                          <span>{activity.date.toLocaleDateString()}</span>
                                          <Clock className="h-3.5 w-3.5 text-slate-400 ml-2" />
                                          <span>
                                            {activity.date.toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            })}
                                          </span>
                                        </div>
                                        <motion.div
                                          whileHover={{ x: 3 }}
                                          className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                              {getActivityIcon(activity.iconName)}
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-slate-800 mb-1">
                                                {activity.title}
                                              </h4>
                                              <p className="text-sm text-slate-600">
                                                {activity.description}
                                              </p>
                                            </div>
                                          </div>
                                        </motion.div>
                                      </motion.div>
                                    ))}

                                  {/* Pagination Controls */}
                                  {activities.length > activitiesPerPage && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                      className="mt-8 border-t border-slate-100 pt-6"
                                    >
                                      <div className="flex justify-center items-center gap-4">
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => setCurrentActivityPage((prev) => Math.max(prev - 1, 1))}
                                          disabled={currentActivityPage === 1}
                                          className={`p-2 rounded-lg transition-colors ${
                                            currentActivityPage === 1
                                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                              : "bg-white text-blue-500 hover:bg-blue-50 border border-blue-100"
                                          }`}
                                        >
                                          <ArrowLeft className="h-4 w-4" />
                                        </motion.button>

                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-slate-600">
                                            Page {currentActivityPage} of{" "}
                                            {Math.ceil(activities.length / activitiesPerPage)}
                                          </span>
                                        </div>

                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() =>
                                            setCurrentActivityPage((prev) =>
                                              Math.min(prev + 1, Math.ceil(activities.length / activitiesPerPage))
                                            )
                                          }
                                          disabled={
                                            currentActivityPage === Math.ceil(activities.length / activitiesPerPage)
                                          }
                                          className={`p-2 rounded-lg transition-colors ${
                                            currentActivityPage === Math.ceil(activities.length / activitiesPerPage)
                                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                              : "bg-white text-blue-500 hover:bg-blue-50 border border-blue-100"
                                          }`}
                                        >
                                          <ArrowRight className="h-4 w-4" />
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8">
                                  <div className="text-slate-400">No activities yet</div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Classes Created",
                  value: userStats.classesCreated,
                  icon: <BookOpen className="h-5 w-5 text-blue-500" />,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  label: "Items Posted",
                  value: userStats.itemsPosted,
                  icon: <Package className="h-5 w-5 text-indigo-500" />,
                  color: "from-indigo-500 to-indigo-600",
                },
                {
                  label: "Community Score",
                  value: `${userStats.communityScore}%`,
                  icon: <Star className="h-5 w-5 text-amber-500" />,
                  color: "from-amber-500 to-amber-600",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
                  <div className="p-4 flex items-center">
                    <div className="mr-4 p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

