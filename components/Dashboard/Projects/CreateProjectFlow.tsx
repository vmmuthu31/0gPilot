"use client";

import React, { useState, cloneElement, type ReactElement } from "react";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Code,
  Shield,
  Layers,
  Database,
  Globe,
  Rocket,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Describe", "Architecture", "Components", "Review"];

const components = [
  {
    id: "auth",
    title: "User Authentication",
    desc: "Wallet connect integration",
    icon: <Shield />,
  },
  {
    id: "marketplace",
    title: "NFT Marketplace",
    desc: "List, buy & sell NFTs",
    icon: <Globe />,
  },
  {
    id: "minting",
    title: "Minting Module",
    desc: "Create and mint new NFTs",
    icon: <ZapIcon />,
  },
  {
    id: "collection",
    title: "Collection Module",
    desc: "Manage NFT collections",
    icon: <Database />,
  },
  {
    id: "royalties",
    title: "Royalties Module",
    desc: "Manage creator royalties",
    icon: <Code />,
  },
  {
    id: "admin",
    title: "Admin Dashboard",
    desc: "Manage users, collections & fees",
    icon: <Layers />,
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    desc: "Charts and market analytics",
    icon: <Cpu />,
  },
  {
    id: "notifications",
    title: "Notification System",
    desc: "Email and on-chain notifications",
    icon: <Rocket />,
  },
];

function ZapIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}

export const CreateProjectFlow = ({ onCancel }: { onCancel: () => void }) => {
  const [step, setStep] = useState(1);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([
    "auth",
    "marketplace",
  ]);
  const [promptText, setPromptText] = useState<string>(
    "Build an NFT marketplace with features like: - User can mint NFTs - Buy & sell NFTs - Collection page - Royalties for creators - Wallet login - Admin dashboard",
  );
  const [framework, setFramework] = useState<string>("Next.js + Tailwind");
  const [blockchain, setBlockchain] = useState<string>("0G Chain Testnet");
  const [language, setLanguage] = useState<string>("TypeScript");
  const [template, setTemplate] = useState<string>("nextjs");
  const [submitting, setSubmitting] = useState(false);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-8">
          Create New Project
        </h1>

        {/* Stepper */}
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2 relative">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500
                  ${
                    step > i + 1
                      ? "bg-emerald-500 text-white"
                      : step === i + 1
                      ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                      : "bg-white/5 text-slate-500 border border-white/10"
                  }
                `}
                >
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-bold transition-colors duration-500 ${
                    step === i + 1 ? "text-purple-400" : "text-slate-500"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-white/10 mx-4 mb-6">
                  <motion.div
                    className="h-full bg-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: step > i + 1 ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Describe your project
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Tell OGPilot what you want to build. Be as detailed as
                  possible.
                </p>

                <div className="relative group mb-8">
                  <textarea
                    rows={8}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full bg-[#050816] border border-white/10 rounded-xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
                    placeholder="Describe your project"
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] text-slate-600">
                    {promptText.length} / 3000
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-6">
                  Choose your preference
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Blockchain
                    </label>
                    <select
                      value={blockchain}
                      onChange={(e) => setBlockchain(e.target.value)}
                      className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option>0G Chain Testnet</option>
                      <option>0G Chain Mainnet</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      UI Framework
                    </label>
                    <select
                      value={framework}
                      onChange={(e) => setFramework(e.target.value)}
                      className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option>Next.js + Tailwind</option>
                      <option>React + Shadcn</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option>TypeScript</option>
                      <option>JavaScript</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Template
                    </label>
                    <select
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full bg-[#050816] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option value="nextjs">Next.js (Full Stack)</option>
                      <option value="solidity">Solidity Contracts</option>
                      <option value="react-native">
                        React Native (Mobile)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  Project Architecture
                </h3>
                <p className="text-sm text-slate-500">
                  OGPilot has analyzed your request and generated the following
                  architecture.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0B1120] border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-12">
                    High Level Architecture
                  </h4>

                  <div className="relative w-full max-w-[500px] h-[420px] mx-auto mt-4">
                    {/* SVG Connections Layer */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                      style={{ zIndex: 0 }}
                    >
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="8"
                          markerHeight="6"
                          refX="4"
                          refY="3"
                          orientation="auto"
                        >
                          <polygon
                            points="0 0, 8 3, 0 6"
                            fill="#7c3aed"
                            opacity="0.5"
                          />
                        </marker>
                        <linearGradient
                          id="grad"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#7c3aed"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity="0.4"
                          />
                        </linearGradient>
                      </defs>

                      {/* 
                          Coordinate Math: 
                          Container: 500w
                          Center X: 250
                          Left Node Center X: 64 (w-32 is 128px, half is 64)
                          Right Node Center X: 436 (500 - 64)
                          0G Chain Top Y: 260, Bottom Y: 335
                        */}

                      {/* 1. Frontend -> Backend */}
                      <path
                        d="M 250,50 C 250,95 64,95 64,136"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 2. Frontend -> Smart Contracts */}
                      <path
                        d="M 250,50 C 250,95 436,95 436,136"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 3. Frontend -> 0G Chain (Direct) */}
                      <path
                        d="M 250,50 L 250,256"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 4. Backend -> 0G Chain (Off-center entry) */}
                      <path
                        d="M 64,195 C 64,227 180,227 180,256"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 5. Smart Contracts -> 0G Chain (Off-center entry) */}
                      <path
                        d="M 436,195 C 436,227 320,227 320,256"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 6. 0G Chain -> Storage (Off-center exit) */}
                      <path
                        d="M 180,335 C 180,350 64,350 64,361"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />

                      {/* 7. 0G Chain -> AI Agents (Off-center exit) */}
                      <path
                        d="M 320,335 C 320,350 436,350 436,361"
                        stroke="url(#grad)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>

                    {/* Tier 1: Frontend */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-36 h-[50px] flex items-center justify-center rounded-xl border border-white/10 bg-[#050816] text-white text-[10px] font-bold shadow-xl">
                        <div className="text-center">
                          Frontend <br />{" "}
                          <span className="text-[8px] text-slate-500 font-medium">
                            Next.js + Tailwind
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tier 2: Logic Layers */}
                    <div className="absolute top-[140px] left-0 z-10">
                      <div className="w-32 h-[55px] flex items-center justify-center rounded-xl border border-emerald-500/30 bg-[#050816] text-white text-[10px] font-bold text-center">
                        <div className="text-center">
                          Backend <br />{" "}
                          <span className="text-[8px] text-slate-500 font-medium">
                            Node.js + Express
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-[140px] right-0 z-10">
                      <div className="w-32 h-[55px] flex items-center justify-center rounded-xl border border-amber-500/30 bg-[#050816] text-white text-[10px] font-bold text-center">
                        <div className="text-center">
                          Smart Contracts <br />{" "}
                          <span className="text-[8px] text-slate-500 font-medium">
                            Solidity
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tier 3: Settlement (0G Chain) */}
                    <div className="absolute top-[260px] left-1/2 -translate-x-1/2 z-10">
                      <div className="w-48 h-[75px] flex items-center justify-center rounded-xl border border-purple-500/50 bg-[#050816] text-white text-[10px] font-bold shadow-[0_0_30px_rgba(124,58,237,0.25)] text-center">
                        <div className="text-center px-4">
                          0G Chain <br />{" "}
                          <span className="text-[8px] text-purple-400 font-medium tracking-widest uppercase">
                            (TESTNET)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tier 4: Infrastructure */}
                    <div className="absolute top-[365px] left-0 z-10">
                      <div className="w-32 h-[50px] flex items-center justify-center rounded-lg border border-white/10 bg-[#050816]/80 text-slate-300 text-[9px] font-bold text-center">
                        <div className="text-center">
                          Storage <br />{" "}
                          <span className="text-[7px] text-slate-500 font-medium uppercase">
                            0G Storage
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-[365px] right-0 z-10">
                      <div className="w-32 h-[50px] flex items-center justify-center rounded-lg border border-white/10 bg-[#050816]/80 text-slate-300 text-[9px] font-bold text-center">
                        <div className="text-center">
                          AI Agents <br />{" "}
                          <span className="text-[7px] text-slate-500 font-medium uppercase">
                            OpenClaw
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Key Features
                    </h4>
                    <div className="space-y-3">
                      {[
                        "NFT Minting",
                        "Buy & Sell NFTs",
                        "Collection Management",
                        "Creator Royalties",
                        "Wallet Authentication",
                      ].map((f) => (
                        <div
                          key={f}
                          className="flex items-center gap-3 text-xs text-white"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-6 text-xs text-slate-400">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-white">
                      Tech Stack
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">Next.js</div>
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        TypeScript
                      </div>
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        TailwindCSS
                      </div>
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        Solidity
                      </div>
                      <div className="flex items-center gap-2 text-blue-500 font-bold">
                        Ethers.js
                      </div>
                      <div className="flex items-center gap-2 text-purple-400 font-bold">
                        0G SDK
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  Select Components
                </h3>
                <p className="text-sm text-slate-500">
                  Select the components you want OGPilot to generate.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {components.map((comp) => {
                  const isSelected = selectedComponents.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedComponents((prev) =>
                          prev.includes(comp.id)
                            ? prev.filter((x) => x !== comp.id)
                            : [...prev, comp.id],
                        );
                      }}
                      className={`
                        p-6 rounded-2xl border text-left transition-all relative group
                        ${
                          isSelected
                            ? "bg-purple-600/10 border-purple-500/40 shadow-[0_0_20px_rgba(124,58,237,0.1)]"
                            : "bg-[#0B1120] border-white/10 hover:border-white/20"
                        }
                      `}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          isSelected
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-white/5 text-slate-500 group-hover:text-slate-300"
                        }`}
                      >
                        {cloneElement(
                          comp.icon as ReactElement<{ className?: string }>,
                          { className: "w-5 h-5" },
                        )}
                      </div>
                      <h4
                        className={`text-sm font-bold mb-2 transition-colors ${
                          isSelected
                            ? "text-white"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {comp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {comp.desc}
                      </p>

                      {isSelected && (
                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  Review & Generate
                </h3>
                <p className="text-sm text-slate-500">
                  Confirm your project details before starting the generation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">
                    Project Summary
                  </h4>
                  <div className="space-y-6">
                    {[
                      { label: "Project Name", value: "NFT Marketplace" },
                      { label: "Blockchain", value: "0G Chain Testnet" },
                      { label: "UI Framework", value: "Next.js + Tailwind" },
                      { label: "Language", value: "TypeScript" },
                      {
                        label: "Components",
                        value: `${selectedComponents.length} selected`,
                      },
                      { label: "Estimated Time", value: "~ 6 - 8 minutes" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-500">
                          {item.label}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0B1120] border border-white/10 rounded-2xl p-8">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">
                    What will be generated
                  </h4>
                  <div className="space-y-4">
                    {[
                      "Smart Contracts",
                      "Frontend Application",
                      "Backend API",
                      "Database Schema",
                      "Deployment Scripts",
                      "Tests",
                      "Documentation",
                    ].map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-3 text-sm text-white font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
        <button
          onClick={step === 1 ? onCancel : prevStep}
          className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-bold transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Cancel" : "Back"}
        </button>

        <button
          onClick={async () => {
            if (step !== 4) return nextStep();
            setSubmitting(true);
            try {
              const body = {
                prompt: promptText,
                framework: framework,
                blockchain: blockchain,
                features: selectedComponents,
                template,
              };

              const token =
                typeof window !== "undefined"
                  ? localStorage.getItem("og_jwt")
                  : null;
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
              };
              if (token) headers["Authorization"] = `Bearer ${token}`;

              const res = await fetch("/api/workflows", {
                method: "POST",
                headers,
                body: JSON.stringify(body),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                // redirect to project page
                window.location.href = `/dashboard/projects/${data.projectId}`;
                return;
              } else {
                alert(data.error?.message || "Failed to create project");
              }
            } catch (err) {
              console.error(err);
              alert("Network error — please try again");
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold transition-all flex items-center gap-2 hover:opacity-90 shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
        >
          {step === 4
            ? submitting
              ? "Generating…"
              : "Generate Project"
            : "Next"}
          {step === 4 ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
