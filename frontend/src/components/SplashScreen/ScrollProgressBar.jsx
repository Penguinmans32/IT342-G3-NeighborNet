import { motion, useScroll } from "framer-motion";

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  return (
    <>
      {/* Background track */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200/20 z-[9999]" />
      
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 z-[9999] transform origin-[0%]"
        style={{ scaleX: scrollYProgress }}
        initial={{ scaleX: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 30, restDelta: 0.001 }}
      />
    </>
  );
}