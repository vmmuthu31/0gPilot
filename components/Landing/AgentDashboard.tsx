"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Code,
  Globe,
  Server,
  Zap,
  Paperclip,
  Maximize2,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAuth } from "@/src/client/auth/AuthProvider";

const agents = [
  {
    name: "Planner Agent",
    status: "Analyzing requirements",
    icon: <FileText className="w-4 h-4" />,
    color: "text-purple-400",
    progress: 100,
  },
  {
    name: "Contract Agent",
    status: "Writing smart contracts",
    icon: <Code className="w-4 h-4" />,
    color: "text-blue-400",
    progress: 85,
  },
  {
    name: "Frontend Agent",
    status: "Building UI components",
    icon: <Globe className="w-4 h-4" />,
    color: "text-cyan-400",
    progress: 40,
  },
  {
    name: "Backend Agent",
    status: "Creating API endpoints",
    icon: <Server className="w-4 h-4" />,
    color: "text-indigo-400",
    progress: 20,
  },
  {
    name: "Deploy Agent",
    status: "Preparing deployment",
    icon: <Zap className="w-4 h-4" />,
    color: "text-pink-400",
    progress: 0,
  },
];

export const AgentDashboard = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { token, status } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const sseUrl = token
      ? `/api/stream?projectId=${projectId}&token=${encodeURIComponent(token)}`
      : `/api/stream?projectId=${projectId}`;

    const sse = new EventSource(sseUrl);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status?.startsWith("NODE_COMPLETED:")) {
          const nodeName = data.status.split(":")[1];
          const index = agents.findIndex(
            (a) =>
              a.name
                .toLowerCase()
                .includes(nodeName.toLowerCase().replace("_", "")) ||
              a.name
                .toLowerCase()
                .includes(nodeName.toLowerCase().split(" ")[0]),
          );
          if (index !== -1) {
            setActiveStep(index + 1);
          }
        } else if (data.status === "COMPLETED") {
          setActiveStep(agents.length);
          setIsBuilding(false);
          sse.close();
        } else if (data.status === "FAILED") {
          setIsBuilding(false);
          sse.close();
        }
      } catch {
        console.log("error parsing event data");
      }
    };

    return () => sse.close();
  }, [projectId]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(Array.from(e.target.files));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <div className="glass-card rounded-[2rem] border border-white/10 bg-[#0A0F1C]/80 backdrop-blur-xl p-8 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Build Your DApp
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-medium text-green-400 uppercase tracking-wider">
              AI is ready
            </span>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-sm text-slate-400 mb-4 ml-1">
            What do you want to build?
          </p>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#050816] border border-white/5 rounded-2xl p-6 min-h-[140px] flex flex-col justify-between shadow-inner">
              <div className="flex flex-col gap-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Create an NFT marketplace with royalties, advanced search, and wallet integration."
                  className="w-full bg-transparent border-none outline-none text-slate-300 leading-relaxed text-sm resize-none placeholder:text-slate-600 h-[80px]"
                />

                <AnimatePresence>
                  {attachedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-wrap gap-2"
                    >
                      {attachedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300"
                        >
                          <Paperclip className="w-3 h-3 text-purple-400" />
                          {file.name}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleFileClick}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all hover:text-purple-400 active:scale-95 cursor-pointer"
                  >
                    <Paperclip
                      className={`w-4 h-4 ${
                        attachedFiles.length > 0 ? "text-purple-400" : ""
                      }`}
                    />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors cursor-pointer">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={async () => {
                    if (!prompt.trim() || isBuilding) return;
                    if (!isConnected || status !== "authenticated" || !token) {
                      return;
                    }

                    const pId = Math.random().toString(36).substring(7);
                    setIsBuilding(true);
                    setActiveStep(0);
                    setProjectId(pId);

                    try {
                      await fetch("/api/workflows", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ projectId: pId, prompt }),
                      });
                    } catch {
                      setIsBuilding(false);
                    }
                  }}
                  className={`p-2.5 rounded-xl ${
                    isBuilding
                      ? "bg-slate-600"
                      : "bg-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:scale-105"
                  } text-white transition-transform active:scale-95 cursor-pointer`}
                  disabled={
                    isBuilding ||
                    !isConnected ||
                    status !== "authenticated" ||
                    !token
                  }
                  title={
                    !isConnected || status !== "authenticated" || !token
                      ? "Connect your wallet to generate"
                      : "Generate"
                  }
                >
                  {isBuilding ? (
                    <svg
                      className="animate-spin w-4 h-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 100 24v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                  ) : (
                    <Send className="w-4 h-4 fill-current" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              AI Agents Working
            </h4>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  borderColor:
                    i === activeStep
                      ? "rgba(168, 85, 247, 0.4)"
                      : i < activeStep
                      ? "rgba(168, 85, 247, 0.2)"
                      : "rgba(255, 255, 255, 0.05)",
                  backgroundColor:
                    i === activeStep
                      ? "rgba(168, 85, 247, 0.08)"
                      : i < activeStep
                      ? "rgba(168, 85, 247, 0.03)"
                      : "rgba(255, 255, 255, 0.02)",
                }}
                className={`p-3 rounded-xl border transition-all duration-500 ${
                  i === activeStep
                    ? "shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-[#050816] border border-white/10 flex items-center justify-center mb-3 ${
                    i <= activeStep ? agent.color : "text-slate-500"
                  }`}
                >
                  {agent.icon}
                </div>
                <p className="text-[10px] font-bold text-white mb-1 truncate">
                  {agent.name.split(" ")[0]}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <div
                    className={`w-1 h-1 rounded-full ${
                      i <= activeStep
                        ? "bg-green-400 animate-pulse"
                        : "bg-slate-600"
                    }`}
                  />
                  <p className="text-[8px] text-slate-500 truncate">
                    {i < activeStep
                      ? "Completed"
                      : i === activeStep
                      ? agent.status
                      : "Waiting..."}
                  </p>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        i < activeStep
                          ? "100%"
                          : i === activeStep
                          ? "60%"
                          : "0%",
                    }}
                    className={`h-full bg-gradient-to-r ${
                      i <= activeStep
                        ? "from-purple-500 to-blue-500"
                        : "from-slate-700 to-slate-800"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[80px] -z-10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[80px] -z-10 rounded-full" />
    </motion.div>
  );
};
