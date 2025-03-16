"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../backendApi/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  MdSearch,
  MdStar,
  MdLock,
  MdStarBorder,
  MdAccessTime,
  MdPerson,
  MdFilterList,
  MdSort,
  MdArrowUpward,
  MdArrowDownward,
  MdBookmark,
  MdBookmarkBorder,
  MdChevronLeft,
  MdPlayArrow,
  MdOutlineWbSunny,
} from "react-icons/md"
import axios from "axios"
import '../styles/search-results-styles.css'


function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query")
  const category = searchParams.get("category")
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [savedClasses, setSavedClasses] = useState([])
  const [hoveredClassId, setHoveredClassId] = useState(null)
  const [sortOption, setSortOption] = useState("relevance")
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)

  const sortRef = useRef(null)
  const filterRef = useRef(null)

  // Handle clicks outside the sort and filter dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortOptions(false)
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        // Include category in the search if it exists
        const searchUrl = `http://localhost:8080/api/classes/search?query=${encodeURIComponent(query)}${
          category ? `&category=${encodeURIComponent(category)}` : ""
        }`

        const response = await axios.get(searchUrl)
        setResults(response.data)
        setFilteredResults(response.data)

        // Simulate saved classes for demo purposes
        const randomSavedClasses = response.data
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .map((c) => c.id)

        setSavedClasses(randomSavedClasses)

        console.log("Search results:", response.data)
      } catch (error) {
        console.error("Error fetching search results:", error)
        setResults([])
        setFilteredResults([])
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      fetchResults()
    }
  }, [query, category])

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...results];
  
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((classItem) => 
        selectedCategories.includes(classItem.category)
      );
    }
  
    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter((classItem) => 
        (classItem.averageRating || 0) >= ratingFilter
      );
    }
  
    // Apply sorting
    switch (sortOption) {
      case "nameAsc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "nameDesc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "ratingDesc":
        filtered.sort((a, b) => 
          (b.averageRating || 0) - (a.averageRating || 0)
        );
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(...a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(...b.createdAt) : new Date(0);
          return dateB - dateA;
        });
        break;
      case "mostEnrolled":
        filtered.sort((a, b) => 
          (b.enrolledCount || 0) - (a.enrolledCount || 0)
        );
        break;
      default:
        break;
    }
  
    setFilteredResults(filtered);
  }, [results, selectedCategories, ratingFilter, sortOption]);

  const handleCategoryClick = (categoryName) => {
    navigate(`/search?query=${encodeURIComponent(categoryName)}`)
  }

  const handleClassClick = (classItem) => {
    navigate(`/class/${classItem.id}`);
  };

  const getFullThumbnailUrl = (thumbnailUrl) => {
    if (!thumbnailUrl) return "/default-class-image.jpg"
    return thumbnailUrl.startsWith("http") ? thumbnailUrl : `http://localhost:8080${thumbnailUrl}`
  }

  const toggleSaveClass = (e, classId) => {
    e.stopPropagation()
    setSavedClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]))
  }

  const toggleCategoryFilter = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }


  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} relative`}>
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-elements"></div>
        <div className="floating-elements floating-elements2"></div>
        <div className="floating-elements floating-elements3"></div>
      </div>

      {/* Header */}
      <div className={`relative ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(-1)}
                className={`p-2 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} rounded-full transition-colors`}
              >
                <MdChevronLeft className="text-xl" />
              </motion.button>

              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {category ? `${category} Classes` : `Search Results for "${query}"`}
                </h1>
                <p className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} text-sm`}>
                  Found {filteredResults.length} classes matching your search
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleDarkMode}
              className={`p-2 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"} rounded-full transition-colors`}
            >
              <MdOutlineWbSunny className={`text-xl ${isDarkMode ? "text-yellow-300" : "text-gray-600"}`} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Filters and Sort */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Category Pills */}
          {results.length > 0 && (
            <div className="flex flex-wrap gap-2 flex-1">
              {Array.from(new Set(results.map((item) => item.category))).map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 ${
                    isDarkMode
                      ? "bg-indigo-900/50 hover:bg-indigo-800 text-indigo-300"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-600"
                  } rounded-full text-sm transition-colors`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          )}

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 ${
                  isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-700"
                } rounded-lg shadow-sm flex items-center gap-2`}
              >
                <MdFilterList />
                <span>Filter</span>
              </motion.button>

              {/* Filter Dropdown */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-64 ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    } border rounded-lg shadow-lg z-20`}
                  >
                    <div className="p-4">
                      <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>Categories</h3>
                      <div className="space-y-2 mb-4">
                        {Array.from(new Set(results.map((item) => item.category))).map((cat) => (
                          <label key={cat} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => toggleCategoryFilter(cat)}
                              className="rounded text-blue-600"
                            />
                            <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{cat}</span>
                          </label>
                        ))}
                      </div>

                      <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"} mb-3`}>
                        Minimum Rating
                      </h3>
                      <div className="space-y-2 mb-4">
                        {[0, 3, 3.5, 4, 4.5].map((rating) => (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={ratingFilter === rating}
                              onChange={() => setRatingFilter(rating)}
                              className="rounded-full text-blue-600"
                            />
                            {rating === 0 ? (
                              <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Any rating</span>
                            ) : (
                              <div className="flex items-center">
                                <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{rating}+ </span>
                                <div className="flex ml-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star}>
                                      {star <= Math.floor(rating) ? (
                                        <MdStar className="text-yellow-400" />
                                      ) : star - 0.5 <= rating ? (
                                        <MdStar className="text-yellow-400" />
                                      ) : (
                                        <MdStarBorder className="text-yellow-400" />
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedCategories([])
                            setRatingFilter(0)
                            setShowFilters(false)
                          }}
                          className={`px-3 py-1.5 ${
                            isDarkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } rounded-lg text-sm transition-colors`}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSortOptions(!showSortOptions)}
                className={`px-4 py-2 ${
                  isDarkMode ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white hover:bg-gray-100 text-gray-700"
                } rounded-lg shadow-sm flex items-center gap-2`}
              >
                <MdSort />
                <span>Sort</span>
              </motion.button>

              {/* Sort Dropdown */}
              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-48 ${
                      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    } border rounded-lg shadow-lg z-20`}
                  >
                    <div className="py-1">
                      {[
                        { id: "relevance", label: "Relevance" },
                        { id: "ratingDesc", label: "Highest Rated", icon: <MdStar /> },
                        { id: "nameAsc", label: "Name (A-Z)", icon: <MdArrowUpward /> },
                        { id: "nameDesc", label: "Name (Z-A)", icon: <MdArrowDownward /> },
                        { id: "newest", label: "Newest First", icon: <MdAccessTime /> },
                        { id: "mostEnrolled", label: "Most Enrolled", icon: <MdPerson /> },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortOption(option.id)
                            setShowSortOptions(false)
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                            sortOption === option.id
                              ? isDarkMode
                                ? "bg-indigo-900/50 text-indigo-300"
                                : "bg-blue-50 text-blue-600"
                              : isDarkMode
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {option.icon}
                          <span>{option.label}</span>
                          {sortOption === option.id && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {(selectedCategories.length > 0 || ratingFilter > 0) && (
            <div className="flex items-center gap-2 mb-6">
            <span className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}>
                Active filters:
            </span>
            {selectedCategories.map((cat) => (
                <span
                key={cat}
                className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                    isDarkMode 
                    ? "bg-indigo-900/50 text-indigo-300" 
                    : "bg-blue-50 text-blue-600"
                }`}
                >
                {cat}
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryFilter(cat);
                    }}
                    className="ml-1 hover:text-red-500"
                >
                    ×
                </button>
                </span>
            ))}
            {ratingFilter > 0 && (
                <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                isDarkMode 
                    ? "bg-indigo-900/50 text-indigo-300" 
                    : "bg-blue-50 text-blue-600"
                }`}>
                {ratingFilter}+ Stars
                <button
                    onClick={() => setRatingFilter(0)}
                    className="ml-1 hover:text-red-500"
                >
                    ×
                </button>
                </span>
            )}
            <button
                onClick={() => {
                setSelectedCategories([]);
                setRatingFilter(0);
                }}
                className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
                } hover:underline`}
            >
                Clear all
            </button>
            </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`animate-pulse ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl h-80 shadow-md`}
              />
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((classItem) => (
                <motion.div
                    key={classItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    onHoverStart={() => setHoveredClassId(classItem.id)}
                    onHoverEnd={() => setHoveredClassId(null)}
                    className={`group ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer`}
                    onClick={() => handleClassClick(classItem)}
                >
                    <div className="relative aspect-video overflow-hidden">
                    <img
                        src={getFullThumbnailUrl(classItem.thumbnailUrl) || "/placeholder.svg"}
                        alt={classItem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Class info badges */}
                    <div className="absolute bottom-3 left-3 flex gap-2 z-10">
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1">
                        <MdAccessTime className="text-white text-xs" />
                        <span className="text-white text-xs">{classItem.duration}</span>
                        </div>
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full flex items-center gap-1">
                        <MdPerson className="text-white text-xs" />
                        <span className="text-white text-xs">{classItem.enrolledCount}</span>
                        </div>
                    </div>
                    </div>

                    <div className="p-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 ${
                        isDarkMode ? "bg-indigo-900/50 text-indigo-300" : "bg-blue-50 text-blue-600"
                        } text-xs font-medium rounded-full`}>
                        {classItem.category}
                        </span>
                        
                        <div className="flex items-center gap-1">
                        <MdPerson className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                        <span className="text-xs text-gray-500">
                            {classItem.enrolledCount || 0} enrolled
                        </span>
                        </div>

                        <div className="flex items-center gap-1">
                        <MdStar className="text-yellow-400" />
                        <span className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                            {classItem.averageRating?.toFixed(1) || "N/A"}
                        </span>
                        </div>
                    </div>

                    <h3
                        className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2 line-clamp-1`}
                    >
                        {classItem.title}
                    </h3>

                    <p className={`${isDarkMode ? "text-gray-300" : "text-gray-500"} text-sm mb-4 line-clamp-2`}>
                        {classItem.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <img
                            src={classItem.creator?.imageUrl || "/images/defaultProfile.png"}
                            alt={classItem.creatorName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {classItem.creatorName}
                        </span>
                        </div>

                        <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 ${
                            isDarkMode
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        } rounded-lg transition-colors shadow-sm`}
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClassClick(classItem)
                        }}
                        >
                        View Class
                        </motion.button>
                    </div>
                    </div>
                </motion.div>
                ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}
          >
            <MdSearch className={`text-6xl ${isDarkMode ? "text-gray-600" : "text-gray-300"} mx-auto mb-4`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"} mb-2`}>
              No results found
            </h2>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-500"}>
              Try adjusting your search terms or browse our categories
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/homepage")}
              className={`mt-6 px-6 py-2 ${
                isDarkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              } rounded-lg transition-colors shadow-sm`}
            >
              Browse All Classes
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchResults

