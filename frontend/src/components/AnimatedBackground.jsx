import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState, useMemo, memo } from 'react';
import { 
  MdComputer, 
  MdSportsBasketball, 
  MdBook, 
  MdBuild, 
  MdKitchen, 
  MdGames,
  MdCamera,
  MdHeadphones
} from 'react-icons/md';

// Memoize individual floating icon
const FloatingIcon = memo(({ Icon, initialX, initialY, scale = 1, opacity = 1 }) => {
  const controls = useAnimation();
  const [hovered, setHovered] = useState(false);

  // Memoize the icon color so it doesn't change on re-render
  const iconColor = useMemo(() => 
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 65%)`,
    []
  );

  useEffect(() => {
    controls.start({
      x: [initialX - 30, initialX + 30, initialX],
      y: [initialY - 30, initialY + 30, initialY],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    });
  }, [controls, initialX, initialY]);

  return (
    <motion.div
      initial={{ x: initialX, y: initialY }}
      animate={controls}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="absolute transform cursor-pointer"
      style={{
        fontSize: '45px',
        opacity,
        transform: `scale(${scale})`
      }}
    >
      <motion.div
        animate={{
          color: hovered ? '#3B82F6' : iconColor,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Icon />
        {hovered && (
          <motion.div
            className="absolute inset-0 blur-md opacity-50"
            style={{
              backgroundColor: iconColor,
              transform: 'scale(1.2)',
              zIndex: -1,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

// Memoize the entire background component
const AnimatedBackground = memo(() => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoize icons and layers
  const icons = useMemo(() => [
    MdComputer, MdSportsBasketball, MdBook, MdBuild,
    MdKitchen, MdGames, MdCamera, MdHeadphones
  ], []);

  const layers = useMemo(() => [
    { scale: 1, opacity: 0.7, icons: icons.slice(0, 4) },
    { scale: 0.6, opacity: 0.5, icons: icons.slice(4) }
  ], [icons]);

  // Memoize icon positions
  const iconPositions = useMemo(() => 
    layers.map(layer => 
      layer.icons.map((_, index) => ({
        x: (windowSize.width / layer.icons.length) * index + (Math.random() * 100 - 50),
        y: Math.random() * windowSize.height
      }))
    ),
    [layers, windowSize]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/50 to-purple-50/90" />
      
      {layers.map((layer, layerIndex) => (
        <div key={layerIndex} className="absolute inset-0">
          {layer.icons.map((Icon, index) => (
            <FloatingIcon
              key={`${layerIndex}-${index}`}
              Icon={Icon}
              initialX={iconPositions[layerIndex][index].x}
              initialY={iconPositions[layerIndex][index].y}
              scale={layer.scale}
              opacity={layer.opacity}
            />
          ))}
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60" />
    </div>
  );
});

// Add display names for debugging
FloatingIcon.displayName = 'FloatingIcon';
AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;