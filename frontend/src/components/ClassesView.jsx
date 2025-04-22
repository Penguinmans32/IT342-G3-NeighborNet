import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  Search, 
  Plus, 
  Clock, 
  Calendar, 
  BookOpen,
  Star,
  MoreVertical,
  Filter,
  Grid,
  List
} from "lucide-react";
import { useState, useEffect} from "react";
import axios from "axios";
import { format } from "date-fns";
import { X } from "lucide-react";

export default function ClassesView() {
  const [viewType, setViewType] = useState("grid");
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchClasses();
  }, [search]);

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const debouncedSearch = debounce((value) => {
    setSearch(value);
  }, 500);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);
    debouncedSearch(value);
  };


  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailsModal(true);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/admin/classes/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = response.data.data;
      setStats({
        totalClasses: data.totalClasses || 0,
        activeClasses: data.activeClasses || 0,
        totalStudents: data.totalStudents || 0,
        averageRating: data.averageRating || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com/api/admin/classes`, {
        params: { search },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setClasses(response.data.data.classes || []);
      setLoading(false);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
    }
  };

  const handleDeleteClick = (classItem) => {
    setSelectedClass(classItem);
    setShowDeleteModal(true);
  };

  const deleteClass = async () => {
    try {
      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/admin/classes/${selectedClass.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowDeleteModal(false);
      fetchClasses();
      fetchStats();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const statsItems = [
    {
      title: "Total Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      color: "blue"
    },
    {
      title: "Active Classes",
      value: stats.activeClasses,
      icon: GraduationCap,
      color: "green"
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "purple"
    },
    {
      title: "Average Rating",
      value: stats.averageRating?.toFixed(1) || 0,
      icon: Star,
      color: "amber"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl p-6 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-${item.color}-100`}>{item.title}</p>
                    <h3 className="text-3xl font-bold mt-1">{item.value}</h3>
                  </div>
                  <Icon className={`w-8 h-8 text-${item.color}-100`} />
                </div>
              </motion.div>
            );
          })}
        </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search classes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isSearching ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setViewType("grid")}
                className={`p-2 ${viewType === "grid" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewType("list")}
                className={`p-2 ${viewType === "list" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-600"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 && !loading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
          <Search className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">No classes found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className={`grid ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
          {classes.map((classItem) => (
            <motion.div
              key={classItem.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
              onClick={() => handleClassClick(classItem)}
            >
              <div className="relative h-48">
                <img
                  src={`https://it342-g3-neighbornet.onrender.com${classItem?.thumbnailUrl}`}
                  alt={classItem.name}
                  className="w-full h-full object-cover"
                />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  active
                </span>
              </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{classItem.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{classItem.instructor}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{classItem.students} Students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{classItem.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(classItem.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-gray-600">{classItem.rating}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(classItem);
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Class
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}


      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Class</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedClass?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteClass}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


        {showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Class Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-start gap-6">
                  <img
                    src={`https://it342-g3-neighbornet.onrender.com${selectedClass?.thumbnailUrl}`}
                    alt={selectedClass?.title}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{selectedClass?.title}</h2>
                    <p className="text-gray-600 mt-2">{selectedClass?.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 font-medium">{selectedClass?.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 font-medium">{selectedClass?.difficulty}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-2 font-medium">{selectedClass?.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Enrolled:</span>
                        <span className="ml-2 font-medium">{selectedClass?.enrolledCount} students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Instructor Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2">{selectedClass?.creatorName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2">{selectedClass?.creatorEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2">{selectedClass?.phone_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Credentials:</span>
                      <span className="ml-2">{selectedClass?.creator_credentials}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {selectedClass?.requirements.map((req, index) => (
                      <li key={index} className="text-gray-600">{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Social Links */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Social Links</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClass?.linkedinUrl && (
                      <a href={selectedClass.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline">LinkedIn Profile</a>
                    )}
                    {selectedClass?.portfolioUrl && (
                      <a href={selectedClass.portfolioUrl} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline">Portfolio</a>
                    )}
                  </div>
                </div>

                {/* Meta Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2">{formatDate(selectedClass?.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2">{formatDate(selectedClass?.updatedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <span className="ml-2">{selectedClass?.averageRating.toFixed(1)} ({selectedClass?.ratingCount} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className={`grid ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}