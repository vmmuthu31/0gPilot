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
import { cloneElement } from "react";

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
              className="glass-card p-8 rounded-2xl group cursor-pointer relative overflow-hidden flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-[#111526] border border-[var(--border)] flex items-center justify-center mb-6 group-hover:border-[#8b5cf6]/50 transition-all">
                {cloneElement(feature.icon, {
                  className: "w-6 h-6 text-[#a78bfa]",
                })}
              </div>
              <h3 className="text-lg font-semibold mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                {feature.desc}
              </p>
              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-[#111526] border border-[var(--border)] flex items-center justify-center group-hover:bg-[#8b5cf6] transition-colors">
                  <ArrowRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
