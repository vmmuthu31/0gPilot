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

const HeroSection = () => {
  const [checkedStep, setCheckedStep] = useState(0);
  const steps = [
    "Planning architecture",
    "Smart contracts",
    "Frontend UI",
    "Backend services",
    "Audit & optimize",
    "Deploy to OG Chain",
  ];

  useEffect(() => {
    const timer = setInterval(
      () => setCheckedStep((prev) => (prev < steps.length ? prev + 1 : 0)),
      1500,
    );
    return () => clearInterval(timer);
  }, [steps.length]);

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

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-[#7c3aed]/10 blur-[100px] rounded-full -z-10"></div>

          <div className="glass-card rounded-2xl overflow-hidden relative">
            <div className="bg-[#0a0f1c]/90 rounded-2xl h-full w-full relative z-10 flex flex-col border border-[var(--border)]">
              <div className="h-10 border-b border-[var(--border)] flex items-center px-4 gap-2 bg-[#111526]/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
              </div>

              <div className="p-6 font-mono text-sm grid md:grid-cols-2 gap-8 relative overflow-hidden">
                <svg
                  className="absolute top-1/2 left-0 w-full h-px z-0"
                  style={{ transform: "translateY(-50%)" }}
                >
                  <line
                    x1="10%"
                    y1="0"
                    x2="90%"
                    y2="0"
                    stroke="rgba(124, 58, 237, 0.2)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>

                <div className="space-y-4 z-10">
                  <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-2">
                    Describe your idea
                  </div>
                  <div className="bg-[#111526] rounded-xl p-4 border border-[var(--border)] text-[#cbd5e1] leading-relaxed relative text-xs">
                    Create an NFT marketplace with royalties, advanced search,
                    and wallet integration.
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="mt-12 flex justify-between items-center px-2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#111526] border border-[var(--border)] flex items-center justify-center text-[#a78bfa]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)]">
                        Prompt
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-2 relative">
                      <div className="absolute inset-0 bg-[#7c3aed] blur-[20px] opacity-40 rounded-full"></div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] p-[1px] relative z-10 animate-spin-slow">
                        <div className="w-full h-full bg-[#0a0f1c] rounded-full flex items-center justify-center">
                          <Layers
                            className="w-5 h-5 text-white animate-spin-slow"
                            style={{ animationDirection: "reverse" }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] text-white">AgentOS</span>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#111526] border border-[var(--border)] flex items-center justify-center text-[#60a5fa]">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)]">
                        Agents
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111526] rounded-xl p-5 border border-[var(--border)] relative z-10 shadow-xl">
                  <div className="text-[10px] text-[#a78bfa] mb-4 font-mono flex items-center gap-2">
                    Generating...
                  </div>
                  <div className="space-y-3">
                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-xs ${idx < checkedStep ? "text-[var(--text-secondary)]" : idx === checkedStep ? "text-white" : "text-[var(--text-muted)]/40"}`}
                        >
                          {step}
                        </span>
                        {idx < checkedStep ? (
                          <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                        ) : idx === checkedStep ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--border)]"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
