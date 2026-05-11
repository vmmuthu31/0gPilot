import {
  ArrowRight,
  CheckCircle,
  Code,
  Cpu,
  Database,
  FileText,
  Globe,
  Layers,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { cloneElement } from "react";

export const Architecture = () => {
  return (
    <section id="architecture" className="py-24 relative overflow-hidden z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-[#7c3aed]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-4"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
              Built on <span className="text-[#a78bfa]">OG</span>
              <br />
              Modular Architecture
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 leading-relaxed text-sm">
              OGPilot leverages OG&apos;s decentralized infrastructure to
              deliver scalable, secure, and autonomous AI-powered development.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Decentralized Compute for AI Inference",
                "Massive Storage for Long-Term Memory",
                "High-Performance Chain for Deployment",
                "OpenClaw for Agent Orchestration",
                "Agent ID for Persistent Identity",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-[var(--text-secondary)]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#7c3aed]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-3 h-3 text-[#a78bfa]" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="secondary" className="text-sm">
              Explore Architecture <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8 relative group"
          >
            {/* Interactive Glow effect behind the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/0 via-[#7c3aed]/10 to-[#3b82f6]/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-card rounded-2xl p-6 border border-[var(--border)] bg-[#0a0f1c]/80 relative overflow-hidden group-hover:border-[#7c3aed]/50 transition-colors duration-500 shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/10 blur-[80px] rounded-full group-hover:bg-[#7c3aed]/20 transition-colors duration-700"></div>
              
              <div className="flex flex-col items-center gap-6 font-mono text-[10px] sm:text-xs relative z-10">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex justify-center w-full relative z-10 cursor-pointer"
                >
                  <div className="bg-[#111526] border border-[#7c3aed]/30 rounded-full px-6 py-2.5 flex items-center gap-2 text-white shadow-lg group-hover:shadow-[0_0_15px_rgba(124,58,237,0.4)] transition-all">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse"></div>{" "}
                    User
                  </div>
                </motion.div>

                <div className="absolute top-[40px] left-1/2 w-[2px] h-[30px] bg-gradient-to-b from-[#7c3aed] to-[#3b82f6] -translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <motion.div 
                  whileHover={{ y: -5 }}
                  className="w-full max-w-md relative z-10 mt-2 cursor-pointer"
                >
                  <div className="bg-[#111526] border border-[#7c3aed]/50 rounded-xl p-3 text-center text-white font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.2)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all group-hover:bg-[#1a1625]">
                    <Layers className="w-4 h-4 text-[#a78bfa] group-hover:text-white transition-colors" /> OGPilot AI
                    Orchestrator
                  </div>
                </motion.div>

                <div className="relative w-full h-[30px] -mt-6 z-0">
                  <div className="absolute top-0 left-1/2 w-[2px] h-[15px] bg-gradient-to-b from-[#3b82f6] to-[var(--border)] -translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-[15px] left-[7%] right-[7%] h-[2px] bg-[var(--border)] group-hover:bg-[#7c3aed]/30 transition-colors"></div>
                  {[7, 21.3, 35.6, 50, 64.3, 78.6, 93].map((leftPos, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: 15 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="absolute top-[15px] w-[2px] bg-gradient-to-b from-[var(--border)] to-transparent group-hover:from-[#7c3aed]/50"
                      style={{ left: `${leftPos}%` }}
                    ></motion.div>
                  ))}
                </div>

                <div className="w-full flex justify-between px-1 relative z-10 -mt-2">
                  {[
                    {
                      name: "Planner",
                      color: "text-purple-400",
                      icon: <FileText />,
                    },
                    {
                      name: "Contract",
                      color: "text-blue-400",
                      icon: <Code />,
                    },
                    {
                      name: "Frontend",
                      color: "text-green-400",
                      icon: <Globe />,
                    },
                    {
                      name: "Backend",
                      color: "text-yellow-400",
                      icon: <Server />,
                    },
                    { name: "Audit", color: "text-red-400", icon: <Shield /> },
                    { name: "Deploy", color: "text-cyan-400", icon: <Zap /> },
                    {
                      name: "Memory",
                      color: "text-pink-400",
                      icon: <Database />,
                    },
                  ].map((agent, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, y: -5 }}
                      className="bg-[#111526] border border-[var(--border)] rounded-lg p-2 md:p-3 flex flex-col items-center justify-center text-center w-[12%] hover:border-[var(--primary)]/50 hover:bg-[#1a1625] transition-all cursor-pointer group/agent hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                    >
                      <div
                        className={`${agent.color} mb-1 text-sm md:text-base group-hover/agent:animate-bounce`}
                      >
                        {agent.icon}
                      </div>
                      <span className="text-[var(--text-secondary)] opacity-90 text-[8px] md:text-[10px] leading-tight group-hover/agent:text-white transition-colors">
                        {agent.name}
                        <br />
                        Agent
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="relative w-full h-[30px] -mt-6 z-0">
                  <div className="absolute top-0 left-[21.3%] w-[2px] h-[30px] bg-[var(--border)] group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-[#7c3aed]/50 transition-colors"></div>
                  <div className="absolute top-0 left-[50%] w-[2px] h-[30px] bg-[var(--border)] group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-[#3b82f6]/50 transition-colors"></div>
                  <div className="absolute top-0 left-[78.6%] w-[2px] h-[30px] bg-[var(--border)] group-hover:bg-gradient-to-b group-hover:from-transparent group-hover:to-[#06b6d4]/50 transition-colors"></div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full -mt-2">
                  {[
                    {
                      title: "OG Compute",
                      sub: "(AI Inference)",
                      icon: <Cpu />,
                      hoverBorder: "hover:border-purple-500/50",
                    },
                    {
                      title: "OG Storage",
                      sub: "(Persistent Memory)",
                      icon: <Database />,
                      hoverBorder: "hover:border-blue-500/50",
                    },
                    {
                      title: "OG Chain",
                      sub: "(Deployment)",
                      icon: <Layers />,
                      hoverBorder: "hover:border-cyan-500/50",
                    },
                  ].map((infra, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      className={`bg-[#0a0f1c] border border-[var(--border)] rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-inner ${infra.hoverBorder} transition-all cursor-pointer hover:bg-[#111526] hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-[#a78bfa]">{infra.icon}</div>
                        <span className="font-semibold text-white text-xs">
                          {infra.title}
                        </span>
                      </div>
                      <span className="text-[var(--text-muted)] text-[9px]">
                        {infra.sub}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex justify-around w-full mt-2 bg-[#111526] border border-[var(--border)] rounded-xl p-3 hover:border-[#7c3aed]/50 transition-all shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold text-xs hover:text-white transition-colors">
                    <Terminal className="text-[#3b82f6]" /> OpenClaw{" "}
                    <span className="text-[9px] text-[var(--text-muted)] font-normal">
                      (Orchestration)
                    </span>
                  </div>
                  <div className="w-px h-full bg-[var(--border)]"></div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] font-semibold text-xs hover:text-white transition-colors">
                    <Shield className="text-[#06b6d4]" /> Agent ID{" "}
                    <span className="text-[9px] text-[var(--text-muted)] font-normal">
                      (Identity)
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
