import { motion, useScroll, useTransform } from "framer-motion"
import { FaCalendarAlt, FaUser, FaTag, FaSearch, FaBookmark, FaComment, FaShare } from "react-icons/fa"
import Footer from "./SplashScreen/Footer"
import { useRef, useState } from "react"
import { Link } from "react-router-dom"

const waveAnimation = `
  @keyframes wave {
    0% {
      transform: perspective(1000px) rotateY(0deg);
    }
    25% {
      transform: perspective(1000px) rotateY(2deg);
    }
    50% {
      transform: perspective(1000px) rotateY(0deg);
    }
    75% {
      transform: perspective(1000px) rotateY(-2deg);
    }
    100% {
      transform: perspective(1000px) rotateY(0deg);
    }
  }

  @keyframes wave-ripple {
    0% {
      transform: translateX(0) translateY(0) skewX(0deg);
    }
    25% {
      transform: translateX(5px) translateY(-5px) skewX(2deg);
    }
    50% {
      transform: translateX(0) translateY(0) skewX(0deg);
    }
    75% {
      transform: translateX(-5px) translateY(5px) skewX(-2deg);
    }
    100% {
      transform: translateX(0) translateY(0) skewX(0deg);
    }
  }
`

// Sample blog post data
const blogPosts = [
  {
    id: 1,
    title: "Building Stronger Communities Through Skill Sharing",
    excerpt:
      "Discover how sharing your skills with neighbors can transform your community and create lasting connections.",
    category: "Community",
    author: "Emma Rodriguez",
    date: "March 15, 2025",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2089&q=80",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "The Economics of Sharing: Why Borrowing Tools Makes Sense",
    excerpt:
      "How the sharing economy is changing the way we think about ownership and consumption in our neighborhoods.",
    category: "Resources",
    author: "Michael Chen",
    date: "March 10, 2025",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: 3,
    title: "From Strangers to Friends: Success Stories from NeighborNet",
    excerpt: "Real stories from users who found friendship, support, and community through our platform.",
    category: "Success Stories",
    author: "Sarah Johnson",
    date: "March 5, 2025",
    image:
      "https://images.unsplash.com/photo-1536819114556-1c10b30f9a92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Urban Gardening: How Neighbors Are Growing Food Together",
    excerpt:
      "Explore the growing trend of community gardens and how they're bringing neighbors together while promoting sustainability.",
    category: "Sustainability",
    author: "David Park",
    date: "February 28, 2025",
    image:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Digital Neighborhoods: Technology's Role in Community Building",
    excerpt:
      "How platforms like NeighborNet are using technology to revitalize the concept of community in the digital age.",
    category: "Technology",
    author: "Aisha Williams",
    date: "February 20, 2025",
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 6,
    title: "The Art of Neighboring: Rediscovering Local Connections",
    excerpt:
      "Why knowing your neighbors matters more than ever in today's fast-paced world, and how to build those relationships.",
    category: "Lifestyle",
    author: "James Wilson",
    date: "February 15, 2025",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    readTime: "4 min read",
    featured: false,
  },
]

// Categories for the filter
const categories = ["All", "Community", "Resources", "Success Stories", "Sustainability", "Technology", "Lifestyle"]

const Blog = () => {
  const scrollRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"],
  })

  const [activeCategory, setActiveCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter posts based on category and search term
  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Featured posts for the hero section
  const featuredPosts = blogPosts.filter((post) => post.featured)

  // Blog post card component
  const BlogPostCard = ({ post, index }) => {
    const y = useTransform(scrollYProgress, [0, 1], [50, -50])

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.03 }}
        className="relative group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
        <div className="relative bg-white p-6 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-48 mb-4 overflow-hidden rounded-xl">
            <img
              src={post.image || "/placeholder.svg"}
              alt={post.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              {post.category}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FaCalendarAlt className="mr-1" /> {post.date} • <FaUser className="mx-1" /> {post.author} •{" "}
            <FaTag className="mx-1" /> {post.readTime}
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">{post.title}</h3>
          <p className="text-gray-600 mb-4">{post.excerpt}</p>
          <div className="flex justify-between items-center">
            <Link to={`/blog/${post.id}`} className="text-blue-600 font-medium hover:underline">
              Read More →
            </Link>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <FaBookmark />
              </button>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <FaComment />
              </button>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <FaShare />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Featured post component for hero section
  const FeaturedPostCard = ({ post, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative overflow-hidden group"
        style={{
          animation: `wave ${3 + index * 0.5}s infinite ease-in-out`,
          transformStyle: "preserve-3d",
          perspective: "1500px",
          backfaceVisibility: "hidden",
          transformOrigin: "center",
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${index === 0 ? "from-blue-50/50 to-blue-100/50" : "from-purple-50/50 to-purple-100/50"}`}
          style={{
            animation: `wave-ripple ${2 + index * 0.5}s infinite ease-in-out`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        />
        <div className="relative z-10 transform-gpu">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FaCalendarAlt className="mr-1" /> {post.date} • <FaUser className="mx-1" /> {post.author}
          </div>
          <h2 className={`text-2xl font-bold ${index === 0 ? "text-blue-600" : "text-purple-600"} mb-4`}>
            {post.title}
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{post.category}</span>
            <Link
              to={`/blog/${post.id}`}
              className={`${index === 0 ? "text-blue-600" : "text-purple-600"} font-medium hover:underline`}
            >
              Read Full Article →
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <style>{waveAnimation}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section with Featured Posts */}
        <div className="relative overflow-hidden min-h-screen">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 bg-blue-500 rounded-full opacity-20"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 container mx-auto px-4 py-20">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
                Our <span className="text-blue-600">Blog</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Insights, stories, and ideas from the NeighborNet community
              </p>
            </motion.div>

            {/* Featured Posts Grid */}
            <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto relative">
              {featuredPosts.map((post, index) => (
                <FeaturedPostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          </div>
        </div>

        {/* Blog Content Section */}
        <div ref={scrollRef} className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search and Filter */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-700 mb-4">No articles found</h3>
                <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="inline-flex rounded-md shadow">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600">
                  1
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                  2
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                  3
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative py-24 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest community stories, tips, and updates.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-sm mt-4 opacity-80">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
        </motion.div>

        <Footer />
      </div>
    </>
  )
}

export default Blog

