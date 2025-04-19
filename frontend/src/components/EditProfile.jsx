import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  ArrowLeft,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Plus,
  X,
  Check,
  Trash2,
  Save,
  Camera,
  Sparkles,
  ChevronRight,
  User,
  Briefcase,
  Heart,
  Link,
  Lock,
  Key,
  ArrowRight,
} from "lucide-react"
import { useAuth } from "../backendApi/AuthContext"

const EditProfile = () => {
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

  const [newSkill, setNewSkill] = useState({ name: "", level: 50 })
  const [newInterest, setNewInterest] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: "", type: "" })
  const [activeSection, setActiveSection] = useState("bio")
  const [previewImage, setPreviewImage] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const bioRef = useRef(null)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useNavigate()
  const { logout } = useAuth();

  const canChangePassword = passwords.current && 
                         passwords.new && 
                         passwords.confirm && 
                         passwords.new === passwords.confirm && 
                         passwords.new.length >= 8;

const handlePasswordChange = async () => {
  if (!canChangePassword) return;
  
  setChangingPassword(true);
  try {
    const response = await axios.put(
      "https://it342-g3-neighbornet.onrender.com/api/users/change-password",
      {
        currentPassword: passwords.current,
        newPassword: passwords.new
      },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.message) {
      showNotification(response.data.message, "success");
      setPasswords({ current: "", new: "", confirm: "" });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to change password";
    showNotification(errorMessage, "error");
    console.error('Password change error:', error.response?.data);
  } finally {
    setChangingPassword(false);
  }
};

const handleDeleteAccount = async () => {
  setDeleting(true);
  try {
    await axios.delete(
      "https://it342-g3-neighbornet.onrender.com/api/users/account",
      {
        data: { password: deletePassword },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );
    
    localStorage.clear();
    
    if (logout) { 
      logout();
    }

    window.location.href = "/";
  } catch (error) {
    showNotification(
      error.response?.data?.message || "Failed to delete account", 
      "error"
    );
    setDeleting(false);
  }
};

  const sections = [
    { id: "bio", label: "About Me", icon: <User className="h-4 w-4" /> },
    { id: "skills", label: "Skills", icon: <Briefcase className="h-4 w-4" /> },
    { id: "interests", label: "Interests", icon: <Heart className="h-4 w-4" /> },
    { id: "social", label: "Social Links", icon: <Link className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Lock className="h-4 w-4" /> },
  ]

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("https://it342-g3-neighbornet.onrender.com/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
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
        })
        setLoading(false)
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to load profile data", "error")
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  useEffect(() => {
    // Auto-focus the bio textarea when the component loads
    if (bioRef.current && activeSection === "bio" && !loading) {
      setTimeout(() => {
        bioRef.current.focus()
      }, 500)
    }
  }, [loading, activeSection])

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith("social.")) {
      const socialNetwork = name.split(".")[1]
      setProfileData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value,
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0])
    }
  }

  const handleImageFile = (file) => {
    // Preview the image
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload the image
    handleImageUpload(file)
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.put("https://it342-g3-neighbornet.onrender.com/api/users/profile/picture", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      })
      setProfileData((prev) => ({
        ...prev,
        imageUrl: response.data.imageUrl,
      }))
      showNotification("Profile picture updated successfully!", "success")
    } catch (error) {
      showNotification("Failed to update profile picture", "error")
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.name) return
    setProfileData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }))
    setNewSkill({ name: "", level: 50 })
  }

  const handleRemoveSkill = (index) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const handleAddInterest = () => {
    if (!newInterest) return
    setProfileData((prev) => ({
      ...prev,
      interests: [...prev.interests, newInterest],
    }))
    setNewInterest("")
  }

  const handleRemoveInterest = (index) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.patch(
        "https://it342-g3-neighbornet.onrender.com/api/users/profile",
        {
          bio: profileData.bio,
          skills: profileData.skills,
          interests: profileData.interests,
          socialLinks: profileData.socialLinks,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      showNotification("Profile updated successfully!", "success")
      setTimeout(() => {
        router.push("/profile")
      }, 1000)
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update profile", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-100 opacity-25"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-600 animate-pulse">Loading your profile...</p>
      </div>
    )
  }

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
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-100 blur-3xl opacity-30"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-100 blur-3xl opacity-30"></div>

      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          onClick={() => router("/profile")}
          whileHover={{ scale: 1.02, x: -5 }}
          whileTap={{ scale: 0.98 }}
          className="group mb-8 flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-slate-100"
        >
          <ArrowLeft className="h-4 w-4 text-blue-500 group-hover:animate-pulse" />
          <span className="text-blue-500 font-medium">Back to Profile</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-6">
              {/* Profile Image */}
              <div
                className={`relative mx-auto w-40 h-40 rounded-full overflow-hidden border-4 ${
                  dragActive ? "border-blue-400 ring-4 ring-blue-100" : "border-white"
                } shadow-md transition-all duration-300`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
               <img
                  src={previewImage || profileData.imageUrl || "/images/defaultProfile.png?height=160&width=160"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    if (e.currentTarget.src !== "/images/defaultProfile.png?height=160&width=160") {
                      e.currentTarget.src = "/images/defaultProfile.png?height=160&width=160";
                    }
                  }}
                  loading="lazy"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Camera className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Change Photo</span>
                  <span className="text-white/70 text-xs mt-1">or drop an image</span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800">{profileData.username}</h2>
                <p className="text-slate-500">{profileData.email}</p>
              </div>

              {/* Navigation */}
              <nav className="mt-8">
                <ul className="space-y-2">
                  {sections.map((section) => (
                    <motion.li key={section.id}>
                      <button
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                            : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className={`${activeSection === section.id ? "text-blue-500" : "text-slate-400"}`}>
                          {section.icon}
                        </span>
                        <span>{section.label}</span>
                        {activeSection === section.id && (
                          <motion.div layoutId="activeSection" className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Save Button (Mobile) */}
              <div className="lg:hidden">
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg ${
                    saving
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                  } transition-all duration-200`}
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden"
            >
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Edit Your Profile
                </h1>
                <p className="text-slate-500 mt-1">Customize your profile information and make it stand out</p>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeSection === "bio" && (
                    <motion.div
                      key="bio"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">About Me</label>
                        <textarea
                          ref={bioRef}
                          name="bio"
                          value={profileData.bio || ""}
                          onChange={handleInputChange}
                          rows={8}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          This will be displayed on your public profile. Be creative and authentic!
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <p className="text-sm text-slate-500">
                          {profileData.bio ? profileData.bio.length : 0} characters
                        </p>
                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("skills")}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <span>Next: Skills</span>
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "skills" && (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-slate-700">Skills</label>
                          <span className="text-xs text-slate-500">{profileData.skills.length} / 10 skills</span>
                        </div>

                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={newSkill.name}
                              onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder="Add a skill..."
                              className="w-full p-3 pl-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                            <span className="text-xs text-slate-500 whitespace-nowrap">Level:</span>
                            <input
                              type="range"
                              value={newSkill.level}
                              onChange={(e) =>
                                setNewSkill((prev) => ({ ...prev, level: Number.parseInt(e.target.value) }))
                              }
                              min="0"
                              max="100"
                              className="flex-1 accent-blue-500"
                            />
                            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                              {newSkill.level}%
                            </span>
                          </div>

                          <motion.button
                            type="button"
                            onClick={handleAddSkill}
                            disabled={!newSkill.name}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                              !newSkill.name
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            } transition-colors`}
                          >
                            <Plus className="h-5 w-5" />
                          </motion.button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <AnimatePresence>
                            {profileData.skills.map((skill, index) => (
                              <motion.div
                                key={`${skill.name}-${index}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="relative p-4 bg-white border border-slate-100 rounded-lg group hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-slate-800">{skill.name}</span>
                                  <span className="text-sm text-slate-500">{skill.level}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${skill.level}%` }}
                                  ></div>
                                </div>
                                <motion.button
                                  type="button"
                                  onClick={() => handleRemoveSkill(index)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {profileData.skills.length === 0 && (
                            <div className="col-span-full p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                              <p className="text-slate-500">Add your skills to showcase your expertise</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("bio")}
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back: About Me</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("interests")}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <span>Next: Interests</span>
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "interests" && (
                    <motion.div
                      key="interests"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-slate-700">Interests</label>
                          <span className="text-xs text-slate-500">{profileData.interests.length} interests</span>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            placeholder="Add an interest..."
                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newInterest) {
                                e.preventDefault()
                                handleAddInterest()
                              }
                            }}
                          />
                          <motion.button
                            type="button"
                            onClick={handleAddInterest}
                            disabled={!newInterest}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg flex items-center justify-center ${
                              !newInterest
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            } transition-colors`}
                          >
                            <Plus className="h-5 w-5" />
                          </motion.button>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <AnimatePresence>
                            {profileData.interests.map((interest, index) => (
                              <motion.div
                                key={`${interest}-${index}`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="group relative inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 hover:shadow-sm transition-shadow"
                              >
                                <span>{interest}</span>
                                <motion.button
                                  type="button"
                                  onClick={() => handleRemoveInterest(index)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="ml-2 p-0.5 bg-blue-100 text-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-200"
                                >
                                  <X className="h-3 w-3" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {profileData.interests.length === 0 && (
                            <div className="w-full p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                              <p className="text-slate-500">Add your interests to show what you're passionate about</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("skills")}
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back: Skills</span>
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("social")}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <span>Next: Social Links</span>
                          <ChevronRight className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "social" && (
                    <motion.div
                      key="social"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700">Social Links</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Github className="h-5 w-5" />
                            </div>
                            <input
                              type="url"
                              name="social.github"
                              value={profileData.socialLinks.github}
                              onChange={handleInputChange}
                              placeholder="GitHub Profile"
                              className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Twitter className="h-5 w-5" />
                            </div>
                            <input
                              type="url"
                              name="social.twitter"
                              value={profileData.socialLinks.twitter}
                              onChange={handleInputChange}
                              placeholder="Twitter Profile"
                              className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Linkedin className="h-5 w-5" />
                            </div>
                            <input
                              type="url"
                              name="social.linkedin"
                              value={profileData.socialLinks.linkedin}
                              onChange={handleInputChange}
                              placeholder="LinkedIn Profile"
                              className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>

                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <Facebook className="h-5 w-5" />
                            </div>
                            <input
                              type="url"
                              name="social.facebook"
                              value={profileData.socialLinks.facebook}
                              onChange={handleInputChange}
                              placeholder="Facebook Profile"
                              className="w-full p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          Add your social media profiles to connect with others and showcase your work
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <motion.button
                          type="button"
                          onClick={() => setActiveSection("interests")}
                          whileHover={{ scale: 1.02, x: -5 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 text-blue-600 font-medium"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back: Interests</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeSection === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    {/* Password Change Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
                      </div>

                      {profileData.provider ? (
                        // Social Login User Message
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                          <div className="flex items-start gap-3">
                            {profileData.provider === "google" ? (
                              <img src="/images/google.png" alt="Google" className="w-6 h-6" />
                            ) : profileData.provider === "github" ? (
                              <Github className="w-6 h-6 text-slate-700" />
                            ) : (
                              <img src="/images/microsoft.png" alt="Microsoft" className="w-6 h-6" />
                            )}
                            <div>
                              <h4 className="font-medium text-slate-800">Social Login Account</h4>
                              <p className="text-sm text-slate-600 mt-1">
                                Your account is managed through {profileData.provider}. 
                                To change your password, please visit your {profileData.provider} account settings.
                              </p>
                              <a 
                                href={
                                  profileData.provider === "google" 
                                    ? "https://myaccount.google.com/security" 
                                    : profileData.provider === "github"
                                    ? "https://github.com/settings/security"
                                    : "https://account.microsoft.com/security"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700"
                              >
                                Manage {profileData.provider} Account
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Regular User Password Change Form
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Current Password
                            </label>
                            <input
                              type="password"
                              value={passwords.current}
                              onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="Enter your current password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              New Password
                            </label>
                            <input
                              type="password"
                              value={passwords.new}
                              onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="Enter your new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              value={passwords.confirm}
                              onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="Confirm your new password"
                            />
                          </div>

                          <div className="pt-2">
                            <motion.button
                              type="button"
                              onClick={handlePasswordChange}
                              disabled={!canChangePassword}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                                canChangePassword
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
                              } transition-colors`}
                            >
                              {changingPassword ? (
                                <>
                                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                  <span>Changing Password...</span>
                                </>
                              ) : (
                                <>
                                  <Key className="h-4 w-4" />
                                  <span>Change Password</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Account Deletion Section */}
                    <div className="space-y-4 pt-6 border-t border-slate-200">
                      <div>
                        <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {profileData.provider 
                            ? `This will permanently delete your NeighborNet account. Your ${profileData.provider} account will not be affected.`
                            : "Once you delete your account, there is no going back. Please be certain."}
                        </p>
                      </div>

                      <motion.button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </motion.button>
                    </div>

                    {/* Back Navigation */}
                    <div className="flex justify-between items-center pt-4">
                      <motion.button
                        type="button"
                        onClick={() => setActiveSection("social")}
                        whileHover={{ scale: 1.02, x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 text-blue-600 font-medium"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back: Social Links</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Form Footer */}
              <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                  <span className="font-medium text-blue-600">{activeSection}</span> section
                </div>

                <div className="hidden lg:flex space-x-4">
                  <motion.button
                    type="button"
                    onClick={() => router.push("/profile")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-2.5 rounded-lg flex items-center gap-2 ${
                      saving
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                    } transition-all duration-200`}
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>


      {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-red-600 mb-4">Delete Account</h3>
                {profileData.provider ? (
                  <p className="text-slate-600 mb-6">
                    This will permanently delete your NeighborNet account. Your {profileData.provider} account will not be affected.
                    Click delete to confirm.
                  </p>
                ) : (
                  <p className="text-slate-600 mb-6">
                    This action cannot be undone. Please enter your password to confirm deletion.
                  </p>
                )}
                
                {!profileData.provider && (
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full p-3 mb-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                )}
                
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={(!profileData.provider && !deletePassword) || deleting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 ${
                      (!profileData.provider && !deletePassword) || deleting
                        ? "bg-red-200 text-red-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    } transition-colors`}
                  >
                    {deleting ? (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
    </div>
  )
}

export default EditProfile

