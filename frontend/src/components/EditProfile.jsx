"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    profileImage: "",
    aboutMe: "",
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    pinterestUrl: "",
    youtubeUrl: "",
    githubUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile data");
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData((prevData) => ({
        ...prevData,
        profileImage: reader.result,
      }));
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch("http://localhost:8080/api/users/profile", profileData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-white via-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 border border-purple-500">
        <motion.button
          onClick={() => navigate("/profile")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2 px-6 py-3 bg-white/80 
                      hover:bg-white/90 rounded-full shadow-lg hover:shadow-xl 
                      transition-all duration-300 backdrop-blur-sm border border-white/50"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 
                            rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 relative z-10"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
            className="text-transparent bg-clip-text bg-gradient-to-r 
                        from-blue-600 to-purple-600 font-medium"
          >
            Back Profile
          </motion.span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                          rounded-full opacity-0 group-hover:opacity-100 transition-opacity 
                          duration-300" />
        </motion.button>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-2">
              <div className="w-full h-full rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer group">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm text-center px-2">Upload Profile Image</span>
                </div>
              </label>
            </div>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleInputChange}
              className="text-xl font-semibold text-center border-b border-transparent hover:border-gray-300 focus:border-gray-500 focus:outline-none px-2 py-1"
              placeholder="Your Name"
            />
          </div>

          {/* About Me Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">About Me</h2>
              <button type="button" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Edit section</span>✎
              </button>
            </div>
            <textarea
              name="aboutMe"
              value={profileData.aboutMe}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                name="facebookUrl"
                value={profileData.facebookUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Facebook URL..."
              />
              <input
                type="url"
                name="twitterUrl"
                value={profileData.twitterUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Twitter URL..."
              />
              <input
                type="url"
                name="instagramUrl"
                value={profileData.instagramUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Instagram URL..."
              />
              <input
                type="url"
                name="pinterestUrl"
                value={profileData.pinterestUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Pinterest URL..."
              />
              <input
                type="url"
                name="youtubeUrl"
                value={profileData.youtubeUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="YouTube URL..."
              />
              <input
                type="url"
                name="githubUrl"
                value={profileData.githubUrl}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-200 rounded-lg"
                placeholder="Github URL..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/profile")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              type="button"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;