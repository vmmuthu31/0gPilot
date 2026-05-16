"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import { Copy, ExternalLink, Globe, Check, Loader2, Search } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Deployment {
  id: string;
  prompt: string;
  status: string;
  contractAddress: string | null;
  contractTxHash: string | null;
  deploymentUrl: string | null;
  repoUrl: string | null;
  explorerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDeployments = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;
      const res = await fetch("/api/deployments", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setDeployments(data.deployments);
      }
    } catch (err) {
      console.error("Failed to fetch deployments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchDeployments();
    })();
  }, [fetchDeployments]);

  const copyAddress = async (address: string, id: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeployments = deployments.filter(dep => {
    if (activeTab === "All") return true;
    if (activeTab === "Live") return dep.status === "COMPLETED" && dep.deploymentUrl;
    if (activeTab === "Contracts") return dep.contractAddress;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Deployments</h1>
              <p className="text-sm text-slate-400">Track and manage your autonomous deployments on 0G Chain.</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search deployments..." 
                className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-white/5 mb-8">
            {["All", "Live", "Contracts"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold pb-4 relative transition-colors ${
                  activeTab === tab ? "text-purple-400" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" 
                  />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-slate-500 text-sm animate-pulse">Syncing with 0G Chain...</p>
            </div>
          ) : (
            <div className="bg-[#0B1120]/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500">
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Project / Prompt</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Infrastructure</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Address / Link</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px]">Deployed At</th>
                      <th className="px-6 py-5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <AnimatePresence mode="popLayout">
                      {filteredDeployments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-20 text-center text-slate-500 italic">
                            No deployments found in this category.
                          </td>
                        </tr>
                      ) : (
                        filteredDeployments.map((dep) => (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={dep.id} 
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="px-6 py-5">
                              <div className="max-w-xs">
                                <div className="font-bold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                                  {dep.prompt}
                                </div>
                                <div className="text-[10px] text-slate-600 font-mono">
                                  ID: {dep.id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                  OG Chain
                                </div>
                                {dep.deploymentUrl && (
                                  <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    Vercel Edge
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                ${dep.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  dep.status === 'RUNNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                  'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                              >
                                <span className={`w-1 h-1 rounded-full mr-1.5 ${dep.status === 'COMPLETED' ? 'bg-emerald-400' : dep.status === 'RUNNING' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
                                {dep.status === 'COMPLETED' ? 'Live' : dep.status}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              {dep.contractAddress ? (
                                <div className="flex items-center gap-2 group/addr">
                                  <code className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                                    {dep.contractAddress.slice(0, 6)}...{dep.contractAddress.slice(-4)}
                                  </code>
                                  <button 
                                    onClick={() => copyAddress(dep.contractAddress!, dep.id)}
                                    className="p-1 text-slate-600 hover:text-white transition-colors"
                                  >
                                    {copiedId === dep.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-600 italic">No contract</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-slate-500 text-xs font-medium">
                              {new Date(dep.createdAt).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-2">
                                {dep.repoUrl && (
                                  <a 
                                    href={dep.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    title="View Source"
                                  >
                                    <FaGithub className="w-4 h-4" />
                                  </a>
                                )}
                                {dep.explorerUrl && (
                                  <a 
                                    href={dep.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                                    title="View on Explorer"
                                  >
                                    <Search className="w-4 h-4" />
                                  </a>
                                )}
                                {dep.deploymentUrl && (
                                  <a 
                                    href={dep.deploymentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all"
                                    title="Visit Site"
                                  >
                                    <Globe className="w-4 h-4" />
                                  </a>
                                )}
                                {!dep.repoUrl && !dep.explorerUrl && !dep.deploymentUrl && (
                                  <button className="p-2 text-slate-700 cursor-not-allowed">
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
