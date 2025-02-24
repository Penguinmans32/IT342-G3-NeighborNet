import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
    { name: 'Marketing', image: 'https://i0.wp.com/www.iedunote.com/img/1178/marketing-definition-what-is-modern-definition-of-marketing.jpg' },
    { name: 'Music', image: 'https://media.istockphoto.com/id/894058154/photo/musical-instruments.jpg?s=612x612&w=0&k=20&c=uB0TFyqeY1wu1BPyH2EB7NMoOCaSb86pk7YNQ5QVCGQ=' },
    { name: 'Graphic Design', image: 'https://www.designyourway.net/blog/wp-content/uploads/2023/09/graphic-designer-vs-art-director.jpg' },
    { name: 'Programming', image: 'https://f.hubspotusercontent10.net/hubfs/6448316/applications-of-computer-programming.jpg' },
    { name: 'Animation', image: 'https://www.slashgear.com/img/gallery/9-of-the-best-android-apps-for-drawing-and-animation-in-2023/intro-1689105104.jpg' },
    { name: 'Creative Writing', image: 'https://www.hope.ac.uk/media/studywithus/undergraduate/images/2023-24ugcoursebannerimages/BA%20(Hons)%20Creative%20Writing%20(Major).jpg' },
    { name: 'Film & Video', image: 'https://www.marketingdonut.co.uk/sites/default/files/how-use-video-promote-your-business226081837.jpg' },
  ];



const features = [
  'Thousands of creative classes. Beginner to pro.',
  'Taught by creative pros and Industry icons.',
  'Learning Paths to help you achieve your goals.',
  'Certificates to celebrate your accomplishments.',
];

const stats = [
  { value: '25K+', label: 'Classes' },
  { value: '600K', label: 'Members' },
  { value: '8K', label: 'Teacher' },
  { value: '4.8', label: 'Rate' },``
];


const duplicatedCategories = [...categories, ...categories];


export function CategorySection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Explore Popular Categories
          </h2>

          {/* Infinite Scroll Container */}
          <div className="relative w-full overflow-hidden">
            <motion.div
              className="flex gap-4 py-4"
              animate={{
                x: ["0%", "-50%"]
              }}
              transition={{
                x: {
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }
              }}
            >
              {duplicatedCategories.map((category, index) => (
                <motion.div
                  key={`${category.name}-${index}`}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative flex-shrink-0 w-64 aspect-square rounded-xl overflow-hidden"
                >
                  <div className="relative w-full h-full group">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                    <h3 className="absolute bottom-4 left-4 text-lg font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {/* Gradient overlays */}
            <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-gray-900 to-transparent z-10" />
            <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-gray-900 to-transparent z-10" />
          </div>
        </motion.div>

        {/* Features and Stats Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        {/* Left Column - Enhanced Features with Improved Visual Hierarchy */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12 relative"
        >
            <div className="space-y-6">
            {/* Enhanced headline with animated underline */}
            <motion.div className="relative">
                <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-bold leading-tight"
                >
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 text-transparent bg-clip-text inline-block">
                    Transform
                </span>
                <br />
                <span className="text-white inline-block mt-2">Your Skills</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text inline-block mt-2">
                    With Experts
                </span>
                </motion.h2>
                <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute -bottom-4 left-0 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500"
                />
            </motion.div>
            
            <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-blue-200/80 max-w-xl"
            >
                Join our community of passionate learners and unlock your true potential through expert-led courses and hands-on experiences.
            </motion.p>

            {/* Quick Stats */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex gap-8 pt-4"
            >
                <div className="space-y-1">
                <div className="text-3xl font-bold text-white">97%</div>
                <div className="text-sm text-blue-200/70">Success Rate</div>
                </div>
                <div className="space-y-1">
                <div className="text-3xl font-bold text-white">4.9/5</div>
                <div className="text-sm text-blue-200/70">Student Rating</div>
                </div>
            </motion.div>
            </div>
                    
            {/* Enhanced Feature Cards with Better Visual Hierarchy */}
            <div className="grid gap-6">
            {features.map((feature, index) => (
                <motion.div 
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, translateX: 10 }}
                className="group relative flex items-center gap-6 p-6 rounded-2xl 
                            backdrop-blur-sm overflow-hidden"
                >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 
                                group-hover:from-blue-500/20 group-hover:to-purple-500/20 
                                transition-all duration-500" />
                
                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 
                                group-hover:border-blue-500/50 transition-colors duration-500" />

                <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/20 
                                flex items-center justify-center group-hover:bg-blue-500/30 
                                transition-colors duration-300 overflow-hidden">
                    <CheckCircle className="text-blue-400 w-7 h-7 group-hover:text-blue-300 
                                        transform group-hover:scale-110 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-purple-500/0 
                                group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300" />
                </div>
                
                <div className="relative">
                    <span className="text-white/90 text-lg font-medium group-hover:text-white 
                                transition-colors duration-300">
                    {feature}
                    </span>
                </div>
                </motion.div>
            ))}
            </div>
        </motion.div>

        {/* Right Column - Interactive Elements with Enhanced Design */}
        <div className="relative">
            {/* Enhanced background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 
                            rounded-3xl blur-3xl opacity-70 animate-pulse" />
            
            {/* Content with improved visual hierarchy */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl p-8 overflow-hidden backdrop-blur-sm"
            >
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 
                            bg-gradient-to-br from-white/10 to-white/5" />

            <div className="relative grid gap-8">
                <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">Why Choose Us?</h3>
                <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                </div>

                {/* Enhanced Achievement Cards */}
                <div className="grid gap-6">
                {[
                    {
                    title: "Personalized Learning Path",
                    description: "AI-powered adaptive learning experience tailored just for you",
                    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                    gradient: "from-blue-500/20 to-purple-500/20",
                    iconColor: "text-blue-400",
                    bgColor: "bg-blue-500/20"
                    },
                    {
                    title: "Live Interactive Workshops",
                    description: "Real-time collaboration with industry experts",
                    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
                    gradient: "from-purple-500/20 to-pink-500/20",
                    iconColor: "text-purple-400",
                    bgColor: "bg-purple-500/20"
                    },
                    {
                    title: "Community & Networking",
                    description: "Connect with peers and build your professional network",
                    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
                    gradient: "from-pink-500/20 to-blue-500/20",
                    iconColor: "text-pink-400",
                    bgColor: "bg-pink-500/20"
                    }
                ].map((achievement, index) => (
                    <motion.div
                    key={achievement.title}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`bg-gradient-to-r ${achievement.gradient} p-6 rounded-xl border border-white/10 
                                hover:border-white/20 transition-all duration-300`}
                    >
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-3">
                        <h4 className="text-xl font-semibold text-white">{achievement.title}</h4>
                        <p className="text-blue-200/70 leading-relaxed">{achievement.description}</p>
                        </div>
                        <div className={`w-14 h-14 ${achievement.bgColor} rounded-full flex items-center justify-center 
                                        transform transition-transform duration-300 hover:scale-110`}>
                        <svg className={`w-7 h-7 ${achievement.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={achievement.icon} />
                        </svg>
                        </div>
                    </div>
                    </motion.div>
                ))}
                </div>
            </div>
            </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}