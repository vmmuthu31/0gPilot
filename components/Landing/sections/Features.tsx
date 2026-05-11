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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -8 }}
              className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col border border-[var(--border)] hover:border-[#7c3aed]/50 transition-all duration-300 shadow-lg hover:shadow-[0_10px_40px_rgba(124,58,237,0.2)] bg-[#0a0f1c]/80 backdrop-blur-md"
            >
              {/* Subtle hover glow background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="w-14 h-14 rounded-2xl bg-[#111526] border border-[var(--border)] flex items-center justify-center mb-8 group-hover:border-[#8b5cf6]/50 group-hover:bg-[#1a1625] transition-all relative z-10 shadow-inner group-hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                {cloneElement(
                  feature.icon as ReactElement<{ className?: string }>,
                  {
                    className:
                      "w-7 h-7 text-[#a78bfa] group-hover:text-white transition-colors duration-300",
                  },
                )}
              </div>

              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#a78bfa] transition-colors relative z-10">
                {feature.title}
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 relative z-10 group-hover:text-gray-300 transition-colors">
                {feature.desc}
              </p>

              <div className="mt-8 flex justify-between items-center relative z-10">
                <span className="text-xs font-semibold text-[#7c3aed] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-4 group-hover:translate-x-0 transform">
                  Learn more
                </span>
                <div className="w-10 h-10 rounded-full bg-[#111526] border border-[var(--border)] flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors group-hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                  <ArrowRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
