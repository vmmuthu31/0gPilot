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

export default function App() {
  return (
    <div className="min-h-screen selection:bg-[#7c3aed]/30 selection:text-white bg-[var(--background)]">
      <Navbar />

      <main>
        <HeroSection />
        <Partners />
        <Stats />
        <Features />
        <Process />
        <Architecture />
        <BuilderTarget />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
