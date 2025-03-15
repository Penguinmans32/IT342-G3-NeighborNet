import { motion } from "framer-motion"
import { useState } from "react"
import Footer from './SplashScreen/Footer';
export default function LearningRoadMap() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("Photography")
  const [activeTab, setActiveTab] = useState("roadmap")

  // Available skills for roadmaps
  const availableSkills = ["Photography", "Programming", "Design", "Marketing", "Developer", "Music", "Art", "Technology"]

  // Roadmap data structure
  const roadmaps = {
    Photography: {
      levels: [
        {
          id: 1,
          title: "Beginner",
          description: "Learn the basics of photography and camera operation",
          duration: "4-6 weeks",
          skills: ["Camera basics", "Composition", "Lighting fundamentals", "Basic editing"],
          classes: [
            {
              id: 101,
              title: "Introduction to Digital Photography",
              instructor: "Emma Johnson",
              duration: "3 hours",
              difficulty: "Beginner",
            },
            {
              id: 102,
              title: "Composition Techniques for Beginners",
              instructor: "David Miller",
              duration: "2 hours",
              difficulty: "Beginner",
            },
            {
              id: 103,
              title: "Understanding Your DSLR Camera",
              instructor: "Emma Johnson",
              duration: "4 hours",
              difficulty: "Beginner",
            },
          ],
          projects: ["Family portrait", "Nature landscape", "Urban photography"],
        },
        {
          id: 2,
          title: "Intermediate",
          description: "Develop your technical skills and artistic vision",
          duration: "2-3 months",
          skills: ["Manual mode mastery", "Advanced composition", "Portrait techniques", "Intermediate editing"],
          classes: [
            {
              id: 201,
              title: "Mastering Manual Mode",
              instructor: "James Wilson",
              duration: "5 hours",
              difficulty: "Intermediate",
            },
            {
              id: 202,
              title: "Portrait Photography Essentials",
              instructor: "Emma Johnson",
              duration: "6 hours",
              difficulty: "Intermediate",
            },
          ],
          projects: ["Portrait series", "Event photography", "Product photography"],
        },
        {
          id: 3,
          title: "Advanced",
          description: "Refine your style and create professional-quality work",
          duration: "3-6 months",
          skills: ["Studio lighting", "Advanced post-processing", "Specialized techniques", "Building a portfolio"],
          classes: [
            {
              id: 301,
              title: "Studio Lighting Masterclass",
              instructor: "Michael Chen",
              duration: "8 hours",
              difficulty: "Advanced",
            },
            {
              id: 302,
              title: "Advanced Post-Processing Techniques",
              instructor: "Sarah Williams",
              duration: "10 hours",
              difficulty: "Advanced",
            },
          ],
          projects: ["Professional portfolio", "Photo exhibition", "Client work"],
        },
      ],
      milestones: [
        {
          id: 1,
          title: "First Manual Mode Shoot",
          description: "Complete your first photoshoot using fully manual camera settings",
          points: 100,
        },
        {
          id: 2,
          title: "Portfolio Review",
          description: "Have your growing portfolio reviewed by a professional photographer",
          points: 250,
        },
        {
          id: 3,
          title: "Photo Exhibition",
          description: "Participate in a community photo exhibition with your best work",
          points: 500,
        },
      ],
    },
    Cooking: {
      levels: [
        {
          id: 1,
          title: "Beginner",
          description: "Learn essential cooking techniques and basic recipes",
          duration: "4-6 weeks",
          skills: ["Knife skills", "Basic techniques", "Flavor principles", "Kitchen safety"],
          classes: [
            {
              id: 101,
              title: "Cooking Fundamentals",
              instructor: "Michael Chen",
              duration: "4 hours",
              difficulty: "Beginner",
            },
            {
              id: 102,
              title: "Knife Skills Workshop",
              instructor: "Lisa Park",
              duration: "2 hours",
              difficulty: "Beginner",
            },
          ],
          projects: ["Family dinner", "Basic baking", "One-pot meals"],
        },
        {
          id: 2,
          title: "Intermediate",
          description: "Expand your culinary repertoire with more complex dishes",
          duration: "2-3 months",
          skills: ["International cuisines", "Advanced techniques", "Menu planning", "Food presentation"],
          classes: [
            {
              id: 201,
              title: "Italian Cuisine Masterclass",
              instructor: "Michael Chen",
              duration: "6 hours",
              difficulty: "Intermediate",
            },
            {
              id: 202,
              title: "The Art of Plating",
              instructor: "Sophie Martinez",
              duration: "3 hours",
              difficulty: "Intermediate",
            },
          ],
          projects: ["Dinner party", "International feast", "Dessert showcase"],
        },
        {
          id: 3,
          title: "Advanced",
          description: "Master complex techniques and develop your culinary style",
          duration: "3-6 months",
          skills: ["Advanced baking", "Molecular gastronomy", "Recipe development", "Wine pairing"],
          classes: [
            {
              id: 301,
              title: "Advanced Pastry Techniques",
              instructor: "Sophie Martinez",
              duration: "8 hours",
              difficulty: "Advanced",
            },
            {
              id: 302,
              title: "Molecular Gastronomy Workshop",
              instructor: "Michael Chen",
              duration: "6 hours",
              difficulty: "Advanced",
            },
          ],
          projects: ["Gourmet dinner", "Recipe book", "Cooking competition"],
        },
      ],
      milestones: [
        {
          id: 1,
          title: "First Dinner Party",
          description: "Successfully plan and execute a three-course meal for friends or family",
          points: 100,
        },
        {
          id: 2,
          title: "Cuisine Mastery",
          description: "Demonstrate proficiency in three different international cuisines",
          points: 250,
        },
        {
          id: 3,
          title: "Recipe Development",
          description: "Create and document five original recipes with professional presentation",
          points: 500,
        },
      ],
    },
    Gardening: {
      levels: [
        {
          id: 1,
          title: "Beginner",
          description: "Learn the basics of plant care and garden planning",
          duration: "4-6 weeks",
          skills: ["Soil basics", "Plant selection", "Watering techniques", "Basic maintenance"],
          classes: [
            {
              id: 101,
              title: "Gardening for Beginners",
              instructor: "Sarah Williams",
              duration: "3 hours",
              difficulty: "Beginner",
            },
            {
              id: 102,
              title: "Container Gardening Basics",
              instructor: "Robert Johnson",
              duration: "2 hours",
              difficulty: "Beginner",
            },
          ],
          projects: ["Herb garden", "Container plants", "Flower bed"],
        },
        {
          id: 2,
          title: "Intermediate",
          description: "Expand your garden and learn specialized techniques",
          duration: "2-3 months",
          skills: ["Garden design", "Pest management", "Seasonal planning", "Propagation"],
          classes: [
            {
              id: 201,
              title: "Organic Pest Management",
              instructor: "Sarah Williams",
              duration: "4 hours",
              difficulty: "Intermediate",
            },
            {
              id: 202,
              title: "Garden Design Principles",
              instructor: "Maria Lopez",
              duration: "5 hours",
              difficulty: "Intermediate",
            },
          ],
          projects: ["Vegetable garden", "Butterfly garden", "Landscape design"],
        },
        {
          id: 3,
          title: "Advanced",
          description: "Master specialized gardening techniques and sustainable practices",
          duration: "3-6 months",
          skills: ["Permaculture", "Advanced propagation", "Landscape design", "Specialty gardens"],
          classes: [
            {
              id: 301,
              title: "Permaculture Design",
              instructor: "Sarah Williams",
              duration: "8 hours",
              difficulty: "Advanced",
            },
            {
              id: 302,
              title: "Advanced Plant Propagation",
              instructor: "Robert Johnson",
              duration: "6 hours",
              difficulty: "Advanced",
            },
          ],
          projects: ["Permaculture garden", "Edible landscape", "Garden renovation"],
        },
      ],
      milestones: [
        {
          id: 1,
          title: "First Harvest",
          description: "Successfully grow and harvest your first edible crops",
          points: 100,
        },
        {
          id: 2,
          title: "Garden Design",
          description: "Create and implement a comprehensive garden design plan",
          points: 250,
        },
        {
          id: 3,
          title: "Sustainable Garden",
          description: "Establish a fully sustainable garden ecosystem with minimal inputs",
          points: 500,
        },
      ],
    },
  }

  // Get the selected roadmap data
  const currentRoadmap = roadmaps[selectedSkill] || roadmaps.Photography

  // Success stories data
  const successStories = [
    {
      id: 1,
      name: "Jennifer Lee",
      skill: "Photography",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      story:
        "I started with zero photography knowledge. After following the roadmap for 6 months, I've launched my own photography business and have my first paid clients!",
      achievement: "Professional Photographer",
    },
    {
      id: 2,
      name: "Marcus Taylor",
      skill: "Cooking",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      story:
        "The cooking roadmap helped me progress from burning toast to hosting dinner parties. I've even started a small catering business for local events.",
      achievement: "Local Caterer",
    },
    {
      id: 3,
      name: "Aisha Patel",
      skill: "Gardening",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      story:
        "Following the gardening roadmap transformed my barren backyard into a thriving ecosystem. I now teach container gardening to apartment dwellers in my community.",
      achievement: "Community Garden Leader",
    },
  ]

  // Recommended resources
  const resources = [
    {
      id: 1,
      title: "Essential Photography Equipment Guide",
      type: "PDF Guide",
      author: "Emma Johnson",
      skill: "Photography",
    },
    {
      id: 2,
      title: "Seasonal Ingredients Calendar",
      type: "Interactive Tool",
      author: "Michael Chen",
      skill: "Cooking",
    },
    {
      id: 3,
      title: "Plant Care Encyclopedia",
      type: "Digital Book",
      author: "Sarah Williams",
      skill: "Gardening",
    },
    {
      id: 4,
      title: "DIY Project Planner Templates",
      type: "Downloadable Templates",
      author: "David Rodriguez",
      skill: "Home DIY",
    },
  ]

  // Filter resources based on selected skill
  const filteredResources = resources.filter((resource) => resource.skill === selectedSkill)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-blue-500 rounded-full opacity-20"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            NeighborNet <span className="text-blue-600">Learning Roadmaps</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Follow structured learning paths to master new skills with guidance from your community
          </p>
        </motion.div>


        {/* Main Content */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-lg font-bold mb-4">Available Skills</h3>
              <div className="space-y-2">
                {availableSkills.map((skill) => (
                  <div
                    key={skill}
                    className={`flex justify-between items-center group cursor-pointer p-2 rounded-lg ${selectedSkill === skill ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <span
                      className={`${selectedSkill === skill ? "text-blue-600 font-medium" : "text-gray-700 group-hover:text-blue-600"} transition-colors`}
                    >
                      {skill}
                    </span>
                    {roadmaps[skill] && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {roadmaps[skill].levels.length} levels
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/50 animate-pulse" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Track Your Progress</h3>
                <p className="text-gray-600 mb-4">Sign in to save your progress and earn achievements as you learn.</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Sign In to Track Progress
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="md:col-span-3"
          >
            {/* Skill Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedSkill} Roadmap</h2>
                  <p className="text-gray-600 mt-2">
                    A structured learning path to help you master {selectedSkill.toLowerCase()} skills from beginner to
                    advanced
                  </p>
                </div>
                <div className="hidden md:block">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                    <svg
                      className="mr-2 w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Start This Roadmap
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Tabs */}
            <div className="mb-8 border-b">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("roadmap")}
                  className={`pb-2 font-medium ${
                    activeTab === "roadmap"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Learning Path
                </button>
                <button
                  onClick={() => setActiveTab("milestones")}
                  className={`pb-2 font-medium ${
                    activeTab === "milestones"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Milestones
                </button>
                <button
                  onClick={() => setActiveTab("success")}
                  className={`pb-2 font-medium ${
                    activeTab === "success"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Success Stories
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`pb-2 font-medium ${
                    activeTab === "resources"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Resources
                </button>
              </div>
            </div>

            {/* Roadmap Tab */}
            {activeTab === "roadmap" && (
              <div className="space-y-8">
                {currentRoadmap.levels.map((level, index) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Connecting line */}
                    {index < currentRoadmap.levels.length - 1 && (
                      <div className="absolute left-8 top-20 w-1 bg-blue-200 h-24 z-0"></div>
                    )}

                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative z-10">
                      <div className="p-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mr-4">
                            {level.id}
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-xl font-bold">{level.title} Level</h3>
                                <p className="text-gray-600">{level.description}</p>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>Estimated time: {level.duration}</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    level.id === 1
                                      ? "bg-green-100 text-green-700"
                                      : level.id === 2
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {level.title}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900">Skills You'll Learn:</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {level.skills.map((skill, i) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900">Recommended Classes:</h4>
                              <div className="mt-2 space-y-3">
                                {level.classes.map((cls) => (
                                  <div
                                    key={cls.id}
                                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex justify-between">
                                      <h5 className="font-medium">{cls.title}</h5>
                                      <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                          cls.difficulty === "Beginner"
                                            ? "bg-green-100 text-green-700"
                                            : cls.difficulty === "Intermediate"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {cls.difficulty}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                      <span>Instructor: {cls.instructor}</span>
                                      <span className="mx-2">•</span>
                                      <span>{cls.duration}</span>
                                    </div>
                                    <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                      View Class Details
                                      <svg
                                        className="ml-1 w-4 h-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-900">Suggested Projects:</h4>
                              <ul className="mt-2 list-disc list-inside text-gray-600">
                                {level.projects.map((project, i) => (
                                  <li key={i}>{project}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                Start Level {level.id}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === "milestones" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Achievement Milestones</h2>
                <p className="text-gray-600 mb-8">
                  Track your progress and earn recognition as you complete these key milestones in your{" "}
                  {selectedSkill.toLowerCase()} journey.
                </p>

                <div className="relative pb-12">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-1 bg-blue-200"></div>

                  {currentRoadmap.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative mb-8"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-blue-100"></div>

                      <div className="ml-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{milestone.title}</h3>
                            <p className="text-gray-600 mt-1">{milestone.description}</p>
                          </div>
                          <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                            <svg
                              className="w-4 h-4 mr-1"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>{milestone.points} points</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 text-gray-400 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-gray-500">Not completed yet</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            Mark as Complete
                            <svg
                              className="ml-1 w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Stories Tab */}
            {activeTab === "success" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Success Stories</h2>
                <p className="text-gray-600 mb-8">
                  See how others have transformed their skills by following our learning roadmaps.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {successStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col items-center text-center mb-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-blue-100">
                            <img
                              src={story.image || "/placeholder.svg"}
                              alt={story.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="text-xl font-bold">{story.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-blue-600">{story.skill} Enthusiast</span>
                          </div>
                          <span className="mt-2 inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            {story.achievement}
                          </span>
                        </div>
                        <div className="text-gray-600 italic">"{story.story}"</div>
                        <div className="mt-4 flex justify-center">
                          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            Read Full Story
                            <svg
                              className="ml-1 w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition-colors">
                    View More Success Stories
                  </button>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
                <p className="text-gray-600 mb-8">
                  Supplement your learning with these carefully selected resources for {selectedSkill.toLowerCase()}.
                </p>

                {filteredResources.length === 0 ? (
                  <div className="text-center py-12 bg-white/80 rounded-xl shadow-md">
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <p className="text-gray-500">No resources available for this skill yet.</p>
                    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Request Resources
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResources.map((resource) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-5 flex items-center justify-between hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold">{resource.title}</h3>
                            <div className="flex items-center mt-1 text-sm">
                              <span className="text-gray-600">By {resource.author}</span>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {resource.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 text-sm rounded-lg transition-colors">
                          Access Resource
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="text-lg font-bold mb-2">Suggest a Resource</h3>
                  <p className="text-gray-600 mb-4">
                    Know a great resource that should be included in this roadmap? Let us know!
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Suggest Resource
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Community Learning Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
          <div className="relative p-12 md:p-16 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Learn Together, Grow Together</h2>
                <p className="text-lg mb-8 text-blue-100">
                  Join learning groups in your neighborhood to follow roadmaps together, practice skills, and stay
                  motivated.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <span>Accountability partners</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span>Regular practice sessions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                        />
                      </svg>
                    </div>
                    <span>Shared achievements</span>
                  </div>
                </div>
                <button className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                  <span>Find Learning Groups</span>
                  <svg
                    className="ml-2 w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Upcoming Learning Groups</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Photography Basics Group",
                      members: 8,
                      startDate: "March 25, 2025",
                      location: "Central Park",
                    },
                    {
                      title: "Business Marketing",
                      members: 6,
                      startDate: "April 2, 2025",
                      location: "Community Kitchen",
                    },
                    {
                      title: "Basic Java Programming",
                      members: 12,
                      startDate: "April 10, 2025",
                      location: "Community Garden",
                    },
                  ].map((group, i) => (
                    <div key={i} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
                      <h4 className="font-semibold">{group.title}</h4>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span>{group.members} members</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Starts {group.startDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center mt-1 text-sm">
                        <svg
                          className="w-4 h-4 mr-1"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{group.location}</span>
                      </div>
                      <button className="mt-3 w-full bg-white/20 hover:bg-white/30 text-white font-medium py-1 px-3 rounded-lg transition-colors text-sm">
                        Join Group
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        
      </div>
      <Footer />
    </div>
  )
}

