"use client";

import { Footer } from "@/components/Landing/Footer";
import Navbar from "@/components/Landing/Navbar";
import { SpaceBackground } from "@/components/Landing/BackgroundParticles";
import { Architecture } from "@/components/Landing/sections/Architecture";
import BuilderTargetSection from "@/components/Landing/sections/BuilderTarget";
import { CTA } from "@/components/Landing/sections/CTA";
import { Features } from "@/components/Landing/sections/Features";
import HeroSection from "@/components/Landing/sections/HeroSection";
import Partners from "@/components/Landing/sections/Partners";
import { Process } from "@/components/Landing/sections/Process";
import { Stats } from "@/components/Landing/sections/Stats";

export default function App() {
  return (
    <div className="min-h-screen selection:bg-[#7c3aed]/30 selection:text-white bg-[var(--background)] relative">
      <SpaceBackground />
      <Navbar />

      <main className="relative z-10 flex flex-col">
        <div className="relative z-[1] bg-transparent">
          <HeroSection />
          <Partners />
          <Stats />
        </div>

        <div className="relative z-[2] bg-[#050816]/60 backdrop-blur-sm rounded-t-[2.5rem] border-t border-[var(--border)] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] mt-8">
          <Features />
        </div>

        <div className="relative z-[3] bg-[#050816]/60 backdrop-blur-sm rounded-t-[2.5rem] border-t border-[var(--border)] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] mt-8">
          <Process />
        </div>

        <div className="relative z-[4] bg-[#050816]/60 backdrop-blur-sm rounded-t-[2.5rem] border-t border-[var(--border)] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] mt-8">
          <Architecture />
        </div>

        <div className="relative z-[5] bg-[#050816]/60 backdrop-blur-sm rounded-t-[2.5rem] border-t border-[var(--border)] shadow-[0_-15px_40px_rgba(0,0,0,0.3)] mt-8">
          <BuilderTargetSection />
        </div>

        <div>
          <CTA />
          <Footer />
        </div>
      </main>
    </div>
  );
}
