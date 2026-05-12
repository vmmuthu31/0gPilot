import { fadeInUp, staggerContainer } from "@/lib/motion";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Code,
  Cpu,
  Database,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { cloneElement, type ReactElement } from "react";

export const Features = () => {
  const features = [
    {
      icon: <MessageSquare />,
      title: "AI DApp Generation",
      desc: "Generate full-stack dApps from natural language prompts.",
    },
    {
      icon: <Code />,
      title: "Smart Contract Studio",
      desc: "Write, test, and audit secure smart contracts with AI.",
    },
    {
      icon: <Cpu />,
      title: "Multi-Agent System",
      desc: "Specialized AI agents work together autonomously.",
    },
    {
      icon: <Zap />,
      title: "Autonomous Deployment",
      desc: "Deploy contracts and apps to OG Chain with one click.",
    },
    {
      icon: <Database />,
      title: "Persistent Memory",
      desc: "Store project memory and state on OG Storage.",
    },
    {
      icon: <Shield />,
      title: "AI Security Auditor",
      desc: "Detect vulnerabilities and optimize your contracts.",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden z-10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Everything You Need to Build in Web3
          </h2>
          <p className="text-[var(--text-secondary)]">
            A complete AI-native development environment powered by
            decentralized infrastructure.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ 
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="glass-card p-4 rounded-xl group cursor-pointer relative overflow-hidden flex flex-col border border-white/10 border-t-white/20 hover:border-purple-400/50 transition-all duration-300 bg-white/[0.02] backdrop-blur-[4px] h-[220px]"
            >
              {/* Dynamic Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-blue-500/0 group-hover:from-purple-500/15 group-hover:to-blue-500/15 transition-colors duration-500" />
              
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center mb-4 group-hover:border-purple-400/60 group-hover:bg-purple-500/20 transition-all duration-300 relative z-10 shadow-[0_0_15px_rgba(147,51,234,0.1)] group-hover:shadow-[0_0_25px_rgba(147,51,234,0.35)]">
                {cloneElement(
                  feature.icon as ReactElement<{ className?: string }>,
                  {
                    className:
                      "w-5 h-5 text-purple-400 group-hover:text-white transition-colors duration-300",
                  },
                )}
              </div>

              <h3 className="text-[15px] font-bold mb-1.5 text-white group-hover:text-purple-300 transition-colors relative z-10 line-clamp-1">
                {feature.title}
              </h3>

              <p className="text-[11.5px] text-slate-200 leading-snug flex-1 relative z-10 group-hover:text-white transition-colors duration-300 line-clamp-3">
                {feature.desc}
              </p>

              <div className="mt-3 flex justify-between items-center relative z-10 pt-3 border-t border-white/10">
                <span className="text-[9px] font-bold text-purple-400/0 group-hover:text-purple-300 transition-all duration-300 uppercase tracking-widest">
                  Deploy Now
                </span>
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(147,51,234,0.2)]">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
