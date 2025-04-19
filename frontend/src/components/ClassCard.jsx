import { memo, useCallback } from 'react';
import { MdBookmark, MdBookmarkBorder, MdStar, MdAccessTime} from "react-icons/md";
import { FileText, BookOpen } from 'lucide-react';
import { motion } from "framer-motion";

const DEFAULT_CLASS_IMAGE = "/images/defaultProfile.png"; 
const DEFAULT_PROFILE_IMAGE = "/images/defaultProfile.png";

// Get Google Cloud Storage URL for thumbnails
const getThumbnailUrl = (thumbnailUrl) => {
  if (!thumbnailUrl) return "/placeholder.svg";
  
  if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
  
  if (thumbnailUrl.includes('/api/classes/thumbnail/')) {
    const filename = thumbnailUrl.substring(thumbnailUrl.lastIndexOf('/') + 1);
    return `https://storage.googleapis.com/neighbornet-media/thumbnails/${filename}`;
  }
  
  return thumbnailUrl;
};

// Handle different types of image URLs
const getCorrectImageUrl = (imageUrl, isProfileImage = false) => {
  if (!imageUrl) return isProfileImage ? DEFAULT_PROFILE_IMAGE : DEFAULT_CLASS_IMAGE;
  
  // Handle profile pictures from Google Cloud Storage
  if (isProfileImage && imageUrl.includes('/api/users/profile-pictures/')) {
    const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    return `https://storage.googleapis.com/neighbornet-media/profile-pictures/${filename}`;
  }
  
  // Handle class thumbnails from Google Cloud Storage
  if (!isProfileImage && imageUrl.includes('/api/classes/thumbnail/')) {
    return getThumbnailUrl(imageUrl);
  }
  
  if (imageUrl.includes('localhost:8080')) {
    const path = imageUrl.split('localhost:8080')[1];
    return `https://it342-g3-neighbornet.onrender.com${path}`;
  }
  
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }
  
  if (imageUrl.startsWith("/api/")) {
    return `https://it342-g3-neighbornet.onrender.com${imageUrl}`;
  }
  
  return imageUrl;
};

const ClassCard = memo(({ 
    classItem, 
    isDarkMode, 
    savedClasses, 
    toggleSaveClass, 
    navigate,
    user
}) => {
    const handleCardClick = useCallback(() => {
        navigate(`/class/${classItem.id}`);
    }, [classItem.id, navigate]);

    const handleSaveClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveClass(classItem.id);
    }, [classItem.id, toggleSaveClass]);

    const navigateToProfile = useCallback((e, userId) => {
      e.stopPropagation(); 
      if (userId === user?.id) {
        navigate('/profile');
      } else {
        navigate(`/profile/${userId}`);
      }
    }, [navigate, user]);

    const isSaved = Array.isArray(savedClasses) && savedClasses.includes(classItem.id);

    const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23cccccc'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' alignment-baseline='middle' fill='%23ffffff'%3ENo Image%3C/text%3E%3C/svg%3E";
    
    // Use the updated functions with proper cloud storage handling
    const thumbnailUrl = getCorrectImageUrl(classItem.thumbnailUrl, false);
    const profileImageUrl = getCorrectImageUrl(classItem.creator?.imageUrl, true);

    return (
        <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`group relative cursor-pointer ${
            isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300`}
        onClick={handleCardClick}
    >
        <div className="aspect-video relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-300"></div>
            <img
                loading="lazy"
                src={thumbnailUrl}
                alt={classItem.title || "Class"}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300 relative z-10"
                onError={(e) => {
                  if (e.target.src !== placeholderImage) {
                    console.log("Using placeholder for image:", e.target.src);
                    e.target.src = placeholderImage;
                  }
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                <button
                    onClick={handleSaveClick}
                    className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                    {isSaved ? (
                        <MdBookmark className="text-blue-600 text-xl" />
                    ) : (
                        <MdBookmarkBorder className="text-gray-700 text-xl" />
                    )}
                </button>
            </div>
        </div>
  
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 ${
                  isDarkMode ? "bg-indigo-900/50 text-indigo-300" : "bg-blue-50 text-blue-600"
                } text-xs font-medium rounded-full`}
              >
                {classItem.category 
                  ? classItem.category.charAt(0).toUpperCase() + classItem.category.slice(1).toLowerCase()
                  : "Uncategorized"}
              </span>
              <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-400"} flex items-center gap-1`}>
                <MdAccessTime className="text-base" />
                {classItem.duration || "1h 30m"}
              </span>
            </div>
            <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <h3
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } mb-2 line-clamp-1`}
                >
                  {classItem.title || "Untitled Class"}
                </h3>
              </div>
              <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-gray-400 mt-1" />
              <p className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} text-sm mb-4 line-clamp-2`}>
                {classItem.description || "No description available"}
              </p>
            </div>
  
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* User circle with initials as immediate fallback */}
                <div className="relative w-6 h-6">
                  {/* Colored circle with initials as immediate visual */}
                  <div className="absolute inset-0 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                    {classItem.creatorName ? classItem.creatorName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  
                  {/* Profile image on top */}
                  <img
                    loading="lazy"
                    src={profileImageUrl}
                    alt={classItem.creator?.username || "Creator"}
                    className="absolute inset-0 w-full h-full rounded-full object-cover cursor-pointer"
                    onClick={(e) => navigateToProfile(e, classItem.creatorId)}
                    onError={(e) => {
                      // If the profile image fails, use a data URL as absolute fallback
                      if (e.target.src !== placeholderImage) {
                        e.target.src = placeholderImage;
                      }
                    }}
                  />
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {classItem.creatorName || "Unknown Creator"}
                  </h4>
                  <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {classItem.sections?.length || 0} sections
                  </p>
                </div>
              </div>
  
              <div className="flex items-center gap-1">
                <MdStar className="text-yellow-400" />
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {classItem.averageRating?.toFixed(1) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
    );
});

ClassCard.displayName = 'ClassCard';
  
export default ClassCard;