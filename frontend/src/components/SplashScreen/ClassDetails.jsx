import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../backendApi/AuthContext';
import { 
  FaPlay, 
  FaClock, 
  FaStar, 
  FaUser, 
  FaBookmark, 
  FaShare,
  FaLock,
  FaCheckCircle,
  FaRegCheckCircle
} from 'react-icons/fa';
import axios from 'axios';
import LoadingScreen from '../SplashScreen/LoadingSreen';

const ClassDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/classes/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setClassData(response.data);
        // Check enrollment status
        const enrollmentResponse = await axios.get(`http://localhost:8080/api/classes/${id}/enrollment-status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setIsEnrolled(enrollmentResponse.data.isEnrolled);
        setProgress(enrollmentResponse.data.progress || 0);
      } catch (error) {
        console.error('Error fetching class details:', error);
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [id, navigate]);

  const handleEnroll = async () => {
    try {
      await axios.post(`http://localhost:8080/api/classes/${id}/enroll`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in class:', error);
    }
  };

  const markSectionComplete = async (sectionId) => {
    try {
      await axios.post(`http://localhost:8080/api/classes/${id}/sections/${sectionId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Update progress
      const newProgress = ((progress + 1) / classData.sections.length) * 100;
      setProgress(newProgress);
    } catch (error) {
      console.error('Error marking section complete:', error);
    }
  };

  if (loading) {
    return <LoadingScreen 
      isLoading={true}
      message="Loading class content..."
      timeout={5000}
      onTimeout={() => setLoading(false)}
    />;
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Class Info */}
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold"
              >
                {classData.title}
              </motion.h1>
              <p className="text-lg text-white/90">{classData.description}</p>
              
              {/* Meta Information */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <FaUser className="mr-2" />
                  <span>{classData.instructor}</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2" />
                  <span>{classData.duration}</span>
                </div>
                <div className="flex items-center">
                  <FaStar className="mr-2" />
                  <span>{classData.rating} ({classData.ratingCount} ratings)</span>
                </div>
              </div>

              {/* Enrollment Button */}
              {!isEnrolled ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnroll}
                  className="px-8 py-3 bg-white text-blue-600 rounded-full font-medium 
                           shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Enroll Now
                </motion.button>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full px-4 py-2">
                    <FaCheckCircle className="inline mr-2" />
                    Enrolled
                  </div>
                  <div className="text-sm">
                    Progress: {Math.round(progress)}%
                  </div>
                </div>
              )}
            </div>

            {/* Preview Image/Video */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={classData.thumbnail} 
                alt={classData.title}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
                >
                  <FaPlay className="text-blue-600 text-xl ml-1" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Course Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
              <div className="space-y-4">
                {classData.sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${
                      activeSection === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {section.completed ? (
                            <FaCheckCircle className="text-blue-500" />
                          ) : (
                            <FaRegCheckCircle className="text-blue-300" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{section.title}</h3>
                          <p className="text-sm text-gray-500">{section.duration}</p>
                        </div>
                      </div>
                      {isEnrolled && !section.completed && (
                        <button
                          onClick={() => markSectionComplete(section.id)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {classData.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Class Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-medium">{classData.enrolledCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{classData.lastUpdated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">{classData.language}</span>
                </div>
              </div>
            </div>

            {/* Share & Save */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-around">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                  <FaBookmark />
                  <span>Save</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500">
                  <FaShare />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;