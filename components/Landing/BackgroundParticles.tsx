"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

interface Dust {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  driftY: number;
}

export const SpaceBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);
  const [dustParticles, setDustParticles] = useState<Dust[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      
      setStars(Array.from({ length: 150 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      })));

      setDustParticles(Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
        driftX: (Math.random() - 0.5) * 5,
        driftY: (Math.random() - 0.5) * 5,
      })));
    });

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050816]">
      <motion.div 
        className="absolute inset-[-5%] z-0"
        animate={{ 
          x: mousePosition.x * -0.5,
          y: mousePosition.y * -0.5,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05),transparent_70%)]" />
      </motion.div>
      
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          x: mousePosition.x * -0.2,
          y: mousePosition.y * -0.2,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
      >
        {stars.map((star) => (
          <motion.div
            key={`star-${star.id}`}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
            }}
            animate={{
              opacity: [star.opacity, 0.2, star.opacity],
              scale: [1, 0.8, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        className="absolute inset-0"
        animate={{ 
          x: mousePosition.x * -0.8,
          y: mousePosition.y * -0.8,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
      >
        {dustParticles.map((dust) => (
          <motion.div
            key={`dust-${dust.id}`}
            className="absolute rounded-full"
            style={{
              left: `${dust.x}%`,
              top: `${dust.y}%`,
              width: dust.size,
              height: dust.size,
              background: "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)",
              filter: "blur(1px)",
            }}
            animate={{
              x: [0, dust.driftX * 20, 0],
              y: [0, dust.driftY * 20, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: dust.duration,
              repeat: Infinity,
              delay: dust.delay,
              ease: "linear",
            }}
          />
        ))}
      </motion.div>

      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/5 blur-[120px]" />
      
      <ShootingStars />

      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
};

const ShootingStars = () => {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const id = Date.now();
        const newStar = {
          id,
          x: Math.random() * 80 + 10,
          y: Math.random() * 40 + 10,
          angle: 45 + (Math.random() - 0.5) * 20,
        };
        setStars((prev) => [...prev, newStar]);
        setTimeout(() => {
          setStars((prev) => prev.filter((s) => s.id !== id));
        }, 2000);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence>
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0.5],
              x: 200 * Math.cos((star.angle * Math.PI) / 180),
              y: 200 * Math.sin((star.angle * Math.PI) / 180),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute h-[1px] w-16 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: `rotate(${star.angle}deg)`,
              filter: "drop-shadow(0 0 5px white)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
