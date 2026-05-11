"use client";

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

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { Button } from "@/components/ui/button";

const createParticleValue = (index: number, offset: number, max: number) => {
  const value = Math.sin(index * 12.9898 + offset) * 43758.5453;
  return (value - Math.floor(value)) * max;
};

const agents = [
  {
    name: "Planner",
    icon: <FileText className="w-5 h-5" />,
    color: "text-purple-400",
  },
  {
    name: "Contract",
    icon: <Code className="w-5 h-5" />,
    color: "text-blue-400",
  },
  {
    name: "Frontend",
    icon: <Globe className="w-5 h-5" />,
    color: "text-cyan-400",
  },
  {
    name: "Backend",
    icon: <Server className="w-5 h-5" />,
    color: "text-yellow-400",
  },
  {
    name: "Audit",
    icon: <Shield className="w-5 h-5" />,
    color: "text-red-400",
  },
  {
    name: "Deploy",
    icon: <Zap className="w-5 h-5" />,
    color: "text-green-400",
  },
  {
    name: "Memory",
    icon: <Database className="w-5 h-5" />,
    color: "text-pink-400",
  },
];

const infra = [
  {
    title: "0G Compute",
    sub: "AI Inference",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "0G Storage",
    sub: "Persistent Memory",
    icon: <Database className="w-5 h-5 text-blue-400" />,
  },
  {
    title: "0G Chain",
    sub: "Deployment",
    icon: <Layers className="w-5 h-5 text-cyan-400" />,
  },
];

export const Architecture = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = [...Array(30)].map((_, i) => ({
    id: i,
    x: createParticleValue(i, 1, 1600),
    y: createParticleValue(i, 2, 900),
    duration: 4 + createParticleValue(i, 3, 5),
  }));

  return (
    <section id="architecture" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_25%)]" />
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="absolute inset-0 overflow-hidden">
        {mounted &&
          particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full bg-purple-400/40"
              initial={{
                x: particle.x,
                y: particle.y,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
              }}
            />
          ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />

              <span className="text-sm text-purple-300">
                Powered by 0G Infrastructure
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Built on{" "}
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                0G
              </span>
              <br />
              Modular Architecture
            </h2>

            <p className="text-slate-400 leading-relaxed mb-8 text-lg">
              OGPilot leverages decentralized AI infrastructure to deliver
              scalable, autonomous, and verifiable Web3 application development.
            </p>

            <ul className="space-y-5 mb-10">
              {[
                "Decentralized Compute for AI Inference",
                "Persistent Long-Term Memory",
                "High-Performance Deployment Layer",
                "OpenClaw Agent Orchestration",
                "Agent ID for Persistent Identity",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                  </div>

                  <span className="text-slate-300">{item}</span>
                </motion.li>
              ))}
            </ul>

            <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white border-0 shadow-[0_0_30px_rgba(124,58,237,0.35)]">
              Explore Architecture
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="lg:col-span-8">
            <Tilt
              glareEnable
              glareMaxOpacity={0.12}
              scale={1.01}
              tiltMaxAngleX={4}
              tiltMaxAngleY={4}
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/90 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(124,58,237,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />

                <div className="relative z-20 flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mb-16 relative"
                  >
                    <div className="px-8 py-3 rounded-2xl border border-purple-500/30 bg-[#111827]/80 backdrop-blur-xl text-white font-semibold shadow-[0_0_30px_rgba(124,58,237,0.25)]">
                      User
                    </div>

                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-[2px] h-16 bg-gradient-to-b from-purple-500 to-blue-500">
                      <motion.div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_15px_#7c3aed]"
                        animate={{
                          y: [0, 50, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(124,58,237,0.2)",
                        "0 0 50px rgba(124,58,237,0.6)",
                        "0 0 20px rgba(124,58,237,0.2)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    className="relative mb-28 overflow-hidden rounded-2xl border border-purple-500/40 bg-[#111526]/90 px-10 py-5 backdrop-blur-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse" />

                    <div className="relative z-10 flex items-center gap-3 text-white font-bold text-lg">
                      <Layers className="w-5 h-5 text-purple-400" />
                      OGPilot AI Orchestrator
                    </div>
                  </motion.div>

                  <div className="relative w-full mb-28">
                    <div className="absolute top-[40px] left-[7%] right-[7%] h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_15px_#7c3aed]"
                          animate={{
                            x: ["0%", "1000%"],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: i,
                            ease: "linear",
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative z-20 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-5">
                      {agents.map((agent, i) => (
                        <div
                          key={i}
                          className="relative flex flex-col items-center"
                        >
                          <div className="absolute top-[-42px] w-[2px] h-[42px] bg-gradient-to-b from-blue-500 to-purple-500">
                            <motion.div
                              className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#06b6d4]"
                              animate={{
                                y: [0, 30, 0],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          </div>

                          <motion.div
                            whileHover={{
                              scale: 1.08,
                              y: -8,
                            }}
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 3 + i * 0.2,
                              repeat: Infinity,
                            }}
                            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl p-5 text-center hover:border-purple-500/40 transition-all cursor-pointer w-full"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity" />

                            <motion.div
                              className="absolute inset-0 rounded-2xl"
                              animate={{
                                boxShadow: [
                                  "0 0 0px rgba(124,58,237,0)",
                                  "0 0 25px rgba(124,58,237,0.35)",
                                  "0 0 0px rgba(124,58,237,0)",
                                ],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />

                            <div
                              className={`relative z-10 flex justify-center mb-3 ${agent.color}`}
                            >
                              {agent.icon}
                            </div>

                            <div className="relative z-10 text-sm text-white font-semibold">
                              {agent.name}
                            </div>

                            <div className="relative z-10 text-[11px] text-slate-400">
                              Agent
                            </div>
                          </motion.div>

                          <div className="absolute bottom-[-55px] w-[2px] h-[55px] bg-gradient-to-b from-purple-500 to-cyan-500">
                            <motion.div
                              className="absolute bottom-0 left-1/2 -translate-x-1/2"
                              animate={{
                                y: [0, 10, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                            >
                              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent border-t-cyan-400" />
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5 w-full mb-10">
                    {infra.map((item, i) => (
                      <motion.div
                        key={i}
                        whileHover={{
                          scale: 1.04,
                        }}
                        className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6 backdrop-blur-xl hover:border-purple-500/40 transition-all"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex items-center gap-3 mb-2">
                          {item.icon}

                          <div className="text-white font-semibold">
                            {item.title}
                          </div>
                        </div>

                        <div className="relative z-10 text-sm text-slate-400">
                          {item.sub}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{
                      scale: 1.02,
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-[#111827]/70 backdrop-blur-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 text-white">
                      <Terminal className="w-5 h-5 text-blue-400" />

                      <span className="font-medium">
                        OpenClaw Orchestration
                      </span>
                    </div>

                    <div className="w-px h-6 bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-3 text-white">
                      <Shield className="w-5 h-5 text-cyan-400" />

                      <span className="font-medium">
                        Agent ID Identity Layer
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>
    </section>
  );
};
