import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fadeInUp } from "@/lib/motion";

export const BuilderTarget = () => {
  const cards = [
    {
      title: "DeFi Builders",
      desc: "Build DeFi protocols, trading bots, and yield optimizers autonomously.",
      icon: <Activity className="w-5 h-5" />,
      chart: "line",
    },
    {
      title: "NFT Creators",
      desc: "Launch NFT marketplaces, collections, and tools in minutes.",
      icon: <Star className="w-5 h-5" />,
      chart: "blocks",
    },
    {
      title: "Web3 Startups",
      desc: "Prototype, build, and deploy MVPs faster than ever with AI agents.",
      icon: <Zap className="w-5 h-5" />,
      chart: "bar",
    },
    {
      title: "AI Researchers",
      desc: "Build AI-native dApps with verifiable execution and decentralized memory.",
      icon: <Cpu className="w-5 h-5" />,
      chart: "nodes",
    },
  ];

  return (
    <section
      id="use-cases"
      className="py-24 bg-gradient-to-b from-transparent to-[#0a0f1c] border-t border-[var(--border)] relative z-10"
    >
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Built for Every Builder
          </h2>
          <p className="text-[var(--text-secondary)]">
            OGPilot empowers developers, founders, and teams to build the future
            of Web3.
          </p>
        </motion.div>

        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#111526] border border-[var(--border)] hidden md:flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-[#8b5cf6] z-20">
          <ChevronLeft className="w-5 h-5" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#111526] border border-[var(--border)] hidden md:flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-[#8b5cf6] z-20">
          <ChevronRight className="w-5 h-5" />
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar md:px-8">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[280px] md:min-w-[300px] flex-1 snap-center"
            >
              <div className="glass-card rounded-2xl p-6 h-[280px] border border-[var(--border)] hover:border-[#8b5cf6]/50 transition-colors flex flex-col relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#111526] border border-[var(--border)] flex items-center justify-center text-[#a78bfa]">
                    {card.icon}
                  </div>
                  <h3 className="font-semibold text-white">{card.title}</h3>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 leading-relaxed">
                  {card.desc}
                </p>

                <div className="h-24 mt-auto rounded-xl bg-[#0a0f1c] border border-[var(--border)] flex items-end overflow-hidden p-2 relative opacity-60 group-hover:opacity-100 transition-opacity">
                  {card.chart === "line" && (
                    <svg
                      className="w-full h-full text-[#7c3aed]"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M0 40 Q 10 20 20 30 T 40 10 T 60 20 T 80 5 T 100 15"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 40 Q 10 20 20 30 T 40 10 T 60 20 T 80 5 T 100 15 L 100 40 L 0 40 Z"
                        fill="rgba(124, 58, 237, 0.2)"
                        stroke="none"
                      />
                    </svg>
                  )}
                  {card.chart === "blocks" && (
                    <div className="w-full flex gap-1.5 items-end h-full px-2">
                      {[40, 70, 30, 90, 50, 80].map((h, j) => (
                        <div
                          key={j}
                          className="flex-1 bg-[#3b82f6]/80 rounded-t-sm"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  )}
                  {card.chart === "bar" && (
                    <div className="w-full flex flex-col justify-center gap-3 h-full px-4">
                      <div className="w-[80%] h-2 bg-[#7c3aed] rounded-full"></div>
                      <div className="w-[50%] h-2 bg-[#3b82f6] rounded-full"></div>
                      <div className="w-full h-2 bg-[#111526] border border-[var(--border)] rounded-full"></div>
                    </div>
                  )}
                  {card.chart === "nodes" && (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#7c3aed] absolute top-2 left-6 shadow-[0_0_10px_#7c3aed]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#3b82f6] absolute bottom-4 right-8 shadow-[0_0_10px_#3b82f6]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-6 right-4 shadow-[0_0_10px_white]"></div>
                      <svg
                        className="absolute inset-0 w-full h-full -z-10"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      >
                        <line x1="20%" y1="20%" x2="80%" y2="80%" />
                        <line x1="80%" y1="20%" x2="20%" y2="80%" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
