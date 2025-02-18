import { motion } from "framer-motion";
import { useAuth } from "../backendApi/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MdMenu, MdAccountCircle, MdDashboard, MdSchool, MdSwapHoriz, MdChat, MdPeople, MdAdd, MdLibraryBooks, MdLogout } from "react-icons/md";
import axios from "axios";

const Homepage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userClasses, setUserClasses] = useState([]);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/classes/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserClasses(response.data);
      } catch (error) {
        console.error("Error fetching user classes:", error);
      }
    };

    if (user) {
      fetchUserClasses();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 md:hidden">
            <button className="text-white">
              <MdMenu className="text-2xl" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-xl font-bold text-blue-500">N</span>
            </div>
            <span className="text-xl font-semibold text-white">Neighbor Net</span>
          </div>

          <div className="flex-1 px-8 hidden md:block">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="search"
                placeholder="Search Classes, Teacher..."
                className="w-full h-10 px-4 rounded-md bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            {!user ? (
              <>
                <button className="hidden md:inline-flex text-white hover:text-white hover:bg-white/10 px-4 py-2 rounded-md">
                  Sign In
                </button>
                <button className="bg-black hover:bg-black/90 text-white px-4 py-2 rounded-md">Sign Up</button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white hidden md:block">{user.username}</span>
                <button onClick={() => setProfileMenuOpen(!isProfileMenuOpen)} className="text-white">
                  <MdAccountCircle className="text-2xl" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Actions Menu */}
      {isProfileMenuOpen && (
        <div className="absolute right-0 top-16 bg-white shadow-lg rounded-md w-[280px] overflow-hidden">
          <div className="p-4 text-center border-b">
            <div className="w-16 h-16 mx-auto mb-2">
              <img
                src={user?.avatar || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h3 className="font-semibold">{user?.name || "Kyla Dominic Genodiala"}</h3>
            <p className="text-sm text-gray-500 mb-2">Add a headline</p>
            <button
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-md transition-colors"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </button>
          </div>
          <nav className="py-1">
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/dashboard")}
            >
              <MdDashboard className="text-xl text-blue-500" />
              <span>Dashboard Classes & Other</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/skills")}
            >
              <MdSchool className="text-xl text-blue-500" />
              <span>Skills</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/borrowing")}
            >
              <MdSwapHoriz className="text-xl text-blue-500" />
              <span>Borrowing Features</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/messages")}
            >
              <MdChat className="text-xl text-blue-500" />
              <span>Messages</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/community")}
            >
              <MdPeople className="text-xl text-blue-500" />
              <span>Community</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/create-class")}
            >
              <MdAdd className="text-xl text-blue-500" />
              <span>Add Class</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/your-classes")}
            >
              <MdLibraryBooks className="text-xl text-blue-500" />
              <span>Your Classes</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <MdLogout className="text-xl text-blue-500" />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-8 space-y-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Share a Skill</h3>
            <p className="text-gray-600 mb-4">Share your expertise with your neighbors and earn community points.</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Start Sharing</button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Borrow Items</h3>
            <p className="text-gray-600 mb-4">Need something? Check what your neighbors are willing to lend.</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Browse Items</button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Community Chat</h3>
            <p className="text-gray-600 mb-4">Connect with your neighbors and join the conversation.</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Start Chatting</button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;