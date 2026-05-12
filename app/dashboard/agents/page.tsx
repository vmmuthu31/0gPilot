"use client";

import React from "react";
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
  ServerCog
} from "lucide-react";

const agents = [
  {
    id: "planner",
    name: "Planner Agent",
    description: "Architecture planning",
    status: "Active",
    icon: <Layers className="w-5 h-5" />,
    color: "from-purple-500 to-indigo-500",
    progress: 85
  },
  {
    id: "smart-contract",
    name: "Smart Contract Agent",
    description: "Writing secure contracts",
    status: "Active",
    icon: <Code className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-500",
    progress: 60
  },
  {
    id: "frontend",
    name: "Frontend Agent",
    description: "Building UI components",
    status: "Active",
    icon: <Globe className="w-5 h-5" />,
    color: "from-pink-500 to-rose-500",
    progress: 40
  },
  {
    id: "backend",
    name: "Backend Agent",
    description: "Creating APIs & services",
    status: "Active",
    icon: <Database className="w-5 h-5" />,
    color: "from-amber-500 to-orange-500",
    progress: 90
  },
  {
    id: "audit",
    name: "Audit Agent",
    description: "Security analysis",
    status: "Active",
    icon: <Shield className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "deployment",
    name: "Deployment Agent",
    description: "Deploying to OG Chain",
    status: "Active",
    icon: <Rocket className="w-5 h-5" />,
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "memory",
    name: "Memory Agent",
    description: "Storing project memory",
    status: "Active",
    icon: <BrainCircuit className="w-5 h-5" />,
    color: "from-purple-500 to-fuchsia-500"
  },
  {
    id: "devops",
    name: "DevOps Agent",
    description: "Managing infrastructure",
    status: "Active",
    icon: <ServerCog className="w-5 h-5" />,
    color: "from-slate-400 to-slate-600"
  }
];

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-7xl mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-2">AI Agents</h1>
            <p className="text-sm text-slate-400">OGPilot&apos;s autonomous agents working for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="bg-[#0B1120] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} p-[1px]`}>
                    <div className="w-full h-full bg-[#050816] rounded-xl flex items-center justify-center">
                      <div className="text-white opacity-80 group-hover:opacity-100 transition-opacity">
                        {agent.icon}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {agent.status}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{agent.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{agent.description}</p>
                  
                  {agent.progress !== undefined ? (
                    <div className="space-y-2">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${agent.color} opacity-80`} 
                          style={{ width: `${agent.progress}%` }} 
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span>Working...</span>
                        <span>{agent.progress}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-1 w-full bg-white/5 rounded-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
