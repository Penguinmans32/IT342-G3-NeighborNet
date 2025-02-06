import { motion } from 'framer-motion';
import { Play, Users, Clock, Star } from 'lucide-react';

function ExploreOnlineSection() {
  const categories = [
    "Featured",
    "Music",
    "Painting",
    "UI/UX Designing",
    "Animation",
    "Creative Writing",
    "Programming",
    "Graphic Design"
  ];

  const courses = [
    {
      id: 1,
      title: "Procreate for Beginners: Learn the Basics & Sell Your Artwork",
      instructor: "Coquillette",
      students: "23",
      duration: "1h 50m",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SANFesKo2o9mz67NnwYBCNlRcricxO.png"
    },
    {
      id: 2,
      title: "Find Your Style: Five Exercises to Unlock Your Creative Identity",
      instructor: "Andy J. Pizza",
      students: "74,514",
      duration: "1h 12m",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SANFesKo2o9mz67NnwYBCNlRcricxO.png"
    },
    {
      id: 3,
      title: "Video for Instagram: Tell an Engaging Story in Less Than a Minute",
      instructor: "Hallease",
      students: "11,525",
      duration: "1h 15m",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SANFesKo2o9mz67NnwYBCNlRcricxO.png"
    },
    {
      id: 4,
      title: "Music Fundamentals: Explore & Create Your Unique Sound",
      instructor: "Jacob Collier",
      students: "10,024",
      duration: "1h 16m",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SANFesKo2o9mz67NnwYBCNlRcricxO.png"
    },
    {
      id: 5,
      title: "YouTube Success: Script, Shoot & Edit with MKBHD",
      instructor: "Marques Brownlee",
      students: "90,039",
      duration: "1h 13m",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SANFesKo2o9mz67NnwYBCNlRcricxO.png"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 text-transparent bg-clip-text">
              Explore Inspiring
            </span>
            <br />
            <span className="text-white">Online Courses</span>
          </h2>
          <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
            Learn from industry experts and transform your creative journey
          </p>
        </motion.div>

        {/* Enhanced Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap gap-3 justify-center mb-16"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-white/5 to-white/10 
                         border border-white/10 text-sm hover:border-white/20 
                         hover:from-blue-500/20 hover:to-purple-500/20 
                         transition-all duration-300 backdrop-blur-sm"
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

       {/* Course Grid */}
       <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto" // Reduced max width
        >
          {/* First row */}
          <div className="grid grid-cols-3 gap-4 mb-12"> {/* Reduced gap and margin */}
            {courses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group relative bg-gradient-to-br from-white/5 to-white/10 
                         rounded-lg overflow-hidden backdrop-blur-sm border border-white/10
                         hover:border-white/20 transition-all duration-300 hover:shadow-xl
                         hover:shadow-blue-500/10"
              >
                <div className="aspect-[5/4] relative overflow-hidden"> {/* Changed aspect ratio */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-500 
                             group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  
                  {/* Smaller Play button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="absolute inset-0 m-auto w-10 h-10 bg-white/10 rounded-full 
                             backdrop-blur-sm flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-all duration-500
                             border border-white/20"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </motion.button>

                  {/* Course info overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full 
                               group-hover:translate-y-0 transition-transform duration-500">
                    <div className="space-y-1.5">
                      <h3 className="font-semibold text-base text-white line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center gap-1.5">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor}`}
                          alt={course.instructor}
                          className="w-5 h-5 rounded-full border border-white/20"
                        />
                        <span className="text-white/90 text-xs">{course.instructor}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/80">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{course.students}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Second row - Offset */}
          <div className="grid grid-cols-2 gap-4 px-12">
            {courses.slice(3, 5).map((course, index) => (
              <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-gradient-to-br from-white/5 to-white/10 
                       rounded-xl overflow-hidden backdrop-blur-sm border border-white/10
                       hover:border-white/20 transition-all duration-300 hover:shadow-2xl
                       hover:shadow-blue-500/10"
            >
              <div className="aspect-[5/3] relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="object-cover w-full h-full transition-transform duration-500 
                           group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent 
                               opacity-0 group-hover:opacity-100 transition-all duration-500" />
                
                {/* Smaller Play button overlay */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="absolute inset-0 m-auto w-12 h-12 bg-white/10 rounded-full 
                           backdrop-blur-sm flex items-center justify-center
                           opacity-0 group-hover:opacity-100 transition-all duration-500
                           border border-white/20"
                >
                  <Play className="w-5 h-5 text-white" />
                </motion.button>
            
                {/* Course info overlay with reduced padding */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full 
                               group-hover:translate-y-0 transition-transform duration-500">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-white line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${course.instructor}`}
                        alt={course.instructor}
                        className="w-6 h-6 rounded-full border-2 border-white/20"
                      />
                      <span className="text-white/90 text-sm">{course.instructor}</span>
                    </div>
            
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-20 space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Start Learning Today
            </span>
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 
                     rounded-full text-lg font-semibold shadow-lg 
                     hover:shadow-xl transition-all duration-300"
          >
            Browse All Courses
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default ExploreOnlineSection;