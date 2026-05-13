"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  Database,
  Wand2,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const examples = [
  {
    title: "NFT Marketplace",
    desc: "Create a full NFT marketplace with royalties and advanced search.",
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    title: "Staking DApp",
    desc: "Build a staking platform with variable rewards and lock periods.",
    icon: <Database className="w-5 h-5 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/10",
  },
  {
    title: "DAO Governance",
    desc: "Create a DAO voting system with token-gated access.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "DeFi Dashboard",
    desc: "Build a DeFi analytics dashboard with real-time price feeds.",
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    color: "from-amber-500/20 to-orange-500/10",
  },
];

export const MainView = () => {
  const [prompt, setPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const urlPrompt = searchParams.get("prompt");
      return urlPrompt ? decodeURIComponent(urlPrompt) : "";
    }
    return "";
  });
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim() || prompt.length < 3) return;
    try {
      setIsEnhancing(true);
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhanced) {
          setPrompt(data.enhanced);
        }
      }
    } catch (error) {
      console.error("Failed to enhance prompt", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 mb-6"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-[12px] text-purple-300 font-medium">
            AI Web3 Builder
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Build. Deploy. Empower. <br />
          With{" "}
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AI on 0G.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-2xl text-lg leading-relaxed"
        >
          0GPilot is your autonomous AI engineer for building, deploying, and
          managing full-stack Web3 applications.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative group mb-16"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <div className="relative bg-[#0B1120] border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your dApp idea in detail..."
            className="flex-1 bg-transparent border-0 px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none"
          />

          <button
            onClick={handleEnhance}
            disabled={isEnhancing || prompt.trim().length < 3}
            className="mr-3 p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 disabled:opacity-50 transition-colors border border-white/5"
            title="Enhance Prompt with AI"
          >
            {isEnhancing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
          </button>

          <button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-all group/btn">
            Generate
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>

      <div>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
          Try these examples
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {examples.map((example, i) => (
            <motion.button
              key={example.title}
              onClick={() => setPrompt(example.desc)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-start text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${example.color} flex items-center justify-center mb-3 border border-white/5`}
              >
                {React.cloneElement(
                  example.icon as React.ReactElement<{ className?: string }>,
                  { className: "w-4 h-4" },
                )}
              </div>
              <h4 className="text-[13px] font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                {example.title}
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors line-clamp-2">
                {example.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
