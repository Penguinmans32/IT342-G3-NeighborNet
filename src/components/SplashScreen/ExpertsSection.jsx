import { motion } from 'framer-motion';
import { ArrowRight, Star, Award, Play, Users } from 'lucide-react';

const experts = [
  {
    name: "Marques Brownlee",
    role: "YouTuber, Producer",
    followers: "18.2M",
    rating: "4.9",
    courses: "12",
    expertise: ["Tech Reviews", "Video Production", "Storytelling"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hygeqNFiV09yLifqM53nGleAu2AZB6.png",
  },
  {
    name: "Amelie Satzgar",
    role: "Photographer",
    followers: "2.5M",
    rating: "4.8",
    courses: "8",
    expertise: ["Tech Reviews", "Video Production", "Storytelling"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hygeqNFiV09yLifqM53nGleAu2AZB6.png",
  },
  {
    name: "Ali Abdaal",
    role: "Doctor, YouTuber",
    followers: "3.8M",
    rating: "4.9",
    courses: "15",
    expertise: ["Tech Reviews", "Video Production", "Storytelling"],
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hygeqNFiV09yLifqM53nGleAu2AZB6.png",
  }
];

export default function ExpertsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-gray-900 to-gray-900" />
          
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent" />
          </div>
      
          <div className="max-w-6xl mx-auto px-4 relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6 mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center gap-2 text-emerald-400"
              >
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">World-Class Instructors</span>
              </motion.div>
      
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-transparent bg-clip-text">
                  Learn from Industry
                </span>
                <br />
                <span className="text-white">Leading Experts</span>
              </h2>
              <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto">
                Join classes taught by renowned creators who are passionate about sharing their expertise and journey with you.
              </p>
            </motion.div>
      
            {/* Top Two Cards */}
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {experts.slice(0, 2).map((expert, index) => (
                  <motion.div
                    key={expert.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl h-[300px]"
                  >
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-gray-900/30 
                                 group-hover:from-emerald-800/40 group-hover:to-gray-800/40 transition-all duration-500" />
                    
                    {/* Main image */}
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-full h-full object-cover transition-transform duration-700 
                               group-hover:scale-110 filter brightness-90"
                    />
                    
                    {/* Content overlay with glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/70 to-transparent
                                 backdrop-blur-[2px] transition-all duration-500">
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="space-y-6"
                        >
                          {/* Expert info */}
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">{expert.name}</h3>
                            <p className="text-emerald-300 text-lg font-medium">{expert.role}</p>
                          </div>
      
                          {/* Expertise tags */}
                          <div className="flex flex-wrap gap-2">
                            {expert.expertise.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full text-xs font-medium
                                         bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
      
                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Followers
                              </div>
                              <div className="text-white font-semibold">{expert.followers}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Rating
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-white font-semibold">{expert.rating}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Courses
                              </div>
                              <div className="text-white font-semibold">{expert.courses}</div>
                            </div>
                          </div>
      
                          {/* CTA buttons */}
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                                       bg-emerald-500 text-white font-medium
                                       hover:bg-emerald-400 transition-all duration-300"
                            >
                              View Courses
                              <Play className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                                       bg-white/10 text-white font-medium backdrop-blur-sm
                                       hover:bg-white/20 transition-all duration-300"
                            >
                              Follow
                              <Users className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
      
                    {/* Border effect */}
                    <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl 
                                 group-hover:border-emerald-500/30 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>
      
              {/* Bottom Card - Centered with controlled width */}
              <div className="flex justify-center">
                {experts.slice(2, 3).map((expert) => (
                  <motion.div
                    key={expert.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="group relative overflow-hidden rounded-2xl h-[300px] w-full md:w-[600px]"
                  >
                    {/* Same card content as above */}
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 to-gray-900/30 
                                 group-hover:from-emerald-800/40 group-hover:to-gray-800/40 transition-all duration-500" />
                    
                    {/* Main image */}
                    <img
                      src={expert.image}
                      alt={expert.name}
                      className="w-full h-full object-cover transition-transform duration-700 
                               group-hover:scale-110 filter brightness-90"
                    />
                    
                    {/* Content overlay with glass effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/70 to-transparent
                                 backdrop-blur-[2px] transition-all duration-500">
                      <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="space-y-6"
                        >
                          {/* Expert info */}
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">{expert.name}</h3>
                            <p className="text-emerald-300 text-lg font-medium">{expert.role}</p>
                          </div>
      
                          {/* Expertise tags */}
                          <div className="flex flex-wrap gap-2">
                            {expert.expertise.map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 rounded-full text-xs font-medium
                                         bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
      
                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Followers
                              </div>
                              <div className="text-white font-semibold">{expert.followers}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Rating
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-white font-semibold">{expert.rating}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-200/60 text-xs font-medium uppercase tracking-wider">
                                Courses
                              </div>
                              <div className="text-white font-semibold">{expert.courses}</div>
                            </div>
                          </div>
      
                          {/* CTA buttons */}
                          <div className="flex items-center gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                                       bg-emerald-500 text-white font-medium
                                       hover:bg-emerald-400 transition-all duration-300"
                            >
                              View Courses
                              <Play className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-full 
                                       bg-white/10 text-white font-medium backdrop-blur-sm
                                       hover:bg-white/20 transition-all duration-300"
                            >
                              Follow
                              <Users className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
      
                    {/* Border effect */}
                    <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl 
                                 group-hover:border-emerald-500/30 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>
            </div>
      
            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mt-20"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 
                         rounded-full text-lg font-semibold shadow-lg 
                         hover:shadow-emerald-500/25 hover:shadow-2xl transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Explore All Experts
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
            </motion.div>
          </div>
        </section>
      );
  }