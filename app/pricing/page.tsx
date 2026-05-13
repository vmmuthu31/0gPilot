"use client";

import Navbar from "@/components/Landing/Navbar";
import { Footer } from "@/components/Landing/Footer";
import { SpaceBackground } from "@/components/Landing/BackgroundParticles";
import { Pricing } from "@/components/Landing/sections/Pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen selection:bg-[#7c3aed]/30 selection:text-white bg-[var(--background)] relative">
      <SpaceBackground />
      <Navbar />

      <main className="relative z-10 pt-16">
        <Pricing />
        <Footer />
      </main>
    </div>
  );
}
