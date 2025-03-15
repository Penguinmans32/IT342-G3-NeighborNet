import { motion } from "framer-motion"
import { useState } from "react"
import Footer from './SplashScreen/Footer';
export default function Careers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("paths")
  const [selectedLevel, setSelectedLevel] = useState("All")

  // Career levels for filtering
  const careerLevels = [
    { name: "All", count: 15 },
    { name: "Entry Level", count: 3 },
    { name: "Mid Level", count: 5 },
    { name: "Senior Level", count: 4 },
    { name: "Leadership", count: 3 },
  ]

  // Career paths data
  const careerPaths = [
    {
      id: 1,
      title: "Full Stack Developer",
      level: "Entry Level to Senior",
      timeframe: "3-5 years",
      description:
        "Build your career as a versatile developer capable of working across the entire technology stack, from frontend interfaces to backend systems.",
      skills: ["JavaScript", "React", "Node.js", "Database Design", "API Development", "DevOps"],
      milestones: [
        {
          level: "Entry Level",
          title: "Junior Developer",
          achievements: [
            "Master core programming concepts and languages",
            "Contribute to feature development with guidance",
            "Build understanding of software development lifecycle",
          ],
        },
        {
          level: "Mid Level",
          title: "Full Stack Developer",
          achievements: [
            "Lead feature development independently",
            "Mentor junior developers",
            "Contribute to architectural decisions",
            "Implement complex business logic",
          ],
        },
        {
          level: "Senior Level",
          title: "Senior Developer",
          achievements: [
            "Design and architect complex systems",
            "Drive technical decisions and best practices",
            "Lead development teams and initiatives",
            "Contribute to product strategy",
          ],
        },
      ],
    },
    {
      id: 2,
      title: "Frontend Specialist",
      level: "Entry Level to Senior",
      timeframe: "2-4 years",
      description:
        "Specialize in creating beautiful, intuitive user interfaces that make neighborhood connections seamless and engaging.",
      skills: ["JavaScript", "React", "CSS/SCSS", "UI/UX Design", "Accessibility", "Performance Optimization"],
      milestones: [
        {
          level: "Entry Level",
          title: "UI Developer",
          achievements: [
            "Build responsive user interfaces from designs",
            "Implement component libraries and design systems",
            "Optimize for cross-browser compatibility",
          ],
        },
        {
          level: "Mid Level",
          title: "Frontend Developer",
          achievements: [
            "Create complex interactive features",
            "Optimize application performance",
            "Implement accessibility standards",
            "Contribute to design system architecture",
          ],
        },
        {
          level: "Senior Level",
          title: "Frontend Architect",
          achievements: [
            "Design scalable frontend architectures",
            "Lead frontend strategy and technology choices",
            "Establish best practices and coding standards",
            "Mentor and grow frontend teams",
          ],
        },
      ],
    },
    {
      id: 3,
      title: "Backend Engineer",
      level: "Entry Level to Senior",
      timeframe: "3-5 years",
      description:
        "Focus on building the robust, scalable systems that power neighborhood connections and ensure reliable platform performance.",
      skills: ["Node.js", "Database Design", "API Development", "System Architecture", "Performance", "Security"],
      milestones: [
        {
          level: "Entry Level",
          title: "Backend Developer",
          achievements: [
            "Build API endpoints and services",
            "Implement data models and database queries",
            "Write unit and integration tests",
            "Debug and resolve backend issues",
          ],
        },
        {
          level: "Mid Level",
          title: "Backend Engineer",
          achievements: [
            "Design and implement complex backend systems",
            "Optimize database performance",
            "Implement security best practices",
            "Create scalable microservices",
          ],
        },
        {
          level: "Senior Level",
          title: "Backend Architect",
          achievements: [
            "Design distributed systems architecture",
            "Lead database strategy and data modeling",
            "Implement advanced security measures",
            "Mentor backend engineering teams",
          ],
        },
      ],
    },
    {
      id: 4,
      title: "DevOps Engineer",
      level: "Mid Level to Senior",
      timeframe: "2-4 years",
      description:
        "Specialize in automating and optimizing the infrastructure that powers neighborhood connections, ensuring reliability and performance.",
      skills: ["CI/CD", "Cloud Infrastructure", "Containerization", "Monitoring", "Security", "Automation"],
      milestones: [
        {
          level: "Mid Level",
          title: "DevOps Engineer",
          achievements: [
            "Implement CI/CD pipelines",
            "Manage cloud infrastructure",
            "Set up monitoring and alerting",
            "Automate deployment processes",
          ],
        },
        {
          level: "Senior Level",
          title: "DevOps Lead",
          achievements: [
            "Design scalable infrastructure architecture",
            "Implement security best practices",
            "Optimize system performance and costs",
            "Lead infrastructure strategy",
          ],
        },
        {
          level: "Leadership",
          title: "Infrastructure Architect",
          achievements: [
            "Design enterprise-level infrastructure",
            "Lead disaster recovery and business continuity planning",
            "Implement advanced security protocols",
            "Drive infrastructure innovation",
          ],
        },
      ],
    },
    {
      id: 5,
      title: "Engineering Manager",
      level: "Senior Level to Leadership",
      timeframe: "4-6 years",
      description:
        "Lead engineering teams to build technology that strengthens neighborhood connections, focusing on both technical excellence and team growth.",
      skills: [
        "Team Leadership",
        "Project Management",
        "Technical Strategy",
        "Mentorship",
        "Cross-functional Collaboration",
      ],
      milestones: [
        {
          level: "Senior Level",
          title: "Tech Lead",
          achievements: [
            "Lead technical direction for projects",
            "Mentor junior and mid-level developers",
            "Collaborate with product and design teams",
            "Balance technical debt with feature development",
          ],
        },
        {
          level: "Leadership",
          title: "Engineering Manager",
          achievements: [
            "Build and lead high-performing engineering teams",
            "Drive technical strategy and roadmap planning",
            "Manage performance and career development",
            "Collaborate on product strategy",
          ],
        },
        {
          level: "Leadership",
          title: "Director of Engineering",
          achievements: [
            "Lead multiple engineering teams",
            "Drive technical vision and strategy",
            "Build engineering culture and processes",
            "Collaborate on company-wide initiatives",
          ],
        },
      ],
    },
  ]

  // Success stories
  const successStories = [
    {
      id: 1,
      name: "Alex Rivera",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      startingRole: "Junior Developer",
      currentRole: "Senior Full Stack Engineer",
      timeframe: "4 years",
      quote:
        "When I joined NeighborNet, I was fresh out of a coding bootcamp. The mentorship and growth opportunities helped me advance from building simple features to architecting complex systems that connect thousands of neighborhoods.",
      achievements: [
        "Led development of real-time messaging system",
        "Mentored 12 junior developers",
        "Contributed to open source projects",
        "Spoke at 3 industry conferences",
      ],
    },
    {
      id: 2,
      name: "Priya Sharma",
      image: "https://randomuser.me/api/portraits/women/65.jpg",
      startingRole: "Frontend Developer",
      currentRole: "Engineering Manager",
      timeframe: "5 years",
      quote:
        "NeighborNet's focus on both technical excellence and leadership development helped me grow from a frontend specialist to leading a cross-functional team. I've been able to make an impact both on our product and on the careers of other developers.",
      achievements: [
        "Redesigned core user experience, increasing engagement by 45%",
        "Built and led a team of 8 engineers",
        "Implemented accessibility standards across the platform",
        "Developed engineering onboarding program",
      ],
    },
    {
      id: 3,
      name: "Marcus Johnson",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      startingRole: "Backend Engineer",
      currentRole: "Chief Technology Officer",
      timeframe: "6 years",
      quote:
        "Starting as a backend engineer, I never imagined I'd help shape the technical direction of an entire platform. NeighborNet's commitment to promoting from within and supporting career growth has allowed me to develop both technical and leadership skills.",
      achievements: [
        "Scaled platform to support 500,000+ users",
        "Led migration to microservices architecture",
        "Built engineering team from 5 to 30 members",
        "Secured two rounds of venture funding",
      ],
    },
  ]

  // Learning resources
  const learningResources = [
    {
      id: 1,
      title: "Technical Mentorship Program",
      description:
        "One-on-one mentorship with senior engineers to accelerate your technical growth and career development.",
      type: "Mentorship",
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    },
    {
      id: 2,
      title: "Conference & Learning Budget",
      description:
        "Annual budget for attending conferences, workshops, and online courses to expand your technical skills.",
      type: "Education",
      icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    },
    {
      id: 3,
      title: "Internal Tech Talks",
      description: "Regular knowledge sharing sessions where team members present on technical topics and innovations.",
      type: "Knowledge Sharing",
      icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
    },
    {
      id: 4,
      title: "Open Source Contribution Time",
      description:
        "Dedicated time to contribute to open source projects that align with your interests and our technology stack.",
      type: "Skill Development",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
    },
    {
      id: 5,
      title: "Leadership Development Program",
      description:
        "Structured program to develop management and leadership skills for those interested in a leadership track.",
      type: "Leadership",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    {
      id: 6,
      title: "Hackathons & Innovation Days",
      description:
        "Regular opportunities to work on creative projects outside your normal responsibilities to spark innovation.",
      type: "Innovation",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
  ]

  // Technical skills
  const technicalSkills = [
    {
      category: "Frontend",
      skills: ["React", "TypeScript", "CSS/SCSS", "Next.js", "Redux", "GraphQL", "Responsive Design", "Accessibility"],
    },
    {
      category: "Backend",
      skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "Redis", "API Design", "Microservices", "Authentication"],
    },
    {
      category: "DevOps",
      skills: [
        "Docker",
        "Kubernetes",
        "AWS",
        "CI/CD",
        "Terraform",
        "Monitoring",
        "Security",
        "Performance Optimization",
      ],
    },
    {
      category: "Soft Skills",
      skills: [
        "Communication",
        "Collaboration",
        "Problem Solving",
        "Mentorship",
        "Project Management",
        "Technical Writing",
        "Presentation",
      ],
    },
  ]

  // Filter career paths based on selected level
  const filteredPaths =
    selectedLevel === "All" ? careerPaths : careerPaths.filter((path) => path.level.includes(selectedLevel))

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
            Developer <span className="text-blue-600">Career Paths</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore growth opportunities and achievement milestones for technology professionals at NeighborNet
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
              <h3 className="text-lg font-bold mb-4">Career Levels</h3>
              <div className="space-y-2">
                {careerLevels.map((level) => (
                  <div
                    key={level.name}
                    className={`flex justify-between items-center group cursor-pointer p-2 rounded-lg ${
                      selectedLevel === level.name ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedLevel(level.name)}
                  >
                    <span
                      className={`${
                        selectedLevel === level.name
                          ? "text-blue-600 font-medium"
                          : "text-gray-700 group-hover:text-blue-600"
                      } transition-colors`}
                    >
                      {level.name}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{level.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-8">
              <h3 className="text-lg font-bold mb-4">Technical Skills</h3>
              <div className="space-y-4">
                {technicalSkills.map((skillGroup) => (
                  <div key={skillGroup.category}>
                    <h4 className="font-medium text-gray-700 mb-2">{skillGroup.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.skills.map((skill) => (
                        <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/50 animate-pulse" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Career Assessment</h3>
                <p className="text-gray-600 mb-4">
                  Not sure which path is right for you? Take our assessment to discover your ideal career trajectory.
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Start Assessment
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
                  onClick={() => setActiveTab("paths")}
                  className={`pb-2 font-medium ${
                    activeTab === "paths"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Career Paths
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
                  onClick={() => setActiveTab("learning")}
                  className={`pb-2 font-medium ${
                    activeTab === "learning"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Learning Resources
                </button>
              </div>
            </div>

            {/* Career Paths Tab */}
            {activeTab === "paths" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedLevel === "All" ? "All Career Paths" : `${selectedLevel} Career Paths`}
                  </h2>
                  <span className="text-gray-500">{filteredPaths.length} paths available</span>
                </div>

                {filteredPaths.length === 0 ? (
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
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500">No career paths match your filters.</p>
                    <button
                      onClick={() => setSelectedLevel("All")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      View All Paths
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {filteredPaths.map((path) => (
                      <motion.div
                        key={path.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h3 className="text-xl font-bold">{path.title}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {path.level}
                                </span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  {path.timeframe}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-gray-600">{path.description}</p>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-semibold text-gray-900">Key Skills:</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {path.skills.map((skill, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Career Progression:</h4>
                            <div className="relative">
                              {/* Timeline line */}
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>

                              <div className="space-y-8">
                                {path.milestones.map((milestone, index) => (
                                  <div key={index} className="relative pl-10">
                                    {/* Timeline dot */}
                                    <div className="absolute left-4 top-1.5 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-blue-100"></div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="font-bold">{milestone.title}</h5>
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                            {milestone.level}
                                          </span>
                                        </div>
                                      </div>
                                      <ul className="mt-3 space-y-1">
                                        {milestone.achievements.map((achievement, i) => (
                                          <li key={i} className="flex items-start text-sm text-gray-600">
                                            <svg
                                              className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                                              xmlns="http://www.w3.org/2000/svg"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                            {achievement}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex justify-end">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                              Explore This Path
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Success Stories Tab */}
            {activeTab === "success" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Developer Success Stories</h2>
                <p className="text-gray-600 mb-8">
                  Real career journeys from developers who have grown their skills and advanced their careers at
                  NeighborNet.
                </p>

                <div className="space-y-8">
                  {successStories.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/4 flex flex-col items-center text-center mb-6 md:mb-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-blue-100">
                              <img
                                src={story.image || "/placeholder.svg"}
                                alt={story.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <h3 className="text-xl font-bold">{story.name}</h3>
                            <div className="text-blue-600 mb-1">{story.currentRole}</div>
                            <div className="flex items-center text-sm text-gray-500">
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
                              <span>{story.timeframe}</span>
                            </div>
                          </div>
                          <div className="md:w-3/4 md:pl-6">
                            <div className="flex items-center mb-4">
                              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mr-2">
                                Started as: {story.startingRole}
                              </div>
                              <svg
                                className="w-4 h-4 text-gray-400 mx-2"
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
                              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                Now: {story.currentRole}
                              </div>
                            </div>
                            <blockquote className="italic text-gray-600 mb-4 border-l-4 border-blue-200 pl-4">
                              "{story.quote}"
                            </blockquote>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Key Achievements:</h4>
                              <ul className="space-y-1">
                                {story.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-start text-sm text-gray-600">
                                    <svg
                                      className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
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

            {/* Learning Resources Tab */}
            {activeTab === "learning" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Learning & Development Resources</h2>
                <p className="text-gray-600 mb-8">
                  Resources and opportunities to help you grow your skills and advance your career at NeighborNet.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {learningResources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={resource.icon} />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-bold">{resource.title}</h3>
                            <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {resource.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{resource.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8">
                  <h3 className="text-xl font-bold mb-4">Career Development Framework</h3>
                  <p className="text-gray-600 mb-6">
                    Our structured approach to career development helps you understand where you are and what you need
                    to do to advance to the next level.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Skills Assessment",
                        description: "Regular evaluations to identify your strengths and areas for growth.",
                        icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                      },
                      {
                        title: "Growth Planning",
                        description: "Personalized development plans aligned with your career goals.",
                        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                      },
                      {
                        title: "Regular Feedback",
                        description: "Continuous feedback to help you grow and improve.",
                        icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
                      },
                    ].map((item, i) => (
                      <div key={i} className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="bg-blue-100 p-2 rounded-md mr-3">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                            </svg>
                          </div>
                          <h4 className="font-bold">{item.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Career Growth Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
          <div className="relative p-12 md:p-16 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Developer Growth at NeighborNet</h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                {
                  stat: "85%",
                  title: "Internal Promotion Rate",
                  description: "of our leadership roles are filled through internal promotions",
                },
                {
                  stat: "18",
                  title: "Learning Days",
                  description: "dedicated days per year for professional development",
                },
                {
                  stat: "94%",
                  title: "Developer Satisfaction",
                  description: "of our developers report high job satisfaction",
                },
                {
                  stat: "2.5 years",
                  title: "Average Promotion Time",
                  description: "from entry level to mid-level positions",
                },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{item.stat}</div>
                  <div className="font-semibold mb-1">{item.title}</div>
                  <p className="text-sm text-blue-100">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Career Development Process */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">Our Career Development Process</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: "Assess",
                  description: "Identify your current skills, strengths, and areas for growth",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                },
                {
                  step: 2,
                  title: "Plan",
                  description: "Create a personalized development plan aligned with your goals",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                },
                {
                  step: 3,
                  title: "Develop",
                  description: "Build skills through projects, mentorship, and learning resources",
                  icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                },
                {
                  step: 4,
                  title: "Advance",
                  description: "Progress to new roles and responsibilities as you grow",
                  icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                },
              ].map((step, i) => (
                <div key={i} className="relative">
                  {/* Connecting line */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -ml-4"></div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg
                        className="w-10 h-10 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </div>
                    <div className="bg-blue-600 text-white rounded-full px-4 py-1 mb-3">Step {step.step}</div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        
      </div>
      <Footer />
    </div>
  )
}

