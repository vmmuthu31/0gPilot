"use client";

import React, { useState } from "react";
import { ProjectSidebar } from "@/components/Dashboard/Projects/ProjectSidebar";
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FileCode2, 
  Settings, 
  ExternalLink,
  GitBranch,
  Search,
  MoreHorizontal
} from "lucide-react";

export default function ProjectDetailsPage() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    frontend: true,
  });

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  return (
    <main className="min-h-screen bg-[#050816] text-white flex overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(124,58,237,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.05),transparent_50%)] z-0" />
      
      <ProjectSidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold mb-4">
            <span className="hover:text-white cursor-pointer transition-colors">Projects</span>
            <span>/</span>
            <span className="text-white">NFT Marketplace</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-white">NFT Marketplace</h1>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Deployed
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                {["0G Chain Testnet", "Next.js", "TypeScript"].map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-300 text-[10px] font-bold">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-500">Deployed on May 20, 2025</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl border border-white/10 bg-[#0B1120] hover:bg-white/5 text-white text-xs font-bold transition-all flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Preview
              </button>
              <button className="px-4 py-2 rounded-xl border border-white/10 bg-[#0B1120] hover:bg-white/5 text-white text-xs font-bold transition-all flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Repo
              </button>
              <button className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                Deploy
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Section */}
        <div className="flex-1 overflow-hidden p-8 flex gap-6">
          {/* File Explorer */}
          <div className="w-72 bg-[#0B1120] border border-white/10 rounded-2xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-white/5 font-bold text-sm text-white">
              Code Explorer
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-1">
                {/* Frontend Folder */}
                <div>
                  <button 
                    onClick={() => toggleFolder('frontend')}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium text-amber-500 transition-colors"
                  >
                    {expandedFolders.frontend ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    frontend
                  </button>
                  
                  {expandedFolders.frontend && (
                    <div className="pl-6 space-y-1 mt-1">
                      {["app", "components", "lib", "hooks", "styles"].map(f => (
                        <div key={f} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                          <Folder className="w-4 h-4" />
                          {f}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                        <Settings className="w-4 h-4" />
                        .env.local
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">
                        <FileCode2 className="w-4 h-4" />
                        next.config.js
                      </div>
                    </div>
                  )}
                </div>

                {/* Backend Folder */}
                <div>
                  <button 
                    onClick={() => toggleFolder('backend')}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium text-emerald-500 transition-colors"
                  >
                    {expandedFolders.backend ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    backend
                  </button>
                </div>

                {/* Contracts Folder */}
                <div>
                  <button 
                    onClick={() => toggleFolder('contracts')}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm font-medium text-blue-500 transition-colors"
                  >
                    {expandedFolders.contracts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    contracts
                  </button>
                  
                  {expandedFolders.contracts && (
                    <div className="pl-6 space-y-1 mt-1">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-white bg-purple-500/10 rounded-lg border border-purple-500/20 cursor-pointer">
                        <FileCode2 className="w-4 h-4 text-purple-400" />
                        Marketplace.sol
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 bg-[#050816] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 bg-[#0B1120]">
              <div className="flex items-center">
                <div className="px-6 py-3 border-r border-white/5 border-b-2 border-b-purple-500 bg-[#050816] flex items-center gap-2 text-sm text-white font-medium">
                  <FileCode2 className="w-4 h-4 text-purple-400" />
                  Marketplace.sol
                </div>
              </div>
              <div className="px-4 flex items-center gap-3 text-slate-500">
                <button className="hover:text-white transition-colors"><Search className="w-4 h-4" /></button>
                <button className="hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed">
              <div className="flex">
                <div className="w-8 shrink-0 text-slate-600 select-none text-right pr-4">
                  {[...Array(14)].map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <div className="flex-1">
                  <div className="text-purple-400">pragma <span className="text-blue-400">solidity</span> <span className="text-amber-300">^0.8.20</span>;</div>
                  <br />
                  <div className="text-purple-400">import <span className="text-emerald-400">&quot;@openzeppelin/contracts/token/ERC721/ERC721.sol&quot;</span>;</div>
                  <div className="text-purple-400">import <span className="text-emerald-400">&quot;@openzeppelin/contracts/access/Ownable.sol&quot;</span>;</div>
                  <br />
                  <div className="text-purple-400">contract <span className="text-blue-400">Marketplace</span> <span className="text-white">is</span> <span className="text-emerald-300">ERC721, Ownable</span> <span className="text-white">{'{'}</span></div>
                  <div className="pl-8"><span className="text-blue-400">uint256</span> <span className="text-slate-400">private</span> <span className="text-white">_tokenIds</span>;</div>
                  <div className="pl-8"><span className="text-blue-400">uint256</span> <span className="text-slate-400">public</span> <span className="text-white">listingFee</span>;</div>
                  <br />
                  <div className="pl-8 text-purple-400">struct <span className="text-emerald-300">Listing</span> <span className="text-white">{'{'}</span></div>
                  <div className="pl-16"><span className="text-blue-400">uint256</span> <span className="text-white">tokenId</span>;</div>
                  <div className="pl-16"><span className="text-blue-400">address</span> <span className="text-white">seller</span>;</div>
                  <div className="pl-16"><span className="text-blue-400">uint256</span> <span className="text-white">price</span>;</div>
                  <div className="pl-16"><span className="text-blue-400">bool</span> <span className="text-white">active</span>;</div>
                  <div className="pl-8 text-white">{'}'}</div>
                  <div className="text-white">{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
