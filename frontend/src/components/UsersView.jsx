import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Calendar, 
  MoreVertical,
  Edit,
  Trash2,
  X,
  RefreshCw 
} from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import EditUserModal from "./EditUserModal";
import AddUserModal from "./AddUserModal";

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, newThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); 
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [page, search, activeTab]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const getCorrectImageUrl = (imageUrl, isProfileImage = false) => {
    if (!imageUrl) return isProfileImage ? DEFAULT_PROFILE_IMAGE : DEFAULT_CLASS_IMAGE;
    
    if (isProfileImage && imageUrl.includes('/api/users/profile-pictures/')) {
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      return `https://storage.googleapis.com/neighbornet-media/profile-pictures/${filename}`;
    }
    
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

  const handleAddUser = async (userData) => {
    try {
      await axios.post(
        'https://it342-g3-neighbornet.onrender.com/api/admin/users',
        userData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchUsers();
      fetchStats();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handlePermanentDelete = async () => {
    try {
      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/admin/users/${selectedUser.id}/permanent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowPermanentDeleteModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error permanently deleting user:', error);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      await axios.patch(
        `https://it342-g3-neighbornet.onrender.com/api/admin/users/${selectedUser.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchUsers();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await axios.post(
        `https://it342-g3-neighbornet.onrender.com/api/admin/users/${userId}/restore`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('https://it342-g3-neighbornet.onrender.com/api/admin/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const endpoint = activeTab === 'deleted' 
        ? '/api/admin/users/deleted'
        : '/api/admin/users';
      
      const response = await axios.get(`https://it342-g3-neighbornet.onrender.com${endpoint}`, {
        params: { search, page, size: 10 },
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data.data.content);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`https://it342-g3-neighbornet.onrender.com/api/admin/users/${selectedUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setShowDeleteModal(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalUsers}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-100" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Users</p>
              <h3 className="text-3xl font-bold mt-1">{stats.activeUsers}</h3>
            </div>
            <Users className="w-8 h-8 text-green-100" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">New This Month</p>
              <h3 className="text-3xl font-bold mt-1">{stats.newThisMonth}</h3>
            </div>
            <Users className="w-8 h-8 text-purple-100" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'active' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active Users
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'deleted' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveTab('deleted')}
        >
          Deleted Users
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={getCorrectImageUrl(user.imageUrl, true) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`} 
                      alt="" 
                    />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(user.createdDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab === 'deleted' ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-red-600 text-xs">
                          Deleted on: {format(new Date(user.deletionDate), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-gray-500 text-xs">
                          Will be permanently deleted on: {format(new Date(user.scheduledDeletionDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {user.emailVerified ? 'active' : 'pending'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      {activeTab === 'deleted' ? (
                        <>
                          <button 
                            onClick={() => handleRestoreUser(user.id)}
                            className="text-green-400 hover:text-green-600 flex items-center gap-1"
                          >
                            <RefreshCw className="w-5 h-5" />
                            <span>Restore</span>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowPermanentDeleteModal(true);
                            }}
                            className="text-red-400 hover:text-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span>Delete Permanently</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleDeleteClick(user)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{page * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((page + 1) * 10, stats.totalUsers)}
                </span>{' '}
                of <span className="font-medium">{stats.totalUsers}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium
                      ${page === i 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Delete User</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the user "{selectedUser?.username}"? Can be still restored later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}


          {showPermanentDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Permanent Delete User</h3>
                  <button 
                    onClick={() => setShowPermanentDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to permanently delete the user "{selectedUser?.username}"? 
                  This action cannot be undone and all user data will be permanently removed.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPermanentDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePermanentDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          )}

       {/* Edit User Modal */}
       <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />


      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddUser}
      />
    </div>
  );
}