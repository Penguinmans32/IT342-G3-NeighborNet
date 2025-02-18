import { useState } from "react";
import { useAuth } from "../backendApi/AuthContext";
import { MdMenu, MdAccountCircle, MdDashboard, MdSchool, MdSwapHoriz, MdChat, MdPeople, MdAdd, MdLibraryBooks, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#fff",
    },
    content: {
      backgroundColor: "#fff",
      margin: "20px",
      borderRadius: "8px",
      padding: "20px",
      display: "flex",
    },
    profileSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: "20px",
      marginLeft: "20px",
    },
    avatar: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      backgroundColor: "#ddd",
      marginBottom: "15px",
    },
    name: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      marginBottom: "5px",
      color: "#333",
    },
    bio: {
      color: "#666",
      marginBottom: "10px",
      fontSize: "0.9rem",
    },
    editButton: {
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      color: "#fff",
      border: "none",
      padding: "8px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      marginBottom: "20px",
    },
    tabs: {
      display: "flex",
      borderBottom: "1px solid #eee",
      marginBottom: "20px",
    },
    tab: {
      padding: "10px 20px",
      cursor: "pointer",
      color: "#666",
      borderBottom: "2px solid transparent",
    },
    activeTab: {
      borderBottom: "2px solid #8b5cf6",
      color: "#8b5cf6",
    },
    section: {
      marginBottom: "20px",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#333",
    },
    statsContainer: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
    },
    stat: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    statLabel: {
      color: "#333",
      fontWeight: "bold",
    },
    statValue: {
      color: "#666",
    },
    linkButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      backgroundColor: "transparent",
      cursor: "pointer",
      color: "#333",
      marginBottom: "20px",
    },
    progressNote: {
      fontSize: "0.8rem",
      color: "#666",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.container}>
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
              onClick={logout}
            >
              <MdLogout className="text-xl text-blue-500" />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.profileSection}>
          <div style={styles.avatar}>
            <img
              src={user?.avatar || "/placeholder.svg"}
              alt="Profile"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          </div>
          <h1 style={styles.name}>{user?.name || "Kyla Dominic Genodiala"}</h1>
          <p style={styles.bio}>@kylatech21 - She/Her</p>
          <button style={styles.editButton} onClick={() => navigate("/edit-profile")}>Edit Profile</button>

          <div style={styles.statsContainer}>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Followers</span>
              <span style={styles.statValue}>0</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statLabel}>Following</span>
              <span style={styles.statValue}>0</span>
            </div>
          </div>

          <button style={styles.linkButton} onClick={() => navigate("/link-social-accounts")}>
            <span>🔗</span>
            Link social accounts
          </button>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Progress*</h3>
            <p style={styles.progressNote}>*These stats are only visible to you</p>
          </div>
        </div>

        <div>
          <div style={styles.tabs}>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === "profile" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </div>
            <div
              style={{
                ...styles.tab,
                ...(activeTab === "achievements" ? styles.activeTab : {}),
              }}
              onClick={() => setActiveTab("achievements")}
            >
              Achievements
            </div>
          </div>

          {activeTab === "profile" && (
            <>
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>About Me</h2>
                <p>Hello, I'm Kyla Dominic.</p>
              </div>
            </>
          )}

          {activeTab === "achievements" && (
            <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>No achievements yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;