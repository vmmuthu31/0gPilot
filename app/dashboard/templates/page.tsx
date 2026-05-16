"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import {
  Globe,
  Database,
  ShieldCheck,
  Zap,
  Coins,
  Image as ImageIcon,
  Vote,
  BarChart3,
  Wallet,
  FileCode2,
  ArrowRight,
  Search,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/client/auth/AuthProvider";

type TemplateCategory = "all" | "defi" | "nft" | "dao" | "infrastructure" | "tooling";

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: TemplateCategory;
  icon: React.ReactNode;
  gradient: string;
  tags: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const templates: Template[] = [
  {
    id: "nft-marketplace",
    title: "NFT Marketplace",
    description: "Full-featured NFT marketplace with minting, listings, auctions, royalties, and advanced search on 0G Chain.",
    prompt: "Build a full NFT marketplace with royalties, listings, auctions, and advanced search on 0G Chain using Next.js and Wagmi",
    category: "nft",
    icon: <ImageIcon className="w-5 h-5" />,
    gradient: "from-pink-500 to-rose-500",
    tags: ["ERC-721", "Auctions", "Royalties"],
    difficulty: "Advanced",
  },
  {
    id: "staking-dapp",
    title: "Staking DApp",
    description: "Staking platform with variable APY rewards, lock periods, auto-compounding, and real-time analytics dashboards.",
    prompt: "Build a staking platform with variable APY rewards, lock periods, and real-time dashboards on 0G Chain",
    category: "defi",
    icon: <Database className="w-5 h-5" />,
    gradient: "from-purple-500 to-indigo-500",
    tags: ["Staking", "APY", "Rewards"],
    difficulty: "Intermediate",
  },
  {
    id: "dao-governance",
    title: "DAO Governance",
    description: "Decentralized governance system with token-gated proposals, weighted voting, quorum rules, and on-chain execution.",
    prompt: "Create a DAO voting system with token-gated access, proposal lifecycle, and on-chain execution on 0G Chain",
    category: "dao",
    icon: <Vote className="w-5 h-5" />,
    gradient: "from-emerald-500 to-teal-500",
    tags: ["Governance", "Voting", "Proposals"],
    difficulty: "Advanced",
  },
  {
    id: "defi-dashboard",
    title: "DeFi Dashboard",
    description: "Analytics dashboard with real-time price feeds, portfolio tracking, yield farming stats, and integrated swap UI.",
    prompt: "Build a DeFi analytics dashboard with real-time price feeds, portfolio tracking, and swap UI on 0G Chain",
    category: "defi",
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: "from-amber-500 to-orange-500",
    tags: ["Analytics", "Charts", "Portfolio"],
    difficulty: "Intermediate",
  },
  {
    id: "token-launchpad",
    title: "Token Launchpad",
    description: "ERC-20 token creation platform with configurable tokenomics, vesting schedules, and fair launch mechanisms.",
    prompt: "Build a token launchpad with ERC-20 creation, configurable tokenomics, vesting schedules, and fair launch on 0G Chain",
    category: "defi",
    icon: <Coins className="w-5 h-5" />,
    gradient: "from-yellow-500 to-amber-500",
    tags: ["ERC-20", "Vesting", "Launch"],
    difficulty: "Intermediate",
  },
  {
    id: "multisig-wallet",
    title: "Multisig Wallet",
    description: "Multi-signature wallet with configurable threshold, transaction queue, signer management, and activity history.",
    prompt: "Build a multi-signature wallet with configurable threshold, transaction queue, and signer management on 0G Chain",
    category: "tooling",
    icon: <Wallet className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-500",
    tags: ["Multisig", "Security", "Wallet"],
    difficulty: "Advanced",
  },
  {
    id: "dex-amm",
    title: "DEX with AMM",
    description: "Decentralized exchange with automated market maker, liquidity pools, swap routing, and LP token management.",
    prompt: "Build a decentralized exchange with AMM, liquidity pools, swap routing, and LP token management on 0G Chain",
    category: "defi",
    icon: <Zap className="w-5 h-5" />,
    gradient: "from-violet-500 to-purple-500",
    tags: ["AMM", "Liquidity", "Swap"],
    difficulty: "Advanced",
  },
  {
    id: "nft-collection",
    title: "NFT Collection",
    description: "Generative NFT collection with reveal mechanics, whitelist minting, on-chain metadata, and gallery UI.",
    prompt: "Build an NFT collection with generative art, reveal mechanics, whitelist minting, and gallery UI on 0G Chain",
    category: "nft",
    icon: <Globe className="w-5 h-5" />,
    gradient: "from-fuchsia-500 to-pink-500",
    tags: ["ERC-721", "Minting", "Gallery"],
    difficulty: "Beginner",
  },
  {
    id: "security-audit",
    title: "Contract Auditor",
    description: "Smart contract security analysis tool with vulnerability detection, gas optimization, and detailed reports.",
    prompt: "Build a smart contract security audit tool with vulnerability scanning, gas optimization suggestions, and audit reports on 0G Chain",
    category: "tooling",
    icon: <ShieldCheck className="w-5 h-5" />,
    gradient: "from-emerald-500 to-green-500",
    tags: ["Security", "Audit", "Analysis"],
    difficulty: "Advanced",
  },
  {
    id: "storage-explorer",
    title: "0G Storage Explorer",
    description: "Explorer UI for 0G decentralized storage with file upload, retrieval, browsing, and usage analytics.",
    prompt: "Build a 0G Storage explorer with file upload, retrieval, browsing interface, and usage analytics on 0G Chain",
    category: "infrastructure",
    icon: <Database className="w-5 h-5" />,
    gradient: "from-sky-500 to-blue-500",
    tags: ["0G Storage", "Explorer", "Files"],
    difficulty: "Intermediate",
  },
  {
    id: "smart-contract-ide",
    title: "Smart Contract IDE",
    description: "Browser-based Solidity IDE with syntax highlighting, compilation, deployment, and testing capabilities.",
    prompt: "Build a browser-based Solidity IDE with syntax highlighting, compilation, and deployment to 0G Chain",
    category: "tooling",
    icon: <FileCode2 className="w-5 h-5" />,
    gradient: "from-slate-400 to-zinc-500",
    tags: ["IDE", "Solidity", "Compiler"],
    difficulty: "Advanced",
  },
  {
    id: "dao-treasury",
    title: "DAO Treasury",
    description: "Treasury management dashboard with multi-asset tracking, spending proposals, and financial reporting.",
    prompt: "Build a DAO treasury management dashboard with multi-asset tracking, spending proposals, and financial reporting on 0G Chain",
    category: "dao",
    icon: <Sparkles className="w-5 h-5" />,
    gradient: "from-teal-500 to-emerald-500",
    tags: ["Treasury", "Finance", "DAO"],
    difficulty: "Intermediate",
  },
];

const categories: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All Templates" },
  { id: "defi", label: "DeFi" },
  { id: "nft", label: "NFT" },
  { id: "dao", label: "DAO" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "tooling", label: "Tooling" },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function TemplatesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: Template) => {
    if (!token) {
      router.push(`/dashboard?prompt=${encodeURIComponent(template.prompt)}`);
      return;
    }

    setLoadingId(template.id);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: template.prompt }),
      });
      const data = await res.json();
      if (res.ok && data.projectId) {
        router.push(`/dashboard/projects/${data.projectId}`);
        return;
      }
    } catch {
      // fallback to dashboard prompt
    }
    setLoadingId(null);
    router.push(`/dashboard?prompt=${encodeURIComponent(template.prompt)}`);
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-7xl mx-auto w-full">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Templates</h1>
              <p className="text-sm text-slate-400">
                Start building with pre-configured project blueprints. One click to generate.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="bg-[#0B1120] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const count = cat.id === "all" ? templates.length : templates.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-purple-600/15 text-purple-400 border border-purple-500/20"
                      : "bg-[#0B1120] text-slate-400 border border-white/5 hover:text-white hover:border-white/10"
                  }`}
                >
                  {cat.label}
                  <span className="ml-2 text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filtered.map((template, i) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#0B1120] border border-white/5 hover:border-purple-500/20 rounded-2xl p-6 transition-all group relative overflow-hidden flex flex-col"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${template.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${template.gradient} p-[1px]`}>
                      <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
                        <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">
                          {template.icon}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${difficultyColors[template.difficulty]}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-purple-400 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                    {template.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-400 font-medium border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={loadingId === template.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-blue-500/80 hover:from-purple-600 hover:to-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-all group/btn"
                  >
                    {loadingId === template.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Starting…
                      </>
                    ) : (
                      <>
                        Use Template
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-10 h-10 text-slate-600 mb-4" />
              <p className="text-sm font-bold text-slate-400 mb-1">No templates found</p>
              <p className="text-xs text-slate-600">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
