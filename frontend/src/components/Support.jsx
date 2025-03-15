import { motion } from "framer-motion"
import { useState } from "react"
import Footer from './SplashScreen/Footer';
export default function Support() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("faq")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Support categories
  const categories = [
    { name: "All", count: 42 },
    { name: "Account", count: 8 },
    { name: "Borrowing", count: 12 },
    { name: "Teaching", count: 7 },
    { name: "Learning", count: 9 },
    { name: "Payments", count: 6 },
  ]

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "How do I create an account on NeighborNet?",
      answer:
        "Creating an account is easy! Click the 'Sign Up' button in the top right corner of the homepage. You'll need to provide your name, email address, and create a password. You'll also need to verify your email address to complete the registration process.",
      category: "Account",
    },
    {
      id: 2,
      question: "How does the borrowing process work?",
      answer:
        "To borrow an item, browse the available items in your neighborhood, select what you need, and send a request to the owner. Once approved, you can arrange pickup or delivery. After using the item, return it in the same condition you received it, and leave a review for the owner.",
      category: "Borrowing",
    },
    {
      id: 3,
      question: "What happens if a borrowed item is damaged?",
      answer:
        "If an item is damaged while in your possession, you should notify the owner immediately. Our community guidelines recommend offering to repair or replace the item. For significant damages, our resolution center can help mediate a fair solution between both parties.",
      category: "Borrowing",
    },
    {
      id: 4,
      question: "How do I become a teacher on NeighborNet?",
      answer:
        "To become a teacher, go to the Teaching Center and click 'Become a Teacher'. Fill out the application form with your skills, experience, and what you'd like to teach. Our team will review your application and get back to you within 48 hours.",
      category: "Teaching",
    },
    {
      id: 5,
      question: "How are payments handled for classes?",
      answer:
        "Payments for classes are processed securely through our platform. When you book a class, the payment is held in escrow until the class is completed. This ensures both teachers and students are protected. You can use credit/debit cards or PayPal for payments.",
      category: "Payments",
    },
    {
      id: 6,
      question: "Can I cancel a class I've signed up for?",
      answer:
        "Yes, you can cancel a class up to 24 hours before the scheduled time for a full refund. Cancellations made less than 24 hours in advance may be subject to a partial refund, depending on the teacher's cancellation policy.",
      category: "Learning",
    },
    {
      id: 7,
      question: "How do I reset my password?",
      answer:
        "To reset your password, click on 'Login' and then 'Forgot Password'. Enter the email address associated with your account, and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
      category: "Account",
    },
    {
      id: 8,
      question: "Is my personal information secure?",
      answer:
        "Yes, we take data security very seriously. We use industry-standard encryption to protect your personal information and never share your data with third parties without your consent. You can review our privacy policy for more details on how we handle your information.",
      category: "Account",
    },
  ]

  // Knowledge base articles
  const knowledgeBase = [
    {
      id: 1,
      title: "Getting Started with NeighborNet",
      description: "A comprehensive guide to setting up your profile and navigating the platform.",
      category: "Account",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 2,
      title: "Borrowing Best Practices",
      description: "Learn how to borrow items responsibly and build a positive reputation in your community.",
      category: "Borrowing",
      readTime: "7 min read",
      image:
        "https://images.unsplash.com/photo-1628102491629-778571d893a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 3,
      title: "Teaching Your First Class",
      description: "Tips and guidelines for preparing and conducting your first neighborhood class.",
      category: "Teaching",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 4,
      title: "Payment System Explained",
      description: "Understanding how payments, refunds, and our escrow system works to protect all users.",
      category: "Payments",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 5,
      title: "Finding the Right Classes",
      description: "How to search, filter, and choose classes that match your interests and schedule.",
      category: "Learning",
      readTime: "4 min read",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 6,
      title: "Account Security Best Practices",
      description: "Keep your account secure with these recommended security measures and tips.",
      category: "Account",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
  ]

  // Support team members
  const supportTeam = [
    {
      id: 1,
      name: "Alex Morgan",
      role: "Community Support Lead",
      image: "https://randomuser.me/api/portraits/women/23.jpg",
      specialties: ["Account Issues", "Community Guidelines"],
    },
    {
      id: 2,
      name: "James Wilson",
      role: "Technical Support Specialist",
      image: "https://randomuser.me/api/portraits/men/52.jpg",
      specialties: ["App Troubleshooting", "Account Recovery"],
    },
    {
      id: 3,
      name: "Sophia Chen",
      role: "Payments & Billing Expert",
      image: "https://randomuser.me/api/portraits/women/79.jpg",
      specialties: ["Payment Issues", "Refunds", "Billing Questions"],
    },
  ]

  // Filter FAQs based on selected category
  const filteredFaqs = selectedCategory === "All" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  // Filter knowledge base articles based on selected category
  const filteredArticles =
    selectedCategory === "All"
      ? knowledgeBase
      : knowledgeBase.filter((article) => article.category === selectedCategory)

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
            NeighborNet <span className="text-blue-600">Support Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get help, find answers, and connect with our support team
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
              <h3 className="text-lg font-bold mb-4">Help Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className={`flex justify-between items-center group cursor-pointer p-2 rounded-lg ${selectedCategory === category.name ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <span
                      className={`${selectedCategory === category.name ? "text-blue-600 font-medium" : "text-gray-700 group-hover:text-blue-600"} transition-colors`}
                    >
                      {category.name}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-100/50 animate-pulse" />
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-4">Need More Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our support team is ready to assist you with any questions or issues.
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Contact Support
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
                  onClick={() => setActiveTab("faq")}
                  className={`pb-2 font-medium ${
                    activeTab === "faq"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Frequently Asked Questions
                </button>
                <button
                  onClick={() => setActiveTab("knowledge")}
                  className={`pb-2 font-medium ${
                    activeTab === "knowledge"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Knowledge Base
                </button>
                <button
                  onClick={() => setActiveTab("team")}
                  className={`pb-2 font-medium ${
                    activeTab === "team"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Support Team
                </button>
              </div>
            </div>

            {/* FAQ Tab */}
            {activeTab === "faq" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedCategory === "All" ? "Frequently Asked Questions" : `${selectedCategory} FAQs`}
                </h2>

                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No FAQs found for this category.</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <details className="group">
                        <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                          <h3 className="font-semibold text-lg pr-8">{faq.question}</h3>
                          <svg
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-6 pb-6 pt-2 text-gray-600">
                          <p>{faq.answer}</p>
                          <div className="mt-4 flex items-center">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {faq.category}
                            </span>
                            <button className="ml-auto text-sm text-blue-600 hover:text-blue-800 flex items-center">
                              <span>Was this helpful?</span>
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
                                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </details>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Knowledge Base Tab */}
            {activeTab === "knowledge" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {selectedCategory === "All" ? "Knowledge Base Articles" : `${selectedCategory} Articles`}
                </h2>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No articles found for this category.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredArticles.map((article) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="h-40 overflow-hidden">
                          <img
                            src={article.image || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center mb-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {article.category}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">{article.readTime}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                          <p className="text-gray-600 mb-4">{article.description}</p>
                          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                            Read Article
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Support Team Tab */}
            {activeTab === "team" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Our Support Team</h2>
                <p className="text-gray-600 mb-8">
                  Meet the people dedicated to helping you get the most out of NeighborNet.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {supportTeam.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300"
                    >
                      <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-100">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold">{member.name}</h3>
                      <p className="text-blue-600 mb-3">{member.role}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {member.specialties.map((specialty, index) => (
                          <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full">
                        Contact {member.name.split(" ")[0]}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Submit Ticket Section */}
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Personalized Help?</h2>
                <p className="text-lg mb-8 text-blue-100">
                  If you couldn't find what you're looking for, our support team is ready to help. Submit a ticket and
                  we'll get back to you within 24 hours.
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span>Fast response times</span>
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <span>Secure communication</span>
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
                          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                        />
                      </svg>
                    </div>
                    <span>Personalized support</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Submit a Support Ticket</h3>
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
                  <select className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none">
                    <option value="" disabled selected className="text-gray-800">
                      Select Issue Category
                    </option>
                    <option value="account" className="text-gray-800">
                      Account Issues
                    </option>
                    <option value="borrowing" className="text-gray-800">
                      Borrowing Problems
                    </option>
                    <option value="teaching" className="text-gray-800">
                      Teaching Center Help
                    </option>
                    <option value="payments" className="text-gray-800">
                      Payment & Billing
                    </option>
                    <option value="other" className="text-gray-800">
                      Other
                    </option>
                  </select>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    className="w-full bg-white/20 border-0 placeholder:text-white/60 text-white p-3 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <div className="flex items-center space-x-2">
                    <button className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
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
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      Attach Files
                    </button>
                    <button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors">
                      Submit Ticket
                    </button>
                  </div>
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

