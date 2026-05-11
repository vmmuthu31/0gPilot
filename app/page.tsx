"use client";

import { Footer } from "@/components/Landing/Footer";
import Navbar from "@/components/Landing/Navbar";
import { Architecture } from "@/components/Landing/sections/Architecture";
import { BuilderTarget } from "@/components/Landing/sections/BuilderTarget";
import { CTA } from "@/components/Landing/sections/CTA";
import { Features } from "@/components/Landing/sections/Features";
import HeroSection from "@/components/Landing/sections/HeroSection";
import Partners from "@/components/Landing/sections/Partners";
import { Process } from "@/components/Landing/sections/Process";
import { Stats } from "@/components/Landing/sections/Stats";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const StickyCard = ({ children, index, total }: { children: React.ReactNode, index: number, total: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div ref={containerRef} className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ scale, opacity, y }}
        className={`w-full h-full bg-[#050816] flex flex-col justify-center ${index > 0 ? "rounded-t-[3rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-12" : ""}`}
      >
        <div className="w-full max-h-full overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen selection:bg-[#7c3aed]/30 selection:text-white bg-[#050816] relative">
      <Navbar />

      <main className="relative pb-[50vh]">
        <StickyCard index={0} total={6}>
          <HeroSection />
          <Partners />
          <Stats />
        </StickyCard>
        
        <StickyCard index={1} total={6}>
          <Features />
        </StickyCard>

        <StickyCard index={2} total={6}>
          <Process />
        </StickyCard>

        <StickyCard index={3} total={6}>
          <Architecture />
        </StickyCard>

        <StickyCard index={4} total={6}>
          <BuilderTarget />
        </StickyCard>

        <StickyCard index={5} total={6}>
          <CTA />
          <Footer />
        </StickyCard>
      </main>
    </div>
  );
}
