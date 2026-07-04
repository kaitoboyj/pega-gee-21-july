import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import backgroundImage from '@/assets/background.jpg';

export const PegasusAnimation = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; speedX: number; speedY: number; color: string }[]>([]);

  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 300; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* New Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gradient Overlay (30% transparent) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black" />

      {/* Central Planet (Dark Space Style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-80 h-80 rounded-full bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-black/70 border border-white/5 shadow-[0_0_80px_rgba(100,100,150,0.1)] relative overflow-hidden">
            <div className="absolute top-16 left-12 w-24 h-24 rounded-full bg-white/10 blur-md" />
            <div className="absolute bottom-20 right-16 w-16 h-16 rounded-full bg-black/30" />
            <div className="absolute top-1/2 left-1/3 w-40 h-10 rounded-full bg-white/8 blur-sm" />
            <div className="absolute bottom-1/3 left-1/4 w-32 h-8 rounded-full bg-gray-800/20 blur-sm" />
          </div>
        </motion.div>
      </div>

      {/* Random Moving Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            backgroundColor: star.color,
            boxShadow: `0 0 ${star.size * 3}px ${star.size}px rgba(255, 255, 255, 0.4)`,
          }}
          animate={{
            x: [0, star.speedX * 100, 0],
            y: [0, star.speedY * 100, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
