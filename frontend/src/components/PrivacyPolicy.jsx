import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"
import Footer from './SplashScreen/Footer';
export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("collection")

  // Table of contents sections
  const sections = [
    { id: "collection", title: "Information Collection" },
    { id: "usage", title: "How We Use Your Information" },
    { id: "sharing", title: "Information Sharing" },
    { id: "security", title: "Data Security" },
    { id: "rights", title: "Your Rights" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "thirdparty", title: "Third-Party Services" },
    { id: "children", title: "Children's Privacy" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" },
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
            Privacy <span className="text-blue-600">Policy</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how NeighborNet collects, uses, and protects your
            personal information.
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
                  At NeighborNet, we are committed to protecting your privacy and ensuring you have a positive
                  experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard
                  your information when you use our service.
                </p>
                <p className="mt-4 text-gray-600">
                  By using NeighborNet, you agree to the collection and use of information in accordance with this
                  policy. We will not use or share your information with anyone except as described in this Privacy
                  Policy.
                </p>
              </div>

              {/* Information Collection */}
              <section id="collection" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Collection</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Information You Provide</h3>
                    <p className="text-gray-600 mt-2">We collect information you provide directly to us when you:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Create an account or profile</li>
                      <li>Complete your profile information</li>
                      <li>Post content or share skills</li>
                      <li>Communicate with other users</li>
                      <li>Participate in community activities</li>
                      <li>Contact our support team</li>
                      <li>Respond to surveys or promotions</li>
                    </ul>
                    <p className="text-gray-600 mt-2">
                      This information may include your name, email address, phone number, profile picture, skills,
                      interests, and any other information you choose to provide.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Information We Collect Automatically</h3>
                    <p className="text-gray-600 mt-2">
                      When you access or use our platform, we automatically collect certain information, including:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Log information (IP address, browser type, pages visited, time spent)</li>
                      <li>Device information (hardware model, operating system, unique device identifiers)</li>
                      <li>Location information (with your permission)</li>
                      <li>Usage data (features used, interactions, preferences)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section id="usage" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-600">We use the information we collect for various purposes, including to:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Provide and Improve Services</h3>
                    <ul className="mt-2 text-gray-600 space-y-1">
                      <li>• Create and maintain your account</li>
                      <li>• Facilitate connections between neighbors</li>
                      <li>• Enable skill sharing and community building</li>
                      <li>• Improve and develop new features</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Personalize Your Experience</h3>
                    <ul className="mt-2 text-gray-600 space-y-1">
                      <li>• Customize content based on your interests</li>
                      <li>• Suggest relevant connections</li>
                      <li>• Recommend skills and activities</li>
                      <li>• Remember your preferences</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Communication</h3>
                    <ul className="mt-2 text-gray-600 space-y-1">
                      <li>• Send notifications about activity</li>
                      <li>• Provide updates about our services</li>
                      <li>• Respond to your inquiries</li>
                      <li>• Send administrative messages</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Safety and Security</h3>
                    <ul className="mt-2 text-gray-600 space-y-1">
                      <li>• Verify accounts and activity</li>
                      <li>• Prevent fraud and abuse</li>
                      <li>• Enforce our terms and policies</li>
                      <li>• Protect the safety of users</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="sharing" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
                <p className="text-gray-600">We may share your information in the following circumstances:</p>
                <div className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">With Other Users</h3>
                    <p className="text-gray-600 mt-2">
                      Your profile information, posts, and shared content will be visible to other users in your
                      neighborhood or community. You can adjust your privacy settings to control what information is
                      shared.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">With Service Providers</h3>
                    <p className="text-gray-600 mt-2">
                      We may share information with third-party vendors, consultants, and other service providers who
                      need access to such information to carry out work on our behalf.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">For Legal Reasons</h3>
                    <p className="text-gray-600 mt-2">We may share information if we believe it's necessary to:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Comply with applicable laws, regulations, or legal process</li>
                      <li>Protect the rights, property, and safety of NeighborNet, our users, or others</li>
                      <li>Detect, prevent, or address fraud, security, or technical issues</li>
                      <li>Enforce our terms of service and other agreements</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Business Transfers</h3>
                    <p className="text-gray-600 mt-2">
                      If NeighborNet is involved in a merger, acquisition, or sale of all or a portion of its assets,
                      your information may be transferred as part of that transaction. We will notify you via email
                      and/or a prominent notice on our website of any change in ownership or uses of your personal
                      information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">With Your Consent</h3>
                    <p className="text-gray-600 mt-2">
                      We may share information with third parties when you give us explicit consent to do so.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="security" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600">
                  We take reasonable measures to help protect your personal information from loss, theft, misuse,
                  unauthorized access, disclosure, alteration, and destruction. These measures include:
                </p>
                <ul className="list-disc list-inside mt-4 text-gray-600 space-y-2">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Monitoring for suspicious activity</li>
                  <li>Employee training on privacy and security practices</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we
                  strive to use commercially acceptable means to protect your personal information, we cannot guarantee
                  its absolute security.
                </p>
              </section>

              {/* Your Rights */}
              <section id="rights" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-600">
                  Depending on your location, you may have certain rights regarding your personal information,
                  including:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Access</h3>
                    <p className="mt-2 text-gray-600">
                      You can request a copy of the personal information we hold about you.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Correction</h3>
                    <p className="mt-2 text-gray-600">
                      You can request that we correct inaccurate or incomplete information.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Deletion</h3>
                    <p className="mt-2 text-gray-600">
                      You can request that we delete your personal information in certain circumstances.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Restriction</h3>
                    <p className="mt-2 text-gray-600">
                      You can request that we restrict the processing of your information.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Data Portability</h3>
                    <p className="mt-2 text-gray-600">
                      You can request a copy of your data in a structured, commonly used format.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800">Objection</h3>
                    <p className="mt-2 text-gray-600">
                      You can object to our processing of your information in certain circumstances.
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mt-6">
                  To exercise any of these rights, please contact us using the information provided in the "Contact Us"
                  section. We will respond to your request within a reasonable timeframe and in accordance with
                  applicable laws.
                </p>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies & Tracking</h2>
                <p className="text-gray-600">
                  We use cookies and similar tracking technologies to collect information about your interactions with
                  our platform. Cookies are small data files stored on your device that help us improve our service and
                  your experience.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Types of Cookies We Use</h3>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>
                        <strong>Essential cookies:</strong> Required for the platform to function properly
                      </li>
                      <li>
                        <strong>Preference cookies:</strong> Remember your settings and preferences
                      </li>
                      <li>
                        <strong>Analytics cookies:</strong> Help us understand how users interact with our platform
                      </li>
                      <li>
                        <strong>Marketing cookies:</strong> Used to deliver relevant content and track the effectiveness
                        of our campaigns
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Your Cookie Choices</h3>
                    <p className="text-gray-600 mt-2">
                      Most web browsers are set to accept cookies by default. You can usually modify your browser
                      settings to decline cookies or to notify you when a cookie is being set. However, if you choose to
                      decline cookies, some features of our platform may not function properly.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Do Not Track</h3>
                    <p className="text-gray-600 mt-2">
                      Some browsers include the ability to transmit "Do Not Track" signals. We do our best to honor such
                      signals. However, there is no industry standard for how companies should respond to these signals,
                      so we may not respond to them in a consistent manner.
                    </p>
                  </div>
                </div>
              </section>

              {/* Third-Party Services */}
              <section id="thirdparty" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
                <p className="text-gray-600">
                  Our platform may contain links to third-party websites, services, or applications that are not
                  operated by us. Additionally, we may use third-party services to support our platform.
                </p>
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">External Links</h3>
                    <p className="text-gray-600 mt-2">
                      When you click on a link to a third-party website, you will be directed to that third party's
                      site. We strongly advise you to review the Privacy Policy of every site you visit. We have no
                      control over and assume no responsibility for the content, privacy policies, or practices of any
                      third-party sites or services.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Third-Party Service Providers</h3>
                    <p className="text-gray-600 mt-2">We may use third-party service providers to:</p>
                    <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                      <li>Host our platform and store data</li>
                      <li>Process payments</li>
                      <li>Analyze platform usage</li>
                      <li>Send emails and notifications</li>
                      <li>Provide customer support</li>
                      <li>Monitor and improve performance</li>
                    </ul>
                    <p className="text-gray-600 mt-2">
                      These third parties may have access to your personal information only to perform these tasks on
                      our behalf and are obligated not to disclose or use it for any other purpose.
                    </p>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section id="children" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="text-gray-600">
                  Our platform is not intended for children under the age of 13, and we do not knowingly collect
                  personal information from children under 13. If we learn that we have collected personal information
                  from a child under 13, we will take steps to delete that information as quickly as possible.
                </p>
                <p className="text-gray-600 mt-4">
                  If you are a parent or guardian and you believe your child has provided us with personal information,
                  please contact us so that we can take appropriate action.
                </p>
              </section>

              {/* Changes to This Policy */}
              <section id="changes" className="mb-12 scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
                <p className="text-gray-600">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
                </p>
                <p className="text-gray-600 mt-4">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                  Policy are effective when they are posted on this page.
                </p>
                <p className="text-gray-600 mt-4">
                  For significant changes, we will make reasonable efforts to provide more prominent notice, such as an
                  email notification or a statement on our homepage.
                </p>
              </section>

              {/* Contact Us */}
              <section id="contact" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                  please contact us at:
                </p>
                <div className="bg-blue-50 p-6 rounded-xl mt-4">
                  <div className="space-y-2">
                    <p className="text-gray-800">
                      <strong>Email:</strong> privacy@neighbornet.com
                    </p>
                    <p className="text-gray-800">
                      <strong>Address:</strong> 123 Community Lane, Suite 500, San Francisco, CA 94105
                    </p>
                    <p className="text-gray-800">
                      <strong>Phone:</strong> (555) 123-4567
                    </p>
                  </div>
                  <div className="mt-6">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                      Contact Privacy Team
                    </button>
                  </div>
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
                Print Policy
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

