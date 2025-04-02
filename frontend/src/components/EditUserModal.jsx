import { X } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

export default function EditUserModal({ 
    isOpen, 
    onClose, 
    user, 
    onUpdate 
  }) {
    const [changes, setChanges] = useState({});
    const [initialData, setInitialData] = useState({
      username: '',
      email: '',
      role: 'ROLE_USER',
      status: 'pending',
      bio: '',
      githubUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      facebookUrl: ''
    });
  
    useEffect(() => {
      if (user) {
        setInitialData({
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'ROLE_USER',
          status: user.emailVerified ? 'active' : 'pending',
          bio: user.bio || '',
          githubUrl: user.githubUrl || '',
          twitterUrl: user.twitterUrl || '',
          linkedinUrl: user.linkedinUrl || '',
          facebookUrl: user.facebookUrl || ''
        });
        setChanges({}); // Reset changes when modal opens with new user
      }
    }, [user]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      // Only track changes that are different from initial values
      if (value !== initialData[name]) {
        setChanges(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        // Remove the field if it's the same as initial value
        const newChanges = { ...changes };
        delete newChanges[name];
        setChanges(newChanges);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (Object.keys(changes).length === 0) {
        onClose();
        return;
      }
      try {
        await onUpdate(changes);
        onClose();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Edit User</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={changes.username ?? initialData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={changes.email ?? initialData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
  
            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={changes.role ?? initialData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={changes.status ?? initialData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
  
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={changes.bio ?? initialData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
  
            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">Social Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">GitHub</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={changes.githubUrl ?? initialData.githubUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Twitter</label>
                  <input
                    type="url"
                    name="twitterUrl"
                    value={changes.twitterUrl ?? initialData.twitterUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={changes.linkedinUrl ?? initialData.linkedinUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Facebook</label>
                  <input
                    type="url"
                    name="facebookUrl"
                    value={changes.facebookUrl ?? initialData.facebookUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
  
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Object.keys(changes).length === 0}
                className={`px-4 py-2 rounded-lg ${
                  Object.keys(changes).length === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }