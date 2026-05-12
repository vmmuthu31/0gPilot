"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { TopNav } from "@/components/Dashboard/TopNav";
import { Copy, ExternalLink } from "lucide-react";

const deployments = [
  {
    id: 1,
    project: "NFT Marketplace",
    environment: "Production",
    network: "OG Chain Testnet",
    status: "Success",
    date: "May 20, 2025 10:30 AM",
  },
  {
    id: 2,
    project: "Staking DApp",
    environment: "Testnet",
    network: "OG Chain Testnet",
    status: "Success",
    date: "May 19, 2025 04:15 PM",
  },
  {
    id: 3,
    project: "DAO Governance",
    environment: "Testnet",
    network: "OG Chain Testnet",
    status: "Pending",
    date: "May 18, 2025 11:20 AM",
  },
  {
    id: 4,
    project: "DeFi Dashboard",
    environment: "Production",
    network: "OG Chain Testnet",
    status: "Failed",
    date: "May 17, 2025 09:10 PM",
  }
];

export default function DeploymentsPage() {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Deployments</h1>
            <p className="text-sm text-slate-400">Track and manage your deployments.</p>
          </div>

          <div className="flex items-center gap-8 border-b border-white/5 mb-8">
            {["All", "OG Chain", "Testnet", "Mainnet"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold pb-4 relative transition-colors ${
                  activeTab === tab ? "text-purple-400" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          <div className="bg-[#0B1120] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400">
                    <th className="px-6 py-4 font-medium">Project</th>
                    <th className="px-6 py-4 font-medium">Environment</th>
                    <th className="px-6 py-4 font-medium">Network</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Deployed At</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deployments.map((dep) => (
                    <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{dep.project}</td>
                      <td className="px-6 py-4 text-slate-300">{dep.environment}</td>
                      <td className="px-6 py-4 text-slate-300">{dep.network}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold
                          ${dep.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            dep.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                            'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                        >
                          {dep.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{dep.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
