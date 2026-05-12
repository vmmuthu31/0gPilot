"use client";

import React from "react";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileJson,
  MoreHorizontal
} from "lucide-react";
import { motion } from "framer-motion";

const projects = [
  {
    name: "NFT Marketplace",
    desc: "A full-featured NFT marketplace with minting, buying and selling.",
    status: "Deployed",
    date: "May 20, 2025",
    stack: ["OG Chain Testnet", "Next.js", "TypeScript"],
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    name: "Staking DApp",
    desc: "Staking platform with rewards and lockup periods.",
    status: "In Progress",
    progress: 40,
    stack: ["OG Chain Testnet", "Next.js", "TypeScript"],
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  {
    name: "DAO Governance",
    desc: "Decentralized governance system for DAOs.",
    status: "Draft",
    date: "May 18, 2025",
    stack: ["OG Chain Testnet", "Next.js", "TypeScript"],
    color: "text-slate-400",
    bgColor: "bg-white/5",
    borderColor: "border-white/10"
  },
];

export const ProjectsList = ({ onCreateNew }: { onCreateNew: () => void }) => {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">My Projects</h1>
          <p className="text-sm text-slate-400">Manage all your projects and deployments.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex items-center gap-8 border-b border-white/5 mb-8 overflow-x-auto pb-px">
        {["All Projects", "In Progress", "Deployed", "Templates"].map((tab, i) => (
          <button 
            key={tab} 
            className={`text-sm font-bold pb-4 relative transition-colors ${i === 0 ? "text-purple-400" : "text-slate-400 hover:text-white"}`}
          >
            {tab}
            {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {projects.map((project, i) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-[#0B1120] border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-purple-500/20">
                <FileJson className="w-6 h-6 text-slate-400 group-hover:text-purple-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{project.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{project.desc}</p>
                <div className="flex items-center gap-3">
                  {project.stack.map(s => (
                    <span key={s} className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold mb-2 ${project.bgColor} ${project.color} border ${project.borderColor}`}>
                  {project.status === "Deployed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {project.status}
                </div>
                {project.progress ? (
                   <div className="w-32">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">{project.progress}%</span>
                   </div>
                ) : (
                  <p className="text-[10px] text-slate-500">{project.date}</p>
                )}
              </div>
              <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
