import { useState, useEffect } from "react";
import { useAuth } from "../backendApi/AuthContext";
import { useNavigate} from "react-router-dom";
import { motion,} from "framer-motion";
import Footer from './SplashScreen/Footer';
import axios from "axios";

const Profile = () => {
  const { user} = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleProfilePictureUpdate = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUpdating(true);
    try {
      const response = await axios.put(
        "http://localhost:8080/api/users/profile/picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      setProfileData(prev => ({
        ...prev,
        imageUrl: response.data.imageUrl
      }));
    } catch (error) {
      console.error("Error updating profile picture:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      position: "relative",
      zIndex: "1",
      paddingTop: "50px",
    },
    homeButton: {
      position: "absolute",
      top: "20px",
      left: "20px",  // Changed from right to left
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.9rem",
      fontWeight: "500",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      zIndex: "10",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
      },
    },
    content: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      margin: "20px",
      borderRadius: "16px",
      padding: "20px",
      display: "flex",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      paddingTop: "20px",
    },
    profileContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
      width: "100%",
      position: "relative",
      background: "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
      padding: "10px 0",
      borderRadius: "8px",
    },
    tabsWrapper: {
      display: "flex",
      gap: "100px",
      position: "relative",
      zIndex: "1",
    },
    tab: {
      padding: "10px 30px",
      cursor: "pointer",
      color: "#666",
      borderBottom: "2px solid transparent",
      position: "relative",
      transition: "all 0.3s ease",
      "&:hover": {
        color: "#8b5cf6",
        transform: "translateY(-2px)",
      },
    },
    profileTab: {
      marginLeft: "20px", 
    },
    achievementsTab: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    },
    tabHighlight: {
      position: "absolute",
      bottom: "-1px",
      height: "2px",
      transition: "all 0.3s ease",
      background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
    },
    animatedBackground: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: "linear-gradient(45deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))",
      zIndex: "-1",
      overflow: "hidden",
    },
    activeTab: {
      borderBottom: "2px solid #8b5cf6",
      color: "#8b5cf6",
      fontWeight: "bold",
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

  const FloatingElement = ({ style }) => (
    <div
      style={{
        position: "absolute",
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
        animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
        ...style,
      }}
    />
  );

  return (
    <>
     <div style={styles.animatedBackground}>
        <FloatingElement style={{ top: "10%", left: "10%" }} />
        <FloatingElement style={{ top: "50%", right: "15%" }} />
        <FloatingElement style={{ bottom: "20%", left: "30%" }} />
      </div>

      <button 
      style={styles.homeButton} 
      onClick={() => navigate("/homepage")}
    >
      Homepage
    </button>
    <div style={styles.container}>
              <div style={styles.content}>
                <div style={styles.profileSection}>
                  <div style={styles.profileContainer}>
                    <div style={styles.avatar} className="relative group">
                      <img
                        src={
                          profileData?.imageUrl
                            ? profileData.imageUrl.startsWith('http')
                              ? profileData.imageUrl
                              : `http://localhost:8080${profileData.imageUrl}`
                            : "/images/defaultProfile.png"
                        }
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          console.error("Error loading image:", e);
                          e.target.onerror = null;
                          e.target.src = "/images/defaultProfile.png";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer">
                          <span className="text-white text-sm">Change Photo</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleProfilePictureUpdate}
                            disabled={isUpdating}
                          />
                        </label>
                      </div>
                      {/* Loading overlay */}
                      {isUpdating && (
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                          <span className="text-white">Updating...</span>
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <h1 style={styles.name}>{profileData?.username || user?.username}</h1>
                    <p style={styles.bio}>
                      {profileData?.email}
                    </p>
                    <button style={styles.editButton} onClick={() => navigate("/edit-profile")}>
                      Edit Profile
                    </button>

                    {/* Stats */}
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

                    {/* Social Links */}
                    <button style={styles.linkButton} onClick={() => navigate("/edit-profile")}>
                      <span>🔗</span>
                      Link social accounts
                    </button>

                    {/* Progress Section */}
                    <div style={styles.section}>
                      <h3 style={styles.sectionTitle}>Progress*</h3>
                      <p style={styles.progressNote}>*These stats are only visible to you</p>
                    </div>
                  </div>
                </div>


                    {/* Right side - Tabs and Content */}
                    <div className="flex-1 ml-8">
                      {/* Tabs */}
                      <div style={styles.tabs}>
                        <div
                          style={{
                            ...styles.tab,
                            ...styles.profileTab,
                            ...(activeTab === "profile" ? styles.activeTab : {}),
                          }}
                          onClick={() => setActiveTab("profile")}
                        >
                          Profile
                        </div>
                        <div
                          style={{
                            ...styles.tab,
                            ...styles.achievementsTab,
                            ...(activeTab === "achievements" ? styles.activeTab : {}),
                          }}
                          onClick={() => setActiveTab("achievements")}
                        >
                          Achievements
                        </div>
                      </div>

                      {/* Tab Content */}
                      <div className="mt-6">
                        {activeTab === "profile" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div style={styles.section}>
                              <h2 style={styles.sectionTitle}>About Me</h2>
                              <p>{profileData?.bio || "No bio yet"}</p>
                            </div>
                            {/* Additional profile sections can go here */}
                          </motion.div>
                        )}

                        {activeTab === "achievements" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ textAlign: "center", color: "#666", padding: "20px" }}
                          >
                            No achievements yet
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Footer />
                </div>
                <style>
        {`
          @keyframes float {
            0% {
              transform: translateY(0) rotate(0);
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
            }
            100% {
              transform: translateY(0) rotate(360deg);
            }
          }
          
          .tab-transition {
            transition: all 0.3s ease;
          }
          
          .tab-hover:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
      </>
  );
};

export default Profile;