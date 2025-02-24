import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Quote, BadgeCheck, Sparkles, GraduationCap } from 'lucide-react';

const Testimonials = () => {
  // Add parallax scroll effect
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const testimonials = [
    {
      quote: "I come to NeighborNet for the curation and class quality. That's really worth the cost of membership to me.",
      name: "MARY ANN",
      role: "DIGITAL ARTIST",
      company: "Adobe Creative Studio",
      avatar: "https://freeparalegal.org/wp-content/uploads/2023/08/July-1536x1024-1.jpg",
      rating: 5,
      coursesCompleted: 12,
      memberSince: "2023",
      verified: true,
      achievements: ["Top Contributor", "Course Excellence"],
      featuredWork: "Digital Art Portfolio 2024"
    },
    {
      quote: "I have an understanding that, even if the work is not perfect, it's a work in progress. And the reason why I'm on Skillshare is to develop a skill.",
      name: "DEVON R",
      role: "UI/UX DESIGNER",
      company: "Design Forward Co.",
      avatar: "https://heroshotphotography.com/wp-content/uploads/2023/03/male-linkedin-corporate-headshot-on-white-square-1024x1024.jpg",
      rating: 5,
      coursesCompleted: 8,
      memberSince: "2024",
      verified: true,
      achievements: ["Rising Star", "Design Innovation"],
      featuredWork: "UX Case Study Collection"
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-rose-50/50 to-white" />
      
      {/* Animated patterns */}
      <motion.div 
        className="absolute inset-0" 
        style={{ y }}
      >
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 relative">
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-gray-900/5 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-gray-600">Student Success Stories</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-rose-500 to-pink-500 text-transparent bg-clip-text">
              Transforming Careers
            </span>
          </h2>
          
          <p className="text-gray-600 text-xl mb-12 leading-relaxed">
            Join our thriving community of over 100,000 creative professionals who have taken their skills to the next level
          </p>

        </motion.div>

        {/* Testimonials with Enhanced Layout */}
        <div className="space-y-32">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center gap-16">
                {/* Quote Section */}
                <div className={`flex-1 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                  <div className="relative">
                    <Quote className="absolute -top-6 -left-4 w-12 h-12 text-rose-200" />
                    <blockquote className="text-2xl font-light text-gray-700 leading-relaxed pl-8">
                      {testimonial.quote}
                    </blockquote>
                  </div>
                </div>

                {/* Enhanced Profile Card */}
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-xl shadow-rose-100/50">
                      <div className="flex flex-col items-center text-center">
                        {/* Avatar with Verification */}
                        <div className="relative mb-6">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-rose-50"
                          />
                          {testimonial.verified && (
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full p-2">
                              <BadgeCheck className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Profile Info */}
                        <h4 className="text-gray-900 text-xl font-semibold mb-1">{testimonial.name}</h4>
                        <p className="text-rose-500 font-medium mb-1">{testimonial.role}</p>
                        <p className="text-gray-500 text-sm mb-4">{testimonial.company}</p>

                        {/* Rating */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>

                        {/* Achievement Tags */}
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {testimonial.achievements.map((achievement, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
                                       bg-rose-50 text-rose-600"
                            >
                              <Sparkles className="w-3 h-3" />
                              {achievement}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-rose-400" />
                            <span>{testimonial.coursesCompleted} courses</span>
                          </div>
                          <div className="h-4 w-px bg-gray-200" />
                          <div>Since {testimonial.memberSince}</div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute inset-0 border border-rose-100 rounded-2xl" />
                    <div className="absolute inset-0 border-2 border-rose-200/20 rounded-2xl 
                                  scale-105 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-32"
        >
          <h3 className="text-2xl font-semibold mb-6">Ready to Start Your Journey?</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 
                     rounded-full text-lg font-medium text-white shadow-lg 
                     hover:shadow-rose-500/25 hover:shadow-2xl transition-all duration-300"
          >
            <span>Join Our Community</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;