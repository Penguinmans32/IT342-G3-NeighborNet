import { motion } from "framer-motion"
import { useState } from "react"
import Footer from './SplashScreen/Footer';
export default function TeachingCenter() {
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { name: "Progamming", count: 24 },
    { name: "Design", count: 36 },
    { name: "Business", count: 18 },
    { name: "Marketing", count: 29 },
    { name: "Photography", count: 15 },
    { name: "Music", count: 22 },
    { name: "Art", count: 31 },
    { name: "Technology", count: 27 },
  ]

  const featuredTeachers = [
    {
      id: 1,
      name: "Emma Johnson",
      skills: "Photography & Editing",
      rating: 4.9,
      students: 42,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      description:
        "Professional photographer teaching everything from basic composition to advanced editing techniques.",
      badges: ["Top Rated", "Quick Responder"],
    },
    {
      id: 2,
      name: "Michael Chen",
      skills: "Cooking & Baking",
      rating: 4.8,
      students: 38,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      description: "Passionate home chef sharing family recipes and professional techniques for delicious meals.",
      badges: ["Community Favorite"],
    },
    {
      id: 3,
      name: "Sarah Williams",
      skills: "Gardening & Sustainability",
      rating: 4.7,
      students: 29,
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      description: "Master gardener teaching sustainable practices for beautiful, productive home gardens.",
      badges: ["Eco Expert"],
    },
    {
      id: 4,
      name: "David Rodriguez",
      skills: "Home DIY & Repairs",
      rating: 4.9,
      students: 51,
      image: "https://randomuser.me/api/portraits/men/46.jpg",
      description: "Handyman with 20+ years experience teaching practical home repair and improvement skills.",
      badges: ["Top Rated", "Verified Pro"],
    },
  ]

  const upcomingClasses = [
    {
      id: 1,
      title: "Smartphone Photography Basics",
      teacher: "Emma Johnson",
      date: "March 18, 2025",
      time: "6:00 PM - 7:30 PM",
      spots: 8,
    },
    {
      id: 2,
      title: "Programming Class",
      teacher: "Michael Chen",
      date: "March 20, 2025",
      time: "5:30 PM - 7:30 PM",
      spots: 6,
    },
    {
      id: 3,
      title: "Marketing Workshop",
      teacher: "Sarah Williams",
      date: "March 22, 2025",
      time: "10:00 AM - 11:30 AM",
      spots: 10,
    },
  ]

  // State for active tab
  const [activeTab, setActiveTab] = useState("featured")

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
            NeighborNet <span className="text-blue-600">Teaching Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover skills, share knowledge, and connect with talented neighbors in your community
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
              <h3 className="text-lg font-bold mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.name} className="flex justify-between items-center group cursor-pointer">
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors">{category.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/50 animate-pulse" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Become a Teacher</h3>
                <p className="text-gray-600 mb-4">Share your skills and knowledge with your community!</p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Start Teaching
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
            {/* Custom Tabs */}
            <div className="mb-8 border-b">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("featured")}
                  className={`pb-2 font-medium ${
                    activeTab === "featured"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Featured Teachers
                </button>
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`pb-2 font-medium ${
                    activeTab === "upcoming"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Upcoming Classes
                </button>
                <button
                  onClick={() => setActiveTab("popular")}
                  className={`pb-2 font-medium ${
                    activeTab === "popular"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Popular Skills
                </button>
              </div>
            </div>

            {/* Featured Teachers Tab */}
            {activeTab === "featured" && (
              <div className="grid md:grid-cols-2 gap-6">
                {featuredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100">
                          <img
                            src={teacher.image || "/placeholder.svg"}
                            alt={teacher.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{teacher.name}</h3>
                          <p className="text-blue-600">{teacher.skills}</p>
                          <div className="flex items-center mt-1">
                            <svg
                              className="w-4 h-4 text-yellow-500 fill-yellow-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <span className="ml-1 text-sm">{teacher.rating}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-600">{teacher.students} students</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {teacher.badges.map((badge) => (
                            <span key={badge} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                              {badge}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600">{teacher.description}</p>
                      </div>

                      <div className="mt-6 flex justify-between items-center">
                        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                          View Profile
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                          Book a Session
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Upcoming Classes Tab */}
            {activeTab === "upcoming" && (
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 flex items-center justify-between hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold">{cls.title}</h3>
                        <p className="text-sm text-gray-600">with {cls.teacher}</p>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <span>{cls.date}</span>
                          <span className="mx-2">•</span>
                          <span>{cls.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-2">{cls.spots} spots left</div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 text-sm rounded-lg transition-colors">
                        Reserve Spot
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Popular Skills Tab */}
            {activeTab === "popular" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "Programming",
                  "Design",
                  "Business",
                  "Marketing",
                  "Photohraphy",
                  "Music",
                  "Art",
                  "Technology",
                  "Fitness",
                ].map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
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
                    <h3 className="font-semibold">{skill}</h3>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Become a Teacher Section */}
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Share Your Knowledge</h2>
                <p className="text-lg mb-8 text-blue-100">
                  Everyone has something valuable to teach. Join our community of teachers and make a difference in your
                  neighborhood.
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
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                      </svg>
                    </div>
                    <span>Build your reputation</span>
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
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>Meet new people</span>
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
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <span>Earn recognition</span>
                  </div>
                </div>
                <button className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
                  <span>Become a Teacher</span>
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
                <h3 className="text-xl font-semibold mb-4">Apply to Teach</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Skills You Want to Teach"
                    className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <textarea
                    placeholder="Tell us about your experience and what you'd like to teach..."
                    className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors">
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-12">What Our Community Says</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "I've learned more from my neighbors in 3 months than I did in years of trying to teach myself. The community here is amazing!",
                author: "Jessica T.",
                role: "Photography Student",
              },
              {
                quote:
                  "Teaching my cooking skills has been incredibly rewarding. I've met wonderful people and rediscovered my passion for food.",
                author: "Robert M.",
                role: "Cooking Teacher",
              },
              {
                quote:
                  "The teaching center made it so easy to find someone to help with my garden. Now it's thriving and I've made a great friend!",
                author: "Priya K.",
                role: "Gardening Student",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/50 rounded-2xl animate-pulse opacity-50" />
                <div className="relative z-10">
                  <div className="text-4xl text-blue-300 mb-4">"</div>
                  <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 mb-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Join NeighborNet today and discover the wealth of knowledge in your community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 text-lg rounded-lg transition-colors">
              Find a Teacher
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-8 text-lg rounded-lg transition-colors">
              Browse Classes
            </button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

