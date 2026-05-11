import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Cpu,
  FileText,
  Layers,
  Play,
  Zap,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { Button } from "@/components/ui/button";

import { AgentDashboard } from "../AgentDashboard";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="planet-glow-left"></div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 w-full">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#1a1625] text-[#a78bfa] border border-[#a78bfa]/20 mb-6 gap-2 hover:bg-[#7c3aed]/20 transition-colors cursor-pointer"
          >
            <img src="/0g.png" alt="0G" className="w-4 h-4 rounded-full" />
            Built for the OG Ecosystem <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-white"
          >
            Autonomous AI <br />
            <span className="gradient-text">Software Engineer</span>
            <br />
            for Web3
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl leading-relaxed"
          >
            OGPilot&apos;s AI agents build, audit, and deploy full-stack
            decentralized applications on OG infrastructure — autonomously.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-4 mb-10"
          >
            <Button
              className="px-8 py-6 text-base bg-[#7c3aed] hover:bg-[#8b5cf6] text-white rounded-xl font-semibold flex items-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-1"
            >
              <Zap className="w-5 h-5 fill-current" /> Build Your DApp
            </Button>
            <Button 
              variant="outline" 
              className="px-8 py-6 text-base border-[var(--border)] bg-transparent hover:bg-[#111526] text-white rounded-xl font-semibold flex items-center gap-2 transition-all hover:border-[#7c3aed]/50 hover:-translate-y-1"
            >
              Explore Demo <Play className="w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-4 text-sm text-[var(--text-secondary)] bg-[#111526]/50 border border-[var(--border)] py-2 px-4 rounded-full w-max backdrop-blur-sm"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[var(--background)] bg-[#111526] overflow-hidden shadow-lg"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 20}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <span>
              Trusted by <strong className="text-white font-bold">950+</strong> builders
              worldwide
            </span>
          </motion.div>
        </motion.div>

        <div className="relative">
          <AgentDashboard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
