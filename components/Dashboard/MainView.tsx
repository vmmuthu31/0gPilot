"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  Database,
  Wand2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const examples = [
  {
    title: "NFT Marketplace",
    desc: "Create a full NFT marketplace with royalties, listings, and advanced search on 0G Chain.",
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    title: "Staking DApp",
    desc: "Build a staking platform with variable APY rewards, lock periods, and real-time dashboards.",
    icon: <Database className="w-5 h-5 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/10",
  },
  {
    title: "DAO Governance",
    desc: "Create a DAO voting system with token-gated access, proposal lifecycle, and on-chain execution.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "DeFi Dashboard",
    desc: "Build a DeFi analytics dashboard with real-time price feeds, portfolio tracking, and swap UI.",
    icon: <Zap className="w-5 h-5 text-amber-400" />,
    color: "from-amber-500/20 to-orange-500/10",
  },
];

type GenerationPhase = "idle" | "enhancing" | "generating" | "error";

export const MainView = () => {
  const router = useRouter();
  const [prompt, setPrompt] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("prompt");
      return p ? decodeURIComponent(p) : "";
    }
    return "";
  });
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const jwt =
    typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;

  const handleEnhance = async () => {
    if (!prompt.trim() || prompt.length < 3) return;
    setPhase("enhancing");
    try {
      const res = await fetch("/api/prompt/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhanced) setPrompt(data.enhanced);
      }
    } catch {
      // non-blocking
    } finally {
      setPhase("idle");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) return;
    setError(null);
    setPhase("generating");

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.projectId) {
        const msg =
          data?.error?.message ??
          data?.error?.code ??
          "Failed to start generation";
        setError(msg);
        setPhase("error");
        return;
      }

      router.push(`/dashboard/projects/${data.projectId}`);
    } catch {
      setError("Network error — check your connection and try again");
      setPhase("error");
    }
  };

  const isWorking = phase === "generating" || phase === "enhancing";

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
            Autonomous AI Cloud IDE for Web3
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
          Describe your dApp. 0GPilot generates, previews, and deploys it live
          — powered by autonomous AI agents on the 0G ecosystem.
        </motion.p>
      </div>

      {/* Prompt bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative group mb-6"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
        <div className="relative bg-[#0B1120] border border-white/10 rounded-2xl p-2 flex items-start shadow-2xl">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (phase === "error") setPhase("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleGenerate();
              }
            }}
            placeholder="Describe your dApp idea in detail — e.g. 'Build an NFT marketplace with royalties on 0G Chain using Next.js and Wagmi'"
            rows={3}
            className="flex-1 bg-transparent border-0 px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex flex-col gap-2 mr-2 mt-2 shrink-0">
            <button
              onClick={handleEnhance}
              disabled={isWorking || prompt.trim().length < 3}
              className="p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-400 disabled:opacity-40 transition-colors border border-white/5"
              title="Enhance prompt with AI (makes it more detailed)"
            >
              {phase === "enhancing" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Wand2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleGenerate}
              disabled={isWorking || prompt.trim().length < 10}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all group/btn whitespace-nowrap"
            >
              {phase === "generating" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  Generate
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-[11px] text-slate-600">
            ⌘ + Enter to generate
          </span>
          <span
            className={`text-[11px] font-mono transition-colors ${
              prompt.length > 1800
                ? "text-red-400"
                : prompt.length > 1200
                ? "text-amber-400"
                : "text-slate-600"
            }`}
          >
            {prompt.length} / 2000
          </span>
        </div>
      </motion.div>

      {/* Error display */}
      <AnimatePresence>
        {phase === "error" && error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-8"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Generation failed</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
              {error.includes("INSUFFICIENT_CREDITS") && (
                <a
                  href="/pricing"
                  className="text-purple-400 hover:underline text-xs mt-1 inline-block"
                >
                  Upgrade your plan →
                </a>
              )}
              {(error.includes("GITHUB_NOT_CONNECTED") ||
                error.includes("VERCEL_NOT_CONNECTED")) && (
                <a
                  href="/dashboard/integrations"
                  className="text-purple-400 hover:underline text-xs mt-1 inline-block"
                >
                  Connect integrations →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example templates */}
      <div className="mb-16">
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
                  { className: "w-4 h-4" }
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

      {/* Pipeline indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center justify-center gap-3 text-[11px] text-slate-600"
      >
        {[
          "Prompt",
          "AI Agents",
          "Code Generation",
          "WebContainer",
          "Live Preview",
          "Deploy",
        ].map((step, i, arr) => (
          <React.Fragment key={step}>
            <span className="hover:text-slate-400 transition-colors">
              {step}
            </span>
            {i < arr.length - 1 && (
              <ArrowRight className="w-3 h-3 shrink-0 text-slate-700" />
            )}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};
