import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  User2, 
  BookOpen, 
  CheckCircle, 
  Lock,
  Star,
  Trophy,
  Map,
  Compass
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SkillsMap = () => {
    const [enrolledClasses, setEnrolledClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrolledClasses = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://neighbornet-back-production.up.railway.app/api/classes/enrolled', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setEnrolledClasses(response.data);
                setLoading(false);
                console.log('Enrolled classes:', response.data);
            } catch (error) {
                console.error('Error fetching enrolled classes:', error);
                setLoading(false);
            }
        };

        fetchEnrolledClasses();
    }, []);

    const getFullThumbnailUrl = (thumbnailUrl) => {
        if (!thumbnailUrl) return "/default-class-image.jpg";
        return thumbnailUrl.startsWith('http') 
          ? thumbnailUrl 
          : `https://neighbornet-back-production.up.railway.app${thumbnailUrl}`;
    };

    const calculateOverallProgress = (classItem) => {
        if (!classItem.lessons || classItem.lessons.length === 0) return 0;
        
        const completedLessonsCount = classItem.lessons.reduce((count, lesson) => {
            return count + (lesson.completed ? 1 : 0);
        }, 0);
    
        return Math.round((completedLessonsCount / classItem.lessons.length) * 100);
    };

    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-50 to-white">
                <motion.div
                    animate={{ 
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="relative w-20 h-20"
                >
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full" />
                    <Compass className="absolute inset-0 m-auto text-indigo-600 w-8 h-8" />
                </motion.div>
            </div>
        );
    }

    if (enrolledClasses.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-b from-indigo-50 to-white p-8"
            >
                <div className="relative">
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        <BookOpen className="w-24 h-24 text-indigo-400" />
                    </motion.div>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-2 -right-2"
                    >
                        <Star className="w-8 h-8 text-yellow-400 fill-current" />
                    </motion.div>
                </div>
                <h2 className="text-3xl font-bold text-indigo-900 mb-4 mt-6">Begin Your Adventure!</h2>
                <p className="text-indigo-600 text-lg mb-8">Your learning journey awaits - start by enrolling in a class</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold 
                             hover:bg-indigo-700 transition-colors duration-300 shadow-lg"
                    onClick={() => navigate('/homepage')}
                >
                    Explore Classes
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
           {/* Homepage Button - Update these styles */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 20px rgba(79, 70, 229, 0.15)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/homepage')}
                className="absolute top-4 left-4 md:fixed md:top-8 md:left-8 z-[100] flex items-center gap-2 px-4 py-2 
                        bg-white/90 backdrop-blur-sm rounded-full shadow-lg 
                        text-indigo-600 font-medium transition-all duration-300
                        hover:bg-white hover:text-indigo-700 border border-indigo-100
                        group"
                style={{
                    position: 'fixed',
                    zIndex: 1000,
                }}
            >
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    whileHover={{ x: -4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                >
                    ←
                </motion.div>
                <span className="relative">
                    Home
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                </span>
            </motion.button>


            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <div className="inline-block p-2 bg-indigo-100 rounded-full mb-4">
                    <Map className="w-8 h-8 text-indigo-600" />
                </div>
                <h1 className="text-4xl font-bold text-indigo-900 mb-4">
                    Your Learning Adventure
                </h1>
                <p className="text-indigo-600 text-lg">
                    Track your progress and continue your journey to mastery
                </p>
            </motion.div>
            
            <div className="max-w-6xl mx-auto relative">
                {/* Background Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-indigo-200 transform -translate-x-1/2 z-0" />

                {enrolledClasses.map((classItem, index) => (
                    <motion.div
                        key={classItem.id}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.3 }}
                        className={`mb-16 relative ${index % 2 === 0 ? 'pr-8 lg:pr-0 lg:mr-auto lg:ml-12' : 'pl-8 lg:pl-0 lg:ml-auto lg:mr-12'} lg:w-[calc(50%-2rem)]`}
                    >
                        {/* Milestone Marker */}
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                className="w-8 h-8 bg-indigo-600 rounded-full border-4 border-white shadow-lg"
                            >
                                {calculateOverallProgress(classItem) === 100 && (
                                    <Trophy className="w-4 h-4 text-white absolute inset-0 m-auto" />
                                )}
                            </motion.div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-white rounded-xl shadow-xl p-6 relative z-10"
                        >
                            {/* Progress Banner */}
                            <div className="absolute top-0 left-0 right-0 h-2 rounded-t-xl overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateOverallProgress(classItem)}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                    transition={{ duration: 1, delay: index * 0.3 }}
                                />
                            </div>

                            <div className="pt-4">
                                {/* Class Content */}
                                <div className="flex items-start gap-6 flex-wrap md:flex-nowrap">
                                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shadow-md relative group">
                                        <img
                                            src={getFullThumbnailUrl(classItem.thumbnailUrl)}
                                            alt={classItem.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-indigo-900 mb-2">
                                            {classItem.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <User2 className="w-4 h-4 text-indigo-600" />
                                            <span className="text-indigo-600">
                                                {classItem.creator.username}
                                            </span>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { 
                                                    label: "Progress", 
                                                    value: `${calculateOverallProgress(classItem)}%`,
                                                    bgColor: "bg-emerald-50",
                                                    textColor: "text-emerald-800",
                                                    borderColor: "border-emerald-200"
                                                },
                                                { 
                                                    label: "Sections", 
                                                    value: classItem.sections?.length || 0,
                                                    bgColor: "bg-indigo-50",
                                                    textColor: "text-indigo-800",
                                                    borderColor: "border-indigo-200"
                                                },
                                                { 
                                                    label: "Duration", 
                                                    value: classItem.duration,
                                                    bgColor: "bg-purple-50",
                                                    textColor: "text-purple-800",
                                                    borderColor: "border-purple-200"
                                                }
                                            ].map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`rounded-lg p-3 text-center shadow-sm border ${stat.bgColor} ${stat.borderColor}`}
                                                >
                                                    <p className={`text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
                                                    <p className={`text-lg font-bold ${stat.textColor}`}>{stat.value}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                               {/* Sections Accordion */}
                                <AnimatePresence>
                                    {selectedClass === classItem.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-6 space-y-3 overflow-hidden"
                                        >
                                            {classItem.lessons?.map((lesson, lIndex) => (
                                                <motion.div
                                                    key={lIndex}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: lIndex * 0.1 }}
                                                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 
                                                            rounded-lg hover:shadow-md transition-shadow duration-300"
                                                >
                                                    {lesson.completed ? (
                                                        <div className="bg-green-100 p-2 rounded-full">
                                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-indigo-100 p-2 rounded-full">
                                                            <Lock className="w-5 h-5 text-indigo-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-indigo-700 font-medium">{lesson.title}</span>
                                                    <span className="text-indigo-400 text-sm ml-auto">{lesson.duration}</span>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 
                                                 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                                        onClick={() => navigate(`/class/${classItem.id}`)}
                                    >
                                        Continue Learning
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="bg-indigo-100 p-3 rounded-lg text-indigo-600 hover:bg-indigo-200 transition-colors duration-300"
                                        onClick={() => setSelectedClass(selectedClass === classItem.id ? null : classItem.id)}
                                    >
                                        <ChevronDown 
                                            className={`w-6 h-6 transform transition-transform duration-300 
                                                      ${selectedClass === classItem.id ? 'rotate-180' : ''}`} 
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SkillsMap;