import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, Settings, Code, Github, Twitter, Linkedin, Mail, ArrowRightCircle } from 'lucide-react';
import { useState } from 'react';

export default function App() {
  const [faqs, setFaqs] = useState([
    {
      question: "What is NeighborNet?",
      answer: (
        <>
          <ArrowRightCircle className="inline w-5 h-5 text-emerald-400 mr-1" />
          NeighborNet is a community platform...
        </>
      ),
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      isOpen: false
    },
    {
      question: "What is included in my NeighborNet membership?",
      answer: (
        <>
          <ArrowRightCircle className="inline w-5 h-5 text-purple-400 mr-1" />
          Your NeighborNet membership includes...
        </>
      ),
      icon: <Settings className="w-5 h-5 text-purple-400" />,
      isOpen: false
    },
    {
      question: "What can I learn from NeighborNet?",
      answer: (
        <>
          <ArrowRightCircle className="inline w-5 h-5 text-blue-400 mr-1" />
          On NeighborNet, you can learn...
        </>
      ),
      icon: <Code className="w-5 h-5 text-blue-400" />,
      isOpen: false
    },
    {
      question: "What happens after my trial is over?",
      answer: (
        <>
          <ArrowRightCircle className="inline w-5 h-5 text-rose-400 mr-1" />
          After your trial period ends...
        </>
      ),
      icon: <MessageCircle className="w-5 h-5 text-rose-400" />,
      isOpen: false
    },
    {
      question: "Can I Teach on NeighborNet?",
      answer: (
        <>
          <ArrowRightCircle className="inline w-5 h-5 text-amber-400 mr-1" />
          Yes, you can become a teacher on NeighborNet...
        </>
      ),
      icon: <Code className="w-5 h-5 text-amber-400" />,
      isOpen: false
    }
  ]);

  const developers = [
    {
      name: "John Smith",
      role: "Lead Developer",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=john",
      bio: "Full-stack developer with 5 years of experience in React and Node.js",
      links: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
    {
      name: "Sarah Johnson",
      role: "UI/UX Developer",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sarah",
      bio: "Passionate about creating beautiful and intuitive user interfaces",
      links: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
    {
      name: "Mike Chen",
      role: "Backend Developer",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=mike",
      bio: "Specialized in building scalable backend systems and APIs",
      links: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    }
  ];

  const toggleFAQ = (index) => {
    setFaqs(faqs.map((faq, i) => ({
      ...faq,
      isOpen: i === index ? !faq.isOpen : false
    })));
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Meet Our Team
            </span>
          </motion.h1>
          
          {/* Developer Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
          >
            {developers.map((dev, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 
                             backdrop-blur-sm border border-white/10 p-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-white/20"
                    />
                    <h3 className="text-xl font-semibold mb-1">{dev.name}</h3>
                    <p className="text-purple-400 text-sm mb-3">{dev.role}</p>
                    <p className="text-gray-400 text-sm mb-4">{dev.bio}</p>
                    
                    <div className="flex justify-center gap-4">
                      {Object.entries(dev.links).map(([platform, url]) => {
                        const Icon = {
                          github: Github,
                          twitter: Twitter,
                          linkedin: Linkedin
                        }[platform];
                        
                        return (
                          <motion.a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            <Icon className="w-5 h-5" />
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h3 className="text-3xl font-semibold mb-12">
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center gap-4 p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    {faq.icon}
                    <span className="flex-1 text-lg">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform duration-300 ${
                        faq.isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {faq.isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-gray-400">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}