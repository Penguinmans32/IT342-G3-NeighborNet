import { memo, useCallback } from 'react';
import { MdBookmark, MdBookmarkBorder, MdStar, MdAccessTime} from "react-icons/md";
import { FileText, BookOpen, AlignLeft } from 'lucide-react';
import { motion } from "framer-motion";

const getCorrectImageUrl = (imageUrl) => {
  if (!imageUrl) return "/default-class-image.jpg";
  
  if (imageUrl.startsWith("http")) return imageUrl;
  
  const isApiPath = imageUrl.startsWith("/api/");
  
  return isApiPath 
    ? `https://neighbornet-back-production.up.railway.app${imageUrl}`
    : imageUrl;
};

const ClassCard = memo(({ 
    classItem, 
    isDarkMode, 
    savedClasses, 
    toggleSaveClass, 
    navigate,
    user
}) => {
    // Use useCallback for event handlers
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

    // Get correct image URLs
    const thumbnailUrl = getCorrectImageUrl(classItem.thumbnailUrl);
    const profileImageUrl = classItem.creator?.imageUrl 
      ? getCorrectImageUrl(classItem.creator.imageUrl)
      : "/images/defaultProfile.png";

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
            <img
                loading="lazy"
                src={thumbnailUrl}
                alt={classItem.title || "Class thumbnail"}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-class-image.jpg";
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
              <img
                loading="lazy"
                src={profileImageUrl}
                alt={classItem.creator?.username || "Creator"}
                className="w-6 h-6 rounded-full object-cover cursor-pointer"
                onClick={(e) => navigateToProfile(e, classItem.creatorId)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/defaultProfile.png";
                }}
              />
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