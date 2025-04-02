import { motion } from "framer-motion";
import { 
  Package,
  Search,
  Filter,
  Grid,
  List,
  Tag,
  Star,
  Clock,
  Users,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function ItemsView() {
  const [viewType, setViewType] = useState("grid");
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalBorrowed: 0,
    totalBorrowers: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchItems();
  }, [search]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/items/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/admin/items`, {
        params: { search },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setItems(response.data.data);
      setLoading(false);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const deleteItem = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/items/${selectedItem.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowDeleteModal(false);
      fetchItems();
      fetchStats();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const statsItems = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      color: "blue"
    },
    {
      title: "Total Borrowed",
      value: stats.totalBorrowed,
      icon: Users,
      color: "green"
    },
    {
      title: "Total Borrowers",
      value: stats.totalBorrowers,
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
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

      {/* Items Grid */}
      <div className={`grid ${viewType === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="relative h-48">
            <img
              src={item.imageUrls[0]}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.imageUrls.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {item.imageUrls.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full ${
                      index === 0 ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  active
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{item.owner?.username}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.borrower ? "Borrowed" : "Available"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.availabilityPeriod}</span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(item);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete Item</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Item Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header Section with Image Gallery */}
              <div className="flex items-start gap-6">
                <div className="w-48 space-y-2">
                  <div className="relative h-48">
                    <img
                      src={selectedItem?.imageUrls[currentImageIndex]}
                      alt={selectedItem?.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {selectedItem?.imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) =>
                              prev === 0 ? selectedItem.imageUrls.length - 1 : prev - 1
                            );
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white hover:bg-black/75"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) =>
                              prev === selectedItem.imageUrls.length - 1 ? 0 : prev + 1
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 rounded-full text-white hover:bg-black/75"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {selectedItem?.imageUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedItem?.imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
                            currentImageIndex === index
                              ? "border-blue-500"
                              : "border-transparent"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${selectedItem?.name} preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedItem?.name}</h2>
                  <p className="text-gray-600 mt-2">{selectedItem?.description}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{selectedItem?.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2 font-medium">{selectedItem?.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Period:</span>
                      <span className="ml-2 font-medium">{selectedItem?.availabilityPeriod}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium">{selectedItem?.borrower ? "Borrowed" : "Available"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2">{selectedItem?.owner?.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{selectedItem?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2">{selectedItem?.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contact Preference:</span>
                    <span className="ml-2">{selectedItem?.contactPreference}</span>
                  </div>
                </div>
              </div>

              {/* Terms Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Terms and Conditions</h3>
                <p className="text-gray-600">{selectedItem?.terms}</p>
              </div>

              {/* Dates Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Availability</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Available From:</span>
                    <span className="ml-2">{formatDate(selectedItem?.availableFrom)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Available Until:</span>
                    <span className="ml-2">{formatDate(selectedItem?.availableUntil)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2">{formatDate(selectedItem?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}