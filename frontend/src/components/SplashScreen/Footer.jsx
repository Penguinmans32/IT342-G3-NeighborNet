import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Mail, Phone, MapPin, Twitter, Github, Linkedin, Instagram, Globe, BookOpen, Headphones, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Teaching Center", path: "/teaching-center", icon: <BookOpen className="w-4 h-4" /> },
        { name: "Learning Roadmap", path: "/roadmap", icon: <GraduationCap className="w-4 h-4" /> },
        { name: "Support", path: "/support", icon: <Headphones className="w-4 h-4" /> }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Blog", path: "/blog" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", path: "/docs" },
        { name: "Community", path: "/community" },
        { name: "Privacy Policy", path: "/privacy" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, url: "#", label: "Twitter" },
    { icon: <Github className="w-5 h-5" />, url: "#", label: "GitHub" },
    { icon: <Linkedin className="w-5 h-5" />, url: "#", label: "LinkedIn" },
    { icon: <Instagram className="w-5 h-5" />, url: "#", label: "Instagram" }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f172a] text-gray-300 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Logo and Info Section */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold">
                  N
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-transparent bg-clip-text">
                  NeighborNet
                </span>
              </div>
            </Link>

            <div className="space-y-4">
              <p className="text-gray-400 max-w-sm">
                Empowering communities through knowledge sharing and collaborative learning.
              </p>

              <div className="flex flex-col space-y-2">
                <a href="mailto:office@neighbornet.com" 
                   className="flex items-center gap-2 text-sm hover:text-[#4f46e5] transition-colors">
                  <Mail className="w-4 h-4" />
                  neighbonet0@gmail.com
                </a>
                <a href="tel:+1-356-255-0284" 
                   className="flex items-center gap-2 text-sm hover:text-[#4f46e5] transition-colors">
                  <Phone className="w-4 h-4" />
                  +63-356-255-0284
                </a>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  Cebu Institute Technology University
                </div>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4f46e5] transition-colors"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1
                           focus:outline-none focus:border-[#4f46e5] transition-colors"
                />
                <button className="bg-[#4f46e5] hover:bg-[#4338ca] px-4 py-2 rounded-lg transition-colors">
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
          <div className="text-sm text-gray-400">
            © 2024 NeighborNet Inc. All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-4 md:mt-0">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.url}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-400 hover:text-[#4f46e5] transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-[#4f46e5] hover:bg-[#4338ca] text-white p-3 rounded-full 
                     shadow-lg hover:shadow-[#4f46e5]/25 transition-all duration-300"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}
