import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle, XCircle, Smartphone, Globe, Zap, Shield, Clock, Award, Sparkles } from 'lucide-react';
import { useState } from 'react';

const Testimonials = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      name: "Messaging",
      description: "Send text and images to other neighbors",
      webAvailable: true,
      mobileAvailable: true,
      webAdditionalInfo: "Full keyboard support for fast typing",
      mobileAdditionalInfo: "On-the-go chat with push notifications",
      icon: <Zap className="w-5 h-5" />,
      mobileScreenshot: "/images/chat-mobile.jpg",
      webScreenshot: "/images/Web-Chat.png"
    },
    {
      name: "Borrowing",
      description: "Create and manage borrowing agreements",
      webAvailable: true,
      mobileAvailable: true,
      webAdditionalInfo: "Advanced agreement templates and calendar integration",
      mobileAdditionalInfo: "Quick agreements with predefined terms",
      icon: <Clock className="w-5 h-5" />,
      mobileScreenshot: "/images/borrowing-web.jpg",
      webScreenshot: "/images/Web-Borrowing.png"
    },
    {
      name: "Learning Quizzes",
      description: "Test your knowledge with interactive quizzes",
      webAvailable: true,
      mobileAvailable: false,
      webAdditionalInfo: "Full keyboard navigation and progress tracking",
      mobileAdditionalInfo: "Not available - use web version for quizzes",
      icon: <Award className="w-5 h-5" />,
      mobileScreenshot: "/images/quiz-mobile.png",
      webScreenshot: "/images/Web-Quiz.png"
    },
    {
      name: "Video Lessons",
      description: "Watch educational content about sustainability",
      webAvailable: true,
      mobileAvailable: true,
      webAdditionalInfo: "Picture-in-picture and speed controls",
      mobileAdditionalInfo: "Offline download support for on-the-go learning",
      icon: <Shield className="w-5 h-5" />,
      mobileScreenshot: "/images/Lesson-web.jpg",
      webScreenshot: "/images/Web-Lesson.png"
    }
  ];

  const placeholderMobileImage = "https://placehold.co/320x570/f8fafc/64748b?text=Mobile+App+View";
  const placeholderWebImage = "https://placehold.co/800x450/f8fafc/64748b?text=Website+View";

  return (
    <section className="py-32 relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      {/* Animated background elements */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-gray-900/5 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Platform Comparison</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-blue-500 to-emerald-500 text-transparent bg-clip-text">
              Web & Mobile Features
            </span>
          </h2>
          
          <p className="text-gray-600 text-xl mb-12 leading-relaxed">
            Discover what you can do on our website and mobile app. Access the right features on the right device.
          </p>
        </motion.div>

        {/* Feature Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Feature Table */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full opacity-50"></div>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl relative z-10 border border-slate-100">
              <h3 className="text-2xl font-bold mb-8 text-gray-800">Feature Availability</h3>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedFeature(index)}
                    className={`cursor-pointer p-4 rounded-xl transition-all duration-300 border ${selectedFeature === index ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-slate-100'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${selectedFeature === index ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {feature.icon}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{feature.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{feature.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Web Availability */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-700">Web:</span>
                            </div>
                            {feature.webAvailable ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          
                          {/* Mobile Availability */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-slate-500" />
                              <span className="text-sm font-medium text-slate-700">Mobile:</span>
                            </div>
                            {feature.mobileAvailable ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedFeature === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-100"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-semibold text-blue-700">WEB FEATURE</span>
                            </div>
                            <p className="text-sm text-slate-600">{feature.webAdditionalInfo}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="w-4 h-4 text-emerald-500" />
                              <span className="text-xs font-semibold text-emerald-700">MOBILE FEATURE</span>
                            </div>
                            <p className="text-sm text-slate-600">{feature.mobileAdditionalInfo}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Right Column: Device Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:ml-auto relative"
          >
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full opacity-50"></div>
            
            {/* 3D-like Phone Container */}
            <div className="relative mx-auto max-w-[320px]">
              {/* Phone Frame */}
              <motion.div
                initial={{ rotateY: 10 }}
                animate={{ rotateY: [10, 0, 10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ perspective: "1000px" }}
                className="relative mx-auto"
              >
                {/* Phone Outer Border */}
                <div className="relative pt-10 pb-16 rounded-[3rem] bg-slate-800 shadow-xl shadow-slate-900/20 ring-1 ring-slate-400/10">
                  {/* Top Notch */}
                  <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-center">
                    <div className="w-1/3 h-6 bg-slate-700 rounded-b-xl"></div>
                  </div>
                  
                  {/* Phone Screen */}
                  <div className="relative h-[570px] w-[320px] overflow-hidden rounded-t-xl bg-slate-100">
                    {/* Display App Screenshots */}
                    <motion.div
                      key={selectedFeature} // Force re-render on selection change
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative h-full w-full"
                    >
                      {features[selectedFeature].mobileAvailable ? (
                        // If feature is available on mobile, show mobile screenshot
                        <img 
                          src={features[selectedFeature].mobileScreenshot || placeholderMobileImage} 
                          alt={`${features[selectedFeature].name} on mobile`}
                          className="object-cover h-full w-full"
                        />
                      ) : (
                        // If feature is not available on mobile, show "web only" message
                        <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                          <div className="w-16 h-16 mb-4 flex items-center justify-center bg-slate-200 rounded-full">
                            <Globe className="w-8 h-8 text-slate-500" />
                          </div>
                          <p className="text-lg font-semibold text-slate-700 mb-2">Web Only Feature</p>
                          <p className="text-center text-sm text-slate-500 max-w-[80%]">
                            {features[selectedFeature].name} is currently only available on our website
                          </p>
                        </div>
                      )}
                      
                      {/* Status Bar */}
                      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-black/40 to-transparent flex items-center justify-between px-6 text-white text-xs">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 20.8995L11.8447 21C6.51896 21 2 16.481 2 11.1553L2.10046 11C2.56252 5.94668 6.94668 1.56252 12 1.10046L12.1553 1C17.481 1 22 5.51896 22 10.8447L21.8995 11C21.4375 16.0533 17.0533 20.4375 12 20.8995ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13Z" />
                          </svg>
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.01 7C6.01 6.10993 5.6873 5.76932 5.41421 5.49624C5.14112 5.22316 4.80052 4.9004 4.80052 4.00049H19.1995C19.1995 4.9004 18.8589 5.22316 18.5858 5.49624C18.3127 5.76932 17.99 6.10994 17.99 7H6.01ZM4 8.00049C4 7.44659 4.44772 6.9989 5.00161 7H18.9984C19.5523 6.9989 20 7.44659 20 8.00049V19.0005C20 19.5544 19.5523 20.0021 18.9984 20H5.00161C4.44772 20.0021 4 19.5544 4 19.0005V8.00049Z" />
                          </svg>
                          <span>100%</span>
                        </div>
                      </div>
                      
                      {/* Feature Badge */}
                      {features[selectedFeature].mobileAvailable && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-sm">
                          {features[selectedFeature].icon}
                          <span>{features[selectedFeature].name}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                  
                  {/* Bottom Home Button */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <div className="w-20 h-1 rounded-full bg-slate-600"></div>
                  </div>
                </div>
                
                {/* Phone Shadow */}
                <div className="absolute -bottom-6 inset-x-0 h-12 bg-gradient-to-t from-slate-900 to-transparent opacity-20 blur-xl"></div>
              </motion.div>
              
              {/* Web Preview Float */}
              {features[selectedFeature].webAvailable && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute top-0 -right-24 w-52 h-36 bg-white rounded-lg overflow-hidden shadow-lg border border-slate-200 hidden lg:block"
                >
                  <img 
                    src={features[selectedFeature].webScreenshot || placeholderWebImage}
                    alt={`${features[selectedFeature].name} on web`}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-slate-100/80 flex items-center px-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-xs py-1 px-2">
                    <div className="flex items-center justify-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>Web Version</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Platform Labels */}
            <div className="mt-12 flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium">Mobile App</span>
                </div>
                <p className="text-sm text-gray-500 text-center">On-the-go access</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Web Platform</span>
                </div>
                <p className="text-sm text-gray-500 text-center">Full featured experience</p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-32"
        >
          <h3 className="text-2xl font-semibold mb-6">Get Started Today</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 
                       rounded-full text-lg font-medium text-white shadow-lg 
                       hover:shadow-blue-500/25 hover:shadow-2xl transition-all duration-300"
            >
              <span>Launch Website</span>
              <Globe className="w-5 h-5 animate-pulse" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200
                       rounded-full text-lg font-medium text-slate-700 shadow-lg 
                       hover:shadow-slate-200/50 hover:shadow-xl transition-all duration-300"
            >
              <span>Download App</span>
              <Smartphone className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;