import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

const BorrowedItems = () => {
  const [borrowedItems, setBorrowedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchBorrowedItems()
  }, [])

  const fetchBorrowedItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/borrowing/items/borrowed", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setBorrowedItems(data)
    } catch (error) {
      console.error("Error fetching borrowed items:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to calculate days remaining until return date
  const getDaysRemaining = (borrowingEnd) => {
    if (!borrowingEnd) return null

    const endDate = new Date(borrowingEnd)
    const today = new Date()
    const diffTime = endDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Function to determine status color based on days remaining
  const getStatusColor = (daysRemaining) => {
    if (daysRemaining === null) return "gray"
    if (daysRemaining < 0) return "red"
    if (daysRemaining <= 3) return "yellow"
    return "green"
  }

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
              Borrowed Items
            </motion.h1>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/your-items")}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back to Your Items
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/homepage")}
                className="bg-white text-indigo-600 border border-indigo-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold mt-4 mb-1 text-purple-700">{borrowedItems.length}</h3>
          <p className="text-purple-600 text-sm font-medium">Total Borrowed Items</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : borrowedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {borrowedItems.map((item, index) => {
              const daysRemaining = getDaysRemaining(item.borrowingEnd)
              const statusColor = getStatusColor(daysRemaining)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-indigo-100"
                >
                  <div className="relative group h-56">
                    <img
                      src={item.imageUrls?.[0] || "/placeholder.svg?height=224&width=400"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="w-full bg-white/90 backdrop-blur-sm text-indigo-600 px-4 py-2 rounded-lg hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium
                      ${
                        statusColor === "green"
                          ? "bg-green-600/90 text-white"
                          : statusColor === "yellow"
                            ? "bg-yellow-500/90 text-white"
                            : statusColor === "red"
                              ? "bg-red-600/90 text-white"
                              : "bg-gray-600/90 text-white"
                      } backdrop-blur-sm`}
                    >
                      {daysRemaining === null
                        ? "No Return Date"
                        : daysRemaining < 0
                          ? "Overdue"
                          : daysRemaining === 0
                            ? "Due Today"
                            : `${daysRemaining} Days Left`}
                    </div>

                    {/* Owner Badge */}
                    <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      Borrowed
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-indigo-900">{item.name}</h3>
                    <p className="text-indigo-600 mb-4 line-clamp-2">{item.description}</p>

                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <p className="text-indigo-700 font-medium">{item.owner?.username || "Unknown Owner"}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p className="text-indigo-600 text-sm">{item.contactPreference}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        More Info
                      </button>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                        ${
                          statusColor === "green"
                            ? "bg-green-100 text-green-700"
                            : statusColor === "yellow"
                              ? "bg-yellow-100 text-yellow-700"
                              : statusColor === "red"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {daysRemaining === null ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : daysRemaining < 0 ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                        {daysRemaining === null
                          ? "No Return Date"
                          : daysRemaining < 0
                            ? `${Math.abs(daysRemaining)} Days Overdue`
                            : daysRemaining === 0
                              ? "Due Today"
                              : `${daysRemaining} Days Left`}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-xl shadow-sm border border-indigo-100"
          >
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">No Borrowed Items</h3>
            <p className="text-indigo-600 mb-6">You haven't borrowed any items yet.</p>
            <button
              onClick={() => navigate("/homepage")}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300 inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Browse Items to Borrow
            </button>
          </motion.div>
        )}
      </div>

      {/* Item Details Modal */}
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
              className="bg-white rounded-xl overflow-hidden max-w-lg w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <img
                  src={selectedItem.imageUrls?.[0] || "/placeholder.svg?height=224&width=400"}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Status Badge */}
                {selectedItem.borrowingEnd && (
                  <div
                    className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-medium
                    ${
                      getStatusColor(getDaysRemaining(selectedItem.borrowingEnd)) === "green"
                        ? "bg-green-600/90 text-white"
                        : getStatusColor(getDaysRemaining(selectedItem.borrowingEnd)) === "yellow"
                          ? "bg-yellow-500/90 text-white"
                          : getStatusColor(getDaysRemaining(selectedItem.borrowingEnd)) === "red"
                            ? "bg-red-600/90 text-white"
                            : "bg-gray-600/90 text-white"
                    } backdrop-blur-sm`}
                  >
                    {getDaysRemaining(selectedItem.borrowingEnd) === null
                      ? "No Return Date"
                      : getDaysRemaining(selectedItem.borrowingEnd) < 0
                        ? "Overdue"
                        : getDaysRemaining(selectedItem.borrowingEnd) === 0
                          ? "Due Today"
                          : `${getDaysRemaining(selectedItem.borrowingEnd)} Days Left`}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2 text-indigo-900">{selectedItem.name}</h3>
                <p className="text-indigo-600 mb-6">{selectedItem.description}</p>

                <div className="space-y-6">
                  {/* Owner Information */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-indigo-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Owner Information
                    </h4>
                    <div className="space-y-2">
                      <p className="text-indigo-700">
                        <span className="font-medium">Name:</span> {selectedItem.owner?.username || "Unknown"}
                      </p>
                      <p className="text-indigo-700">
                        <span className="font-medium">Contact Preference:</span> {selectedItem.contactPreference}
                      </p>
                      {selectedItem.email && (
                        <p className="text-indigo-700">
                          <span className="font-medium">Email:</span> {selectedItem.email}
                        </p>
                      )}
                      {selectedItem.phone && (
                        <p className="text-indigo-700">
                          <span className="font-medium">Phone:</span> {selectedItem.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Borrowing Period */}
                  {(selectedItem.borrowingStart || selectedItem.borrowingEnd) && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-purple-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Borrowing Period
                      </h4>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-purple-500 text-xs uppercase font-medium">From</p>
                          <p className="text-purple-900 font-medium">
                            {selectedItem.borrowingStart
                              ? new Date(selectedItem.borrowingStart).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-500 text-xs uppercase font-medium">To</p>
                          <p className="text-purple-900 font-medium">
                            {selectedItem.borrowingEnd
                              ? new Date(selectedItem.borrowingEnd).toLocaleDateString()
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedItem(null)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium"
                  >
                    Close
                  </motion.button>

                  {selectedItem.owner?.email && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`mailto:${selectedItem.owner.email}`}
                      className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium text-center"
                    >
                      Contact Owner
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BorrowedItems;