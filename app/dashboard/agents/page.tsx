"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import { 
  Layers, 
  Code, 
  Globe, 
  Database, 
  Shield, 
  Rocket, 
  BrainCircuit, 
  ServerCog,
  FlaskConical,
  BarChart3,
  Loader2,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";

interface Agent {
  id: string;
  name: string;
  capability: string;
  description: string;
  status: string;
  model: string;
  runsForUser: number;
}

const AGENT_UI_CONFIG: Record<string, { icon: React.ReactNode, color: string }> = {
  planner: {
    icon: <Layers className="w-5 h-5" />,
    color: "from-purple-500 to-indigo-500"
  },
  frontendNode: {
    icon: <Globe className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500"
  },
  contractsNode: {
    icon: <Code className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500"
  },
  auditNode: {
    icon: <Shield className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-500"
  },
  backendNode: {
    icon: <Database className="w-5 h-5" />,
    color: "from-amber-500 to-orange-500"
  },
  database: {
    icon: <ServerCog className="w-5 h-5" />,
    color: "from-slate-400 to-slate-600"
  },
  testing: {
    icon: <FlaskConical className="w-5 h-5" />,
    color: "from-indigo-500 to-blue-500"
  },
  deployNode: {
    icon: <Rocket className="w-5 h-5" />,
    color: "from-cyan-500 to-blue-500"
  },
  analyticsNode: {
    icon: <BarChart3 className="w-5 h-5" />,
    color: "from-fuchsia-500 to-purple-500"
  },
  memory: {
    icon: <BrainCircuit className="w-5 h-5" />,
    color: "from-purple-500 to-fuchsia-500"
  }
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("og_jwt") : null;
      const res = await fetch("/api/agents", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await fetchAgents();
    })();
  }, [fetchAgents]);

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-7xl mx-auto w-full">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">AI Agents</h1>
              <p className="text-sm text-slate-400">OGPilot&apos;s autonomous agents working for you.</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Cpu className="w-4 h-4 text-purple-400" />
              <div className="text-[11px]">
                <div className="text-slate-500 font-bold uppercase tracking-wider">Cluster Status</div>
                <div className="text-emerald-400 font-bold">All Systems Nominal</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-slate-500 text-sm animate-pulse">Initializing Agent Cluster...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent) => {
                const config = AGENT_UI_CONFIG[agent.capability] || {
                  icon: <Cpu className="w-5 h-5" />,
                  color: "from-slate-500 to-slate-700"
                };
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={agent.id}
                    className="bg-[#0B1120] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} p-[1px]`}>
                        <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
                          <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">
                            {config.icon}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                          {agent.status}
                        </div>
                        <div className="text-[9px] text-slate-600 font-mono">
                          {agent.model}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{agent.name}</h3>
                      <p className="text-xs text-slate-500 mb-6 line-clamp-2 h-8">{agent.description}</p>
                      
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[10px] text-slate-500">
                          Total Tasks
                        </div>
                        <div className="text-xs font-bold text-white">
                          {agent.runsForUser}
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative background element */}
                    <div className={`absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br ${config.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
