import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Footer from './SplashScreen/Footer';

const YourItems = () => {
  const [items, setItems] = useState([])
  const [lentItems, setLentItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [borrowers, setBorrowers] = useState([])
  const [activeTab, setActiveTab] = useState("available")
  const navigate = useNavigate()
  
  useEffect(() => {
    fetchYourItems()
    fetchLentItems()
  }, [])

  const fetchYourItems = async () => {
    try {
      const response = await fetch("https://it342-g3-neighbornet.onrender.com/api/borrowing/items/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error("Error fetching your items:", error)
    }
  }

  const getItemImageUrl = (imageUrl) => {
    if (!imageUrl) return "/images/no-image.png";
    
    if (imageUrl.startsWith('http')) return imageUrl;
    
    if (imageUrl.includes('/api/borrowing/items/images/')) {
      try {
        const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        return `https://storage.googleapis.com/neighbornet-media/item-images/${filename}`;
      } catch (error) {
        console.error("Error parsing image URL:", error);
        return "/images/no-image.png";
      }
    }
    
    return imageUrl;
  };


  const fetchLentItems = async () => {
    try {
      const response = await fetch("https://it342-g3-neighbornet.onrender.com/api/borrowing/items/lent", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      console.log("Lent items with borrowing details:", data);
      setLentItems(data);
    } catch (error) {
      console.error("Error fetching lent items:", error);
    }
  };

  const fetchBorrowers = async (itemId) => {
    try {
      const response = await fetch(`https://it342-g3-neighbornet.onrender.com/api/borrowing/items/${itemId}/borrowers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setBorrowers(data)
      setSelectedItem(itemId)
    } catch (error) {
      console.error("Error fetching borrowers:", error)
    }
  }

  const availableItems = items.filter((item) => !lentItems.find((lent) => lent.id === item.id))

  return (
    <div className="min-h-screen bg-indigo-50/30">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-indigo-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Items Collection
            </motion.h1>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/borrowed-items")}
                className="bg-white text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Borrowed Items
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/homepage")}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Homepage
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-blue-700">{items.length}</h3>
            <p className="text-blue-600 text-sm font-medium">Total Items</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-indigo-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-indigo-700">{availableItems.length}</h3>
            <p className="text-indigo-600 text-sm font-medium">Available Items</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold mt-4 mb-1 text-purple-700">{lentItems.length}</h3>
            <p className="text-purple-600 text-sm font-medium">Currently Lent</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-indigo-200 mb-8">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "available"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          >
            Available Items
            {availableItems.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                {availableItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("lent")}
            className={`px-6 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "lent"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            Currently Lent
            {lentItems.length > 0 && (
              <span className="ml-2 bg-purple-100 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                {lentItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Available Items Section */}
        <AnimatePresence mode="wait">
          {activeTab === "available" && (
            <motion.div
              key="available"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              {availableItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-indigo-100"
                    >
                      <div className="relative group h-56">
                      <img
                        src={getItemImageUrl(item.imageUrls?.[0]) || "/placeholder.svg?height=224&width=400"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/no-image.png";
                        }}
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 w-full">
                            <button
                              onClick={() => fetchBorrowers(item.id)}
                              className="w-full bg-white/90 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              View Borrowers
                            </button>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          Available
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-indigo-900">{item.name}</h3>
                        <p className="text-indigo-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => fetchBorrowers(item.id)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Details
                          </button>
                          <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            Ready to Lend
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-indigo-100">
                  <svg
                    className="w-16 h-16 text-indigo-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-indigo-900 mb-2">No Available Items</h3>
                  <p className="text-indigo-600 mb-6">You don't have any available items to lend at the moment.</p>
                  <button
                    onClick={() => navigate("/add-item")}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add New Item
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Lent Items Section */}
          {activeTab === "lent" && (
            <motion.div
              key="lent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {lentItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lentItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-purple-100"
                    >
                      <div className="relative group h-56">
                      <img
                        src={getItemImageUrl(item.imageUrls?.[0]) || "/placeholder.svg?height=224&width=400"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                          <div className="p-4 w-full">
                            <button
                              onClick={() => fetchBorrowers(item.id)}
                              className="w-full bg-white/90 backdrop-blur-sm text-purple-600 px-4 py-2 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              View Borrowers
                            </button>
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                          Currently Lent
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-purple-900">{item.name}</h3>
                        <p className="text-purple-600 mb-4 line-clamp-2">{item.description}</p>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="space-y-2">
                            <p className="text-purple-800 text-sm flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Currently Being Borrowed
                            </p>
                            {/* Add return date info */}
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-purple-500 font-medium">Return Date:</p>
                                <p className="text-purple-700">
                                  {item.borrowingEnd ? new Date(item.borrowingEnd).toLocaleDateString() : 'No Return Date Set'}
                                </p>
                              </div>
                              <svg 
                                className="w-5 h-5 text-purple-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100">
                  <svg
                    className="w-16 h-16 text-purple-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">No Items Currently Lent</h3>
                  <p className="text-purple-600 mb-6">None of your items are currently being borrowed.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Borrowers Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-indigo-900/50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-indigo-900">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Current Borrowers
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {borrowers.length > 0 ? (
                  <div className="divide-y divide-indigo-100">
                    {borrowers.map((borrower, index) => (
                      <motion.div
                        key={borrower.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="py-4 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-indigo-900">Borrower ID: {borrower.borrowerId}</p>
                            <p
                              className={`text-sm ${borrower.status === "APPROVED" ? "text-green-600" : "text-yellow-600"}`}
                            >
                              {borrower.status}
                            </p>
                          </div>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-3 flex justify-between">
                          <div className="text-sm">
                            <p className="text-indigo-400 text-xs uppercase font-medium">From</p>
                            <p className="text-indigo-900">{new Date(borrower.borrowingStart).toLocaleDateString()}</p>
                          </div>
                          <div className="text-sm text-right">
                            <p className="text-indigo-400 text-xs uppercase font-medium">To</p>
                            <p className="text-indigo-900">{new Date(borrower.borrowingEnd).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
                            ${
                              borrower.status === "APPROVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {borrower.status === "APPROVED" ? (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              ) : (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              )}
                            </svg>
                            {borrower.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <svg
                      className="w-16 h-16 text-indigo-200 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <p className="text-indigo-500 text-lg">No current borrowers</p>
                    <p className="text-indigo-400 text-sm mt-2">This item is available for lending</p>
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedItem(null)}
                  className="mt-6 w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

export default YourItems;