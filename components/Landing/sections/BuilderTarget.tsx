"use client";

import React from "react";
import { motion } from "framer-motion";

import {
  TbChartLine,
  TbRocket,
  TbBrain,
  TbPhoto,
  TbTopologyStar3,
  TbStack2,
} from "react-icons/tb";

const cards = [
  {
    title: "DeFi Builders",
    desc: "Build DeFi protocols, trading bots, liquidity engines, and yield optimizers autonomously.",
    icon: <TbChartLine />,
    type: "defi",
    color: "from-fuchsia-500/20 to-purple-500/5",
    iconColor: "text-fuchsia-400",
  },

  {
    title: "NFT Creators",
    desc: "Launch NFT marketplaces, collections, launchpads, and creator tools in minutes.",
    icon: <TbPhoto />,
    type: "nft",
    color: "from-blue-500/20 to-cyan-500/5",
    iconColor: "text-blue-400",
  },

  {
    title: "Web3 Startups",
    desc: "Prototype, build, and deploy production-ready MVPs faster with autonomous AI agents.",
    icon: <TbRocket />,
    type: "startup",
    color: "from-cyan-500/20 to-blue-500/5",
    iconColor: "text-cyan-400",
  },

  {
    title: "AI Researchers",
    desc: "Build AI-native dApps with verifiable execution, decentralized memory, and agent systems.",
    icon: <TbBrain />,
    type: "ai",
    color: "from-violet-500/20 to-purple-500/5",
    iconColor: "text-violet-400",
  },
];

export default function BuilderTargetSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.10),transparent_30%)]" />

      <div
        className="
          absolute
          inset-0
          opacity-[0.04]
          bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)]
          bg-[size:42px_42px]
        "
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Built for Every Builder
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed"
          >
            OGPilot empowers developers, founders, creators, and AI teams to
            build the future of Web3 with autonomous infrastructure.
          </motion.p>
        </div>

        <div className="relative w-full overflow-hidden pb-8 pt-4">
          <div className="flex gap-7 w-max">
            <motion.div
              className="flex gap-7 w-max flex-shrink-0"
              animate={{
                x: ["0%", "calc(-100% - 28px)"],
              }}
              transition={{
                duration: 25,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {cards.map((card, i) => (
                <motion.div
                  key={`first-${i}`}
                  whileHover={{
                    y: -12,
                  }}
                  className="group w-[calc(min(100vw_-_3rem,1232px))] md:w-[calc((min(100vw_-_3rem,1232px)_-_28px)/2)] xl:w-[calc((min(100vw_-_3rem,1232px)_-_84px)/4)] flex-shrink-0"
                >
              <div
                className={`
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-white/10
                  bg-gradient-to-b
                  ${card.color}
                  backdrop-blur-2xl
                  p-7
                  h-[420px]
                  transition-all
                  duration-500
                  hover:border-purple-500/40
                  hover:shadow-[0_0_50px_rgba(139,92,246,0.18)]
                `}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_35%)]" />

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className={`
                    relative
                    z-10
                    w-16
                    h-16
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#0f172a]
                    flex
                    items-center
                    justify-center
                    text-3xl
                    mb-8
                    ${card.iconColor}
                    shadow-[0_0_25px_rgba(139,92,246,0.15)]
                  `}
                >
                  {card.icon}
                </motion.div>

                <h3 className="relative z-10 text-2xl font-bold text-white mb-5">
                  {card.title}
                </h3>

                <p className="relative z-10 text-slate-400 leading-relaxed text-[15px] mb-8">
                  {card.desc}
                </p>

                <div
                  className="
                    relative
                    z-10
                    mt-auto
                    h-[150px]
                    rounded-[24px]
                    border
                    border-white/10
                    bg-[#050816]
                    overflow-hidden
                    flex
                    items-center
                    justify-center
                  "
                >
                  {card.type === "defi" && (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.25),transparent_50%)]" />

                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 400 160"
                        fill="none"
                      >
                        {[...Array(8)].map((_, i) => (
                          <line
                            key={i}
                            x1="0"
                            y1={i * 25}
                            x2="400"
                            y2={i * 25}
                            stroke="rgba(255,255,255,0.04)"
                          />
                        ))}

                        <path
                          d="
                            M0 140
                            C40 120,60 100,90 110
                            C120 120,150 70,180 80
                            C210 90,240 40,280 55
                            C320 70,350 10,400 20
                            L400 160
                            L0 160
                            Z
                          "
                          fill="url(#paint0_linear)"
                        />

                        <motion.path
                          d="
                            M0 140
                            C40 120,60 100,90 110
                            C120 120,150 70,180 80
                            C210 90,240 40,280 55
                            C320 70,350 10,400 20
                          "
                          stroke="#c084fc"
                          strokeWidth="4"
                          strokeLinecap="round"
                          fill="none"
                          initial={{
                            pathLength: 0,
                          }}
                          whileInView={{
                            pathLength: 1,
                          }}
                          transition={{
                            duration: 2,
                          }}
                        />

                        <defs>
                          <linearGradient
                            id="paint0_linear"
                            x1="200"
                            y1="0"
                            x2="200"
                            y2="160"
                          >
                            <stop stopColor="rgba(192,132,252,0.45)" />

                            <stop offset="1" stopColor="rgba(192,132,252,0)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}

                  {card.type === "nft" && (
                    <div className="grid grid-cols-3 gap-3 p-4 w-full h-full">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <motion.div
                          key={item}
                          whileHover={{
                            scale: 1.08,
                          }}
                          className={`
                              rounded-2xl
                              border
                              border-white/10
                              bg-gradient-to-br
                              ${
                                item % 2 === 0
                                  ? "from-blue-500/20 to-cyan-500/10"
                                  : "from-purple-500/20 to-fuchsia-500/10"
                              }
                              backdrop-blur-xl
                              relative
                              overflow-hidden
                            `}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_50%)]" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <TbPhoto className="text-white/60 text-2xl" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {card.type === "startup" && (
                    <div className="w-full px-5">
                      <div className="space-y-4">
                        <motion.div
                          animate={{
                            width: ["60%", "85%", "60%"],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                          }}
                          className="
                            h-4
                            rounded-full
                            bg-gradient-to-r
                            from-purple-500
                            to-fuchsia-400
                            shadow-[0_0_20px_rgba(168,85,247,0.5)]
                          "
                        />

                        <motion.div
                          animate={{
                            width: ["35%", "70%", "35%"],
                          }}
                          transition={{
                            duration: 4,
                            delay: 0.5,
                            repeat: Infinity,
                          }}
                          className="
                            h-4
                            rounded-full
                            bg-gradient-to-r
                            from-blue-500
                            to-cyan-400
                            shadow-[0_0_20px_rgba(59,130,246,0.5)]
                          "
                        />

                        <motion.div
                          animate={{
                            width: ["80%", "100%", "80%"],
                          }}
                          transition={{
                            duration: 4,
                            delay: 1,
                            repeat: Infinity,
                          }}
                          className="
                            h-4
                            rounded-full
                            bg-gradient-to-r
                            from-cyan-500
                            to-sky-400
                            shadow-[0_0_20px_rgba(6,182,212,0.5)]
                          "
                        />
                      </div>

                      <div className="absolute bottom-5 right-5 w-16 h-16 rounded-2xl border border-white/10 bg-[#0f172a] flex items-center justify-center">
                        <TbStack2 className="text-3xl text-blue-400" />
                      </div>
                    </div>
                  )}

                  {card.type === "ai" && (
                    <div className="absolute inset-0">
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 400 160"
                      >
                        <motion.path
                          d="M40 120 L120 70 L210 100 L300 50 L360 90"
                          stroke="#8b5cf6"
                          strokeWidth="2"
                          fill="none"
                          initial={{
                            pathLength: 0,
                          }}
                          whileInView={{
                            pathLength: 1,
                          }}
                          transition={{
                            duration: 2,
                          }}
                        />

                        <motion.path
                          d="M120 70 L180 30 L260 60 L340 20"
                          stroke="#3b82f6"
                          strokeWidth="2"
                          fill="none"
                          initial={{
                            pathLength: 0,
                          }}
                          whileInView={{
                            pathLength: 1,
                          }}
                          transition={{
                            duration: 2,
                            delay: 0.3,
                          }}
                        />
                        {[
                          [40, 120],
                          [120, 70],
                          [210, 100],
                          [300, 50],
                          [360, 90],
                          [180, 30],
                          [260, 60],
                          [340, 20],
                        ].map((node, i) => (
                          <motion.circle
                            key={i}
                            cx={node[0]}
                            cy={node[1]}
                            r="6"
                            fill={i % 2 === 0 ? "#8b5cf6" : "#3b82f6"}
                            animate={{
                              scale: [1, 1.4, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl flex items-center justify-center">
                          <TbTopologyStar3 className="text-3xl text-violet-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex gap-7 w-max flex-shrink-0"
              animate={{
                x: ["0%", "calc(-100% - 28px)"],
              }}
              transition={{
                duration: 25,
                ease: "linear",
                repeat: Infinity,
              }}
              aria-hidden="true"
            >
              {cards.map((card, i) => (
                <motion.div
                  key={`second-${i}`}
                  whileHover={{
                    y: -12,
                  }}
                  className="group w-[calc(min(100vw_-_3rem,1232px))] md:w-[calc((min(100vw_-_3rem,1232px)_-_28px)/2)] xl:w-[calc((min(100vw_-_3rem,1232px)_-_84px)/4)] flex-shrink-0"
                >
                  <div
                    className={`
                      relative
                      overflow-hidden
                      rounded-[34px]
                      border
                      border-white/10
                      bg-gradient-to-b
                      ${card.color}
                      backdrop-blur-2xl
                      p-7
                      h-[420px]
                      transition-all
                      duration-500
                      hover:border-purple-500/40
                      hover:shadow-[0_0_50px_rgba(139,92,246,0.18)]
                    `}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_35%)]" />

                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className={`
                        relative z-10 w-16 h-16 rounded-2xl border border-white/10 bg-[#0f172a] flex items-center justify-center text-3xl mb-8 ${card.iconColor} shadow-[0_0_25px_rgba(139,92,246,0.15)]
                      `}
                    >
                      {card.icon}
                    </motion.div>

                    <h3 className="relative z-10 text-2xl font-bold text-white mb-5">
                      {card.title}
                    </h3>

                    <p className="relative z-10 text-slate-400 leading-relaxed text-[15px] mb-8">
                      {card.desc}
                    </p>

                    <div className="relative z-10 mt-auto h-[150px] rounded-[24px] border border-white/10 bg-[#050816] overflow-hidden flex items-center justify-center">
                      {/* Graphics are decorative, so simple placeholder rendering for duplicate visually if needed, but since it's just the exact same render: */}
                      {card.type === "defi" && (
                        <div className="absolute inset-0">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.25),transparent_50%)]" />
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" fill="none">
                            {[...Array(8)].map((_, j) => (
                              <line key={j} x1="0" y1={j * 25} x2="400" y2={j * 25} stroke="rgba(255,255,255,0.04)" />
                            ))}
                            <path d="M0 140 C40 120,60 100,90 110 C120 120,150 70,180 80 C210 90,240 40,280 55 C320 70,350 10,400 20 L400 160 L0 160 Z" fill="url(#paint0_linear)" />
                            <motion.path d="M0 140 C40 120,60 100,90 110 C120 120,150 70,180 80 C210 90,240 40,280 55 C320 70,350 10,400 20" stroke="#c084fc" strokeWidth="4" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2 }} />
                            <defs>
                              <linearGradient id="paint0_linear" x1="200" y1="0" x2="200" y2="160">
                                <stop stopColor="rgba(192,132,252,0.45)" />
                                <stop offset="1" stopColor="rgba(192,132,252,0)" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      )}

                      {card.type === "nft" && (
                        <div className="grid grid-cols-3 gap-3 p-4 w-full h-full">
                          {[1, 2, 3, 4, 5, 6].map((item) => (
                            <motion.div key={item} whileHover={{ scale: 1.08 }} className={`rounded-2xl border border-white/10 bg-gradient-to-br ${item % 2 === 0 ? "from-blue-500/20 to-cyan-500/10" : "from-purple-500/20 to-fuchsia-500/10"} backdrop-blur-xl relative overflow-hidden`}>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <TbPhoto className="text-white/60 text-2xl" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {card.type === "startup" && (
                        <div className="w-full px-5">
                          <div className="space-y-4">
                            <motion.div animate={{ width: ["60%", "85%", "60%"] }} transition={{ duration: 4, repeat: Infinity }} className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
                            <motion.div animate={{ width: ["35%", "70%", "35%"] }} transition={{ duration: 4, delay: 0.5, repeat: Infinity }} className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                            <motion.div animate={{ width: ["80%", "100%", "80%"] }} transition={{ duration: 4, delay: 1, repeat: Infinity }} className="h-4 rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                          </div>
                          <div className="absolute bottom-5 right-5 w-16 h-16 rounded-2xl border border-white/10 bg-[#0f172a] flex items-center justify-center">
                            <TbStack2 className="text-3xl text-blue-400" />
                          </div>
                        </div>
                      )}

                      {card.type === "ai" && (
                        <div className="absolute inset-0">
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160">
                            <motion.path d="M40 120 L120 70 L210 100 L300 50 L360 90" stroke="#8b5cf6" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2 }} />
                            <motion.path d="M120 70 L180 30 L260 60 L340 20" stroke="#3b82f6" strokeWidth="2" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.3 }} />
                            {[[40, 120], [120, 70], [210, 100], [300, 50], [360, 90], [180, 30], [260, 60], [340, 20]].map((node, j) => (
                              <motion.circle key={j} cx={node[0]} cy={node[1]} r="6" fill={j % 2 === 0 ? "#8b5cf6" : "#3b82f6"} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, delay: j * 0.15 }} />
                            ))}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-2xl border border-white/10 bg-[#0f172a]/90 backdrop-blur-xl flex items-center justify-center">
                              <TbTopologyStar3 className="text-3xl text-violet-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
