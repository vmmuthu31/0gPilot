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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="min-w-[280px] md:min-w-[320px] flex-1 snap-center cursor-pointer group"
            >
              <div className="glass-card rounded-2xl p-6 h-[300px] border border-[var(--border)] hover:border-[#8b5cf6]/60 transition-all duration-300 flex flex-col relative overflow-hidden bg-[#0a0f1c]/80 shadow-lg hover:shadow-[0_15px_40px_rgba(124,58,237,0.15)]">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#111526] border border-[#7c3aed]/30 flex items-center justify-center text-[#a78bfa] group-hover:text-white group-hover:bg-[#7c3aed] transition-all duration-300 shadow-inner">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-white text-lg group-hover:text-[#a78bfa] transition-colors">{card.title}</h3>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1 leading-relaxed relative z-10 group-hover:text-gray-300 transition-colors">
                  {card.desc}
                </p>

                <div className="h-28 mt-auto rounded-xl bg-[#050816] border border-[var(--border)] flex items-end overflow-hidden p-2 relative opacity-70 group-hover:opacity-100 group-hover:border-[#7c3aed]/40 transition-all duration-500 shadow-inner group-hover:shadow-[inset_0_0_20px_rgba(124,58,237,0.1)]">
                  {card.chart === "line" && (
                    <div className="w-full h-full relative">
                      <svg
                        className="absolute bottom-0 w-full h-[120%] text-[#a78bfa] drop-shadow-[0_0_8px_rgba(167,139,250,0.8)] group-hover:text-[#c4b5fd] transition-colors duration-300"
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
                          fill="url(#gradient-line)"
                          stroke="none"
                        />
                      </svg>
                      <defs>
                        <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(124, 58, 237, 0.4)" />
                          <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
                        </linearGradient>
                      </defs>
                    </div>
                  )}
                  {card.chart === "blocks" && (
                    <div className="w-full flex gap-1.5 items-end h-full px-2">
                      {[40, 70, 30, 90, 50, 80].map((h, j) => (
                        <div
                          key={j}
                          className="flex-1 rounded-t-sm transition-all duration-700 group-hover:bg-[#8b5cf6]"
                          style={{ height: `${h}%`, backgroundColor: j % 2 === 0 ? '#3b82f6' : '#60a5fa', opacity: 0.8 }}
                        ></div>
                      ))}
                    </div>
                  )}
                  {card.chart === "bar" && (
                    <div className="w-full flex flex-col justify-center gap-3 h-full px-4 relative z-10">
                      <div className="w-[85%] h-2.5 bg-gradient-to-r from-[#7c3aed] to-[#c084fc] rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)] group-hover:w-[95%] transition-all duration-700"></div>
                      <div className="w-[50%] h-2.5 bg-gradient-to-r from-[#3b82f6] to-[#93c5fd] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:w-[60%] transition-all duration-700 delay-100"></div>
                      <div className="w-full h-2.5 bg-[#111526] border border-[var(--border)] rounded-full overflow-hidden">
                         <div className="w-[30%] h-full bg-[#475569] opacity-50"></div>
                      </div>
                    </div>
                  )}
                  {card.chart === "nodes" && (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#7c3aed] absolute top-2 left-6 shadow-[0_0_15px_#7c3aed] group-hover:scale-125 transition-transform duration-500 animate-pulse"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] absolute bottom-4 right-8 shadow-[0_0_15px_#3b82f6] group-hover:scale-125 transition-transform duration-500 delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-[#06b6d4] absolute top-6 right-4 shadow-[0_0_10px_#06b6d4] group-hover:scale-125 transition-transform duration-500 delay-200"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-3 left-10 shadow-[0_0_10px_white]"></div>
                      <svg
                        className="absolute inset-0 w-full h-full -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"
                        stroke="rgba(124,58,237,0.3)"
                        strokeWidth="1.5"
                      >
                        <line x1="25%" y1="20%" x2="80%" y2="70%" />
                        <line x1="80%" y1="25%" x2="30%" y2="80%" />
                        <line x1="25%" y1="20%" x2="30%" y2="80%" />
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
