import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"
import Footer from './SplashScreen/Footer';
export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started")

  // Table of contents sections
  const sections = [
    { id: "getting-started", title: "Getting Started" },
    { id: "user-guide", title: "User Guide" },
    { id: "features", title: "Features" },
    { id: "account", title: "Account Management" },
    { id: "community", title: "Community Guidelines" },
    { id: "faq", title: "FAQ" },
    { id: "troubleshooting", title: "Troubleshooting" },
    { id: "api", title: "API Documentation" },
    { id: "mobile", title: "Mobile App" },
    { id: "updates", title: "Updates & Releases" },
  ]

  // Function to handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Last updated date
  const lastUpdated = "March 15, 2025"

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
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Welcome to the NeighborNet documentation. Here you'll find everything you need to know about using our
            platform.
          </p>
          <p className="mt-4 text-gray-500">Last Updated: {lastUpdated}</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar - Table of Contents */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:col-span-1"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl sticky top-8">
              <h3 className="text-lg font-bold mb-4">Table of Contents</h3>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
                  <svg
                    className="w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="md:col-span-3"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              {/* Introduction */}
              <div className="mb-10">
                <p className="text-gray-600">
                  NeighborNet is designed to help you connect with your neighbors, share skills, and build a stronger
                  community. This documentation will guide you through all the features and functionalities of our
                  platform.
                </p>
                <p className="mt-4 text-gray-600">
                  Whether you're a new user or looking to explore advanced features, you'll find all the information you
                  need here.
                </p>
              </div>

              {/* Getting Started */}
              <section id="getting-started" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Creating Your Account</h3>
                    <p className="text-gray-600 mt-2">
                      To get started with NeighborNet, you'll need to create an account. Here's how:
                    </p>
                    <ol className="list-decimal list-inside mt-2 text-gray-600 space-y-2">
                      <li>Visit the NeighborNet homepage and click on "Sign Up"</li>
                      <li>Enter your email address and create a password</li>
                      <li>Verify your email address by clicking the link sent to your inbox</li>
                      <li>Complete your profile by adding your name, location, and profile picture</li>
                      <li>Set your privacy preferences</li>
                    </ol>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800">Setting Up Your Profile</h3>
                    <p className="text-gray-600 mt-2">
                      A complete profile helps you connect with neighbors and build trust in your community:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-2">
                      <li>Add a clear profile photo</li>
                      <li>Write a brief bio about yourself</li>
                      <li>List your skills, interests, and hobbies</li>
                      <li>Specify your neighborhood or area</li>
                      <li>Set your availability preferences for community activities</li>
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800">Navigating the Platform</h3>
                    <p className="text-gray-600 mt-2">
                      The NeighborNet interface is designed to be intuitive and easy to use:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Home Feed</h4>
                        <p className="mt-1 text-gray-600">View updates, posts, and activities from your neighborhood</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Neighbors</h4>
                        <p className="mt-1 text-gray-600">Discover and connect with people in your community</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Events</h4>
                        <p className="mt-1 text-gray-600">Find and create local events and gatherings</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Marketplace</h4>
                        <p className="mt-1 text-gray-600">Share, borrow, or exchange items with neighbors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Guide */}
              <section id="user-guide" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User Guide</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Connecting with Neighbors</h3>
                    <p className="text-gray-600 mt-2">
                      Building your network is the first step to a vibrant community experience:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Search for neighbors by name, interests, or skills</li>
                      <li>Send connection requests with a personalized message</li>
                      <li>Accept or decline incoming connection requests</li>
                      <li>Browse the neighborhood directory</li>
                      <li>Recommend connections to other neighbors</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Posting and Sharing</h3>
                    <p className="text-gray-600 mt-2">Share updates, questions, and resources with your community:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Create text posts, photos, or videos</li>
                      <li>Tag relevant topics or categories</li>
                      <li>Mention neighbors using @username</li>
                      <li>Control who can see your posts with privacy settings</li>
                      <li>Edit or delete your posts as needed</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Messaging</h3>
                    <p className="text-gray-600 mt-2">Communicate directly with individual neighbors or groups:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Send private messages to connected neighbors</li>
                      <li>Create group conversations for specific topics or projects</li>
                      <li>Share files, photos, and links in messages</li>
                      <li>Set notification preferences for messages</li>
                      <li>Block or report inappropriate messages</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Features */}
              <section id="features" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Skill Sharing</h3>
                    <p className="text-gray-600">
                      Exchange knowledge and abilities with neighbors. Teach what you know and learn what you don't.
                    </p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• List your skills on your profile</li>
                      <li>• Search for specific skills in your area</li>
                      <li>• Request skill sessions or tutorials</li>
                      <li>• Leave feedback after skill exchanges</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Community Events</h3>
                    <p className="text-gray-600">
                      Organize and discover local gatherings, from block parties to workshops.
                    </p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• Create event listings with details and RSVP options</li>
                      <li>• Browse upcoming events on the calendar</li>
                      <li>• Receive notifications for events near you</li>
                      <li>• Share photos and recaps after events</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Neighborhood Marketplace</h3>
                    <p className="text-gray-600">Buy, sell, give away, or borrow items within your community.</p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• List items with photos and descriptions</li>
                      <li>• Browse available items by category</li>
                      <li>• Message sellers or lenders directly</li>
                      <li>• Track transaction history</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Community Resources</h3>
                    <p className="text-gray-600">
                      Access and contribute to a shared knowledge base for your neighborhood.
                    </p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• Find local service recommendations</li>
                      <li>• Access emergency contact information</li>
                      <li>• Share and view neighborhood announcements</li>
                      <li>• Contribute to community guides</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Help Requests</h3>
                    <p className="text-gray-600">Ask for assistance or offer help to neighbors in need.</p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• Post specific help requests</li>
                      <li>• Volunteer for open requests</li>
                      <li>• Schedule assistance times</li>
                      <li>• Thank helpers and leave feedback</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Safety Alerts</h3>
                    <p className="text-gray-600">Stay informed about important safety information in your area.</p>
                    <ul className="mt-3 text-gray-600 space-y-1">
                      <li>• Receive notifications about urgent issues</li>
                      <li>• Report safety concerns</li>
                      <li>• Access emergency resources</li>
                      <li>• Verify and update alert information</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Account Management */}
              <section id="account" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Management</h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Profile Settings</h3>
                    <p className="text-gray-600 mt-2">Manage how your information appears to others:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Update your profile photo and cover image</li>
                      <li>Edit your bio, interests, and skills</li>
                      <li>Manage your contact information</li>
                      <li>Control profile visibility settings</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Privacy Controls</h3>
                    <p className="text-gray-600 mt-2">Customize who can see your information and activities:</p>
                    <div className="mt-3 space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">Content Privacy</h4>
                        <p className="text-gray-600 text-sm">Control who can see your posts, photos, and activities</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">Connection Privacy</h4>
                        <p className="text-gray-600 text-sm">Manage who can send you connection requests</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">Location Privacy</h4>
                        <p className="text-gray-600 text-sm">Control how your location information is shared</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
                    <p className="text-gray-600 mt-2">Customize how and when you receive updates:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Email notification preferences</li>
                      <li>Push notification settings</li>
                      <li>Activity digest frequency</li>
                      <li>Alert priorities and categories</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Account Security</h3>
                    <p className="text-gray-600 mt-2">Keep your account safe and secure:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Change your password</li>
                      <li>Enable two-factor authentication</li>
                      <li>Manage connected devices</li>
                      <li>Review login history</li>
                      <li>Set up account recovery options</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Community Guidelines */}
              <section id="community" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
                <p className="text-gray-600">
                  NeighborNet is committed to creating a safe, respectful, and helpful community. All members are
                  expected to follow these guidelines:
                </p>

                <div className="mt-6 space-y-5">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-800">Be Respectful and Kind</h3>
                    <p className="text-gray-600 mt-1">
                      Treat all community members with respect and courtesy. Disagreements happen, but keep
                      conversations constructive and considerate.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-800">Maintain Privacy</h3>
                    <p className="text-gray-600 mt-1">
                      Respect others' privacy. Don't share personal information about other members without their
                      explicit permission.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-800">No Harassment or Discrimination</h3>
                    <p className="text-gray-600 mt-1">
                      We have zero tolerance for harassment, hate speech, or discrimination based on race, ethnicity,
                      gender, religion, sexual orientation, disability, or any other personal characteristic.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-800">Share Accurate Information</h3>
                    <p className="text-gray-600 mt-1">
                      Verify information before sharing it with the community, especially regarding safety alerts or
                      community resources.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-semibold text-gray-800">Use Appropriate Content</h3>
                    <p className="text-gray-600 mt-1">
                      Don't post content that is illegal, obscene, or otherwise inappropriate. This includes spam,
                      scams, and misleading information.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-yellow-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800">Reporting Violations</h3>
                  <p className="text-gray-600 mt-2">
                    If you encounter content or behavior that violates our community guidelines:
                  </p>
                  <ol className="list-decimal list-inside mt-3 text-gray-600 space-y-1">
                    <li>Use the "Report" button on the specific content or profile</li>
                    <li>Select the appropriate reason for reporting</li>
                    <li>Provide additional details if requested</li>
                    <li>Our moderation team will review the report and take appropriate action</li>
                  </ol>
                </div>
              </section>

              {/* FAQ */}
              <section id="faq" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">How is my neighborhood determined?</h3>
                    <p className="text-gray-600 mt-2">
                      Your neighborhood is determined based on the address you provide during registration. You can
                      adjust your neighborhood settings in your profile if needed.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Can I be part of multiple neighborhoods?</h3>
                    <p className="text-gray-600 mt-2">
                      Yes, you can join up to three neighborhoods. This is useful if you live near the border of
                      neighborhoods or want to stay connected to a previous neighborhood.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">How do I verify my address?</h3>
                    <p className="text-gray-600 mt-2">
                      Address verification happens through a postcard sent to your physical address with a unique code,
                      or through utility bill verification. This helps ensure community safety.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">Is NeighborNet free to use?</h3>
                    <p className="text-gray-600 mt-2">
                      Yes, basic NeighborNet features are free for all users. We offer a premium subscription with
                      additional features for those who want enhanced capabilities.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">How do I delete my account?</h3>
                    <p className="text-gray-600 mt-2">
                      You can delete your account by going to Settings Account Delete Account. Note that this action
                      is permanent and will remove all your data from our platform.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">How are disputes between neighbors handled?</h3>
                    <p className="text-gray-600 mt-2">
                      We encourage neighbors to resolve disputes amicably. For serious issues, our community moderation
                      team can intervene. Use the reporting tools to flag problematic behavior.
                    </p>
                  </div>
                </div>
              </section>

              {/* Troubleshooting */}
              <section id="troubleshooting" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Common Issues</h3>

                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Login Problems</h4>
                        <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
                          <li>Try resetting your password</li>
                          <li>Clear your browser cache and cookies</li>
                          <li>Ensure you're using the correct email address</li>
                          <li>Check if your account has been temporarily suspended</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Notification Issues</h4>
                        <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
                          <li>Check your notification settings</li>
                          <li>Ensure app permissions are enabled on your device</li>
                          <li>Verify your email address isn't blocking our messages</li>
                          <li>Try logging out and back in</li>
                        </ul>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-800">Content Not Loading</h4>
                        <ul className="mt-2 text-gray-600 space-y-1 list-disc list-inside">
                          <li>Check your internet connection</li>
                          <li>Try refreshing the page</li>
                          <li>Clear your browser cache</li>
                          <li>Try using a different browser</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Error Messages</h3>
                    <p className="text-gray-600 mt-2">
                      Here are explanations for common error messages you might encounter:
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">"Unable to connect to server"</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          This usually indicates an internet connection issue or our servers may be temporarily down.
                          Check your internet connection and try again later.
                        </p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">"Access denied"</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          You may not have permission to view this content or your session may have expired. Try logging
                          out and back in.
                        </p>
                      </div>

                      <div className="bg-red-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">"Invalid operation"</h4>
                        <p className="text-gray-600 text-sm mt-1">
                          The action you're trying to perform is not allowed or not available. Check if you have the
                          necessary permissions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Contact Support</h3>
                    <p className="text-gray-600 mt-2">
                      If you're still experiencing issues after trying the troubleshooting steps:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Visit our Help Center at help.neighbornet.com</li>
                      <li>Email support@neighbornet.com</li>
                      <li>Use the in-app "Help" button to submit a ticket</li>
                      <li>Check our status page at status.neighbornet.com for system-wide issues</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* API Documentation */}
              <section id="api" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">API Documentation</h2>

                <p className="text-gray-600">
                  NeighborNet offers a public API for developers who want to build integrations or extensions for our
                  platform.
                </p>

                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Getting Started with the API</h3>
                    <ol className="list-decimal list-inside mt-2 text-gray-600 space-y-2">
                      <li>Register for a developer account at developers.neighbornet.com</li>
                      <li>Create a new application to receive your API keys</li>
                      <li>Review the API documentation and endpoints</li>
                      <li>Test your integration in our sandbox environment</li>
                      <li>Submit your application for review before going live</li>
                    </ol>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Available Endpoints</h3>
                    <p className="text-gray-600 mt-2">Our API provides access to various NeighborNet features:</p>

                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">Endpoint</th>
                            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                              Description
                            </th>
                            <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-700">
                              Access Level
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">/api/events</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Access community events data</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Public</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">/api/marketplace</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Access marketplace listings</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Public</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">/api/resources</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Access community resources</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Public</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">/api/user</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">User profile operations</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Authenticated</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">/api/messages</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Messaging operations</td>
                            <td className="py-2 px-4 border-b text-sm text-gray-600">Authenticated</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Rate Limits</h3>
                    <p className="text-gray-600 mt-2">
                      To ensure fair usage and system stability, our API implements the following rate limits:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Free tier: 100 requests per hour</li>
                      <li>Developer tier: 1,000 requests per hour</li>
                      <li>Partner tier: 10,000 requests per hour</li>
                      <li>Enterprise tier: Custom limits</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800">API Resources</h3>
                    <ul className="mt-3 text-gray-600 space-y-2">
                      <li>
                        <a href="#" className="text-blue-600 hover:underline">
                          Full API Documentation
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline">
                          API Changelog
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline">
                          Sample Code & SDKs
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-blue-600 hover:underline">
                          Developer Forum
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Mobile App */}
              <section id="mobile" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Mobile App</h2>

                <p className="text-gray-600">
                  The NeighborNet mobile app provides a convenient way to stay connected with your community on the go.
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Installation</h3>
                    <p className="text-gray-600 mt-2">Download the NeighborNet app from your device's app store:</p>
                    <div className="mt-4 flex space-x-4">
                      <a href="#" className="inline-block bg-black text-white px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.12 2.29-.84 3.46-.77 1.5.12 2.65.72 3.39 1.79-3.05 1.86-2.27 5.5.48 6.62C18.75 17.48 18.02 19.35 17.05 20.28zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.01-1.16 4.07-3.74 4.25z" />
                          </svg>
                          <div>
                            <div className="text-xs">Download on the</div>
                            <div className="text-sm font-semibold">App Store</div>
                          </div>
                        </div>
                      </a>
                      <a href="#" className="inline-block bg-black text-white px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.18 20.82c.44.36 1.04.41 1.53.17l.09-.09 6.52-6.52 5.65 5.65c.36.36.92.36 1.28 0s.36-.92 0-1.28L12.62 13l1.5-1.5 5.65 5.65c.36.36.92.36 1.28 0s.36-.92 0-1.28L15.38 10l6.17-6.17c.36-.36.36-.92 0-1.28s-.92-.36-1.28 0L3.18 19.54c-.36.36-.36.92 0 1.28z" />
                          </svg>
                          <div>
                            <div className="text-xs">GET IT ON</div>
                            <div className="text-sm font-semibold">Google Play</div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">System Requirements</h3>
                    <div className="mt-2 space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">iOS</h4>
                        <p className="text-gray-600 text-sm">
                          iOS 14.0 or later. Compatible with iPhone, iPad, and iPod touch.
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-800">Android</h4>
                        <p className="text-gray-600 text-sm">Android 8.0 or later. Requires 100MB of free space.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800">Mobile-Specific Features</h3>
                  <p className="text-gray-600 mt-2">
                    The mobile app includes all the features of the web platform, plus these mobile-exclusive features:
                  </p>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Push Notifications</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Receive instant alerts about important community updates and messages.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Location Services</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Find nearby events and resources with GPS integration.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Offline Mode</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Access saved content even when you don't have an internet connection.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Camera Integration</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Easily take photos and videos to share with your community.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">QR Code Scanner</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Quickly connect with neighbors or access event information.
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800">Biometric Login</h4>
                      <p className="text-gray-600 text-sm mt-1">
                        Securely access your account with fingerprint or face recognition.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Updates & Releases */}
              <section id="updates" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates & Releases</h2>

                <p className="text-gray-600">
                  NeighborNet is constantly evolving with new features and improvements. Stay up-to-date with our latest
                  releases.
                </p>

                <div className="mt-6 space-y-8">
                  <div>
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full text-sm">
                        Latest Release
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 ml-3">Version 3.5.0</h3>
                      <span className="text-gray-500 ml-3">March 10, 2025</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800">New Features</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Group video calls for community meetings</li>
                          <li>Enhanced event calendar with recurring events</li>
                          <li>Dark mode support</li>
                          <li>Community polls and voting system</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800">Improvements</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Faster loading times for the news feed</li>
                          <li>Redesigned notification center</li>
                          <li>Improved search functionality</li>
                          <li>Better accessibility for screen readers</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800">Bug Fixes</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Fixed image upload issues on certain devices</li>
                          <li>Resolved notification delivery delays</li>
                          <li>Fixed calendar sync problems</li>
                          <li>Addressed login issues for some users</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Version 3.4.2</h3>
                      <span className="text-gray-500 ml-3">February 15, 2025</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800">Improvements</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Performance optimizations for large communities</li>
                          <li>Enhanced security measures</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800">Bug Fixes</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Fixed message delivery issues</li>
                          <li>Resolved profile photo cropping problems</li>
                          <li>Fixed several UI inconsistencies</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800">Version 3.4.0</h3>
                      <span className="text-gray-500 ml-3">January 20, 2025</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800">New Features</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Community calendar integration</li>
                          <li>Skill matching algorithm</li>
                          <li>Resource sharing center</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-800">Improvements</h4>
                        <ul className="list-disc list-inside mt-1 text-gray-600 space-y-1">
                          <li>Redesigned marketplace interface</li>
                          <li>Enhanced messaging features</li>
                          <li>Improved mobile responsiveness</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <a href="#" className="text-blue-600 hover:underline">
                    View full release history →
                  </a>
                </div>
              </section>
            </div>

            {/* Print and Download Options */}
            <div className="mt-8 flex justify-end space-x-4">
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print Documentation
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

