import { motion, useScroll, useTransform } from 'framer-motion';
import { FaHandshake, FaUsers, FaLeaf, FaLightbulb, FaShare, FaTools, FaBook, FaHandHoldingHeart } from 'react-icons/fa';
import Footer from './SplashScreen/Footer';
import { useRef } from 'react';

const flagAnimation = `
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
`;


const AboutUs = () => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start end", "end start"]
  });

  const features = [
    {
      icon: FaShare,
      title: "Skill Exchange",
      description: "Share your expertise and learn from others in your community",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: FaTools,
      title: "Item Borrowing",
      description: "Borrow tools and items from neighbors, reducing waste and costs",
      color: "from-purple-400 to-purple-600"
    },
    {
      icon: FaBook,
      title: "Learning Hub",
      description: "Access tutorials and resources from community experts",
      color: "from-green-400 to-green-600"
    },
    {
      icon: FaHandHoldingHeart,
      title: "Community Support",
      description: "Build lasting connections with neighbors who share and care",
      color: "from-red-400 to-red-600"
    }
  ];

  // Replace stats section with interactive feature cards
  const FeatureCard = ({ feature, index }) => {
    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
        className="relative group cursor-pointer"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
        <div className="relative bg-white p-8 rounded-2xl shadow-xl">
          <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform`}>
            <feature.icon className="text-3xl text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      </motion.div>
    );
  };

  // Interactive sections to replace the timeline
  const interactiveSections = [
    {
      title: "How It Works",
      content: [
        { step: "Sign Up", description: "Create your account and join your local community" },
        { step: "Share Skills", description: "List your skills and what you'd like to learn" },
        { step: "Connect", description: "Match with neighbors based on mutual interests" },
        { step: "Learn & Share", description: "Start sharing knowledge and resources" }
      ]
    }
  ];

  return (
    <>

    <style>{flagAnimation}</style>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section with Three Parts */}
        <div className="relative overflow-hidden min-h-screen">
        {/* Animated background elements - keep this for visual appeal */}
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
                repeat: Infinity,
                repeatType: "reverse",
                }}
            />
            ))}
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20">
            {/* Title Section - keep as is */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
            >
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
                About <span className="text-blue-600">NeighborNet</span>
            </h1>
            </motion.div>

            {/* Three Section Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto relative">
            {/* Divider Lines */}
            <div className="hidden md:block absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent transform -translate-x-1/2"></div>
            <div className="hidden md:block absolute left-2/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent transform -translate-x-1/2"></div>

            {/* What is NeighborNet */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative overflow-hidden group"
                style={{
                    animation: "wave 3s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    perspective: "1500px",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center"
                }}
            >
                <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50"
                style={{
                    animation: "wave-ripple 2s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                }}
                />
                <div className="relative z-10 transform-gpu" >
                <h2 className="text-2xl font-bold text-blue-600 mb-4">
                What is NeighborNet?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                NeighborNet is a revolutionary platform that transforms how communities connect and share resources. We create a space where neighbors can exchange skills, knowledge, and items, fostering a more collaborative and sustainable neighborhood environment.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                Our platform serves as a digital bridge, connecting individuals within communities who might otherwise never meet. Through NeighborNet, you can discover hidden talents in your neighborhood and share your own expertise with others.
                </p>
                <p className="text-gray-700 leading-relaxed">
                We believe that every neighborhood contains a wealth of knowledge and resources that, when shared, can create stronger, more resilient communities.
                </p>
                </div>
            </motion.div>

            {/* Our Mission */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative overflow-hidden group"
                style={{
                    animation: "wave 3.5s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    perspective: "1500px",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center"
                  }}
            >
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/50"
                  style={{
                    animation: "wave-ripple 2.5s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center"
                  }}
                />
                <div className='relative z-10 transform-gpu'>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">
                Our Mission
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                We're building bridges between neighbors, enabling skill sharing and resource borrowing to create stronger, more connected communities. Our platform makes it easy to teach, learn, and share, turning every neighborhood into a hub of collective knowledge and mutual support.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                Our vision extends beyond simple connections - we aim to revolutionize how communities interact and support each other. Through NeighborNet, we're creating a sustainable ecosystem of sharing and learning.
                </p>
                <p className="text-gray-700 leading-relaxed">
                We're committed to fostering an environment where knowledge flows freely, resources are shared efficiently, and community bonds grow stronger with every interaction.
                </p>
                </div>
            </motion.div>

            {/* Why Choose Us */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative overflow-hidden group"
                style={{
                    animation: "wave 4s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    perspective: "1500px",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center"
                  }}
            >
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/50"
                  style={{
                    animation: "wave-ripple 3s infinite ease-in-out",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden",
                    transformOrigin: "center center"
                  }}
                />
                <div className='relative z-10 transform-gpu'>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                Why Choose Us?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                NeighborNet stands out by combining skill sharing with resource borrowing, creating a unique ecosystem of community support. We provide a secure, user-friendly platform where neighbors can connect, share their expertise, and access tools and resources they need without the burden of ownership.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                Our platform features:
                • Secure and verified user profiles
                • Easy-to-use skill sharing system
                • Efficient resource borrowing tracking
                • Community-driven rating system
                • Real-time messaging and scheduling
                </p>
                <p className="text-gray-700 leading-relaxed">
                Join NeighborNet today and be part of a movement that's redefining community interaction and resource sharing for the modern age.
                </p>
                </div>
            </motion.div>
            </div>

            {/* Tagline */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center mt-16"
            >
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Connecting neighbors, sharing skills, building community
            </p>
            </motion.div>
        </div>
        </div>

      {/* Feature Showcase */}
      <div ref={scrollRef} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* Interactive How It Works Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">How It Works</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {interactiveSections[0].content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.step}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < interactiveSections[0].content.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-200"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative py-24 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Join Our Community?
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <span className="group-hover:mr-2 transition-all">Get Started Today</span>
            <span className="group-hover:opacity-100 opacity-0 transition-all">→</span>
          </motion.button>
        </div>
      </motion.div>

      <Footer />
    </div>
    </>
  );
};

export default AboutUs;